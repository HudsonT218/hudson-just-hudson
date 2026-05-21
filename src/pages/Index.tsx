import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import WhatIBuild from "@/components/WhatIBuild";
import Contact from "@/components/Contact";

const Index = () => {
  const [showArrow, setShowArrow] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) setShowArrow(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Hudson Turansky — AI Solutions & Web Development</title>
        <meta name="description" content="I build custom websites, AI tools, and software for businesses and individuals. Book a free call to talk through your project." />
        <link rel="canonical" href="https://hudsonturansky.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/" />
        <meta property="og:title" content="Hudson Turansky — AI Solutions & Web Development" />
        <meta property="og:description" content="Custom websites, AI tools, and software. Hourly, transparent, built with AI." />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hudson Turansky — AI Solutions & Web Development" />
        <meta name="twitter:description" content="Custom websites, AI tools, and software. Hourly, transparent, built with AI." />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        {/* Subtle radial blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          {/* Availability badge */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-3"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(12px)",
                borderRadius: "9999px",
                padding: "4px 14px 4px 4px",
              }}
            >
              <span
                className="font-mono text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(59,130,246,0.15)",
                  color: "#60a5fa",
                }}
              >
                OPEN
              </span>
              <span className="text-sm text-gray-400">
                Available for new projects
              </span>
            </div>
          </div>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Builder · AI Solutions · Web Development
          </p>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Hudson{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Turansky
            </span>
          </h1>

          <p className="text-lg text-gray-400 font-light max-w-lg mx-auto mb-10">
            I build custom websites, AI tools, and software for small
            businesses. Hourly, transparent pricing. Most projects ship in
            2–6 weeks. You bring the idea; I lead it end‑to‑end, no agency
            markup, no freelancer hand‑off chains.
          </p>

          <div className="flex justify-center mb-8">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: "#ffffff",
                color: "#09090b",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ffffff";
              }}
            >
              Book a Call
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M5.5 3L9.5 7L5.5 11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Scroll hint */}
      {showArrow && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 pointer-events-none transition-opacity duration-700"
          style={{ opacity: 1 }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            <path
              d="M7 11L14 18L21 11"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      {/* About */}
      <section id="about" className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            About
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold leading-tight mb-8"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="block text-white">I'm a builder.</span>
            <span className="block text-gray-600">I work with AI.</span>
          </h2>
          <div className="space-y-5 text-gray-400 font-light leading-relaxed">
            <p>
              I build custom websites, AI tools, and software for small
              businesses and solo founders — the kind of work most agencies
              overcharge for and most freelancers can't deliver end‑to‑end.
              Hourly, transparent rates. Most projects ship in 2–6 weeks;
              custom AI agents and operations software run longer depending on
              scope. I've gone deep on AI in particular — not just using it,
              but understanding what it can really do and where it doesn't
              belong yet — and I'll tell you honestly which bucket your idea
              falls in before we start building.
            </p>
            <p>
              You don't have to be technical to work with me. Maybe you know AI
              could help your business but the whole space just feels like
              noise. Maybe you've had an idea for months with no real path to
              building it. Maybe you need a proper website and the agency route
              felt overpriced and overcomplicated. Those are the people I do
              this for: you've got something worth building, and you need
              someone who can actually build it.
            </p>
            <p>
              My role is to be the person who takes it all the way. I lead the
              project end to end, so you're not managing a developer or
              juggling freelancers. You bring the goal, I handle getting there.
              Working with AI lets me build faster and leaner than a
              traditional shop, which keeps your cost down, and I'd rather talk
              you out of a weak idea than bill you for one. I'm early in client
              work and price honestly because of it, which means real attention
              and a fair rate while I build my track record.
            </p>
          </div>
          <div className="mt-10">
            <Link
              to="/work"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              See my work <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      <WhatIBuild />

      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      />

      <Contact />

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{
          backgroundColor: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p className="text-xs text-gray-600">
          &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{' '}
          <a href="mailto:hudsonturansky@gmail.com" className="hover:text-gray-400 transition-colors">
            hudsonturansky@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
