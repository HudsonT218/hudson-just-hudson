// Supabase Edge Function — Notify client when admin approves a preview.
//
// Called from the admin dashboard when the "Approve" button is clicked
// (after the order status flips to 'approved').
//
// Required env vars:
//   RESEND_API_KEY (optional)
//   RESEND_FROM_EMAIL
//   APP_URL

// @ts-nocheck — Deno runtime
// deno-lint-ignore-file no-explicit-any

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Require an authenticated admin caller — this function sends branded
  // emails from builds@hudsonturansky.com and must not be a public relay.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: isAdmin } = await admin.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
  if (!isAdmin) {
    // Fall back to direct user_roles check since public.has_role was removed.
    const { data: roleRow } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  const body = (await req.json()) as {
    customerEmail: string;
    customerName?: string;
    orderNumber: string;
    previewUrl: string;
    iterationsRemaining: number;
    isRevision: boolean;
    iterationNumber?: number;
    maxIterations?: number;
  };

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'builds@hudsonturansky.com';
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

  if (!resendKey) {
    return new Response(JSON.stringify({ ok: true, stubbed: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const greeting = body.customerName ? body.customerName : 'there';
  const subject = body.isRevision
    ? `Revision ${body.iterationNumber} ready — ${body.orderNumber}`
    : `Your preview is ready — ${body.orderNumber}`;

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 8px;color:#0F172A">
        ${body.isRevision ? `Your updated preview is ready, ${greeting}.` : `Your preview is ready, ${greeting}.`}
      </h1>
      <p style="color:#374151;line-height:22px">
        ${body.isRevision
          ? 'We applied your feedback. Take another look — and let us know if you want anything else tweaked.'
          : "Take a look. If everything checks out, that's your finished site. If not — submit feedback right on the preview page and we'll iterate."}
      </p>
      <a href="${body.previewUrl}" style="background:#2563EB;color:#fff;font-weight:600;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">
        View your preview
      </a>
      <p style="color:#6b7280;font-size:12px;margin-top:16px">
        ${body.isRevision
          ? `Revision ${body.iterationNumber} of ${body.maxIterations} · order ${body.orderNumber}`
          : `You have ${body.iterationsRemaining} revision round${body.iterationsRemaining === 1 ? '' : 's'} included.`}
        ·
        <a href="${appUrl}/dashboard/order/${body.orderNumber}" style="color:#2563EB">Submit feedback</a>
      </p>
    </div>
  `;

  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: body.customerEmail,
      subject,
      html,
    }),
  });

  if (!result.ok) {
    return new Response(JSON.stringify({ ok: false, error: await result.text() }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
