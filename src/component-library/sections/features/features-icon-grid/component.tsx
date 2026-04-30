import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, BarChart3, Users, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FeatureItem {
  icon?: keyof typeof ICONS;
  title: string;
  description: string;
}

export interface FeaturesIconGridProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  features?: FeatureItem[];
}

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Sparkles,
  BarChart3,
  Users,
  Globe,
};

const DEFAULT_FEATURES: FeatureItem[] = [
  { icon: 'Zap', title: 'Lightning fast', description: 'Page loads in under a second with global edge caching and smart pre-rendering.' },
  { icon: 'Shield', title: 'Secure by default', description: 'Enterprise-grade security with SOC 2, SSO, and end-to-end encryption.' },
  { icon: 'Sparkles', title: 'AI-assisted editing', description: 'Generate copy, refine layouts, and adjust styles with a single prompt.' },
  { icon: 'BarChart3', title: 'Built-in analytics', description: 'See exactly how visitors engage and which sections drive the most conversions.' },
  { icon: 'Users', title: 'Team collaboration', description: 'Comment, review, and ship updates together with realtime presence.' },
  { icon: 'Globe', title: 'Global CDN', description: 'Auto-deploy to over 200 edge locations so visitors get the fastest experience.' },
];

export function FeaturesIconGrid({
  eyebrow = 'Why teams choose us',
  headline = 'Everything you need, nothing you do not',
  subheadline = 'A focused toolkit that helps you build, launch, and grow without the bloat.',
  features = DEFAULT_FEATURES,
}: FeaturesIconGridProps) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = ICONS[feature.icon || 'Zap'] || Zap;
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6"
              >
                <div className="inline-flex w-12 h-12 rounded-md bg-primary/10 text-primary items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesIconGrid;
