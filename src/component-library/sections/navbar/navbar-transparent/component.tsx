import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarTransparentProps {
  logo?: string;
  logoImage?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export function NavbarTransparent({
  logo = 'Brand',
  logoImage,
  links = DEFAULT_LINKS,
  ctaLabel = 'Get Started',
  ctaHref = '#',
}: NavbarTransparentProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-bg/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a
            href="#"
            className={`flex items-center gap-2 font-heading font-bold text-lg transition-colors ${
              scrolled ? 'text-text-primary' : 'text-text-inverse'
            }`}
          >
            {logoImage ? (
              <img src={logoImage} alt={logo} className="h-8 w-auto" />
            ) : (
              <span>{logo}</span>
            )}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-text-secondary hover:text-text-primary'
                    : 'text-text-inverse/80 hover:text-text-inverse'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex">
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
            >
              {ctaLabel}
            </a>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className={`md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-surface-hover ${
              scrolled ? 'text-text-primary' : 'text-text-inverse'
            }`}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-bg py-4 flex flex-col gap-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-base font-medium text-text-secondary hover:text-text-primary transition-colors py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaHref}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-text font-semibold shadow-sm hover:bg-primary-hover transition-colors"
            >
              {ctaLabel}
            </a>
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavbarTransparent;
