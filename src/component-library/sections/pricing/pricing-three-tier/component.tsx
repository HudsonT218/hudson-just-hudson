import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface PricingTier {
  name: string;
  description?: string;
  monthlyPrice: number | string;
  annualPrice?: number | string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
  recommended?: boolean;
}

export interface PricingThreeTierProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  tiers?: PricingTier[];
  showToggle?: boolean;
  currency?: string;
}

const DEFAULT_TIERS: PricingTier[] = [
  {
    name: 'Starter',
    description: 'For small projects and personal sites.',
    monthlyPrice: 9,
    annualPrice: 7,
    features: ['1 site', 'Custom domain', 'Basic analytics', 'Community support'],
    ctaLabel: 'Start free',
    ctaHref: '#',
  },
  {
    name: 'Pro',
    description: 'For growing teams and businesses.',
    monthlyPrice: 29,
    annualPrice: 24,
    features: ['10 sites', 'Custom domains', 'Advanced analytics', 'Priority support', 'A/B testing', 'Team collaboration'],
    ctaLabel: 'Start free trial',
    ctaHref: '#',
    recommended: true,
  },
  {
    name: 'Enterprise',
    description: 'For larger organizations with custom needs.',
    monthlyPrice: 'Custom',
    annualPrice: 'Custom',
    features: ['Unlimited sites', 'SSO & SAML', 'Dedicated CSM', 'SLA guarantees', 'Custom integrations', 'Audit logs'],
    ctaLabel: 'Contact sales',
    ctaHref: '#',
  },
];

export function PricingThreeTier({
  eyebrow = 'Pricing',
  headline = 'Simple pricing, no surprises',
  subheadline = 'Pick a plan that scales with your needs. Upgrade or downgrade any time.',
  tiers = DEFAULT_TIERS,
  showToggle = true,
  currency = '$',
}: PricingThreeTierProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-4">
              {eyebrow}
            </span>
          )}
          <h2 className="font-heading font-bold text-text-primary text-3xl md:text-4xl tracking-tight">
            {headline}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{subheadline}</p>
        </div>

        {showToggle && (
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center bg-surface border border-border rounded-full p-1">
              <button
                type="button"
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  !annual ? 'bg-primary text-primary-text shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                  annual ? 'bg-primary text-primary-text shadow-sm' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Annual <span className="text-xs opacity-80 ml-1">save 20%</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {tiers.map((tier, i) => {
            const price = annual && tier.annualPrice !== undefined ? tier.annualPrice : tier.monthlyPrice;
            const isNumber = typeof price === 'number';
            return (
              <motion.article
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative rounded-xl p-8 flex flex-col ${
                  tier.recommended
                    ? 'bg-surface border-2 border-primary shadow-xl md:scale-105'
                    : 'bg-surface border border-border shadow-sm'
                }`}
              >
                {tier.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-primary text-primary-text text-xs font-semibold px-3 py-1 shadow-sm">
                    Recommended
                  </span>
                )}
                <h3 className="font-heading font-semibold text-xl text-text-primary">{tier.name}</h3>
                {tier.description && (
                  <p className="mt-2 text-sm text-text-secondary">{tier.description}</p>
                )}
                <div className="mt-6 flex items-baseline gap-1">
                  {isNumber ? (
                    <>
                      <span className="font-heading font-bold text-4xl text-text-primary">
                        {currency}
                        {price}
                      </span>
                      <span className="text-text-muted text-sm">/ month</span>
                    </>
                  ) : (
                    <span className="font-heading font-bold text-4xl text-text-primary">{price}</span>
                  )}
                </div>
                <ul className="mt-6 flex flex-col gap-3 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text-primary text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={tier.ctaHref || '#'}
                  className={`mt-8 inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold transition-colors ${
                    tier.recommended
                      ? 'bg-primary text-primary-text shadow-sm hover:bg-primary-hover'
                      : 'border border-border text-text-primary hover:bg-surface-hover'
                  }`}
                >
                  {tier.ctaLabel || 'Get Started'}
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PricingThreeTier;
