import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
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
        <title>Hudson Turansky · AI builder for finance</title>
        <meta
          name="description"
          content="I'm Hudson. I use AI to build tools for finance, agents, automations, and custom software. Here's what I'm making and what I'm learning as I go."
        />
        <link rel="canonical" href="https://hudsonturansky.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/" />
        <meta property="og:title" content="Hudson Turansky · AI builder for finance" />
        <meta
          property="og:description"
          content="Builder, working with AI. Tools for finance, plus what I'm learning as I go."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hudson Turansky · AI builder for finance" />
        <meta
          name="twitter:description"
          content="Builder, working with AI. Tools for finance, plus what I'm learning as I go."
        />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section
        id="hero"
        className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center"
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Builder · AI · Finance
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
          >
            I'm Hudson. I use AI to build{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              tools for finance.
            </span>
          </h1>

          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto mb-10">
            Builder, working with AI. This is what I'm making and what I'm learning as I go.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Link
              to="/builds"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: "var(--app-button-bg)",
                color: "var(--app-button-fg)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--app-button-bg-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--app-button-bg)";
              }}
            >
              See what I'm building →
            </Link>
            <Link
              to="/updates"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              style={{
                backgroundColor: "var(--app-card-bg-strong)",
                color: "#ffffff",
                border: "1px solid var(--app-border-strong)",
              }}
            >
              Follow along →
            </Link>
          </div>

          <p className="text-sm text-gray-500 font-light max-w-xl mx-auto leading-relaxed">
            <span className="text-gray-400">Right now:</span> using AI to build tools for working
            with markets, and learning finance by shipping them. Latest:{" "}
            <Link
              to="/finance-tools/filing-summarizer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              a tool that turns any SEC filing into a one-page analyst brief
            </Link>
            .
          </p>
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
              stroke="var(--app-text-soft)"
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
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
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
            <span className="block text-gray-600">AI is what I do.</span>
          </h2>
          <div className="space-y-5 text-gray-400 font-light leading-relaxed">
            <p>
              I'm a builder, and AI is what I do, whether that's AI tools, agents, automations, or
              custom software. I like taking an idea and turning it into something that actually
              works.
            </p>
            <p>
              My focus now is finance, even though I don't come from it. I'm early in the field and
              studying for my SIE, and that's exactly the point: I want to learn markets from the
              people who know them while doing what I'm already good at.
            </p>
            <p>
              The way I see it, I'm a custom builder for finance. You bring the domain knowledge and
              know what needs to exist, and I bring the ability to build it and get it shipped.
              That's the work I'm after.
            </p>
            <p>
              If you work in finance and need things built,{" "}
              <a
                href="mailto:hudsonturansky@gmail.com"
                className="text-white underline decoration-1 underline-offset-4 hover:text-blue-300 transition-colors"
              >
                let's talk
              </a>
              .
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/builds"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
              style={{
                backgroundColor: "var(--app-card-bg-strong)",
                border: "1px solid var(--app-border-strong)",
              }}
            >
              See what I'm building <span aria-hidden>→</span>
            </Link>
            <Link
              to="/finance-tools"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
              style={{
                backgroundColor: "var(--app-card-bg-strong)",
                border: "1px solid var(--app-border-strong)",
              }}
            >
              Finance tools <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      <Contact />

      {/* Footer */}
      <footer
        className="py-8 px-6 text-center"
        style={{
          backgroundColor: "var(--app-page-bg)",
          borderTop: "1px solid var(--app-border-soft)",
        }}
      >
        <p className="text-xs text-gray-600">
          &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{" "}
          <a href="mailto:hudsonturansky@gmail.com" className="hover:text-gray-400 transition-colors">
            hudsonturansky@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Index;
