import { motion } from 'framer-motion';

export interface GridLogo {
  name: string;
  src?: string;
}

export interface SocialProofGridProps {
  label?: string;
  logos?: GridLogo[];
}

const DEFAULT_LOGOS: GridLogo[] = [
  { name: 'Acme' },
  { name: 'Globex' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Stark' },
  { name: 'Wayne' },
  { name: 'Pied Piper' },
  { name: 'Hooli' },
  { name: 'Soylent' },
  { name: 'Cyberdyne' },
  { name: 'Tyrell' },
  { name: 'Vandelay' },
];

export function SocialProofGrid({
  label = 'Powering thousands of fast-growing businesses',
  logos = DEFAULT_LOGOS,
}: SocialProofGridProps) {
  return (
    <section className="bg-bg py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-medium uppercase tracking-wider text-text-muted mb-12"
        >
          {label}
        </motion.p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-10 items-center">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center justify-center grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all"
            >
              {logo.src ? (
                <img src={logo.src} alt={logo.name} className="h-8 w-auto" />
              ) : (
                <span className="font-heading font-semibold text-lg text-text-secondary hover:text-text-primary transition-colors">
                  {logo.name}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SocialProofGrid;
