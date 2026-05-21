import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import WhatIBuild from "@/components/WhatIBuild";
import Contact from "@/components/Contact";

// Visible FAQ answers + JSON-LD FAQPage entries, single source of truth so
// the structured data matches the rendered text exactly. (Google penalizes
// FAQ schema where the marked-up answer differs from the on-page answer.)
const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: "How do I add AI to my small business?",
    a: "Start by listing the 3 most repetitive things in your week, intake forms, scheduling, email triage, document processing, customer FAQs. Then decide whether a $20 ChatGPT subscription, an off-the-shelf AI tool ($50–200/mo), or a custom build is the right level of investment. Most small businesses get the biggest first win from automating customer intake or email triage with a custom assistant tied to their own knowledge base.",
  },
  {
    q: "How much does custom AI cost?",
    a: "Hourly, transparent rates. A focused custom AI assistant or automation typically runs $1,500–$5,000 total. A larger custom agent that does multi-step work or operates inside an existing workflow tool usually lands $5,000–$15,000. I scope before quoting, and you see hours as the project progresses.",
  },
  {
    q: "How long does it take to build a custom AI tool?",
    a: "Most custom AI tools ship in 3–8 weeks from kickoff to deployed. A small focused automation can be done in under 2 weeks; an end-to-end custom AI agent integrated with your existing tools (CRM, Slack, Notion, Google Workspace) typically takes 4–8 weeks. AI-assisted workflows let me build faster than a traditional agency.",
  },
  {
    q: "Should I hire a consultant or use ChatGPT myself?",
    a: "Use ChatGPT yourself first for everything you can, it is the cheapest test. Hire a builder when you need something embedded in your existing tools, tuned to your specific data, reliable enough to put in front of customers, or automating work across multiple steps that ChatGPT alone cannot reach. If a $20 ChatGPT subscription solves your problem, I will tell you that on the discovery call.",
  },
  {
    q: "Do you work with contractors, professional services, or e-commerce businesses?",
    a: "Yes, those are the three buckets where I see the highest ROI for small businesses. Contractors typically need scheduling and intake automation plus document handling. Professional services (legal, accounting, consulting) need document processing and client-facing assistants. E-commerce needs custom inventory tools, customer support agents, and analytics dashboards. Different industries, similar building blocks.",
  },
  {
    q: "How do we get started?",
    a: "Book a free 30-minute discovery call. We talk through what you want to build, I tell you honestly whether it is worth building, scope it out, and send a written estimate with an hourly rate and a rough total. No commitment until we both agree on scope.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: {
      "@type": "Answer",
      text: a,
    },
  })),
};

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
        <title>Hudson Turansky · AI Solutions & Web Development</title>
        <meta name="description" content="I build custom websites, AI tools, and software for businesses and individuals. Book a free call to talk through your project." />
        <link rel="canonical" href="https://hudsonturansky.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/" />
        <meta property="og:title" content="Hudson Turansky · AI Solutions & Web Development" />
        <meta property="og:description" content="Custom websites, AI tools, and software. Hourly, transparent, built with AI." />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hudson Turansky · AI Solutions & Web Development" />
        <meta name="twitter:description" content="Custom websites, AI tools, and software. Hourly, transparent, built with AI." />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(FAQ_JSONLD)}</script>
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
              "radial-gradient(ellipse at 50% 40%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          {/* Availability badge */}
          <div className="flex justify-center mb-8">
            <div
              className="inline-flex items-center gap-3"
              style={{
                border: "1px solid var(--app-border-strong)",
                backgroundColor: "var(--app-card-bg-hover)",
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
            Custom websites, AI tools, and software, built end to end for
            businesses and individuals who have an idea and need someone to
            actually ship it. I'm early in client work, and my pricing reflects
            that.
          </p>

          <div className="flex justify-center mb-8">
            <a
              href="#contact"
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
            <span className="block text-gray-600">I work with AI.</span>
          </h2>
          <div className="space-y-5 text-gray-400 font-light leading-relaxed">
            <p>
              I build custom websites, AI tools, and software. I've spent
              serious time going deep on AI in particular: not just using it,
              but understanding what it can really do and how to build solid
              things with it. I care about making things that actually work,
              and I don't cut corners to get there.
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
                backgroundColor: "var(--app-card-bg-strong)",
                border: "1px solid var(--app-border-strong)",
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
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      <WhatIBuild />

      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* Resources callout, short hook that funnels users into /resources,
          which is the single doorway to the guides + the AI Brief tool. */}
      <section id="resources-callout" className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Free Resources
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-5"
            style={{ letterSpacing: "-0.03em" }}
          >
            Figure out where AI{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              actually fits.
            </span>
          </h2>
          <p className="text-gray-400 font-light leading-relaxed max-w-2xl mx-auto mb-10">
            Take the free 5-minute brief and get a personalized list of 6–10 specific use-cases for
            your work and life. Or read the guides for the longer thinking behind it.
          </p>
          <div className="flex justify-center">
            <Link
              to="/resources"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-md transition-colors duration-200"
              style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
            >
              See resources →
            </Link>
          </div>
        </div>
      </section>

      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* FAQ, visible content paired with FAQPage JSON-LD in <Helmet>. */}
      <section id="faq" className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              FAQ
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-white">Questions buyers ask.</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl"
                style={{
                  backgroundColor: "var(--app-card-bg)",
                  border: "1px solid var(--app-border-soft)",
                }}
              >
                <summary
                  className="px-6 py-5 cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden text-base font-medium text-white"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  <span>{q}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-gray-500 transition-transform duration-200 group-open:rotate-180 flex-shrink-0"
                    aria-hidden
                  >
                    <path
                      d="M3 5L7 9L11 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm font-light text-gray-400 leading-relaxed">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

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
