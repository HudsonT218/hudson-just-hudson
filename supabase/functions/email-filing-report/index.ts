// Supabase Edge Function — email a Filing Summary as a PDF.
//
// Triggered by the "Request report" button. It does NOT call the LLM and does
// NOT consume a free use — it just re-renders an already-generated brief as a
// PDF and emails it via Resend.
//
//   Browser → invoke("email-filing-report", { summaryId, recipient })
//     → look up the brief in `filing_summaries`
//     → generate PDF (pdf-lib)
//     → Resend email with the PDF attached
//
// Required env vars:
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  (auto-injected)
//   RESEND_API_KEY                            — required to send the email
//   RESEND_FROM_EMAIL                         — optional, default builds@hudsonturansky.com

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime, not Node

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';
import { generateBriefPdf } from '../_shared/filing-pdf.ts';
import { normalizeBrief } from '../_shared/filing-brief-prompt.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const body = (await req.json()) as { summaryId?: string; recipient?: string };

    const summaryId = (body.summaryId ?? '').trim();
    if (!summaryId || !UUID_RE.test(summaryId)) {
      return json({ error: 'invalid_request', message: 'Missing or invalid summary id.' }, 400);
    }

    const recipient = (body.recipient ?? '').trim().toLowerCase();
    if (!recipient || !EMAIL_RE.test(recipient) || recipient.length > 254) {
      return json(
        { error: 'invalid_email', message: 'Please enter a valid email address to send the report to.' },
        400,
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'server_misconfigured' }, 503);
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: row, error: lookupError } = await admin
      .from('filing_summaries')
      .select('results, meta, ticker, form')
      .eq('id', summaryId)
      .maybeSingle();
    if (lookupError) {
      console.error('Summary lookup failed', lookupError);
      return json({ error: 'internal_error' }, 500);
    }
    if (!row) {
      return json({ error: 'not_found', message: 'That summary could not be found.' }, 404);
    }

    const brief = normalizeBrief(row.results);
    const meta = (row.meta ?? {}) as any;
    // Backfill meta fields from the row in case the stored meta is sparse.
    meta.ticker = meta.ticker ?? row.ticker ?? '';
    meta.form = meta.form ?? row.form ?? '';
    meta.company = meta.company ?? meta.ticker;

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      console.error('RESEND_API_KEY not set');
      return json(
        { error: 'email_unavailable', message: 'Email delivery is not configured right now.' },
        503,
      );
    }

    // Generate the PDF.
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await generateBriefPdf(brief, meta);
    } catch (e) {
      console.error('PDF generation failed', e);
      return json({ error: 'pdf_error', message: 'Could not build the PDF. Please try again.' }, 500);
    }

    const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'builds@hudsonturansky.com';
    const company = String(meta.company || meta.ticker || 'Company');
    const ticker = String(meta.ticker || '');
    const form = String(meta.form || 'filing');
    const fileBase = `${ticker || 'filing'}-${form}`.replace(/[^A-Za-z0-9._-]+/g, '-');
    const filename = `${fileBase}-brief.pdf`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Hudson Turansky <${fromEmail}>`,
        to: [recipient],
        subject: `${company}${ticker ? ` (${ticker})` : ''} — ${form} filing brief`,
        html: renderEmailHtml(company, ticker, form, brief.headline, meta.sourceUrl),
        reply_to: 'hudsonturansky@gmail.com',
        attachments: [{ filename, content: toBase64(pdfBytes) }],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Resend error', response.status, text.slice(0, 500));
      return json(
        { error: 'send_failed', message: 'Could not send the email. Please try again.' },
        502,
      );
    }

    return json({ ok: true });
  } catch (e) {
    console.error('Unhandled error', e);
    return json({ error: 'internal_error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Chunked base64 — avoids the call-stack overflow that String.fromCharCode(...big)
// hits on larger PDFs.
function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmailHtml(
  company: string,
  ticker: string,
  form: string,
  headline: string,
  sourceUrl: string | undefined,
): string {
  const title = `${company}${ticker ? ` (${ticker})` : ''} — ${form} brief`;
  return `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${esc(title)}</title></head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f3f4f6;">
      <tr><td align="center" style="padding:32px 16px;">
        <table cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;padding:32px;">
          <tr><td>
            <p style="margin:0 0 8px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;color:#2563eb;font-weight:500;">Your filing brief</p>
            <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:700;color:#111827;line-height:1.25;letter-spacing:-0.02em;">${esc(title)}</h1>
            ${headline ? `<p style="margin:0 0 20px 0;font-size:15px;color:#4b5563;line-height:1.6;">${esc(headline)}</p>` : ''}
            <p style="margin:0 0 20px 0;font-size:14px;color:#4b5563;line-height:1.6;">Your one-page brief is attached as a PDF so you can keep it. It's a plain-English summary — educational only, not investment advice. Always verify against the original filing.</p>
            ${sourceUrl ? `<p style="margin:0 0 24px 0;font-size:13px;"><a href="${esc(sourceUrl)}" style="color:#2563eb;text-decoration:none;font-weight:500;">View the original filing on SEC.gov &rarr;</a></p>` : ''}
            <div style="margin:24px 0 0 0;padding:20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:15px;font-weight:600;color:#1e3a8a;">Want a custom finance tool?</p>
              <p style="margin:0 0 14px 0;font-size:13px;color:#4b5563;line-height:1.55;">I build AI tools, dashboards, and automations. Reply to this email if you'd like to talk through an idea.</p>
            </div>
            <p style="margin:28px 0 0 0;font-size:11px;color:#9ca3af;line-height:1.55;text-align:center;">Generated by the Filing Summarizer at hudsonturansky.com.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
