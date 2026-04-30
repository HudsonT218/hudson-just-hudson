import { motion } from 'framer-motion';

export interface HeroVideoProps {
  videoUrl?: string;
  posterUrl?: string;
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  overlayOpacity?: number;
}

export function HeroVideo({
  videoUrl,
  posterUrl,
  headline = 'Build beautiful websites without limits',
  subheadline = 'A complete toolkit for designers, marketers, and founders who care about every pixel.',
  ctaLabel = 'Start free trial',
  ctaHref = '#',
  overlayOpacity = 0.55,
}: HeroVideoProps) {
  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden bg-bg-tertiary">
      {videoUrl ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gradient-primary" />
      )}

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="font-heading font-bold text-white text-4xl sm:text-5xl md:text-display leading-tight tracking-tight">
              {headline}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/90 leading-relaxed">
              {subheadline}
            </p>
            <div className="mt-10 flex justify-center">
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-4 text-primary-text font-semibold text-lg shadow-lg hover:bg-primary-hover transition-colors"
              >
                {ctaLabel}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default HeroVideo;
