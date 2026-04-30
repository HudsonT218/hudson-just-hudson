import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export interface Testimonial {
  quote: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  rating?: number;
}

export interface TestimonialsCardsGridProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  testimonials?: Testimonial[];
  showRatings?: boolean;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote: 'We launched our marketing site in two days instead of two months. The result looked better than anything we have ever shipped.',
    name: 'Sarah Chen',
    role: 'Head of Marketing, Northwind',
    rating: 5,
  },
  {
    quote: 'The editor finally lets non-engineers iterate on the site without breaking the design system. It is a complete win.',
    name: 'Marcus Adebayo',
    role: 'Director of Brand, Lumio',
    rating: 5,
  },
  {
    quote: 'Performance is incredible. Our pages went from 3.5 seconds to under one second on mobile after the migration.',
    name: 'Priya Patel',
    role: 'Engineering Manager, Hyperion',
    rating: 5,
  },
  {
    quote: 'Honestly, I was skeptical. Then we shipped three campaigns in a single sprint. I am no longer skeptical.',
    name: 'David Rivera',
    role: 'Growth Lead, Stratus',
    rating: 4,
  },
  {
    quote: 'The built-in analytics tell us exactly what to fix next. No more guessing — we just iterate where the data points us.',
    name: 'Emily Foster',
    role: 'Product Lead, Vantage',
    rating: 5,
  },
  {
    quote: 'It pays for itself in the first month. We canceled three other tools and our site improved.',
    name: 'Jordan Kim',
    role: 'Founder, Pillar',
    rating: 5,
  },
];

export function TestimonialsCardsGrid({
  eyebrow = 'Testimonials',
  headline = 'Loved by teams that ship',
  subheadline = 'Hear what our customers say about working with us.',
  testimonials = DEFAULT_TESTIMONIALS,
  showRatings = true,
}: TestimonialsCardsGridProps) {
  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.article
              key={`${t.name}-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col"
            >
              {showRatings && t.rating !== undefined && (
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${idx < (t.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-text-muted'}`}
                    />
                  ))}
                </div>
              )}
              <blockquote className="text-text-primary leading-relaxed flex-1">
                "{t.quote}"
              </blockquote>
              <footer className="mt-6 flex items-center gap-3">
                {t.avatarUrl ? (
                  <img
                    src={t.avatarUrl}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                    {t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-text-primary text-sm">{t.name}</div>
                  {t.role && <div className="text-xs text-text-muted">{t.role}</div>}
                </div>
              </footer>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCardsGrid;
