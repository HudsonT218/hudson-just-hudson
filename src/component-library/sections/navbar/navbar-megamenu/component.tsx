import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

export interface MegaMenuLink {
  label: string;
  href: string;
  description?: string;
}

export interface MegaMenuColumn {
  heading: string;
  links: MegaMenuLink[];
}

export interface MegaMenuItem {
  label: string;
  href?: string;
  columns?: MegaMenuColumn[];
}

export interface NavbarMegamenuProps {
  logo?: string;
  logoImage?: string;
  items?: MegaMenuItem[];
  ctaLabel?: string;
  ctaHref?: string;
}

const DEFAULT_ITEMS: MegaMenuItem[] = [
  {
    label: 'Product',
    columns: [
      {
        heading: 'Platform',
        links: [
          { label: 'Overview', href: '#', description: 'Tour the entire product' },
          { label: 'Integrations', href: '#', description: 'Connect your stack' },
          { label: 'Security', href: '#', description: 'Enterprise-grade safety' },
        ],
      },
      {
        heading: 'For teams',
        links: [
          { label: 'Engineering', href: '#', description: 'Ship faster, together' },
          { label: 'Marketing', href: '#', description: 'Launch campaigns quickly' },
          { label: 'Sales', href: '#', description: 'Close more deals' },
        ],
      },
    ],
  },
  {
    label: 'Solutions',
    columns: [
      {
        heading: 'By use case',
        links: [
          { label: 'Automation', href: '#', description: 'Run on autopilot' },
          { label: 'Analytics', href: '#', description: 'Insights in real time' },
          { label: 'Collaboration', href: '#', description: 'One source of truth' },
        ],
      },
    ],
  },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Company', href: '#company' },
];

export function NavbarMegamenu({
  logo = 'Brand',
  logoImage,
  items = DEFAULT_ITEMS,
  ctaLabel = 'Get Started',
  ctaHref = '#',
}: NavbarMegamenuProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-bg border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-2 font-heading font-bold text-text-primary text-lg">
            {logoImage ? (
              <img src={logoImage} alt={logo} className="h-8 w-auto" />
            ) : (
              <span>{logo}</span>
            )}
          </a>

          <div
            className="hidden lg:flex items-center gap-2"
            onMouseLeave={() => setOpenMenu(null)}
          >
            {items.map((item) => {
              const hasMenu = !!item.columns?.length;
              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => hasMenu && setOpenMenu(item.label)}
                >
                  {hasMenu ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {item.label}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <a
                      href={item.href || '#'}
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {item.label}
                    </a>
                  )}

                  {hasMenu && openMenu === item.label && (
                    <div className="absolute left-0 top-full pt-2">
                      <div
                        className="bg-bg border border-border rounded-lg shadow-lg p-6 grid gap-6"
                        style={{
                          gridTemplateColumns: `repeat(${Math.max(item.columns!.length, 1)}, minmax(220px, 1fr))`,
                          minWidth: `${Math.max(item.columns!.length * 240, 240)}px`,
                        }}
                      >
                        {item.columns!.map((col) => (
                          <div key={col.heading}>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                              {col.heading}
                            </h4>
                            <ul className="flex flex-col gap-3">
                              {col.links.map((l) => (
                                <li key={l.label}>
                                  <a
                                    href={l.href}
                                    className="block group"
                                  >
                                    <span className="block text-sm font-medium text-text-primary group-hover:text-primary transition-colors">
                                      {l.label}
                                    </span>
                                    {l.description && (
                                      <span className="block text-xs text-text-muted mt-0.5">
                                        {l.description}
                                      </span>
                                    )}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden lg:flex">
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
            className="lg:hidden inline-flex items-center justify-center p-2 text-text-primary rounded-md hover:bg-surface-hover"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border py-4 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.label} className="py-1">
                {item.columns ? (
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer py-2 text-base font-medium text-text-primary">
                      {item.label}
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="pl-4 pt-2 flex flex-col gap-2">
                      {item.columns.flatMap((col) => col.links).map((l) => (
                        <a
                          key={l.label}
                          href={l.href}
                          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </details>
                ) : (
                  <a
                    href={item.href || '#'}
                    className="block py-2 text-base font-medium text-text-primary"
                  >
                    {item.label}
                  </a>
                )}
              </div>
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

export default NavbarMegamenu;
