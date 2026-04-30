import { motion } from 'framer-motion';
import { Image as ImageIcon, Check } from 'lucide-react';

export interface AlternatingRow {
  eyebrow?: string;
  title: string;
  description: string;
  bullets?: string[];
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface FeaturesAlternatingProps {
  headline?: string;
  subheadline?: string;
  rows?: AlternatingRow[];
}

const DEFAULT_ROWS: AlternatingRow[] = [
  {
    eyebrow: 'Build',
    title: 'A drag-and-drop editor that respects your design system',
    description: 'Compose pages from polished sections without breaking your design tokens. Every block stays consistent, on brand, and accessible by default.',
    bullets: ['Token-aware editor', 'Section library', 'Realtime preview'],
    ctaLabel: 'Explore the editor',
    ctaHref: '#',
  },
  {
    eyebrow: 'Ship',
    title: 'Deploy globally with one click',
    description: 'Built-in CDN, automatic image optimization, and instant rollbacks. Your visitors get a fast experience anywhere in the world.',
    bullets: ['Edge deploys', 'Atomic rollbacks', 'Preview environments'],
    ctaLabel: 'See the runtime',
    ctaHref: '#',
  },
  {
    eyebrow: 'Grow',
    title: 'Understand what works and double down',
    description: 'Built-in analytics surface the sections, copy, and CTAs that drive results — so you can iterate with confidence.',
    bullets: ['Funnel breakdowns', 'Heatmaps', 'A/B testing'],
    ctaLabel: 'Browse analytics',
    ctaHref: '#',
  },
];

export function FeaturesAlternating({
  headline = 'A platform that grows with you',
  subheadline = 'From the first prototype to a fully optimized funnel, every step is built in.',
  rows = DEFAULT_ROWS,
}: FeaturesAlternatingProps) {
  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-bold text-text-primary text-3xl md:text-4xl tracking-tight">
            {headline}
          </h2>
          <p className="mt-4 text-lg text-text-secondary">{subheadline}</p>
        </div>

        <div className="flex flex-col gap-20 md:gap-28">
          {rows.map((row, i) => {
            const reverse = i % 2 === 1;
            return (
              <div
                key={row.title}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5 }}
                  className={reverse ? 'lg:order-2' : ''}
                >
                  {row.eyebrow && (
                    <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-4">
                      {row.eyebrow}
                    </span>
                  )}
                  <h3 className="font-heading font-bold text-text-primary text-2xl md:text-3xl tracking-tight">
                    {row.title}
                  </h3>
                  <p className="mt-4 text-text-secondary leading-relaxed">{row.description}</p>

                  {row.bullets && row.bullets.length > 0 && (
                    <ul className="mt-6 flex flex-col gap-3">
                      {row.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-3">
                          <span className="inline-flex w-5 h-5 mt-0.5 rounded-full bg-primary/10 text-primary items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                          <span className="text-text-primary">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {row.ctaLabel && (
                    <div className="mt-8">
                      <a
                        href={row.ctaHref || '#'}
                        className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-text-primary font-semibold hover:bg-surface-hover transition-colors"
                      >
                        {row.ctaLabel}
                      </a>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className={reverse ? 'lg:order-1' : ''}
                >
                  {row.imageUrl ? (
                    <img
                      src={row.imageUrl}
                      alt={row.title}
                      className="w-full rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-bg-tertiary rounded-lg flex items-center justify-center border border-border">
                      <ImageIcon className="w-16 h-16 text-text-muted" />
                    </div>
                  )}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesAlternating;
