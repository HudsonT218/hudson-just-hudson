import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, BarChart3, Zap, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Users,
  BarChart3,
  Zap,
  Globe,
};

export interface StatCard {
  icon?: keyof typeof ICONS;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
}

export interface StatsCardsProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  stats?: StatCard[];
}

const DEFAULT_STATS: StatCard[] = [
  { icon: 'Users', label: 'Active users', value: '25,400', trend: 18, trendLabel: 'vs last quarter' },
  { icon: 'BarChart3', label: 'Avg. conversion lift', value: '+34%', trend: 6, trendLabel: 'vs last month' },
  { icon: 'Zap', label: 'Avg. page load', value: '0.8s', trend: -22, trendLabel: 'faster than before' },
  { icon: 'Globe', label: 'Countries served', value: '180+', trend: 12, trendLabel: 'new markets' },
];

export function StatsCards({
  eyebrow = 'By the numbers',
  headline = 'Real outcomes for real teams',
  subheadline = 'A snapshot of the impact our customers see in the first 90 days.',
  stats = DEFAULT_STATS,
}: StatsCardsProps) {
  return (
    <section className="bg-bg py-20 md:py-24">
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
          <p className="mt-4 text-lg text-text-secondary">{subheadline}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = ICONS[stat.icon || 'BarChart3'] || BarChart3;
            const TrendIcon = (stat.trend ?? 0) >= 0 ? TrendingUp : TrendingDown;
            const trendColor = (stat.trend ?? 0) >= 0 ? 'text-green-500' : 'text-red-500';
            return (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="bg-surface border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex w-10 h-10 rounded-md bg-primary/10 text-primary items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.trend !== undefined && (
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
                      <TrendIcon className="w-3.5 h-3.5" />
                      {stat.trend > 0 ? '+' : ''}
                      {stat.trend}%
                    </span>
                  )}
                </div>
                <div className="font-heading font-bold text-text-primary text-3xl tracking-tight">
                  {stat.value}
                </div>
                <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
                {stat.trendLabel && (
                  <p className="mt-1 text-xs text-text-muted">{stat.trendLabel}</p>
                )}
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatsCards;
