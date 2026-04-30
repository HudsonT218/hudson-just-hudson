import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export interface SingleSpotlightProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  planName?: string;
  planDescription?: string;
  price?: number | string;
  priceSuffix?: string;
  currency?: string;
  features?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  guarantee?: string;
}

const DEFAULT_FEATURES = [
  'Unlimited sites and pages',
  'Custom domains with SSL',
  'Advanced analytics dashboard',
  'A/B testing and experiments',
  'Team collaboration with roles',
  'Priority email and chat support',
  'SSO and SAML authentication',
  'Audit logs and access controls',
  '99.9% uptime SLA',
  '24/7 monitoring and alerts',
];

export function PricingSingleSpotlight({
  eyebrow = 'One simple plan',
  headline = 'Everything you need, one price',
  subheadline = 'No tiers, no upsells. One plan that includes every feature.',
  planName = 'All-in-One',
  planDescription = 'Includes every feature, every integration, and every future update.',
  price = 49,
  priceSuffix = 'per user / month',
  currency = '$',
  features = DEFAULT_FEATURES,
  ctaLabel = 'Start free trial',
  ctaHref = '#',
  guarantee = '14-day free trial. No credit card required.',
}: SingleSpotlightProps) {
  const isNumber = typeof price === 'number';
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

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-surface border border-border rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-primary text-text-inverse p-8 md:p-12 text-center">
            <h3 className="font-heading font-semibold text-2xl">{planName}</h3>
            <p className="mt-2 text-white/90 max-w-md mx-auto">{planDescription}</p>
            <div className="mt-8 inline-flex items-baseline gap-2">
              {isNumber ? (
                <>
                  <span className="font-heading font-bold text-6xl">
                    {currency}
                    {price}
                  </span>
                  <span className="text-white/80 text-base">{priceSuffix}</span>
                </>
              ) : (
                <span className="font-heading font-bold text-6xl">{price}</span>
              )}
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h4 className="font-heading font-semibold text-text-primary text-lg mb-6 text-center">
              Everything included
            </h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="inline-flex w-5 h-5 mt-0.5 rounded-full bg-primary/10 text-primary items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  <span className="text-text-primary text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col items-center gap-3">
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3.5 text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
              >
                {ctaLabel}
              </a>
              {guarantee && <p className="text-sm text-text-muted">{guarantee}</p>}
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

export default PricingSingleSpotlight;
