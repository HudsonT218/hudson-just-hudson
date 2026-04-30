import { motion } from 'framer-motion';

export interface CtaCenteredProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  variant?: 'gradient' | 'primary' | 'surface';
}

export function CtaCentered({
  eyebrow,
  headline = 'Ready to launch a site you are proud of?',
  subheadline = 'Start free in minutes. No credit card required.',
  primaryCtaLabel = 'Get started',
  primaryCtaHref = '#',
  secondaryCtaLabel = 'Talk to sales',
  secondaryCtaHref = '#',
  variant = 'gradient',
}: CtaCenteredProps) {
  const bg =
    variant === 'gradient'
      ? 'bg-gradient-primary text-text-inverse'
      : variant === 'primary'
      ? 'bg-primary text-primary-text'
      : 'bg-surface text-text-primary border border-border';

  const isLight = variant === 'surface';
  const subTextColor = isLight ? 'text-text-secondary' : 'text-white/90';
  const eyebrowColor = isLight ? 'text-text-secondary border-border bg-bg' : 'text-white/90 border-white/20 bg-white/10';

  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className={`relative ${bg} rounded-2xl px-6 py-16 md:px-12 md:py-20 text-center overflow-hidden shadow-lg`}
        >
          {eyebrow && (
            <span className={`inline-flex items-center rounded-full border ${eyebrowColor} px-3 py-1 text-xs font-medium mb-6`}>
              {eyebrow}
            </span>
          )}
          <h2 className={`font-heading font-bold text-3xl md:text-5xl tracking-tight max-w-3xl mx-auto ${isLight ? 'text-text-primary' : ''}`}>
            {headline}
          </h2>
          {subheadline && (
            <p className={`mt-4 text-lg ${subTextColor} max-w-2xl mx-auto`}>
              {subheadline}
            </p>
          )}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={primaryCtaHref}
              className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold shadow-sm transition-colors ${
                isLight
                  ? 'bg-primary text-primary-text hover:bg-primary-hover'
                  : 'bg-white text-text-primary hover:bg-white/90'
              }`}
            >
              {primaryCtaLabel}
            </a>
            {secondaryCtaLabel && (
              <a
                href={secondaryCtaHref}
                className={`inline-flex items-center justify-center rounded-md px-6 py-3 font-semibold border transition-colors ${
                  isLight
                    ? 'border-border text-text-primary hover:bg-surface-hover'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                {secondaryCtaLabel}
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default CtaCentered;
