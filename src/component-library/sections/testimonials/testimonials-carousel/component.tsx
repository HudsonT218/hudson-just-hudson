import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

export interface CarouselTestimonial {
  quote: string;
  name: string;
  role?: string;
  avatarUrl?: string;
  company?: string;
}

export interface TestimonialsCarouselProps {
  eyebrow?: string;
  headline?: string;
  testimonials?: CarouselTestimonial[];
  autoplay?: boolean;
  intervalMs?: number;
}

const DEFAULT_TESTIMONIALS: CarouselTestimonial[] = [
  {
    quote:
      'We replaced three tools with one and shipped a brand-new marketing site in a single sprint. The team is more aligned than ever.',
    name: 'Sarah Chen',
    role: 'Head of Marketing',
    company: 'Northwind',
  },
  {
    quote:
      'The platform pays for itself in the first month. Performance, polish, and pace — we got all three without trade-offs.',
    name: 'Marcus Adebayo',
    role: 'Director of Brand',
    company: 'Lumio',
  },
  {
    quote:
      'I never thought I would say this about a website tool, but it is genuinely a joy to use every day.',
    name: 'Priya Patel',
    role: 'Engineering Manager',
    company: 'Hyperion',
  },
];

export function TestimonialsCarousel({
  eyebrow = 'What people are saying',
  headline = 'Trusted by teams across every industry',
  testimonials = DEFAULT_TESTIMONIALS,
  autoplay = true,
  intervalMs = 5500,
}: TestimonialsCarouselProps) {
  const [index, setIndex] = useState(0);
  const total = testimonials.length;

  useEffect(() => {
    if (!autoplay || total <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [autoplay, intervalMs, total]);

  if (total === 0) return null;
  const t = testimonials[index];

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
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="bg-surface border border-border rounded-2xl shadow-md p-8 md:p-12 min-h-[260px]">
            <Quote className="w-10 h-10 text-primary/30 mb-4" />
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <blockquote className="text-text-primary text-lg md:text-xl leading-relaxed">
                  {t.quote}
                </blockquote>
                <footer className="mt-6 flex items-center gap-3">
                  {t.avatarUrl ? (
                    <img
                      src={t.avatarUrl}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                      {t.name.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div>
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
          </div>

          {total > 1 && (
            <>
              <div className="flex items-center justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === index ? 'bg-primary' : 'bg-border hover:bg-border-hover'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => setIndex((i) => (i - 1 + total) % total)}
                className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center text-text-primary hover:bg-surface-hover transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => setIndex((i) => (i + 1) % total)}
                className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-surface border border-border shadow-sm flex items-center justify-center text-text-primary hover:bg-surface-hover transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;
