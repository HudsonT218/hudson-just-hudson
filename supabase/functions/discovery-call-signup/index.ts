// Supabase Edge Function — Discovery-call signup from the /free-build landing page.
//
// Flow:
//   1. Validate the body, length-limit free-text fields, drop honeypot hits.
//   2. With the service-role key, look up an existing lead by email.
//   3. New email: INSERT a Warm lead with how_i_know_them = "Free-projects landing page".
//      Repeat email: UPDATE that lead, appending a dated note (avoids duplicates,
//      keeps the CRM clean if the same person submits twice).
//   4. Best-effort: notify Hudson via the Lovable transactional email pipeline
//      (template `free-build-signup`). Failure here never fails the request.
//
// The site_settings counter is NOT decremented here — Hudson updates it manually
// from Admin → Settings.

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

    // Honeypot
    if (typeof body.website === 'string' && body.website.trim().length > 0) {
      return json({ ok: true });
    }

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

    const { data: existing, error: existingError } = await admin
      .from('leads')
      .select('id, notes')
      .eq('email', email)
      .maybeSingle();
    if (existingError) {
      console.error('Existing-lead query failed', existingError);
      return json({ error: 'internal_error' }, 500);
    }

    let leadId: string;
    if (existing) {
      leadId = existing.id;
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
      const { data: inserted, error: insertError } = await admin
        .from('leads')
        .insert({
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
        })
        .select('id')
        .single();
      if (insertError || !inserted) {
        console.error('Lead insert failed', insertError);
        return json({ error: 'store_error', message: 'Could not save your signup.' }, 500);
      }
      leadId = inserted.id;
    }

    // Best-effort admin notification via the Lovable transactional email pipeline.
    // The Edge gateway requires a JWT-format Bearer token. This project's
    // SERVICE_ROLE_KEY is `sb_secret_…` (non-JWT) and ANON_KEY isn't reliably
    // present as a JWT in the function env, so we use the project's publishable
    // anon JWT (safe to embed — it's the same key shipped to every browser).
    const PUBLISHABLE_ANON_JWT =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpcWRuaGNra2J5ZGdtY3VxYWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MTc2NjcsImV4cCI6MjA5MTA5MzY2N30.xfuxzlSeDk3Qh0Zv47KKmBSQ_VAHuIiq4hFeQooqgRI';
    try {
      const sendResp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: PUBLISHABLE_ANON_JWT,
          Authorization: `Bearer ${PUBLISHABLE_ANON_JWT}`,
        },
        body: JSON.stringify({
          templateName: 'free-build-signup',
          recipientEmail: Deno.env.get('ADMIN_EMAIL') ?? 'hudsonturansky@gmail.com',
          idempotencyKey: `free-build-signup-${leadId}-${today}`,
          templateData: { name, email, company, phone, message, utmSource },
        }),
      });
      if (!sendResp.ok) {
        const errBody = await sendResp.text();
        console.warn(
          `Admin notification email failed (non-fatal): ${sendResp.status} ${errBody}`,
        );
      } else {
        await sendResp.text();
        console.log('Admin notification email enqueued for lead', leadId);
      }
    } catch (e) {
      console.warn('Admin notification email threw (non-fatal)', e);
    }

    return json({ ok: true });
  } catch (e) {
    console.error('Unhandled error in discovery-call-signup', e);
    return json({ error: 'internal_error' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}
