import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/92 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo monogram */}
        <a
          href="#hero"
          className="text-xl font-extrabold tracking-tight text-gray-900"
          style={{ letterSpacing: "-0.03em" }}
        >
          HT
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-gray-400 hover:text-gray-900 transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="text-sm font-medium text-white px-5 py-2 rounded-full transition-shadow duration-200 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #2563eb, #4f46e5)",
            }}
          >
            Let's Talk
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="17" y2="6" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="14" x2="17" y2="14" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 pb-5 pt-2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2.5 text-sm text-gray-400 hover:text-gray-900 transition-colors"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="inline-block mt-3 text-sm font-medium text-white px-5 py-2 rounded-full"
            style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)" }}
            onClick={() => setOpen(false)}
          >
            Let's Talk
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
