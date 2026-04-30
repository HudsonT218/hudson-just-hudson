import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface TwoTierPlan {
  name: string;
  description?: string;
  monthlyPrice: number | string;
  annualPrice: number | string;
  features: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface PricingTwoToggleProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  plans?: TwoTierPlan[];
  currency?: string;
  savingsLabel?: string;
}

const DEFAULT_PLANS: TwoTierPlan[] = [
  {
    name: 'Personal',
    description: 'For individuals and small projects.',
    monthlyPrice: 12,
    annualPrice: 10,
    features: ['Up to 3 sites', 'Custom domain', 'Standard analytics', 'Email support'],
    ctaLabel: 'Get started',
    ctaHref: '#',
  },
  {
    name: 'Team',
    description: 'For teams that ship together.',
    monthlyPrice: 39,
    annualPrice: 32,
    features: ['Unlimited sites', 'Team collaboration', 'Advanced analytics', 'Priority support', 'A/B testing'],
    ctaLabel: 'Start free trial',
    ctaHref: '#',
  },
];

export function PricingTwoToggle({
  eyebrow = 'Pricing',
  headline = 'Choose what fits your team',
  subheadline = 'Start free and upgrade as you grow. Save 20% with annual billing.',
  plans = DEFAULT_PLANS,
  currency = '$',
  savingsLabel = 'Save 20%',
}: PricingTwoToggleProps) {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
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

        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-surface border border-border rounded-full p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                !annual ? 'bg-primary text-primary-text shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-2 ${
                annual ? 'bg-primary text-primary-text shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Annual
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${annual ? 'bg-white/20' : 'bg-success/15 text-success'}`}>
                {savingsLabel}
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, i) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const isNumber = typeof price === 'number';
            return (
              <motion.article
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-surface border border-border rounded-xl p-8 shadow-sm flex flex-col"
              >
                <h3 className="font-heading font-semibold text-xl text-text-primary">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-2 text-sm text-text-secondary">{plan.description}</p>
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
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-text-primary text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaHref || '#'}
                  className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
                >
                  {plan.ctaLabel || 'Get Started'}
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default PricingTwoToggle;
