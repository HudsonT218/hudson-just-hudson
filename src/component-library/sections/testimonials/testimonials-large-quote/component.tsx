import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

export interface LargeQuoteTestimonial {
  quote: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  company?: string;
}

export interface TestimonialsLargeQuoteProps {
  eyebrow?: string;
  testimonials?: LargeQuoteTestimonial[];
  autoCycle?: boolean;
  intervalMs?: number;
}

const DEFAULT_TESTIMONIALS: LargeQuoteTestimonial[] = [
  {
    quote:
      'We rebuilt the entire marketing site in a weekend, and the result is the best work our team has ever shipped. It changed how we work.',
    name: 'Sarah Chen',
    role: 'Head of Marketing',
    company: 'Northwind',
  },
  {
    quote:
      'Polished, fast, and a joy to use. It is rare to find a tool that gets all three right.',
    name: 'Marcus Adebayo',
    role: 'Director of Brand',
    company: 'Lumio',
  },
];

export function TestimonialsLargeQuote({
  eyebrow = 'Customer story',
  testimonials = DEFAULT_TESTIMONIALS,
  autoCycle = true,
  intervalMs = 7000,
}: TestimonialsLargeQuoteProps) {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;

  useEffect(() => {
    if (!autoCycle || total <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoCycle, intervalMs, total]);

  if (total === 0) return null;
  const t = testimonials[index];

  return (
    <section className="bg-bg-secondary py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {eyebrow && (
          <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-8">
            {eyebrow}
          </span>
        )}

        <Quote className="w-16 h-16 text-primary/30 mx-auto mb-6" />

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <blockquote className="font-heading font-medium text-text-primary text-2xl md:text-4xl leading-tight tracking-tight">
              "{t.quote}"
            </blockquote>
            <footer className="mt-10 inline-flex items-center gap-4">
              {t.avatarUrl ? (
                <img
                  src={t.avatarUrl}
                  alt={t.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold text-lg">
                  {t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold text-text-primary">{t.name}</div>
                <div className="text-sm text-text-muted">
                  {t.role}
                  {t.role && t.company ? ' · ' : ''}
                  {t.company}
                </div>
              </div>
            </footer>
          </motion.div>
        </AnimatePresence>

        {total > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-primary' : 'bg-border hover:bg-border-hover'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default TestimonialsLargeQuote;
