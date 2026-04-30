import { useState } from 'react';
import { Menu, X, Megaphone } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarCenteredProps {
  logo?: string;
  logoImage?: string;
  links?: NavLink[];
  announcement?: string;
  announcementHref?: string;
  showAnnouncement?: boolean;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'Product', href: '#product' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
  { label: 'Contact', href: '#contact' },
];

export function NavbarCentered({
  logo = 'Brand',
  logoImage,
  links = DEFAULT_LINKS,
  announcement = 'New: Our Spring release is live — explore what is new.',
  announcementHref = '#',
  showAnnouncement = true,
}: NavbarCenteredProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full bg-bg border-b border-border">
      {showAnnouncement && (
        <a
          href={announcementHref}
          className="block bg-primary text-primary-text text-sm py-2 px-4 text-center hover:bg-primary-hover transition-colors"
        >
          <span className="inline-flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            {announcement}
          </span>
        </a>
      )}

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-6 gap-4">
          <a href="#" className="flex items-center gap-2 font-heading font-bold text-text-primary text-2xl">
            {logoImage ? (
              <img src={logoImage} alt={logo} className="h-10 w-auto" />
            ) : (
              <span>{logo}</span>
            )}
          </a>

          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden absolute right-4 top-4 inline-flex items-center justify-center p-2 text-text-primary rounded-md hover:bg-surface-hover"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border py-4 flex flex-col gap-3 items-center">
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
          </div>
        )}
      </nav>
    </header>
  );
}

export default NavbarCentered;
