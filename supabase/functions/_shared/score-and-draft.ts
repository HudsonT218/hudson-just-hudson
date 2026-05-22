// Shared LLM classifier + drafter for warm leads.
//
// Used by both edge functions:
//   • scrape-warm-leads    — scores + drafts candidates pulled from public APIs
//   • intake-warm-lead     — scores + drafts candidates pushed in by Hermes
//
// Behavior matches what shipped in migration 003: Lovable AI Gateway by
// default, heuristic fallback if no API key. Same prompt, same scoring scale.

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

export interface ScoreCandidate {
  source_id: string;
  author_handle: string | null;
  raw_title: string | null;
  raw_excerpt: string;
  matched_keywords: string[];
}

export interface ScoreResult {
  score: number;
  reasoning: string;
  draft: string | null;
}

export async function scoreAndDraft(
  candidate: ScoreCandidate,
  outreach_voice: string,
): Promise<ScoreResult> {
  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    // Heuristic fallback so the system still works without an LLM. Keyword-
    // count proxy, no draft text. Capped at 100.
    const score =
      Math.min(100, candidate.matched_keywords.length * 30 + 20) +
      (candidate.raw_excerpt.length > 200 ? 10 : 0);
    return {
      score: Math.min(100, score),
      reasoning: "(heuristic — no LOVABLE_API_KEY set)",
      draft: null,
    };
  }

  const model =
    Deno.env.get("LOVABLE_AI_MODEL") ?? "google/gemini-3-flash-preview";

  const prompt = `
You are screening public posts for a freelance developer named Hudson, who builds custom AI-powered web projects (landing pages, agent automations, lightweight SaaS) for small business owners.

Post details:
- Source: ${candidate.source_id}
- Author: ${candidate.author_handle ?? "unknown"}
- Title: ${candidate.raw_title ?? "(none)"}
- Body excerpt: ${candidate.raw_excerpt}
- Matched keywords: ${candidate.matched_keywords.join(", ")}

About Hudson (use this voice in the draft):
${outreach_voice}

Score this lead 0-100 on how warm it is (the author is a small business owner actively asking for help that Hudson could deliver — a website, AI integrations, automations, internal tools).
- 0-29:   noise (Q about a tool, ranting, news, marketing spam, dev-to-dev chatter)
- 30-59:  tangentially relevant (general "I should build a website someday" chatter)
- 60-79:  good fit — they describe a real need Hudson could solve, but it's not super specific
- 80-100: hot lead — small biz owner explicitly looking for someone to build their site / add AI / automate something

Bias DOWN posts from developers, agencies, or people clearly hiring for technical roles. Bias UP posts from non-technical small business owners describing a specific business problem.

If the score is >= 60, also write a SHORT reply (max 3 sentences) that:
1. Quotes their specific problem in the first sentence
2. Shows you understand the scope without over-promising
3. Ends with ONE specific question (not "want to hop on a call")
The reply must sound like Hudson wrote it — relaxed, lowercase-leaning, no marketing speak.

Respond in this exact JSON format:
{"score": <int>, "reasoning": "<one sentence>", "draft": "<reply or null>"}`;

  let r: Response;
  try {
    r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });
  } catch (e) {
    return {
      score: 0,
      reasoning: `LLM fetch failed: ${e instanceof Error ? e.message : String(e)}`,
      draft: null,
    };
  }

  if (!r.ok) {
    let reasoning = `LLM error: ${r.status}`;
    if (r.status === 429) reasoning = "LLM rate-limited (429) — try again shortly";
    else if (r.status === 402)
      reasoning =
        "Lovable AI credits exhausted (402) — top up in Settings → Workspace → Usage";
    return { score: 0, reasoning, draft: null };
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
