// Supabase Edge Function — Send a reference request invite (admin only).
//
// Required env vars:
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SUPABASE_ANON_KEY
//   RESEND_API_KEY (optional — emails skipped if missing)

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  // base64url
  let b64 = btoa(String.fromCharCode(...bytes));
  b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return b64.slice(0, 32);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify admin caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'unauthorized' }, 401);
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401);

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow, error: roleErr } = await admin
      .from('user_roles').select('role')
      .eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
    if (roleErr || !roleRow) return json({ error: 'forbidden' }, 403);

    const body = (await req.json()) as { email?: string; name?: string; notes?: string };
    const email = (body.email ?? '').toLowerCase().trim();
    const name = body.name?.trim() || null;
    const notes = body.notes?.trim() || null;

    if (!email || !EMAIL_RE.test(email)) return json({ error: 'invalid_email' }, 400);

    // Revoke prior pending requests for this email
    await admin
      .from('reference_requests')
      .update({ status: 'revoked' })
      .eq('invited_email', email)
      .eq('status', 'pending');

    const token = generateToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: inserted, error: insertErr } = await admin
      .from('reference_requests')
      .insert({
        invited_email: email,
        invited_name: name,
        token,
        expires_at: expiresAt,
        notes,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertErr) return json({ error: insertErr.message }, 500);

    // Send email via Resend
    const resendKey = Deno.env.get('RESEND_API_KEY');
    if (resendKey) {
      // TODO: Once hudsonturansky.com is verified in Resend, this `from` is good.
      // Until then, fallback to onboarding@resend.dev.
      const fromVerified = 'Hudson Turansky <hudson@hudsonturansky.com>';
      const fromFallback = 'Hudson Turansky <onboarding@resend.dev>';

      const link = `https://hudsonturansky.com/reference/${token}`;
      const greeting = name || 'there';
      const text = `Hi ${greeting},

Hudson Turansky here. I'm putting together a public references page on my site and would really appreciate a short note from you.

It's quick — just your name, role, and a one-line summary of working together. Should take 2 minutes. The link below expires in 7 days.

→ Write your reference: ${link}

Thanks for considering it,
Hudson
hudsonturansky@gmail.com`;

      const send = (from: string) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: email,
            reply_to: 'hudsonturansky@gmail.com',
            subject: 'Quick reference request from Hudson Turansky',
            text,
          }),
        });

      let res = await send(fromVerified);
      if (!res.ok) {
        // Try fallback sender if domain isn't verified yet
        res = await send(fromFallback);
      }
      if (!res.ok) {
        const errText = await res.text();
        console.error('Resend send failed:', errText);
      }
    }

    return json({ ok: true, request_id: inserted.id });
  } catch (e) {
    console.error('send-reference-invite error:', e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
