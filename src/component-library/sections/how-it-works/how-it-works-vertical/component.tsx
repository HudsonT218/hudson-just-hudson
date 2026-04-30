import { motion } from 'framer-motion';

export interface VerticalStep {
  title: string;
  description: string;
}

export interface HowItWorksVerticalProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  steps?: VerticalStep[];
}

const DEFAULT_STEPS: VerticalStep[] = [
  {
    title: 'Pick a starting point',
    description: 'Choose from a curated set of beautifully designed templates and section variants.',
  },
  {
    title: 'Make it yours',
    description: 'Edit copy, swap images, and tune your brand tokens — every change updates instantly.',
  },
  {
    title: 'Publish anywhere',
    description: 'Deploy to our global edge network, your custom domain, or export clean code.',
  },
  {
    title: 'Iterate with data',
    description: 'See exactly what is working and refine your funnel with built-in analytics.',
  },
];

export function HowItWorksVertical({
  eyebrow = 'How it works',
  headline = 'Live in four simple steps',
  subheadline = 'A streamlined flow from idea to a polished, public site.',
  steps = DEFAULT_STEPS,
}: HowItWorksVerticalProps) {
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

        <div className="max-w-2xl mx-auto relative">
          <div className="absolute left-6 top-3 bottom-3 w-px bg-border" aria-hidden="true" />
          <ol className="flex flex-col gap-10">
            {steps.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-primary-text font-heading font-bold flex items-center justify-center shadow-md flex-shrink-0">
                  {i + 1}
                </div>
                <div className="pt-2">
                  <h3 className="font-heading font-semibold text-xl text-text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksVertical;
