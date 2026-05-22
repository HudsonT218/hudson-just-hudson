// Supabase Edge Function — Agent Config (read endpoint for local agents).
//
// Hermes (or any local agent) calls this at the start of each run to pick up:
//   • whether the master toggle is on
//   • whether its specific source is enabled
//   • the keyword list to search
//   • the per-run target (how many accepted leads to stop after)
//   • the score threshold (so the agent can pre-filter if it wants)
//
// Authentication: same AGENT_API_KEY Bearer token as intake-warm-lead.
//
// Request:
//   GET /functions/v1/agent-config?source_id=linkedin
//   Authorization: Bearer <AGENT_API_KEY>
//
// Response:
//   {
//     automation_enabled: bool,    // master toggle
//     source_id:          string,
//     source_enabled:     bool,
//     source_kind:        'edge_function' | 'local_agent',
//     keywords:           string[],
//     target_per_run:     int,
//     threshold:          int,     // 0–100
//     outreach_voice:     string   // for Hermes's reference; scoring still
//                                  // happens server-side at intake time
//   }

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

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
  if (!expected) return false;
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return safeCompare(match[1], expected);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "GET") {
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

  const url = new URL(req.url);
  const sourceId = url.searchParams.get("source_id");
  if (!sourceId) {
    return new Response(
      JSON.stringify({ error: "missing_param", param: "source_id" }),
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

  const [settingsRes, sourceRes] = await Promise.all([
    supabase
      .from("warm_lead_settings")
      .select("enabled, target_per_run, threshold, outreach_voice")
      .eq("id", "singleton")
      .single(),
    supabase
      .from("warm_lead_sources")
      .select("id, enabled, kind, config")
      .eq("id", sourceId)
      .maybeSingle(),
  ]);

  if (settingsRes.error) {
    return new Response(JSON.stringify({ error: settingsRes.error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (sourceRes.error) {
    return new Response(JSON.stringify({ error: sourceRes.error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!sourceRes.data) {
    return new Response(
      JSON.stringify({ error: "source_unknown", source_id: sourceId }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const settings = settingsRes.data as {
    enabled: boolean;
    target_per_run: number;
    threshold: number;
    outreach_voice: string;
  };
  const source = sourceRes.data as {
    id: string;
    enabled: boolean;
    kind: string;
    config: Record<string, any>;
  };

  const keywords = Array.isArray(source.config?.keywords)
    ? (source.config.keywords as unknown[]).map(String)
    : [];

  return new Response(
    JSON.stringify({
      automation_enabled: settings.enabled,
      source_id: source.id,
      source_enabled: source.enabled,
      source_kind: source.kind,
      keywords,
      target_per_run: settings.target_per_run,
      threshold: settings.threshold,
      outreach_voice: settings.outreach_voice,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    },
  );
});
