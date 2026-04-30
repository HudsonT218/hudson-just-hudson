import { Twitter, Github, Linkedin, Youtube } from 'lucide-react';
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

export interface FooterMultiColumnProps {
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
      { label: 'Integrations', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Customers', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Blog', href: '#' },
      { label: 'Guides', href: '#' },
      { label: 'Help center', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
  },
];

const DEFAULT_SOCIALS: FooterSocial[] = [
  { platform: 'twitter', href: '#' },
  { platform: 'github', href: '#' },
  { platform: 'linkedin', href: '#' },
  { platform: 'youtube', href: '#' },
];

export function FooterMultiColumn({
  logo = 'Brand',
  logoImage,
  description = 'Beautiful, fast websites for modern teams.',
  columns = DEFAULT_COLUMNS,
  socials = DEFAULT_SOCIALS,
  copyright = `© ${new Date().getFullYear()} Brand, Inc. All rights reserved.`,
}: FooterMultiColumnProps) {
  return (
    <footer className="bg-bg-secondary border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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

export default FooterMultiColumn;
