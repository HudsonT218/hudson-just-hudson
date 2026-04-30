import { Twitter, Github, Linkedin, Youtube } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  youtube: Youtube,
};

export interface SocialLink {
  platform: keyof typeof SOCIAL_ICONS;
  href: string;
}

export interface FooterSimpleProps {
  logo?: string;
  logoImage?: string;
  copyright?: string;
  socials?: SocialLink[];
}

const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: 'twitter', href: '#' },
  { platform: 'github', href: '#' },
  { platform: 'linkedin', href: '#' },
];

export function FooterSimple({
  logo = 'Brand',
  logoImage,
  copyright = `© ${new Date().getFullYear()} Brand, Inc. All rights reserved.`,
  socials = DEFAULT_SOCIALS,
}: FooterSimpleProps) {
  return (
    <footer className="bg-bg border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:justify-between gap-4">
          <div className="flex items-center gap-2 font-heading font-bold text-text-primary">
            {logoImage ? (
              <img src={logoImage} alt={logo} className="h-7 w-auto" />
            ) : (
              <span>{logo}</span>
            )}
          </div>

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

export default FooterSimple;
