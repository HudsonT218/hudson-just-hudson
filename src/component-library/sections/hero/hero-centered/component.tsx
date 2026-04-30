import { motion } from 'framer-motion';

export interface HeroCenteredProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  logoStrip?: { name: string; src?: string }[];
  showLogoStrip?: boolean;
}

const DEFAULT_LOGOS = [
  { name: 'Acme' },
  { name: 'Globex' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Stark' },
];

export function HeroCentered({
  eyebrow = 'Now in public beta',
  headline = 'The fastest way to launch a beautiful website',
  subheadline = 'Build, customize, and ship a polished site in minutes. No code, no compromises — just clean design that converts.',
  primaryCtaLabel = 'Start free trial',
  primaryCtaHref = '#',
  secondaryCtaLabel = 'See how it works',
  secondaryCtaHref = '#',
  logoStrip = DEFAULT_LOGOS,
  showLogoStrip = true,
}: HeroCenteredProps) {
  return (
    <section className="relative bg-bg py-20 md:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-6">
              {eyebrow}
            </span>
          )}
          <h1 className="font-heading font-bold text-text-primary text-4xl sm:text-5xl md:text-display leading-tight tracking-tight">
            {headline}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed">
            {subheadline}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={primaryCtaHref}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
            >
              {primaryCtaLabel}
            </a>
            <a
              href={secondaryCtaHref}
              className="inline-flex items-center justify-center rounded-md border border-border px-6 py-3 text-text-primary font-semibold hover:bg-surface-hover transition-colors"
            >
              {secondaryCtaLabel}
            </a>
          </div>
        </motion.div>

        {showLogoStrip && logoStrip.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-20"
          >
            <p className="text-center text-sm text-text-muted mb-6">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
              {logoStrip.map((logo) => (
                <div
                  key={logo.name}
                  className="text-text-muted font-heading font-semibold text-lg"
                >
                  {logo.src ? (
                    <img src={logo.src} alt={logo.name} className="h-8 w-auto" />
                  ) : (
                    logo.name
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default HeroCentered;
