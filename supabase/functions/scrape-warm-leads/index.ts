// Supabase Edge Function — Warm Lead Scraper.
//
// Polls each enabled source in `warm_lead_sources` for posts that look like
// "I need someone to build me X" signals, scores them with an LLM, drafts a
// personalized first-touch reply, and inserts qualifying ones into `warm_leads`.
//
// Trigger options:
//   1. Manual:  POST from /admin/warm-leads "Run now" button
//   2. Cron:    Supabase pg_cron / external scheduler hits this endpoint
//
// Required env vars:
//   SUPABASE_URL                 (auto-provided by Supabase)
//   SUPABASE_SERVICE_ROLE_KEY    (auto-provided by Supabase)
//   LOVABLE_API_KEY              (auto-provided; used for Lovable AI classifier+drafter)
//   LOVABLE_AI_MODEL             (optional, default: google/gemini-3-flash-preview)
//
// Sources currently implemented (no-account-required):
//   • hackernews    — Algolia HN Search API (https://hn.algolia.com/api)
//   • github_issues — GitHub Search Issues API (60 req/hr unauth, 5k/hr w/ token)
//
// Sources scaffolded but disabled-by-default:
//   • bluesky       — public AppView search
//   • reddit        — public JSON (account-free read works, may rate-limit)

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

// ----------------------------------------------------------------------------
// Types (mirror src/lib/warm-leads-types.ts — kept inline so the function is
// self-contained with no shared-package gymnastics.)
// ----------------------------------------------------------------------------
interface WarmLeadSource {
  id: string;
  label: string;
  enabled: boolean;
  config: Record<string, any>;
  last_run_at: string | null;
  last_error: string | null;
}

interface WarmLeadSettings {
  id: string;
  mode: "capped" | "always_on" | "paused";
  target_per_week: number;
  threshold: number;
  outreach_voice: string;
  week_started_on: string;
  this_week_count: number;
}

interface Candidate {
  source_id: string;
  external_id: string;
  url: string;
  author_handle: string | null;
  author_display_name: string | null;
  posted_at: string | null;
  raw_title: string | null;
  raw_excerpt: string;
  matched_keywords: string[];
}

interface ScoreResult {
  score: number;
  reasoning: string;
  draft: string | null;
}

// ----------------------------------------------------------------------------
// Source: Hacker News (via Algolia)
// API docs: https://hn.algolia.com/api
// We hit /api/v1/search_by_date for each keyword, last 24h, story+comment types.
// ----------------------------------------------------------------------------
async function scrapeHackerNews(source: WarmLeadSource): Promise<Candidate[]> {
  const keywords: string[] = source.config?.keywords ?? [];
  if (keywords.length === 0) return [];

  const since = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
  const out: Candidate[] = [];

  for (const kw of keywords) {
    const url =
      `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(kw)}` +
      `&tags=(story,comment)&numericFilters=created_at_i>${since}&hitsPerPage=20`;
    const r = await fetch(url);
    if (!r.ok) continue;
    const json = await r.json();
    for (const hit of json.hits ?? []) {
      const text: string =
        hit.story_text ?? hit.comment_text ?? hit.title ?? "";
      if (!text) continue;
      // Strip HTML the cheap way.
      const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const objectId = hit.objectID;
      const isComment = !!hit.comment_text;
      const linkUrl = isComment
        ? `https://news.ycombinator.com/item?id=${objectId}`
        : hit.url ?? `https://news.ycombinator.com/item?id=${objectId}`;
      out.push({
        source_id: "hackernews",
        external_id: `hn:${objectId}`,
        url: linkUrl,
        author_handle: hit.author ?? null,
        author_display_name: hit.author ?? null,
        posted_at: hit.created_at ?? null,
        raw_title: hit.title ?? null,
        raw_excerpt: clean.slice(0, 1000),
        matched_keywords: [kw],
      });
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// Source: GitHub Issues
// API docs: https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests
// We search open issues created in the last 7d for "help wanted" signals.
// ----------------------------------------------------------------------------
async function scrapeGitHubIssues(source: WarmLeadSource): Promise<Candidate[]> {
  const keywords: string[] = source.config?.keywords ?? [];
  const languages: string[] = source.config?.languages ?? [];
  if (keywords.length === 0) return [];

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const out: Candidate[] = [];
  const ghToken = Deno.env.get("GITHUB_TOKEN");
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "hudsonturansky-warm-lead-bot",
  };
  if (ghToken) headers.Authorization = `Bearer ${ghToken}`;

  for (const kw of keywords) {
    const langClause =
      languages.length > 0
        ? " " + languages.map((l) => `language:${l}`).join(" ")
        : "";
    const q = `"${kw}" is:issue is:open created:>${since}${langClause}`;
    const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&per_page=15&sort=created`;
    const r = await fetch(url, { headers });
    if (!r.ok) continue;
    const json = await r.json();
    for (const item of json.items ?? []) {
      const body: string = (item.body ?? "").replace(/\s+/g, " ").trim();
      if (!body) continue;
      out.push({
        source_id: "github_issues",
        external_id: `gh:${item.id}`,
        url: item.html_url,
        author_handle: item.user?.login ?? null,
        author_display_name: item.user?.login ?? null,
        posted_at: item.created_at ?? null,
        raw_title: item.title ?? null,
        raw_excerpt: body.slice(0, 1000),
        matched_keywords: [kw],
      });
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// Source: Bluesky (public AppView search — no auth needed)
// ----------------------------------------------------------------------------
async function scrapeBluesky(source: WarmLeadSource): Promise<Candidate[]> {
  const keywords: string[] = source.config?.keywords ?? [];
  const out: Candidate[] = [];
  for (const kw of keywords) {
    const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(kw)}&limit=20`;
    const r = await fetch(url);
    if (!r.ok) continue;
    const json = await r.json();
    for (const post of json.posts ?? []) {
      const text: string = post.record?.text ?? "";
      if (!text) continue;
      const did = post.author?.did ?? "";
      const rkey = (post.uri ?? "").split("/").pop();
      const handle = post.author?.handle ?? "";
      const webUrl =
        handle && rkey
          ? `https://bsky.app/profile/${handle}/post/${rkey}`
          : post.uri;
      out.push({
        source_id: "bluesky",
        external_id: `bsky:${did}:${rkey}`,
        url: webUrl,
        author_handle: handle || null,
        author_display_name: post.author?.displayName ?? handle ?? null,
        posted_at: post.indexedAt ?? null,
        raw_title: null,
        raw_excerpt: text.slice(0, 1000),
        matched_keywords: [kw],
      });
    }
  }
  return out;
}

// ----------------------------------------------------------------------------
// Source: Reddit (public JSON)
// ----------------------------------------------------------------------------
async function scrapeReddit(source: WarmLeadSource): Promise<Candidate[]> {
  const subs: string[] = source.config?.subreddits ?? [];
  const keywords: string[] = source.config?.keywords ?? [];
  const out: Candidate[] = [];
  for (const sub of subs) {
    const url = `https://www.reddit.com/r/${sub}/new.json?limit=25`;
    const r = await fetch(url, {
      headers: { "User-Agent": "hudsonturansky-warm-lead-bot/0.1" },
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
  hackernews: scrapeHackerNews,
  github_issues: scrapeGitHubIssues,
  bluesky: scrapeBluesky,
  reddit: scrapeReddit,
};

// ----------------------------------------------------------------------------
// LLM Classifier + Drafter
// ----------------------------------------------------------------------------
async function scoreAndDraft(
  candidate: Candidate,
  settings: WarmLeadSettings,
): Promise<ScoreResult> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    // Heuristic fallback so the system still works without an LLM.
    const score =
      Math.min(100, candidate.matched_keywords.length * 30 + 20) +
      (candidate.raw_excerpt.length > 200 ? 10 : 0);
    return {
      score,
      reasoning: "(heuristic — no OPENAI_API_KEY set)",
      draft: null,
    };
  }

  const model = Deno.env.get("OPENAI_MODEL") ?? "gpt-4o-mini";
  const prompt = `
You are screening public posts for a freelance developer named Hudson, who builds custom AI-powered web projects (landing pages, agent automations, lightweight SaaS).

Post details:
- Source: ${candidate.source_id}
- Author: ${candidate.author_handle ?? "unknown"}
- Title: ${candidate.raw_title ?? "(none)"}
- Body excerpt: ${candidate.raw_excerpt}
- Matched keywords: ${candidate.matched_keywords.join(", ")}

About Hudson (use this voice in the draft):
${settings.outreach_voice}

Score this lead 0-100 on how warm it is (the author is actively asking for help that Hudson could deliver).
- 0-29:   noise (Q about a tool, ranting, news, marketing spam)
- 30-59:  tangentially relevant (general "AI is cool" chatter)
- 60-79:  good fit — they describe a need Hudson could solve, but it's not super specific
- 80-100: hot lead — they explicitly want to hire someone for an AI/web build

If the score is >= 60, also write a SHORT reply (max 3 sentences) that:
1. Quotes their specific problem in the first sentence
2. Shows you understand the scope without over-promising
3. Ends with ONE specific question (not "want to hop on a call")
The reply must sound like Hudson wrote it — relaxed, lowercase-leaning, no marketing speak.

Respond in this exact JSON format:
{"score": <int>, "reasoning": "<one sentence>", "draft": "<reply or null>"}`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });
  if (!r.ok) {
    return {
      score: 0,
      reasoning: `LLM error: ${r.status}`,
      draft: null,
    };
  }
  const json = await r.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  try {
    const parsed = JSON.parse(content);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score) || 0)),
      reasoning: String(parsed.reasoning ?? ""),
      draft:
        parsed.draft && parsed.draft !== "null" ? String(parsed.draft) : null,
    };
  } catch {
    return { score: 0, reasoning: "Failed to parse LLM output", draft: null };
  }
}

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

  // Load settings + reset weekly counter if a new ISO-week has started.
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

  if (settings.mode === "paused") {
    return new Response(
      JSON.stringify({ skipped: true, reason: "mode=paused" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Reset weekly counter on Monday rollover.
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const weekIso = startOfWeek.toISOString().slice(0, 10);
  let weekCount = settings.this_week_count;
  if (settings.week_started_on !== weekIso) {
    weekCount = 0;
    await supabase
      .from("warm_lead_settings")
      .update({ week_started_on: weekIso, this_week_count: 0 })
      .eq("id", "singleton");
  }

  // Capped mode: stop early if we've already hit the target this week.
  if (settings.mode === "capped" && weekCount >= settings.target_per_week) {
    return new Response(
      JSON.stringify({
        skipped: true,
        reason: "weekly_target_met",
        this_week_count: weekCount,
        target: settings.target_per_week,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Load enabled sources.
  const { data: sourcesData, error: sourcesErr } = await supabase
    .from("warm_lead_sources")
    .select("*")
    .eq("enabled", true);
  if (sourcesErr) {
    return new Response(JSON.stringify({ error: sourcesErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const sources = (sourcesData ?? []) as WarmLeadSource[];

  // Scrape each source in parallel.
  const errors: string[] = [];
  const allCandidates: Candidate[] = [];
  await Promise.all(
    sources.map(async (s) => {
      const fn = SCRAPERS[s.id];
      if (!fn) return;
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

  // De-dupe candidates against existing rows (avoid LLM cost on repeats).
  const externalIds = allCandidates.map((c) => c.external_id);
  const { data: existing } = await supabase
    .from("warm_leads")
    .select("external_id")
    .in("external_id", externalIds.length > 0 ? externalIds : ["__none__"]);
  const seen = new Set(((existing ?? []) as { external_id: string }[]).map((r) => r.external_id));
  const fresh = allCandidates.filter((c) => !seen.has(c.external_id));

  // Cap LLM cost: at most 30 fresh candidates per run.
  const MAX_PER_RUN = 30;
  const toScore = fresh.slice(0, MAX_PER_RUN);

  // Score + draft in parallel (small batches to avoid rate-limit fireworks).
  let inserted = 0;
  for (let i = 0; i < toScore.length; i += 5) {
    const batch = toScore.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (c) => ({ candidate: c, scored: await scoreAndDraft(c, settings) })),
    );
    for (const { candidate, scored } of results) {
      if (scored.score < settings.threshold) continue;

      // Capped mode: respect remaining quota.
      if (
        settings.mode === "capped" &&
        weekCount >= settings.target_per_week
      ) {
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
      weekCount += 1;
    }
  }

  await supabase
    .from("warm_lead_settings")
    .update({
      this_week_count: weekCount,
      last_run_at: new Date().toISOString(),
    })
    .eq("id", "singleton");

  return new Response(
    JSON.stringify({
      scanned: allCandidates.length,
      fresh: fresh.length,
      scored: toScore.length,
      inserted,
      this_week_count: weekCount,
      target_per_week: settings.target_per_week,
      mode: settings.mode,
      errors,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
