// Supabase Edge Function — Filing Summarizer.
//
// Endpoint for the free `/finance-tools/filing-summarizer` tool. Flow mirrors
// `ai-test-generate` exactly:
//   1. Validate the incoming email + ticker + form.
//   2. Check the global daily cap (circuit breaker). Reject before any work.
//   3. Check this email's free-use count (3 by default). Reject before any work
//      — this is the main cost guard, run BEFORE the SEC fetch and LLM call.
//   4. Fetch + clean the company's latest SEC filing from EDGAR (free, no key).
//   5. Call the Lovable AI Gateway to turn the filing into a plain-English brief.
//   6. Store the result in `filing_summaries` (this consumes a use). Best-effort
//      insert into `leads` so tool users become CRM entries.
//   7. Return the brief + metadata + uses_remaining to the caller.
//
// Required env vars (Lovable Cloud → Edge Functions → Secrets):
//   SUPABASE_URL                  (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY     (auto-injected)
//   LOVABLE_API_KEY               — auto-provisioned. Powers the AI gateway.
//   FILING_MODEL                  — optional, default `google/gemini-3-flash-preview`
//   FILING_FREE_USES              — optional, default 3
//   FILING_DAILY_CAP              — optional, default 200
//   SEC_USER_AGENT                — optional. SEC requires a descriptive UA with
//                                   a real contact; a hudsonturansky.com default
//                                   is baked in.

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime, not Node

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';
import {
  fetchLatestFiling,
  normalizeTicker,
  normalizeForm,
  FilingError,
} from '../_shared/sec-edgar.ts';
import {
  FILING_SYSTEM_PROMPT,
  buildFilingUserMessage,
  normalizeBrief,
  isUsableBrief,
} from '../_shared/filing-brief-prompt.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const body = (await req.json()) as {
      email?: string;
      ticker?: string;
      form?: string;
      source?: string;
    };

    // 1a. Email validation
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return json(
        { error: 'invalid_email', message: 'Please enter a valid email address.' },
        400,
      );
    }

    // 1b. Ticker + form validation (cheap, before any network/LLM work)
    let ticker: string;
    let form: ReturnType<typeof normalizeForm>;
    try {
      ticker = normalizeTicker(body.ticker);
      form = normalizeForm(body.form);
    } catch (e) {
      if (e instanceof FilingError) {
        return json({ error: e.code, message: e.message }, 400);
      }
      throw e;
    }

    // Self-reported attribution (optional), length-limited.
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

    const freeUses = Number(Deno.env.get('FILING_FREE_USES') ?? '3');

    // Owner bypass — unlimited runs from Hudson's own emails for testing/demos.
    const isOwner = email === 'hudsonturansky@gmail.com' || email.endsWith('@hudsonturansky.com');

    let priorCount = 0;

    if (!isOwner) {
      // 2. Circuit breaker — global daily cap (cost protection)
      const dailyCap = Number(Deno.env.get('FILING_DAILY_CAP') ?? '200');
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      const { count: todayCount, error: countError } = await admin
        .from('filing_summaries')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed')
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
              "We've hit today's free-summary limit. Please try again tomorrow.",
          },
          429,
        );
      }

      // 3. Per-email free-use gate — BEFORE the SEC/LLM work (main cost guard).
      const { count: emailCount, error: emailErr } = await admin
        .from('filing_summaries')
        .select('id', { count: 'exact', head: true })
        .eq('email', email)
        .eq('status', 'completed');
      if (emailErr) {
        console.error('Per-email count query failed', emailErr);
        return json({ error: 'internal_error' }, 500);
      }
      priorCount = emailCount ?? 0;
      if (priorCount >= freeUses) {
        return json(
          {
            error: 'limit_reached',
            uses_remaining: 0,
            message: `You've used all ${freeUses} free filing summaries for this email. Book a call if you'd like a custom finance tool built.`,
          },
          200,
        );
      }
    }

    // 4. Fetch + clean the filing from SEC EDGAR. Failures here DO NOT consume a
    //    use (we only insert a completed row on success).
    let filing;
    try {
      filing = await fetchLatestFiling(ticker, form);
    } catch (e) {
      if (e instanceof FilingError) {
        const status = e.code === 'sec_unavailable' ? 502 : 200;
        return json({ error: e.code, message: e.message }, status);
      }
      console.error('SEC fetch failed', e);
      return json(
        { error: 'sec_unavailable', message: 'Could not retrieve the filing right now. Please try again.' },
        502,
      );
    }

    // 5. LLM call — via Lovable AI Gateway (identical shape to ai-test-generate)
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableKey) {
      console.error('LOVABLE_API_KEY not set');
      return json(
        { error: 'server_misconfigured', message: 'Summarizer temporarily unavailable.' },
        503,
      );
    }
    const model = Deno.env.get('FILING_MODEL') ?? 'google/gemini-3-flash-preview';
    const userMessage = buildFilingUserMessage(filing.meta, filing.text);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: FILING_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      const text = await aiResponse.text();
      console.error('Lovable AI gateway error', aiResponse.status, text);
      if (aiResponse.status === 429) {
        return json(
          { error: 'rate_limited', message: 'Too many requests right now. Please try again in a minute.' },
          429,
        );
      }
      if (aiResponse.status === 402) {
        return json(
          { error: 'credits_exhausted', message: 'Summarizer temporarily unavailable. Please try again later.' },
          503,
        );
      }
      return json(
        {
          error: 'llm_error',
          message: 'Could not generate the summary right now. Please try again in a few minutes.',
        },
        502,
      );
    }

    const aiData = (await aiResponse.json()) as any;
    const generatedText: string = aiData.choices?.[0]?.message?.content ?? '{}';

    let parsed: any;
    try {
      parsed = JSON.parse(generatedText);
    } catch (e) {
      console.error('LLM JSON parse failed', e, generatedText.slice(0, 500));
      return json(
        { error: 'llm_parse_error', message: 'Could not read the AI response. Please try again.' },
        502,
      );
    }

    if (!isUsableBrief(parsed)) {
      console.error('LLM produced unusable brief', parsed);
      return json(
        { error: 'llm_shape_error', message: 'Could not read the AI response. Please try again.' },
        502,
      );
    }
    const results = normalizeBrief(parsed);

    // 6. Store the summary — this consumes a use (status='completed').
    const { data: inserted, error: insertError } = await admin
      .from('filing_summaries')
      .insert({
        email,
        ticker: filing.meta.ticker,
        form: filing.meta.form,
        results,
        meta: filing.meta,
        status: 'completed',
      })
      .select('id')
      .single();
    if (insertError || !inserted) {
      console.error('Summary insert failed', insertError);
      return json({ error: 'store_error', message: 'Could not save your summary.' }, 500);
    }
    const summaryId = inserted.id;

    // 7. Best-effort lead insert. Failure here is non-fatal.
    try {
      const { data: existingLead } = await admin
        .from('leads')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (!existingLead) {
        await admin.from('leads').insert({
          name: email.split('@')[0].slice(0, 100),
          email,
          status: 'cold',
          source,
          how_i_know_them: 'Filing Summarizer',
          what_they_might_need: `Summarized ${filing.meta.ticker} ${filing.meta.form}`,
          notes: `Used the Filing Summarizer on ${new Date().toISOString().slice(0, 10)} (${filing.meta.ticker} ${filing.meta.form}).`,
        });
      }
    } catch (e) {
      console.warn('Lead upsert failed (non-fatal)', e);
    }

    const uses_remaining = isOwner ? null : Math.max(0, freeUses - (priorCount + 1));

    return json({
      ok: true,
      results,
      summaryId,
      meta: filing.meta,
      uses_remaining,
    });
  } catch (e) {
    console.error('Unhandled error', e);
    return json({ error: 'internal_error' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
