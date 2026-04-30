// Supabase Edge Function — Stripe Webhook Handler
//
// On `checkout.session.completed`, creates an order in Supabase from the session
// metadata + the draft's stashed pending_spec, then sends the order-confirmation
// email via Resend.
//
// Required env vars:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   RESEND_API_KEY (optional — emails will be skipped if missing)
//   RESEND_FROM_EMAIL (default: builds@hudsonturansky.com)
//   APP_URL

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Deno runtime

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=denonext';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!stripeKey || !webhookSecret) {
    return new Response('Stripe not configured', { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });
  const signature = req.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (e) {
    console.error('[webhook] Bad signature:', e);
    return new Response('Bad signature', { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceKey);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const draftId = session.metadata?.draftId;

    if (!userId) {
      return new Response('Missing userId metadata', { status: 400 });
    }

    // Fetch the spec we stashed during create-checkout.
    let spec: any = null;
    if (draftId) {
      const { data: draft } = await supabase
        .from('drafts')
        .select('*')
        .eq('id', draftId)
        .single();
      const stashed = draft?.scraped_content as any;
      spec = stashed?.pending_spec ?? null;
    }

    if (!spec) {
      console.warn('[webhook] No pending spec found for draft', draftId);
      return new Response('Missing spec', { status: 400 });
    }

    const orderNumber = generateOrderNumber();
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        draft_id: draftId || null,
        order_number: orderNumber,
        status: 'paid',
        spec,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string' ? session.payment_intent : null,
        amount_paid: session.amount_total ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error('[webhook] Failed to insert order:', error);
      return new Response('DB error', { status: 500 });
    }

    // Send confirmation email (best-effort)
    await sendOrderConfirmationEmail({
      orderNumber,
      to: session.customer_email ?? '',
      amount: session.amount_total ?? 0,
      modelName: spec.model,
      themeName: spec.theme,
      sectionCount: Array.isArray(spec.sections) ? spec.sections.length : 0,
    });

    return new Response(JSON.stringify({ ok: true, orderId: order.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});

async function sendOrderConfirmationEmail(args: {
  orderNumber: string;
  to: string;
  amount: number;
  modelName: string;
  themeName: string;
  sectionCount: number;
}): Promise<void> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) {
    console.log('[webhook] RESEND_API_KEY not set — skipping confirmation email.');
    return;
  }
  const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') ?? 'builds@hudsonturansky.com';
  const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
  const dollars = (args.amount / 100).toFixed(0);

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 8px;color:#0F172A">Thanks for your order.</h1>
      <p style="color:#374151;line-height:22px">
        Order <code style="font-family:monospace">${args.orderNumber}</code> is in. We'll start
        building right away and email you when your preview is ready.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px 16px;margin:16px 0;font-size:13px;color:#374151">
        <p style="margin:0 0 4px;color:#6b7280;font-size:12px">Build</p>
        <p style="margin:0 0 12px">${args.modelName} · ${args.themeName} theme · ${args.sectionCount} sections</p>
        <p style="margin:0 0 4px;color:#6b7280;font-size:12px">Total</p>
        <p style="margin:0;font-weight:600">$${dollars}</p>
      </div>
      <a href="${appUrl}/dashboard" style="background:#2563EB;color:#fff;font-weight:600;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">
        Track your order
      </a>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: args.to,
      subject: `Order ${args.orderNumber} confirmed`,
      html,
    }),
  });
}

function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `ORD-${year}-${random}`;
}
