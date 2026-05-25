// Supabase Edge Function — Discovery-call signup from the /free-build landing page.
//
// Flow:
//   1. Validate the body, length-limit free-text fields, drop honeypot hits.
//   2. With the service-role key, look up an existing lead by email.
//   3. New email: INSERT a Warm lead with how_i_know_them = "Free-projects landing page".
//      Repeat email: UPDATE that lead, appending a dated note (avoids duplicates,
//      keeps the CRM clean if the same person submits twice).
//   4. Best-effort: email Hudson via Resend that there's a new signup. Failure
//      here never fails the request.
//
// The site_settings counter is NOT decremented here — Hudson updates it manually
// from Admin → Settings.
//
// Required env vars (Lovable Cloud → Edge Functions → Secrets):
//   SUPABASE_URL                  (auto-injected)
//   SUPABASE_SERVICE_ROLE_KEY     (auto-injected)
//   RESEND_API_KEY                — optional. Without it, the notification email
//                                    is skipped silently and signup still succeeds.
//   RESEND_FROM_EMAIL             — optional, default `builds@hudsonturansky.com`
//   ADMIN_EMAIL                   — optional, default `hudsonturansky@gmail.com`

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime, not Node

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAX_NAME_LEN = 100;
const MAX_EMAIL_LEN = 254;
const MAX_COMPANY_LEN = 120;
const MAX_PHONE_LEN = 40;
const MAX_MESSAGE_LEN = 1000;
const MAX_UTM_LEN = 120;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const body = (await req.json()) as {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
      message?: string;
      utm_source?: string;
      website?: string;
    };

    // Honeypot — bots tend to fill every text field they see. Real humans never
    // see the "website" input (it's visually hidden). Silently succeed so the
    // bot moves on without retrying.
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      return json({ ok: true });
    }

    // Validation + length-limit every field.
    const name = (body.name ?? '').trim();
    if (!name || name.length > MAX_NAME_LEN) {
      return json({ error: 'invalid_name', message: 'Please enter your name.' }, 400);
    }
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email) || email.length > MAX_EMAIL_LEN) {
      return json(
        { error: 'invalid_email', message: 'Please enter a valid email address.' },
        400,
      );
    }
    const company = body.company?.trim().slice(0, MAX_COMPANY_LEN) || null;
    const phone = body.phone?.trim().slice(0, MAX_PHONE_LEN) || null;
    const message = body.message?.trim().slice(0, MAX_MESSAGE_LEN) || null;
    const utmSource = body.utm_source?.trim().slice(0, MAX_UTM_LEN) || null;

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return json({ error: 'server_misconfigured' }, 503);
    }
    const admin = createClient(supabaseUrl, serviceKey);

    const today = new Date().toISOString().slice(0, 10);
    const noteStamp =
      `Signed up for a free discovery call via the free-projects landing page on ${today}.` +
      (utmSource ? ` UTM source: ${utmSource}.` : '');

    // De-dupe by email. The CRM is small and admin-curated — duplicate rows
    // for the same person are worse than a slightly noisier `notes` field.
    const { data: existing, error: existingError } = await admin
      .from('leads')
      .select('id, notes')
      .eq('email', email)
      .maybeSingle();
    if (existingError) {
      console.error('Existing-lead query failed', existingError);
      return json({ error: 'internal_error' }, 500);
    }

    if (existing) {
      const mergedNotes = existing.notes
        ? `${existing.notes}\n\n${noteStamp}`
        : noteStamp;
      const { error: updateError } = await admin
        .from('leads')
        .update({ notes: mergedNotes, next_action: 'Schedule discovery call' })
        .eq('id', existing.id);
      if (updateError) {
        console.error('Lead update failed', updateError);
        return json({ error: 'store_error', message: 'Could not save your signup.' }, 500);
      }
    } else {
      const { error: insertError } = await admin.from('leads').insert({
        name: name.slice(0, MAX_NAME_LEN),
        email,
        company,
        phone,
        status: 'warm',
        how_i_know_them: 'Free-projects landing page',
        what_they_might_need:
          message ||
          'Not sure yet — wants help identifying AI projects (discovery call).',
        source: utmSource || 'Social media',
        next_action: 'Schedule discovery call',
        notes: noteStamp,
      });
      if (insertError) {
        console.error('Lead insert failed', insertError);
        return json({ error: 'store_error', message: 'Could not save your signup.' }, 500);
      }
    }

    // Best-effort notification email. Never fails the request.
    try {
      await sendAdminNotification({ name, email, company, phone, message, utmSource });
    } catch (e) {
      console.warn('Admin notification email failed (non-fatal)', e);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('Unhandled error in discovery-call-signup', e);
    return json({ error: 'internal_error' }, 500);
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

async function sendAdminNotification(opts: {
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string | null;
  utmSource: string | null;
}): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    console.info('RESEND_API_KEY not set — skipping admin notification email');
    return;
  }
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'builds@hudsonturansky.com';
  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'hudsonturansky@gmail.com';

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const rows = [
    ['Name', opts.name],
    ['Email', opts.email],
    ['Company', opts.company],
    ['Phone', opts.phone],
    ['What they want built', opts.message],
    ['UTM source', opts.utmSource],
  ]
    .filter(([, v]) => v && String(v).trim())
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;vertical-align:top">${escape(
          String(label),
        )}</td><td style="padding:6px 0;color:#0F172A;white-space:pre-wrap">${escape(
          String(value),
        )}</td></tr>`,
    )
    .join('');

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 8px;color:#0F172A">New free-project signup</h1>
      <p style="color:#374151;line-height:22px;margin:0 0 16px">
        Someone just claimed a free-project discovery call from the /free-build landing page.
      </p>
      <table style="border-collapse:collapse;font-size:14px"><tbody>${rows}</tbody></table>
      <p style="color:#6b7280;line-height:22px;margin:24px 0 0;font-size:13px">
        They are already in Admin → Leads as a Warm lead. Open it to schedule the call.
      </p>
    </div>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Hudson Turansky <${fromEmail}>`,
      to: [adminEmail],
      subject: `New free-project signup: ${opts.name}`,
      html,
      reply_to: opts.email,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body.slice(0, 500)}`);
  }
}
