import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, BarChart3, Users, Globe, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = { Zap, Shield, Sparkles, BarChart3, Users, Globe };

export interface HoverCardFeature {
  icon?: keyof typeof ICONS;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}

export interface FeaturesHoverCardsProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  features?: HoverCardFeature[];
}

const DEFAULT_FEATURES: HoverCardFeature[] = [
  { icon: 'Zap', title: 'Lightning fast', description: 'Sub-second loads with global edge caching.', linkLabel: 'See benchmarks', href: '#' },
  { icon: 'Shield', title: 'Secure by default', description: 'SOC 2, SSO, encrypted at rest and in transit.', linkLabel: 'Read the report', href: '#' },
  { icon: 'Sparkles', title: 'AI-assisted editing', description: 'Generate copy and refine layouts in seconds.', linkLabel: 'Try the editor', href: '#' },
  { icon: 'BarChart3', title: 'Built-in analytics', description: 'Track engagement and conversion out of the box.', linkLabel: 'View dashboard', href: '#' },
  { icon: 'Users', title: 'Team collaboration', description: 'Comment, review, and ship together in real time.', linkLabel: 'Invite teammates', href: '#' },
  { icon: 'Globe', title: 'Global CDN', description: 'Auto-deploy to over 200 edge locations worldwide.', linkLabel: 'Explore the network', href: '#' },
];

export function FeaturesHoverCards({
  eyebrow = 'Why teams choose us',
  headline = 'Everything you need to launch',
  subheadline = 'A focused platform that helps you build, ship, and grow.',
  features = DEFAULT_FEATURES,
}: FeaturesHoverCardsProps) {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = ICONS[feature.icon || 'Zap'] || Zap;
            return (
              <motion.a
                key={feature.title}
                href={feature.href || '#'}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group block bg-surface border border-border rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-border-hover transition-all"
              >
                <div className="inline-flex w-12 h-12 rounded-md bg-primary/10 text-primary items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-text transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed mb-4">{feature.description}</p>
                {feature.linkLabel && (
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {feature.linkLabel}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesHoverCards;
