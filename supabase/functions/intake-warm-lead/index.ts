// Supabase Edge Function — Warm Lead Intake (push endpoint).
//
// Receives a single candidate from a local agent (typically Hermes running
// on Hudson's PC, scraping LinkedIn via a real browser session) and runs it
// through the same scoreAndDraft pipeline used by scrape-warm-leads.
//
// Authentication: Bearer token in `Authorization` header, compared against
// the AGENT_API_KEY env var. Single-tenant for v1 — Hudson sets the secret
// once in Supabase and shares it with his local agent. If this ever gets
// productized, swap to a hashed-key table.
//
// Request body:
//   {
//     source_id:           string,    // must be enabled + kind='local_agent'
//     external_id:         string,    // stable per-source ID, used for de-dup
//     url:                 string,
//     author_handle?:      string,
//     author_display_name?:string,
//     posted_at?:          ISO date,
//     raw_title?:          string,
//     raw_excerpt:         string,    // first ~1k chars of the post text
//     matched_keywords?:   string[]   // which agent-side keywords matched
//   }
//
// Response (200):
//   { accepted: true,  lead_id: UUID, score: int, draft: string | null }
//   { accepted: false, reason: 'below_threshold' | 'duplicate'
//                            | 'automation_off' | 'source_disabled'
//                            | 'source_not_local_agent' | 'source_unknown',
//     score?: int, draft?: string | null }
//
// Errors:
//   401 if Authorization header missing/wrong
//   400 if body is malformed
//   500 if DB / LLM blows up

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";
import { scoreAndDraft } from "../_shared/score-and-draft.ts";

interface IntakePayload {
  source_id: string;
  external_id: string;
  url: string;
  author_handle?: string | null;
  author_display_name?: string | null;
  posted_at?: string | null;
  raw_title?: string | null;
  raw_excerpt: string;
  matched_keywords?: string[];
}

// Constant-time string compare so the secret can't be timed out byte by byte.
function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function authorized(req: Request): boolean {
  const expected = Deno.env.get("AGENT_API_KEY");
  if (!expected) return false; // secret not configured — refuse rather than open up
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return safeCompare(match[1], expected);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!authorized(req)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: IntakePayload;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const missing: string[] = [];
  if (!body.source_id) missing.push("source_id");
  if (!body.external_id) missing.push("external_id");
  if (!body.url) missing.push("url");
  if (!body.raw_excerpt) missing.push("raw_excerpt");
  if (missing.length > 0) {
    return new Response(
      JSON.stringify({ error: "missing_fields", fields: missing }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Master toggle
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
  const settings = settingsRow as {
    enabled: boolean;
    threshold: number;
    outreach_voice: string;
  };

  if (!settings.enabled) {
    return new Response(
      JSON.stringify({ accepted: false, reason: "automation_off" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Source must exist, be enabled, and be of kind=local_agent.
  const { data: sourceRow, error: sourceErr } = await supabase
    .from("warm_lead_sources")
    .select("*")
    .eq("id", body.source_id)
    .maybeSingle();
  if (sourceErr) {
    return new Response(JSON.stringify({ error: sourceErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!sourceRow) {
    return new Response(
      JSON.stringify({ accepted: false, reason: "source_unknown" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  if (!sourceRow.enabled) {
    return new Response(
      JSON.stringify({ accepted: false, reason: "source_disabled" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
  if (sourceRow.kind !== "local_agent") {
    // Cloud sources are scraped by scrape-warm-leads — don't allow Hermes to
    // bypass that and push directly into Reddit's inbox slot, for example.
    return new Response(
      JSON.stringify({ accepted: false, reason: "source_not_local_agent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Duplicate check (same source_id + external_id).
  const { data: existing } = await supabase
    .from("warm_leads")
    .select("id")
    .eq("source_id", body.source_id)
    .eq("external_id", body.external_id)
    .maybeSingle();
  if (existing) {
    return new Response(
      JSON.stringify({ accepted: false, reason: "duplicate", lead_id: existing.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Score + draft with the shared pipeline.
  const scored = await scoreAndDraft(
    {
      source_id: body.source_id,
      author_handle: body.author_handle ?? null,
      raw_title: body.raw_title ?? null,
      raw_excerpt: body.raw_excerpt,
      matched_keywords: body.matched_keywords ?? [],
    },
    settings.outreach_voice,
  );

  if (scored.score < settings.threshold) {
    return new Response(
      JSON.stringify({
        accepted: false,
        reason: "below_threshold",
        score: scored.score,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Insert.
  const { data: inserted, error: insertErr } = await supabase
    .from("warm_leads")
    .insert({
      source_id: body.source_id,
      external_id: body.external_id,
      url: body.url,
      author_handle: body.author_handle ?? null,
      author_display_name: body.author_display_name ?? null,
      posted_at: body.posted_at ?? null,
      raw_title: body.raw_title ?? null,
      raw_excerpt: body.raw_excerpt.slice(0, 1000),
      score: scored.score,
      score_reasoning: scored.reasoning,
      matched_keywords: body.matched_keywords ?? [],
      drafted_message: scored.draft,
      draft_generated_at: scored.draft ? new Date().toISOString() : null,
      status: "new",
    })
    .select("id")
    .single();

  if (insertErr) {
    return new Response(JSON.stringify({ error: insertErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Stamp last_run_at on the source so the admin UI shows "last run" updating.
  await supabase
    .from("warm_lead_sources")
    .update({ last_run_at: new Date().toISOString(), last_error: null })
    .eq("id", body.source_id);

  return new Response(
    JSON.stringify({
      accepted: true,
      lead_id: inserted.id,
      score: scored.score,
      draft: scored.draft,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
