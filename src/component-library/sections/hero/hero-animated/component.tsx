import { motion } from 'framer-motion';

export interface HeroAnimatedProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function HeroAnimated({
  eyebrow = 'New • AI-powered',
  headline = 'Design that thinks alongside you',
  subheadline = 'A creative platform built for speed, polish, and the parts of the work you actually enjoy.',
  primaryCtaLabel = 'Get Started',
  primaryCtaHref = '#',
  secondaryCtaLabel = 'Watch demo',
  secondaryCtaHref = '#',
}: HeroAnimatedProps) {
  return (
    <section className="relative bg-bg py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <motion.div
          className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-primary/30 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 -right-32 w-[420px] h-[420px] rounded-full bg-accent/30 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/3 w-[360px] h-[360px] rounded-full bg-secondary/30 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          {eyebrow && (
            <span className="inline-flex items-center rounded-full border border-border bg-surface/80 backdrop-blur px-3 py-1 text-xs font-medium text-text-secondary mb-6">
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
              className="inline-flex items-center justify-center rounded-md border border-border bg-bg/60 backdrop-blur px-6 py-3 text-text-primary font-semibold hover:bg-surface-hover transition-colors"
            >
              {secondaryCtaLabel}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroAnimated;
