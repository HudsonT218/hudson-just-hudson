import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, BarChart3, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = { Zap, Shield, Sparkles, BarChart3, Users };

export interface BentoFeature {
  icon?: keyof typeof ICONS;
  title: string;
  description: string;
}

export interface FeaturesBentoProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  hero?: BentoFeature;
  features?: BentoFeature[];
}

const DEFAULT_HERO: BentoFeature = {
  icon: 'Sparkles',
  title: 'Designed to ship',
  description: 'Pre-built sections, polished animations, and smart defaults — so the first version is the right version.',
};

const DEFAULT_FEATURES: BentoFeature[] = [
  { icon: 'Zap', title: 'Fast by default', description: 'Edge-rendered, cached globally.' },
  { icon: 'Shield', title: 'Secure', description: 'SOC 2, SSO, encrypted at rest.' },
  { icon: 'BarChart3', title: 'Analytics', description: 'Built-in metrics that matter.' },
  { icon: 'Users', title: 'Collaboration', description: 'Real-time editing with your team.' },
];

export function FeaturesBento({
  eyebrow = 'The toolkit',
  headline = 'A complete kit for shipping work you are proud of',
  subheadline = 'Each part of the stack is designed to work beautifully on its own and even better together.',
  hero = DEFAULT_HERO,
  features = DEFAULT_FEATURES,
}: FeaturesBentoProps) {
  const HeroIcon = ICONS[hero.icon || 'Sparkles'] || Sparkles;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[1fr]">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-primary text-text-inverse p-8 rounded-xl shadow-md flex flex-col justify-end min-h-[280px]"
          >
            <div className="inline-flex w-12 h-12 rounded-md bg-white/15 items-center justify-center mb-4">
              <HeroIcon className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-semibold text-2xl mb-2">{hero.title}</h3>
            <p className="text-white/90 leading-relaxed max-w-md">{hero.description}</p>
          </motion.article>

          {features.map((feature, i) => {
            const Icon = ICONS[feature.icon || 'Zap'] || Zap;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="bg-surface border border-border p-6 rounded-xl"
              >
                <div className="inline-flex w-10 h-10 rounded-md bg-primary/10 text-primary items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-base text-text-primary mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesBento;
