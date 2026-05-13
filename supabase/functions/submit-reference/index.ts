// Supabase Edge Function — Submit a reference (PUBLIC, no auth).

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_RE = /^https?:\/\/(www\.)?linkedin\.com\//;
// eslint-disable-next-line no-control-regex
const CONTROL_RE = /[\x00-\x1F\x7F]/g;

function clean(s: string): string {
  return s.replace(CONTROL_RE, '').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as {
      token?: string;
      name?: string;
      role_title?: string;
      email?: string;
      headline?: string;
      linkedin_url?: string;
    };

    const token = (body.token ?? '').trim();
    const name = clean(body.name ?? '');
    const role_title = clean(body.role_title ?? '');
    const email = clean(body.email ?? '').toLowerCase();
    const headline = clean(body.headline ?? '');
    const linkedin_url = body.linkedin_url ? clean(body.linkedin_url) : '';

    if (!token) return json({ error: 'invalid_token' }, 400);
    if (name.length < 1 || name.length > 80) return json({ error: 'invalid_name' }, 400);
    if (role_title.length < 1 || role_title.length > 80)
      return json({ error: 'invalid_role_title' }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);
    if (headline.length < 1 || headline.length > 140)
      return json({ error: 'invalid_headline' }, 400);
    if (linkedin_url && !LINKEDIN_RE.test(linkedin_url))
      return json({ error: 'invalid_linkedin' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: row } = await admin
      .from('reference_requests')
      .select('id, status, expires_at, invited_email')
      .eq('token', token)
      .maybeSingle();

    if (!row) return json({ error: 'invalid' }, 404);

    if (row.status === 'pending' && new Date(row.expires_at).getTime() < Date.now()) {
      await admin.from('reference_requests').update({ status: 'expired' }).eq('id', row.id);
      return json({ error: 'expired' }, 410);
    }
    if (row.status === 'submitted') return json({ error: 'already_submitted' }, 409);
    if (row.status === 'revoked') return json({ error: 'revoked' }, 410);
    if (row.status === 'expired') return json({ error: 'expired' }, 410);

    if (row.invited_email !== email) return json({ error: 'email_mismatch' }, 403);

    const { error: insertErr } = await admin.from('references').insert({
      request_id: row.id,
      name,
      role_title,
      email,
      headline,
      linkedin_url: linkedin_url || null,
      status: 'pending_review',
    });
    if (insertErr) return json({ error: insertErr.message }, 500);

    await admin
      .from('reference_requests')
      .update({ status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', row.id);

    // Notify Hudson
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      const fromVerified = 'Hudson Turansky <hudson@hudsonturansky.com>';
      const fromFallback = 'Hudson Turansky <onboarding@resend.dev>'; // TODO: remove once domain verified
      const text = `${name} (${email}) just submitted a reference.
Role: ${role_title}
Quote: "${headline}"
${linkedin_url ? `LinkedIn: ${linkedin_url}` : ''}
Review it: https://hudsonturansky.com/admin/references`;

      const send = (from: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: 'hudsonturansky@gmail.com',
            subject: `New reference submitted — ${name}`,
            text,
          }),
        });

      let res = await send(fromVerified);
      if (!res.ok) res = await send(fromFallback);
      if (!res.ok) console.error('Resend notify failed:', await res.text());
    }

    return json({ ok: true });
  } catch (e) {
    console.error('submit-reference error:', e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
