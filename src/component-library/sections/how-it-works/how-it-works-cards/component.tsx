import { motion } from 'framer-motion';

export interface CardStep {
  title: string;
  description: string;
}

export interface HowItWorksCardsProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  steps?: CardStep[];
}

const DEFAULT_STEPS: CardStep[] = [
  {
    title: 'Plan your launch',
    description: 'Map out your goals, audience, and key messaging in our guided onboarding flow.',
  },
  {
    title: 'Design your site',
    description: 'Pick polished sections, swap in your content, and tweak your brand tokens.',
  },
  {
    title: 'Launch and grow',
    description: 'Publish in one click, track engagement, and iterate based on real visitor data.',
  },
];

export function HowItWorksCards({
  eyebrow = 'How it works',
  headline = 'A simple process from start to launch',
  subheadline = 'Three steps. Hours, not weeks.',
  steps = DEFAULT_STEPS,
}: HowItWorksCardsProps) {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative bg-surface border border-border rounded-xl p-8 overflow-hidden shadow-sm"
            >
              <span
                className="absolute -top-4 -right-2 font-heading font-bold text-[120px] leading-none text-primary/10 select-none pointer-events-none"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="relative">
                <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-primary mb-4">
                  Step {i + 1}
                </span>
                <h3 className="font-heading font-semibold text-xl text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{step.description}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksCards;
