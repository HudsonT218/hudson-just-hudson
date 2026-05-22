// Supabase Edge Function — Warm Lead Scraper (cloud sources).
//
// V2 model
// ────────
// • Only handles sources with kind='edge_function'. Local-agent sources
//   (LinkedIn) push in through intake-warm-lead instead.
// • Master toggle: warm_lead_settings.enabled must be true. When false,
//   bails out with `skipped: true, reason: 'automation_off'`.
// • Per-run cap: stops inserting once `target_per_run` (or the count passed
//   in the request body) has been reached. No weekly bookkeeping.
//
// Trigger options
// ───────────────
//   1. Manual:  POST from /admin/warm-leads "Run now" button
//   2. Cron:    Supabase pg_cron / external scheduler hits this endpoint
//
// Required env vars (all auto-provided by Supabase):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   LOVABLE_API_KEY              — classifier + drafter
//   LOVABLE_AI_MODEL             — optional, default google/gemini-3-flash-preview

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { scoreAndDraft, type ScoreCandidate } from "../_shared/score-and-draft.ts";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------
interface WarmLeadSource {
  id: string;
  label: string;
  kind: "edge_function" | "local_agent";
  enabled: boolean;
  config: Record<string, any>;
  last_run_at: string | null;
  last_error: string | null;
}

interface WarmLeadSettings {
  id: string;
  enabled: boolean;
  target_per_run: number;
  threshold: number;
  outreach_voice: string;
}

interface Candidate extends ScoreCandidate {
  external_id: string;
  url: string;
  author_display_name: string | null;
  posted_at: string | null;
}

// ----------------------------------------------------------------------------
// Source: Reddit (public JSON, no auth required)
//
// Currently the only edge-function source. HN / GitHub / Bluesky were removed
// in migration 004 — too dev-heavy for Hudson's small-biz-owner target market.
// New cloud sources go here as their own scrape* function.
// ----------------------------------------------------------------------------
async function scrapeReddit(source: WarmLeadSource): Promise<Candidate[]> {
  const subs: string[] = source.config?.subreddits ?? [];
  const keywords: string[] = source.config?.keywords ?? [];
  const out: Candidate[] = [];
  for (const sub of subs) {
    const url = `https://www.reddit.com/r/${sub}/new.json?limit=25`;
    const r = await fetch(url, {
      headers: { "User-Agent": "hudsonturansky-warm-lead-bot/0.2" },
    });
    if (!r.ok) continue;
    const json = await r.json();
    for (const child of json.data?.children ?? []) {
      const post = child.data ?? {};
      const text: string = `${post.title ?? ""} ${post.selftext ?? ""}`.trim();
      const matches = keywords.filter((kw) =>
        text.toLowerCase().includes(kw.toLowerCase()),
      );
      if (matches.length === 0) continue;
      out.push({
        source_id: "reddit",
        external_id: `reddit:${post.id}`,
        url: `https://www.reddit.com${post.permalink}`,
        author_handle: post.author ?? null,
        author_display_name: post.author ?? null,
        posted_at: post.created_utc
          ? new Date(post.created_utc * 1000).toISOString()
          : null,
        raw_title: post.title ?? null,
        raw_excerpt: text.slice(0, 1000),
        matched_keywords: matches,
      });
    }
  }
  return out;
}

const SCRAPERS: Record<string, (s: WarmLeadSource) => Promise<Candidate[]>> = {
  reddit: scrapeReddit,
};

// ----------------------------------------------------------------------------
// Main handler
// ----------------------------------------------------------------------------
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Per-run cap can be overridden by the caller (e.g. the Run-Now button).
  let bodyOverride: { target_per_run?: number } = {};
  try {
    bodyOverride = await req.json();
  } catch {
    /* empty body is fine */
  }

  // Load settings.
  const { data: settingsRow, error: settingsErr } = await supabase
    .from("warm_lead_settings")
    .select("*")
    .eq("id", "singleton")
    .single();
  if (settingsErr) {
    return new Response(JSON.stringify({ error: settingsErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const settings = settingsRow as WarmLeadSettings;

  if (!settings.enabled) {
    return new Response(
      JSON.stringify({ skipped: true, reason: "automation_off" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const targetPerRun = Math.max(
    1,
    Math.min(50, bodyOverride.target_per_run ?? settings.target_per_run),
  );

  // Load enabled cloud-runnable sources only.
  const { data: sourcesData, error: sourcesErr } = await supabase
    .from("warm_lead_sources")
    .select("*")
    .eq("enabled", true)
    .eq("kind", "edge_function");
  if (sourcesErr) {
    return new Response(JSON.stringify({ error: sourcesErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sources = (sourcesData ?? []) as WarmLeadSource[];

  if (sources.length === 0) {
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: "no_enabled_cloud_sources",
        hint: "Enable Reddit (or a future cloud source) in /admin/warm-leads settings, or trigger your local agent for LinkedIn.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Scrape each source in parallel.
  const errors: string[] = [];
  const allCandidates: Candidate[] = [];
  await Promise.all(
    sources.map(async (s) => {
      const fn = SCRAPERS[s.id];
      if (!fn) {
        errors.push(`${s.id}: no scraper implemented`);
        return;
      }
      try {
        const cands = await fn(s);
        allCandidates.push(...cands);
        await supabase
          .from("warm_lead_sources")
          .update({ last_run_at: new Date().toISOString(), last_error: null })
          .eq("id", s.id);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        errors.push(`${s.id}: ${msg}`);
        await supabase
          .from("warm_lead_sources")
          .update({ last_error: msg, last_run_at: new Date().toISOString() })
          .eq("id", s.id);
      }
    }),
  );

  // De-dupe candidates against existing rows (avoid wasted LLM cost on repeats).
  const externalIds = allCandidates.map((c) => c.external_id);
  const { data: existing } = await supabase
    .from("warm_leads")
    .select("external_id")
    .in("external_id", externalIds.length > 0 ? externalIds : ["__none__"]);
  const seen = new Set(
    ((existing ?? []) as { external_id: string }[]).map((r) => r.external_id),
  );
  const fresh = allCandidates.filter((c) => !seen.has(c.external_id));

  // Cap LLM spend by scoring at most ~2x the target — most candidates pass
  // threshold, so scoring more than this is wasted work. Floors at 10 to keep
  // tiny runs still useful.
  const scoreCap = Math.max(10, targetPerRun * 2);
  const toScore = fresh.slice(0, scoreCap);

  // Score + draft in parallel, batched 5 at a time to avoid rate-limit fireworks.
  let inserted = 0;
  let stop = false;
  for (let i = 0; i < toScore.length && !stop; i += 5) {
    const batch = toScore.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (c) => ({
        candidate: c,
        scored: await scoreAndDraft(c, settings.outreach_voice),
      })),
    );
    for (const { candidate, scored } of results) {
      if (scored.score < settings.threshold) continue;
      if (inserted >= targetPerRun) {
        stop = true;
        break;
      }
      const { error: insertErr } = await supabase.from("warm_leads").insert({
        source_id: candidate.source_id,
        external_id: candidate.external_id,
        url: candidate.url,
        author_handle: candidate.author_handle,
        author_display_name: candidate.author_display_name,
        posted_at: candidate.posted_at,
        raw_title: candidate.raw_title,
        raw_excerpt: candidate.raw_excerpt,
        score: scored.score,
        score_reasoning: scored.reasoning,
        matched_keywords: candidate.matched_keywords,
        drafted_message: scored.draft,
        draft_generated_at: scored.draft ? new Date().toISOString() : null,
        status: "new",
      });
      if (insertErr) {
        errors.push(`insert ${candidate.external_id}: ${insertErr.message}`);
        continue;
      }
      inserted += 1;
    }
  }

  await supabase
    .from("warm_lead_settings")
    .update({ last_run_at: new Date().toISOString() })
    .eq("id", "singleton");

  return new Response(
    JSON.stringify({
      scanned: allCandidates.length,
      fresh: fresh.length,
      scored: toScore.length,
      inserted,
      target_per_run: targetPerRun,
      errors,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
