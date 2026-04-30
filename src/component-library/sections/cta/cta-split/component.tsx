import { useState, FormEvent, useId } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';

export interface CtaSplitProps {
  headline?: string;
  subheadline?: string;
  mode?: 'form' | 'button';
  emailPlaceholder?: string;
  submitLabel?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  privacyText?: string;
}

export function CtaSplit({
  headline = 'Get product updates and growth tips, monthly',
  subheadline = 'Join 25,000 founders, marketers, and engineers who trust our newsletter for thoughtful, practical insights.',
  mode = 'form',
  emailPlaceholder = 'you@company.com',
  submitLabel = 'Subscribe',
  primaryCtaLabel = 'Get started',
  primaryCtaHref = '#',
  secondaryCtaLabel = 'Learn more',
  secondaryCtaHref = '#',
  privacyText = 'No spam. Unsubscribe any time.',
}: CtaSplitProps) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-md grid lg:grid-cols-2 gap-10 items-center"
        >
          <div>
            <h2 className="font-heading font-bold text-text-primary text-3xl md:text-4xl tracking-tight">
              {headline}
            </h2>
            <p className="mt-4 text-text-secondary leading-relaxed">{subheadline}</p>
          </div>

          {mode === 'form' ? (
            <div>
              {submitted ? (
                <div className="rounded-md bg-success/10 border border-success/30 p-5 flex items-center gap-3">
                  <Check className="w-5 h-5 text-success" />
                  <p className="text-text-primary">Thanks! Check your inbox to confirm.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <label htmlFor={`${id}-email`} className="sr-only">
                    Email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      id={`${id}-email`}
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={emailPlaceholder}
                      className="flex-1 rounded-md border border-border bg-bg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors whitespace-nowrap"
                    >
                      {submitLabel}
                    </button>
                  </div>
                  {privacyText && (
                    <p className="text-xs text-text-muted">{privacyText}</p>
                  )}
                </form>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <a
                href={primaryCtaHref}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
              >
                {primaryCtaLabel}
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-text-primary font-semibold hover:bg-surface-hover transition-colors"
              >
                {secondaryCtaLabel}
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

export default CtaSplit;
