// Supabase Edge Function — Create Stripe Checkout Session
//
// Receives: { spec, draftId, userId } from the wizard's "Proceed to payment" button.
// Returns: { url } — the Stripe Checkout session URL the client redirects to.
//
// Required env vars (set via `supabase secrets set ...`):
//   STRIPE_SECRET_KEY
//   APP_URL (e.g. https://configurator.hudsonturansky.com)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

// deno-lint-ignore-file no-explicit-any
// @ts-nocheck — Edge functions run on Deno; lints below target Node which is incorrect here.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=denonext';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';

const PRICES: Record<string, number> = {
  landing: 50000,
  business: 150000,
  portfolio: 100000,
  saas: 250000,
};

const MODEL_NAMES: Record<string, string> = {
  landing: 'Landing Page',
  business: 'Business Website',
  portfolio: 'Portfolio',
  saas: 'SaaS Marketing Site',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const appUrl = Deno.env.get('APP_URL') ?? 'http://localhost:5173';
    if (!stripeKey) {
      return jsonResponse({ error: 'Stripe is not configured' }, 500);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const auth = req.headers.get('Authorization');
    if (!auth) return jsonResponse({ error: 'Missing auth header' }, 401);

    // Verify the caller via their JWT
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Not authenticated' }, 401);
    }

    const body = (await req.json()) as {
      spec: { model: string; theme: string; sections: any[] };
      draftId?: string;
    };
    const price = PRICES[body.spec.model] ?? PRICES.landing;
    const productName = MODEL_NAMES[body.spec.model] ?? 'Custom Site Build';

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: price,
            product_data: {
              name: productName,
              description: `${body.spec.theme} theme · ${body.spec.sections.length} sections`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: userData.user.email,
      success_url: `${appUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/configure${body.draftId ? `/${body.draftId}` : ''}`,
      metadata: {
        userId: userData.user.id,
        draftId: body.draftId ?? '',
        model: body.spec.model,
        theme: body.spec.theme,
      },
    });

    // Stash the spec in Supabase keyed by session id so the webhook can pick it up
    const adminClient = createClient(supabaseUrl, serviceKey);
    await adminClient
      .from('drafts')
      .update({
        scraped_content: { ...((body as any).extra ?? {}), pending_session: session.id, pending_spec: body.spec },
      })
      .eq('id', body.draftId)
      .eq('user_id', userData.user.id);

    return jsonResponse({ url: session.url });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'Unknown error' }, 500);
  }
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
