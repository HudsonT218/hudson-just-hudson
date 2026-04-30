import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  items?: FaqItem[];
  allowMultiple?: boolean;
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: 'How long does it take to launch a site?',
    answer:
      'Most teams ship a polished marketing site within a day. The editor handles the design system, performance, and SEO so you can focus on content.',
  },
  {
    question: 'Can I use my own custom domain?',
    answer:
      'Yes. Connect any domain you own, and we will provision SSL automatically. You can also export your site to host wherever you like.',
  },
  {
    question: 'Do you support team collaboration?',
    answer:
      'Absolutely. Invite teammates, leave inline comments, and review changes before they ship. Real-time presence keeps everyone in sync.',
  },
  {
    question: 'What about accessibility and SEO?',
    answer:
      'Every section is built to WCAG 2.1 AA standards out of the box. Pages are pre-rendered and ship with structured data, sitemaps, and clean semantic HTML.',
  },
  {
    question: 'Can I cancel any time?',
    answer:
      'Yes — cancel from your dashboard whenever you like. Your site will continue running until the end of your billing period.',
  },
];

export function FaqAccordion({
  eyebrow = 'FAQ',
  headline = 'Frequently asked questions',
  subheadline = 'Everything you need to know before getting started.',
  items = DEFAULT_ITEMS,
  allowMultiple = false,
}: FaqAccordionProps) {
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggle = (i: number) => {
    setOpenIndices((cur) => {
      const isOpen = cur.includes(i);
      if (allowMultiple) {
        return isOpen ? cur.filter((x) => x !== i) : [...cur, i];
      }
      return isOpen ? [] : [i];
    });
  };

  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
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

        <div className="flex flex-col gap-3">
          {items.map((item, i) => {
            const isOpen = openIndices.includes(i);
            return (
              <div
                key={item.question}
                className="bg-surface border border-border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-surface-hover transition-colors"
                >
                  <span className="font-medium text-text-primary">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-text-muted transition-transform flex-shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-text-secondary leading-relaxed">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FaqAccordion;
