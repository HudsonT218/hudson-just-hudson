import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Fragment } from 'react';

export interface HorizontalStep {
  title: string;
  description: string;
}

export interface HowItWorksHorizontalProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  steps?: HorizontalStep[];
}

const DEFAULT_STEPS: HorizontalStep[] = [
  { title: 'Sign up', description: 'Create a free account in under a minute.' },
  { title: 'Pick a template', description: 'Start from a polished design tuned for your industry.' },
  { title: 'Customize', description: 'Edit content, brand, and layout to fit your story.' },
  { title: 'Publish', description: 'Ship to a custom domain with one click.' },
];

export function HowItWorksHorizontal({
  eyebrow = 'How it works',
  headline = 'From signup to live in minutes',
  subheadline = 'A clear path forward at every stage.',
  steps = DEFAULT_STEPS,
}: HowItWorksHorizontalProps) {
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

        <div className="flex flex-col md:flex-row md:items-stretch flex-wrap gap-6 md:gap-2 justify-center">
          {steps.map((step, i) => (
            <Fragment key={step.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex-1 min-w-[220px] bg-surface border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-primary text-primary-text font-heading font-bold flex items-center justify-center mb-4">
                  {i + 1}
                </div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">{step.description}</p>
              </motion.div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-text-muted px-1">
                  <ArrowRight className="w-6 h-6" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksHorizontal;
