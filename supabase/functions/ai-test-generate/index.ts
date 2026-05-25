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
//   LOVABLE_API_KEY               — auto-provisioned. Used to call the Lovable AI Gateway.
//   AI_TEST_MODEL                 — optional, default `google/gemini-3-flash-preview`
//   AI_TEST_DAILY_CAP             — optional, default 200
//   RESEND_API_KEY                — optional. Without it, the function skips the
//                                    email step but still returns results to the
//                                    on-page view. With it, the test-taker gets
//                                    a copy of their results in their inbox.
//   RESEND_FROM_EMAIL             — optional, default `builds@hudsonturansky.com`
//   APP_URL                       — optional, default `https://hudsonturansky.com`.
//                                    Used in the email's "View on the web" link.

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
    const body = (await req.json()) as { email?: string; source?: string; answers?: Record<string, any> };

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

    // Self-reported attribution (optional). Length-limited to avoid storage
    // bloat from copy-paste payloads.
    const source =
      typeof body.source === 'string' && body.source.trim()
        ? body.source.trim().slice(0, 120)
        : null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'server_misconfigured' }, 503);
    }
    const admin = createClient(supabaseUrl, serviceKey);

    // Owner bypass — allow unlimited submissions from @hudsonturansky.com for testing.
    const isOwner = email.endsWith('@hudsonturansky.com');

    if (!isOwner) {
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
    }

    // 5. LLM call — via Lovable AI Gateway (no OpenAI key needed)
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      console.error('LOVABLE_API_KEY not set');
      return json(
        { error: 'server_misconfigured', message: 'AI test temporarily unavailable.' },
        503,
      );
    }
    const model = Deno.env.get('AI_TEST_MODEL') ?? 'google/gemini-3-flash-preview';

    const userMessage = JSON.stringify({ questionnaire_answers: cleanedAnswers });

    const openaiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiResponse.ok) {
      const text = await openaiResponse.text();
      console.error('Lovable AI gateway error', openaiResponse.status, text);
      if (openaiResponse.status === 429) {
        return json(
          { error: 'rate_limited', message: 'Too many requests right now. Please try again in a minute.' },
          429,
        );
      }
      if (openaiResponse.status === 402) {
        return json(
          { error: 'credits_exhausted', message: 'AI test temporarily unavailable. Please try again later.' },
          503,
        );
      }
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
          source,
          how_i_know_them: 'AI use-case test',
          what_they_might_need: topIdea ?? 'See AI test results',
          notes: `Took the free AI use-case test on ${new Date().toISOString().slice(0, 10)}.`,
        });
      }
    } catch (e) {
      console.warn('Lead upsert failed (non-fatal)', e);
    }

    // 8. Best-effort email delivery via Resend. Failure here is non-fatal —
    //    the user already has their results on screen.
    try {
      await sendResultsEmail(email, extractName(cleanedAnswers), results);
    } catch (e) {
      console.warn('Email delivery failed (non-fatal)', e);
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

// ---------------------------------------------------------------------------
// Email delivery (Resend)
// ---------------------------------------------------------------------------

const EFFORT_LABEL_EMAIL: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  needs_building: 'Needs building',
};

const EFFORT_COLOR_EMAIL: Record<string, string> = {
  easy: '#10b981',
  medium: '#f59e0b',
  needs_building: '#3b82f6',
};

async function sendResultsEmail(
  toEmail: string,
  name: string | null,
  results: any,
): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.info('RESEND_API_KEY not set — skipping email');
    return;
  }
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'builds@hudsonturansky.com';
  const appUrl = Deno.env.get('APP_URL') ?? 'https://hudsonturansky.com';
  const greetingName = name?.trim() ? name.trim().split(/\s+/)[0] : 'there';

  const html = renderResultsHtml({
    greetingName,
    results,
    bookingUrl: 'https://calendly.com/hudsonturansky/30min',
    siteUrl: appUrl,
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Hudson Turansky <${fromEmail}>`,
      to: [toEmail],
      subject: 'Your AI Use-Case Test results',
      html,
      reply_to: 'hudsonturansky@gmail.com',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body.slice(0, 500)}`);
  }
}

function renderResultsHtml(opts: {
  greetingName: string;
  results: any;
  bookingUrl: string;
  siteUrl: string;
}): string {
  const summary: string | undefined = opts.results?.summary;
  const atWork: any[] = Array.isArray(opts.results?.at_work) ? opts.results.at_work : [];
  const inLife: any[] = Array.isArray(opts.results?.in_your_life) ? opts.results.in_your_life : [];

  const renderIdeas = (heading: string, ideas: any[]) => {
    if (!ideas.length) return '';
    const items = ideas
      .map((idea) => {
        const effort = String(idea?.effort ?? 'medium');
        const color = EFFORT_COLOR_EMAIL[effort] ?? '#6b7280';
        const label = EFFORT_LABEL_EMAIL[effort] ?? effort;
        const buildCta =
          effort === 'needs_building'
            ? `<p style="margin: 12px 0 0 0; font-size: 13px;"><a href="${esc(opts.bookingUrl)}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">Scope this with Hudson →</a></p>`
            : '';
        return `
          <tr><td style="padding: 16px 0; border-top: 1px solid #e5e7eb;">
            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
              <tr>
                <td style="padding-bottom: 8px;">
                  <span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em; border-radius: 999px; color: ${color}; border: 1px solid ${color};">${esc(label)}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #111827; line-height: 1.4;">${esc(idea?.title ?? '')}</p>
                  <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563; line-height: 1.55;">${esc(idea?.description ?? '')}</p>
                  <p style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.55;"><strong style="color: #4b5563;">How this helps you:</strong> ${esc(idea?.how_it_helps ?? '')}</p>
                  ${buildCta}
                </td>
              </tr>
            </table>
          </td></tr>
        `;
      })
      .join('');
    return `
      <h2 style="margin: 32px 0 4px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; font-weight: 600;">${esc(heading)}</h2>
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        ${items}
      </table>
    `;
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your AI Use-Case Test results</title>
  </head>
  <body style="margin: 0; padding: 0; background: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background: #f3f4f6;">
      <tr><td align="center" style="padding: 32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px; background: #ffffff; border-radius: 16px; padding: 32px;">
          <tr><td>
            <p style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #3b82f6; font-weight: 500;">Your results</p>
            <h1 style="margin: 0 0 16px 0; font-size: 26px; font-weight: 700; color: #111827; line-height: 1.2; letter-spacing: -0.02em;">Hey ${esc(opts.greetingName)} — here's your personalized AI use-case map.</h1>
            ${summary ? `<p style="margin: 0 0 24px 0; font-size: 15px; color: #4b5563; line-height: 1.6;">${esc(summary)}</p>` : ''}
            ${renderIdeas('At work', atWork)}
            ${renderIdeas('In your life', inLife)}

            <div style="margin: 32px 0 0 0; padding: 24px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #1e3a8a;">Want to scope a build?</p>
              <p style="margin: 0 0 16px 0; font-size: 14px; color: #4b5563; line-height: 1.55;">Free 30-minute discovery call. No pitch, just a conversation about whether it's worth building.</p>
              <a href="${esc(opts.bookingUrl)}" style="display: inline-block; padding: 10px 20px; background: #111827; color: #ffffff; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 8px;">Book a call</a>
            </div>

            <p style="margin: 32px 0 0 0; font-size: 12px; color: #9ca3af; line-height: 1.55; text-align: center;">
              You took the free AI use-case test on <a href="${esc(opts.siteUrl)}/ai-test" style="color: #6b7280; text-decoration: underline;">${esc(opts.siteUrl)}/ai-test</a>. Reply to this email if you want to talk anything through — I read everything.
            </p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: #d1d5db; line-height: 1.55; text-align: center;">
              — Hudson
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
