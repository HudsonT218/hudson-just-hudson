import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripePk = import.meta.env.VITE_STRIPE_PK ?? '';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!stripePk) {
      console.warn('[stripe] VITE_STRIPE_PK is not set — checkout will be unavailable.');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(stripePk);
  }
  return stripePromise;
}

export const isStripeConfigured = Boolean(stripePk);
