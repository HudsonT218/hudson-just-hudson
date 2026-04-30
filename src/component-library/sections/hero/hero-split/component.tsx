import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

export interface HeroSplitProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function HeroSplit({
  eyebrow = 'Built for modern teams',
  headline = 'Beautiful sites, shipped in record time',
  subheadline = 'Pick a layout, edit your content, and publish. Our system handles design, performance, and SEO so you can focus on growth.',
  primaryCtaLabel = 'Start free trial',
  primaryCtaHref = '#',
  secondaryCtaLabel = 'View demo',
  secondaryCtaHref = '#',
  imageUrl,
  imageAlt = 'Product screenshot',
}: HeroSplitProps) {
  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {eyebrow && (
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-6">
                {eyebrow}
              </span>
            )}
            <h1 className="font-heading font-bold text-text-primary text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight">
              {headline}
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              {subheadline}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full rounded-lg shadow-xl"
              />
            ) : (
              <div className="w-full aspect-video bg-bg-tertiary rounded-lg flex items-center justify-center shadow-xl border border-border">
                <ImageIcon className="w-16 h-16 text-text-muted" />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroSplit;
