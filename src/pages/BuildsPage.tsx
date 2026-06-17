import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import happyTailsCover from "@/assets/happy-tails.png";
import chesapeakePantryCover from "@/assets/chesapeake-pantry.png";
import Collaborators from "@/components/Collaborators";

const MeetingAssistantDemo = lazy(() =>
  import("@/components/meeting-assistant-demo/MeetingAssistantDemo")
);

type PortfolioItem = {
  label: string;
  title: string;
  desc: string;
  url?: string;
  image?: string;
};

const CAPABILITIES = [
  {
    label: "AI Agents & Assistants",
    body: "Custom AI tools built on top of models like Claude and Gemini, including OpenClaw Agents and Hermes Agents. I work with MCP and CLI agents, chatbots, research assistants, document processors, and workflow agents. I scope what's actually feasible before building anything.",
  },
  {
    label: "Automation & Integrations",
    body: "Scripts, bots, and pipelines that connect tools and automate repetitive work. Python or Node, depending on what fits.",
  },
  {
    label: "Operations Software",
    body: "Full-stack internal applications. Custom admin panels, client portals, CRMs, and ops dashboards, built around how a team actually works rather than a generic SaaS template.",
  },
  {
    label: "Web Development",
    body: "Landing pages, business sites, and internal dashboards. Single-page or multi-page. Fast turnaround, clean code, deployed and documented.",
  },
];

const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    label: "Finance Tool · 2026",
    title: "Filing Summarizer",
    desc: "A tool that turns any company's latest SEC filing (10-K or 10-Q) into a plain-English one-page brief. Live on this site, with 3 free runs per email.",
    url: "/finance-tools/filing-summarizer",
  },
  {
    label: "Web · 2026",
    title: "Happy Tails Dog Walking",
    desc: "An example landing page I built, not for an actual client, just a demo of the kind of site I can ship fast.",
    url: "https://happytailsdogwalking.lovable.app",
    image: happyTailsCover,
  },
  {
    label: "Software · 2026",
    title: "Chesapeake Community Pantry",
    desc: "An example volunteer tracking OS I built: shift scheduling, hour tracking, leaderboards, and manager reports for a food bank.",
    url: "https://chesapeake-pantry.lovable.app",
    image: chesapeakePantryCover,
  },
];

const BuildsPage = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Builds · Hudson Turansky</title>
        <meta
          name="description"
          content="Things I'm building with AI: finance tools, agents, automations, and software. Some live, some demos, more on the way."
        />
        <link rel="canonical" href="https://hudsonturansky.com/builds" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/builds" />
        <meta property="og:title" content="Builds · Hudson Turansky" />
        <meta property="og:description" content="Things I'm building with AI: finance tools, agents, automations, and software." />
        <meta property="og:image" content="https://hudsonturansky.com/og-work.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Builds · Hudson Turansky" />
        <meta name="twitter:description" content="Things I'm building with AI: finance tools, agents, automations, and software." />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-work.png" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Builds
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Things I'm{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              building.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto">
            Tools, agents, automations, and software. Some live, some demos, and more on the way.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* Portfolio */}
      <section id="portfolio" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Projects
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-white">Things I've built.</span>
            </h2>
            <p className="text-sm text-gray-500 font-light mt-4">
              Including this site, built and designed by me.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PORTFOLIO_ITEMS.map((p, i) => {
              const isInternal = !!p.url && p.url.startsWith("/");
              const isExternal = !!p.url && !isInternal;
              const isLive = !!p.url;
              const Wrapper: React.ElementType = isInternal ? Link : isExternal ? "a" : "div";
              const wrapperProps = isInternal
                ? { to: p.url }
                : isExternal
                  ? { href: p.url, target: "_blank", rel: "noopener noreferrer" }
                  : {};
              return (
                <Wrapper
                  key={i}
                  {...wrapperProps}
                  className={`rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                    isLive ? "hover:-translate-y-1 cursor-pointer" : ""
                  }`}
                  style={{
                    backgroundColor: isLive
                      ? "var(--app-card-bg-strong)"
                      : "var(--app-card-bg)",
                    border: isLive
                      ? "1px solid var(--app-border-strong)"
                      : "1px dashed var(--app-border-med)",
                  }}
                >
                  {p.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1">
                    <p
                      className="text-xs uppercase tracking-widest font-medium mb-4"
                      style={{
                        color: isLive
                          ? "hsl(217, 91%, 60%)"
                          : "var(--app-text-muted)",
                      }}
                    >
                      {p.label}
                    </p>
                    <h3
                      className="text-base font-semibold mb-3"
                      style={{
                        letterSpacing: "-0.01em",
                        color: isLive
                          ? "var(--app-text-strong)"
                          : "var(--app-text-med)",
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="text-sm font-light leading-relaxed mb-6 flex-1"
                      style={{
                        color: isLive
                          ? "var(--app-text-med)"
                          : "var(--app-text-muted)",
                      }}
                    >
                      {p.desc}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-sm font-medium"
                      style={{
                        color: isLive
                          ? "hsl(217, 91%, 60%)"
                          : "var(--app-text-soft)",
                      }}
                    >
                      {isInternal ? "Open →" : isExternal ? "Visit →" : "View →"}
                    </span>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* Capabilities */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              What I build
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-white">The kind of work I do.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAPABILITIES.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl p-8"
                style={{
                  backgroundColor: "var(--app-card-bg)",
                  border: "1px solid var(--app-border-soft)",
                }}
              >
                <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-4">
                  {c.label}
                </p>
                <p className="text-gray-400 text-sm font-light leading-relaxed">
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      <Collaborators />

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* AI meeting assistant demo */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Live Demo
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-white">An AI meeting assistant I built.</span>
            </h2>
            <p className="text-lg text-gray-400 font-light mt-4 max-w-2xl">
              Before the meeting, the assistant reads in a stack of company documents: reports, dashboards, contracts, market feeds. During the meeting, one model transcribes the conversation in real time while a second model runs silently in the background, cross-referencing what's said against the loaded context. When it catches a misstated number, an unanswered question, or a piece of relevant context no one raised, it drops a note with a citation back to the source. The conversation flows uninterrupted.
            </p>
            <p className="text-lg text-gray-300 font-light mt-4 max-w-2xl">
              One example of the kind of custom AI assistant I build.
            </p>
          </div>

          {/* The demo is a UI mockup of a real product I built. It stays in
              its native dark theme even when the rest of the site is in light
              mode, the same way Apple / Stripe / Linear embed dark app
              screenshots into light marketing pages. `dark-region` restores all
              dark CSS vars + Tailwind text remaps inside; `boxShadow: none`
              suppresses the light-mode top-edge highlight that would otherwise
              hit the `.rounded-2xl` wrapper. */}
          <div
            className="dark-region rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "var(--app-page-bg)",
              boxShadow: "none",
            }}
          >
            <Suspense fallback={<div className="h-96" />}>
              <MeetingAssistantDemo />
            </Suspense>
          </div>

          <p className="text-sm text-gray-500 font-light mt-8 max-w-2xl leading-relaxed">
            A scripted walkthrough of a Q4 review meeting at a fake SaaS company. The demo isn't
            connected to a live LLM, it's a faithful recreation of a prototype I built and
            previously deployed.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* Contact CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Building in the same space?
          </h2>
          <p className="text-gray-400 font-light mb-8">
            I like comparing notes and shipping things. If you work in AI or finance, say hi.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:hudsonturansky@gmail.com"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: "var(--app-button-bg)",
                color: "var(--app-button-fg)",
              }}
            >
              Email me →
            </a>
            <Link
              to="/finance-tools"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
              style={{
                backgroundColor: "var(--app-card-bg-strong)",
                color: "#ffffff",
                border: "1px solid var(--app-border-strong)",
              }}
            >
              Explore the finance tools →
            </Link>
          </div>
        </div>
      </section>

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

export default BuildsPage;
