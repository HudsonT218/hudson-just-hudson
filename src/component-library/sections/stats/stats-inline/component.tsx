import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

export interface StatItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

export interface StatsInlineProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  stats?: StatItem[];
  durationMs?: number;
}

const DEFAULT_STATS: StatItem[] = [
  { value: 25000, label: 'Active customers', suffix: '+' },
  { value: 99.99, label: 'Uptime', suffix: '%' },
  { value: 180, label: 'Countries served', suffix: '+' },
  { value: 4.9, label: 'Avg. customer rating', suffix: '/5' },
];

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toFixed(2).replace(/\.?0+$/, '');
}

function CountUp({ to, durationMs = 1500 }: { to: number; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, durationMs]);

  const display = Number.isInteger(to) ? Math.round(val) : Math.round(val * 100) / 100;
  return <span ref={ref}>{formatNumber(display)}</span>;
}

export function StatsInline({
  eyebrow,
  headline = 'Trusted at scale',
  subheadline = 'Numbers that reflect the work we put in for our customers every day.',
  stats = DEFAULT_STATS,
  durationMs = 1500,
}: StatsInlineProps) {
  return (
    <section className="bg-bg-secondary py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(headline || subheadline) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {eyebrow && (
              <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-secondary mb-4">
                {eyebrow}
              </span>
            )}
            {headline && (
              <h2 className="font-heading font-bold text-text-primary text-3xl md:text-4xl tracking-tight">
                {headline}
              </h2>
            )}
            {subheadline && <p className="mt-4 text-lg text-text-secondary">{subheadline}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-heading font-bold text-text-primary text-4xl md:text-5xl tracking-tight">
                {stat.prefix}
                <CountUp to={stat.value} durationMs={durationMs} />
                {stat.suffix}
              </div>
              <p className="mt-2 text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsInline;
