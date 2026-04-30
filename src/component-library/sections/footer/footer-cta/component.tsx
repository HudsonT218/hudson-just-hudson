import { motion } from 'framer-motion';
import { Twitter, Github, Linkedin, Youtube, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
};

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

export interface FooterSocial {
  platform: keyof typeof SOCIAL_ICONS;
  href: string;
}

export interface FooterCtaProps {
  ctaHeadline?: string;
  ctaSubheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
  logo?: string;
  logoImage?: string;
  description?: string;
  columns?: FooterColumn[];
  socials?: FooterSocial[];
  copyright?: string;
}

const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    heading: 'Product',
    links: [
      { label: 'Features', href: '#' },
      { label: 'Pricing', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Help center', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
];

const DEFAULT_SOCIALS: FooterSocial[] = [
  { platform: 'twitter', href: '#' },
  { platform: 'github', href: '#' },
  { platform: 'linkedin', href: '#' },
];

export function FooterCta({
  ctaHeadline = 'Ready to build something great?',
  ctaSubheadline = 'Try it free for 14 days. No credit card required.',
  ctaLabel = 'Get started',
  ctaHref = '#',
  logo = 'Brand',
  logoImage,
  description = 'Beautiful, fast websites for modern teams.',
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  copyright = `© ${new Date().getFullYear()} Brand, Inc. All rights reserved.`,
}: FooterCtaProps) {
  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-primary text-text-inverse rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 mb-16 shadow-lg"
        >
          <div>
            <h2 className="font-heading font-bold text-2xl md:text-3xl tracking-tight">
              {ctaHeadline}
            </h2>
            <p className="mt-2 text-white/90">{ctaSubheadline}</p>
          </div>
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white text-text-primary px-6 py-3 font-semibold shadow-sm hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-2 font-heading font-bold text-text-primary text-lg mb-4">
              {logoImage ? (
                <img src={logoImage} alt={logo} className="h-8 w-auto" />
              ) : (
                <span>{logo}</span>
              )}
            </div>
            <p className="text-text-secondary max-w-xs">{description}</p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-sm font-semibold text-text-primary mb-4">{col.heading}</h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">{copyright}</p>
          <div className="flex items-center gap-4">
            {socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.platform];
              if (!Icon) return null;
              return (
                <a
                  key={s.platform}
                  href={s.href}
                  aria-label={s.platform}
                  className="text-text-muted hover:text-text-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default FooterCta;
