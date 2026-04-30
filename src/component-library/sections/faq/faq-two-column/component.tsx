import { motion } from 'framer-motion';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqTwoColumnProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  contactLabel?: string;
  contactHref?: string;
  contactCtaLabel?: string;
  items?: FaqItem[];
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    question: 'How long does it take to launch?',
    answer:
      'Most teams ship a polished site in a single day. The editor handles design and performance for you.',
  },
  {
    question: 'Can I use a custom domain?',
    answer:
      'Yes — connect any domain and we will handle SSL automatically. You can also export to host elsewhere.',
  },
  {
    question: 'Do you support teams?',
    answer:
      'Invite teammates, leave inline comments, and review changes before they ship — all in real time.',
  },
  {
    question: 'What about accessibility?',
    answer:
      'Every section is built to WCAG 2.1 AA standards by default, so your site is accessible from day one.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Start free for 14 days, no credit card required. Cancel any time from your dashboard.',
  },
  {
    question: 'How do you handle data?',
    answer:
      'We are SOC 2 Type II compliant, support SSO, and encrypt data at rest and in transit.',
  },
];

export function FaqTwoColumn({
  eyebrow = 'FAQ',
  headline = 'Got questions?',
  subheadline = 'Quick answers to the things people ask most. Still curious? We are happy to chat.',
  contactLabel = 'Cannot find what you are looking for?',
  contactHref = '#',
  contactCtaLabel = 'Contact support',
  items = DEFAULT_ITEMS,
}: FaqTwoColumnProps) {
  return (
    <section className="bg-bg py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            {eyebrow && (
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-4">
                {eyebrow}
              </span>
            )}
            <h2 className="font-heading font-bold text-text-primary text-3xl md:text-4xl tracking-tight">
              {headline}
            </h2>
            <p className="mt-4 text-lg text-text-secondary">{subheadline}</p>
            <div className="mt-8 p-5 bg-surface border border-border rounded-xl">
              <p className="text-sm text-text-secondary mb-3">{contactLabel}</p>
              <a
                href={contactHref}
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-primary-text font-semibold text-sm shadow-sm hover:bg-primary-hover transition-colors"
              >
                {contactCtaLabel}
              </a>
            </div>
          </motion.div>

          <div className="lg:col-span-2 flex flex-col divide-y divide-border">
            {items.map((item, i) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="py-6 first:pt-0"
              >
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                  {item.question}
                </h3>
                <p className="text-text-secondary leading-relaxed">{item.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FaqTwoColumn;
