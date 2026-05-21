// Supabase Edge Function — AI Use-Case Test generator.
//
// Endpoint for the free `/ai-test` quiz. Flow:
//   1. Validate the incoming email + answers, length-limit free-text fields.
//   2. Check the global daily cap (circuit breaker). Reject before LLM call.
//   3. Check this email has not already been used. Reject before LLM call.
//   4. Call OpenAI with a strong system prompt that produces grouped, tagged
//      use-case ideas.
//   5. Store the submission. Best-effort insert into `leads` so test takers
//      become CRM entries.
//   6. Return the parsed results to the caller.
//
// Required env vars (Lovable Cloud → Edge Functions → Secrets):
//   SUPABASE_URL                  (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY     (auto-injected)
//   OPENAI_API_KEY                — required
//   OPENAI_MODEL                  — optional, default `gpt-4o-mini`
//   AI_TEST_DAILY_CAP             — optional, default 200

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime, not Node

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FREE_TEXT_LEN = 800; // chars per free-text answer
const MAX_ARRAY_LEN = 20;       // max items per multi-select array
const MAX_ITEM_LEN = 200;       // max chars per array item

const SYSTEM_PROMPT = `You are an expert AI use-case scout for small business owners and solo professionals. Given a short questionnaire about someone's work and life, generate 6–10 personalized AI use-case ideas they could actually use.

OUTPUT FORMAT — strict JSON, no preamble, no markdown:
{
  "summary": "1-2 sentence summary of this person's situation and the biggest opportunity for them",
  "at_work": [
    {
      "title": "short crisp title (4-8 words)",
      "description": "one-sentence concrete description of what the AI does",
      "how_it_helps": "one sentence referencing the person's specific answers — explain why this would matter to THEM",
      "effort": "easy" | "medium" | "needs_building"
    }
  ],
  "in_your_life": [
    { "title": "...", "description": "...", "how_it_helps": "...", "effort": "easy" | "medium" | "needs_building" }
  ]
}

EFFORT TAGS:
- "easy" — the person can set this up themselves with ChatGPT/Claude in <30 minutes. No coding.
- "medium" — needs an off-the-shelf AI tool ($50–$200/mo) configured for their workflow.
- "needs_building" — needs a custom build. Use this for things tied to their specific data, multi-step automations, or anything customer-facing.

RULES:
- Generate 4–6 "at_work" + 2–4 "in_your_life" items = 6–10 total. Skew toward at_work unless the person is clearly a solo founder.
- Reference their actual answers in "how_it_helps". Be specific, not generic.
- Don't recommend AI for things AI is bad at: precision math, real-time data integrity, regulated decisions without review.
- Don't oversell. If their problem is solved by ChatGPT alone, say so and tag it "easy".
- Be honest, not pitchy. Recommend "needs_building" only when it truly helps.
- Return ONLY the JSON. No explanation, no markdown fence.
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const body = (await req.json()) as { email?: string; answers?: Record<string, any> };

    // 1. Email validation
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return json(
        { error: 'invalid_email', message: 'Please enter a valid email address.' },
        400,
      );
    }

    // 2. Answers validation + length limits
    if (!body.answers || typeof body.answers !== 'object') {
      return json({ error: 'invalid_answers', message: 'Quiz answers are missing.' }, 400);
    }
    const cleanedAnswers = clampAnswers(body.answers);
    if (Object.keys(cleanedAnswers).length === 0) {
      return json({ error: 'invalid_answers', message: 'No answers received.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'server_misconfigured' }, 503);
    }
    const admin = createClient(supabaseUrl, serviceKey);

    // 3. Circuit breaker — global daily cap (cost protection)
    const dailyCap = Number(Deno.env.get('AI_TEST_DAILY_CAP') ?? '200');
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count: todayCount, error: countError } = await admin
      .from('ai_test_submissions')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayStart.toISOString());
    if (countError) {
      console.error('Daily-count query failed', countError);
      return json({ error: 'internal_error' }, 500);
    }
    if ((todayCount ?? 0) >= dailyCap) {
      return json(
        {
          error: 'daily_cap_reached',
          message:
            "We have hit today's free-test limit. Please try again tomorrow, or book a free 30-minute call.",
        },
        429,
      );
    }

    // 4. One-use-per-email — BEFORE any LLM call (this is the main cost guard)
    const { data: existing, error: existingError } = await admin
      .from('ai_test_submissions')
      .select('id, created_at')
      .eq('email', email)
      .maybeSingle();
    if (existingError) {
      console.error('Existing-email query failed', existingError);
      return json({ error: 'internal_error' }, 500);
    }
    if (existing) {
      return json(
        {
          error: 'already_used',
          message:
            'This email has already used the free AI use-case test. Book a discovery call to talk through your results in more detail.',
        },
        409,
      );
    }

    // 5. LLM call
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not set');
      return json(
        { error: 'server_misconfigured', message: 'AI test temporarily unavailable.' },
        503,
      );
    }
    const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-4o-mini';

    const userMessage = JSON.stringify({ questionnaire_answers: cleanedAnswers });

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text();
      console.error('OpenAI error', openaiResponse.status, text);
      return json(
        {
          error: 'llm_error',
          message: 'Could not generate your results right now. Please try again in a few minutes.',
        },
        502,
      );
    }

    const openaiData = (await openaiResponse.json()) as any;
    const generatedText: string = openaiData.choices?.[0]?.message?.content ?? '{}';

    let results: any;
    try {
      results = JSON.parse(generatedText);
    } catch (e) {
      console.error('LLM JSON parse failed', e, generatedText.slice(0, 500));
      return json(
        {
          error: 'llm_parse_error',
          message: 'Could not read the AI response. Please try again.',
        },
        502,
      );
    }

    // Minimal shape check
    if (!Array.isArray(results?.at_work) && !Array.isArray(results?.in_your_life)) {
      console.error('LLM produced unexpected shape', results);
      return json(
        { error: 'llm_shape_error', message: 'Could not read the AI response. Please try again.' },
        502,
      );
    }

    // 6. Store submission
    const { error: insertError } = await admin.from('ai_test_submissions').insert({
      email,
      answers: cleanedAnswers,
      results,
      status: 'completed',
    });
    if (insertError) {
      console.error('Submission insert failed', insertError);
      return json({ error: 'store_error', message: 'Could not save your results.' }, 500);
    }

    // 7. Best-effort lead insert. Failure here is non-fatal — the user still
    //    gets their results; we just lose the CRM entry.
    try {
      const { data: existingLead } = await admin
        .from('leads')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (!existingLead) {
        const leadName = extractName(cleanedAnswers) ?? email.split('@')[0];
        const topIdea = extractTopIdea(results);
        await admin.from('leads').insert({
          name: leadName.slice(0, 100),
          email,
          status: 'cold',
          how_i_know_them: 'AI use-case test',
          what_they_might_need: topIdea ?? 'See AI test results',
          notes: `Took the free AI use-case test on ${new Date().toISOString().slice(0, 10)}.`,
        });
      }
    } catch (e) {
      console.warn('Lead upsert failed (non-fatal)', e);
    }

    return json({ ok: true, results });
  } catch (e) {
    console.error('Unhandled error', e);
    return json({ error: 'internal_error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampAnswers(answers: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(answers)) {
    if (typeof k !== 'string' || k.length > 100) continue;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      if (trimmed) out[k] = trimmed.slice(0, MAX_FREE_TEXT_LEN);
    } else if (Array.isArray(v)) {
      const cleaned = v
        .slice(0, MAX_ARRAY_LEN)
        .map((x) => (typeof x === 'string' ? x.trim().slice(0, MAX_ITEM_LEN) : null))
        .filter((x): x is string => !!x);
      if (cleaned.length) out[k] = cleaned;
    } else if (v == null) {
      // skip
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      out[k] = v;
    } else {
      out[k] = String(v).slice(0, MAX_FREE_TEXT_LEN);
    }
  }
  return out;
}

function extractName(answers: Record<string, any>): string | null {
  for (const key of ['name', 'full_name', 'first_name', 'your_name']) {
    const v = answers[key];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return null;
}

function extractTopIdea(results: any): string | null {
  const all = [
    ...(Array.isArray(results?.at_work) ? results.at_work : []),
    ...(Array.isArray(results?.in_your_life) ? results.in_your_life : []),
  ];
  const buildIdea = all.find((i: any) => i?.effort === 'needs_building');
  return (buildIdea?.title ?? all[0]?.title ?? null) as string | null;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
