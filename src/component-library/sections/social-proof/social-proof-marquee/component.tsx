export interface MarqueeLogo {
  name: string;
  src?: string;
}

export interface SocialProofMarqueeProps {
  label?: string;
  logos?: MarqueeLogo[];
  speed?: 'slow' | 'normal' | 'fast';
}

const DEFAULT_LOGOS: MarqueeLogo[] = [
  { name: 'Acme' },
  { name: 'Globex' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Stark Industries' },
  { name: 'Wayne Co.' },
  { name: 'Pied Piper' },
  { name: 'Hooli' },
];

export function SocialProofMarquee({
  label = 'Trusted by leading teams worldwide',
  logos = DEFAULT_LOGOS,
  speed = 'normal',
}: SocialProofMarqueeProps) {
  const duration = speed === 'slow' ? '50s' : speed === 'fast' ? '20s' : '35s';
  const doubled = [...logos, ...logos];

  return (
    <section className="bg-bg py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-text-muted mb-10">
          {label}
        </p>
      </div>

      <div className="relative overflow-hidden mask-fade">
        <div
          className="flex w-max animate-marquee gap-12 sm:gap-16 items-center"
          style={{ animationDuration: duration }}
        >
          {doubled.map((logo, i) => (
            <div
              key={`${logo.name}-${i}`}
              className="flex items-center justify-center text-text-muted grayscale opacity-70 hover:opacity-100 hover:grayscale-0 hover:text-text-primary transition-all flex-shrink-0"
            >
              {logo.src ? (
                <img src={logo.src} alt={logo.name} className="h-8 w-auto" />
              ) : (
                <span className="font-heading font-semibold text-lg whitespace-nowrap">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
}

export default SocialProofMarquee;
