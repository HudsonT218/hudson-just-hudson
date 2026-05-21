import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/useTheme";

const NAV_LINKS: Array<{ label: string; href: string }> = [
  { label: "About",     href: "#about" },
  { label: "Work",      href: "/work" },
  { label: "Resources", href: "/resources" },
  { label: "Contact",   href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolveHref = (href: string) => {
    if (href.startsWith("/")) return href;
    return isHome ? href : `/${href}`;
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const resolved = resolveHref(href);

    // Hash-only link on the current page, let the browser scroll natively
    if (resolved.startsWith("#")) return;

    // Route with hash (e.g. "/#services"), navigate then scroll
    if (resolved.startsWith("/") && resolved.includes("#")) {
      e.preventDefault();
      const [path, hash] = resolved.split("#");
      const target = path || "/";
      if (location.pathname === target) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(target);
        // Wait for render then scroll
        requestAnimationFrame(() => {
          setTimeout(() => {
            document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        });
      }
      return;
    }

    // Pure route link (e.g. "/work"), client-side navigate
    if (resolved.startsWith("/")) {
      e.preventDefault();
      navigate(resolved);
      window.scrollTo(0, 0);
    }
  };

  const logoHref = isHome ? "#hero" : "/";

  return (
    <nav
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? theme === "light"
            ? "rgba(245,245,245,0.85)"
            : "rgba(9,9,11,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid var(--app-border-med)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href={logoHref}
          onClick={(e) => handleNav(e, logoHref)}
          aria-label="Hudson Turansky · Home"
          className="text-xl font-extrabold text-white tracking-tight"
          style={{ letterSpacing: "-0.03em" }}
        >
          HT
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const resolved = resolveHref(link.href);
            const isCurrent =
              location.pathname === resolved ||
              (link.href.startsWith("#") && isHome && location.hash === link.href);
            return (
              <a
                key={link.label}
                href={resolved}
                onClick={(e) => handleNav(e, link.href)}
                aria-current={isCurrent ? "page" : undefined}
                className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </a>
            );
          })}
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        {/* Mobile theme toggle + menu */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle theme={theme} onToggle={toggleTheme} compact />
          <button
            className="w-10 h-10 flex items-center justify-center rounded-md text-gray-400"
            style={{ border: "1px solid var(--app-border-strong)" }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="3" y1="3" x2="13" y2="13" />
                <line x1="13" y1="3" x2="3" y2="13" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="2" y1="4.5" x2="14" y2="4.5" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="11.5" x2="14" y2="11.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav"
        role="menu"
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className="px-6 pb-5 pt-2"
          style={{
            backgroundColor:
              theme === "light" ? "rgba(245,245,245,0.97)" : "rgba(9,9,11,0.95)",
            borderBottom: "1px solid var(--app-border-med)",
          }}
        >
          {NAV_LINKS.map((link) => {
            const resolved = resolveHref(link.href);
            const isCurrent =
              location.pathname === resolved ||
              (link.href.startsWith("#") && isHome && location.hash === link.href);
            return (
              <a
                key={link.label}
                href={resolved}
                onClick={(e) => {
                  handleNav(e, link.href);
                  setOpen(false);
                }}
                aria-current={isCurrent ? "page" : undefined}
                className="block py-2.5 text-sm text-gray-500 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

// ---------------------------------------------------------------------------
// Theme toggle button
// ---------------------------------------------------------------------------

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
  compact?: boolean;
}

const ThemeToggle = ({ theme, onToggle, compact = false }: ThemeToggleProps) => {
  const size = compact ? "w-10 h-10" : "w-9 h-9";
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`${size} flex items-center justify-center rounded-md text-gray-400 hover:text-white transition-colors`}
      style={{ border: "1px solid var(--app-border-strong)" }}
    >
      {isDark ? (
        // Sun icon, click to go light.
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="8" cy="8" r="3" />
          <line x1="8" y1="1.5" x2="8" y2="3" strokeLinecap="round" />
          <line x1="8" y1="13" x2="8" y2="14.5" strokeLinecap="round" />
          <line x1="1.5" y1="8" x2="3" y2="8" strokeLinecap="round" />
          <line x1="13" y1="8" x2="14.5" y2="8" strokeLinecap="round" />
          <line x1="3.4" y1="3.4" x2="4.5" y2="4.5" strokeLinecap="round" />
          <line x1="11.5" y1="11.5" x2="12.6" y2="12.6" strokeLinecap="round" />
          <line x1="3.4" y1="12.6" x2="4.5" y2="11.5" strokeLinecap="round" />
          <line x1="11.5" y1="4.5" x2="12.6" y2="3.4" strokeLinecap="round" />
        </svg>
      ) : (
        // Moon icon, click to go dark.
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path
            d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7Z"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
};
