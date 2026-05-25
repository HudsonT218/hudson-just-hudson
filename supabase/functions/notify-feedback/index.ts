// Supabase Edge Function — Notify admin when client feedback is submitted.
//
// Called from the client right after FeedbackForm.onSubmit succeeds.
// (Alternative: Supabase database webhook on `feedback` insert. Either works.)
//
// Required env vars:
//   RESEND_API_KEY (optional — emails skipped if missing)
//   RESEND_FROM_EMAIL
//   ADMIN_EMAIL
//   APP_URL

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Require an authenticated caller who owns the referenced order.
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json()) as {
    orderId: string;
    orderNumber: string;
    clientName: string;
    iterationNumber: number;
    maxIterations: number;
    changeCount: number;
  };

  // Verify the authenticated user owns this order (server-side authorization).
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: orderRow } = await admin
    .from('orders').select('id,user_id')
    .eq('id', body.orderId).maybeSingle();
  if (!orderRow || orderRow.user_id !== userData.user.id) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }



  const resendKey = Deno.env.get('RESEND_API_KEY');
  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'hudsonturansky@gmail.com';
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'builds@hudsonturansky.com';
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';

  if (!resendKey) {
    return new Response(JSON.stringify({ ok: true, stubbed: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const adminUrl = `${appUrl}/admin/order/${body.orderId}`;
  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 8px;color:#0F172A">New feedback on ${body.orderNumber}</h1>
      <p style="color:#374151;line-height:22px">
        <strong>${body.clientName}</strong> submitted ${body.changeCount} change request${body.changeCount === 1 ? '' : 's'} (revision ${body.iterationNumber} of ${body.maxIterations}).
      </p>
      <a href="${adminUrl}" style="background:#2563EB;color:#fff;font-weight:600;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:8px">
        Review in admin
      </a>
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
      to: adminEmail,
      subject: `New feedback on ${body.orderNumber} from ${body.clientName}`,
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
