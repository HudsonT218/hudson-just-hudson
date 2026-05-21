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
    label: "Web Development",
    body: "Landing pages, business sites, internal dashboards. Single-page or multi-page. Fast turnaround, clean code, always deployed and documented on handoff.",
  },
  {
    label: "AI Agents & Assistants",
    body: "Custom AI tools built on top of models like Claude and Gemini, including OpenClaw Agents and Hermes Agents. I work with MCP and CLI agents, chatbots, research assistants, document processors, workflow agents. I scope what's actually feasible before we build anything.",
  },
  {
    label: "Operations Software",
    body: "Full-stack internal applications. Custom admin panels, client portals, CRMs, ops dashboards. Built around how your team actually works, not a generic SaaS template.",
  },
  {
    label: "Automation & Integrations",
    body: "Scripts, bots, and pipelines that connect your tools and automate repetitive work. Python or Node, depending on what fits.",
  },
];

const PORTFOLIO_ITEMS: PortfolioItem[] = [
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
    desc: "An example volunteer tracking OS I built, shift scheduling, hour tracking, leaderboards, and manager reports for a food bank.",
    url: "https://chesapeake-pantry.lovable.app",
    image: chesapeakePantryCover,
  },
];

const WorkPage = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Work · Hudson Turansky</title>
        <meta name="description" content="Web development, AI solutions, and custom software. A look at what I build and what I've shipped." />
        <link rel="canonical" href="https://hudsonturansky.com/work" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/work" />
        <meta property="og:title" content="Work · Hudson Turansky" />
        <meta property="og:description" content="Capabilities and portfolio. Web, AI, software." />
        <meta property="og:image" content="https://hudsonturansky.com/og-work.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Work · Hudson Turansky" />
        <meta name="twitter:description" content="Capabilities and portfolio. Web, AI, software." />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-work.png" />
      </Helmet>
      <Navbar />

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Work
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            What I Do.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              What I've Built.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto">
            A look at the types of projects I take on and a few things I've
            already made.
          </p>
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
              Capabilities
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="block text-white">What I build.</span>
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

      {/* Portfolio */}
      <section id="portfolio" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Portfolio
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
              const isLive = !!p.url;
              const Wrapper: React.ElementType = isLive ? "a" : "div";
              const wrapperProps = isLive
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
                          : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {p.label}
                    </p>
                    <h3
                      className="text-base font-semibold mb-3"
                      style={{
                        letterSpacing: "-0.01em",
                        color: isLive ? "#fff" : "rgba(255,255,255,0.5)",
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      className="text-sm font-light leading-relaxed mb-6 flex-1"
                      style={{
                        color: isLive
                          ? "rgba(255,255,255,0.5)"
                          : "rgba(120,120,120,1)",
                      }}
                    >
                      {p.desc}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 text-sm font-medium"
                      style={{
                        color: isLive
                          ? "hsl(217, 91%, 60%)"
                          : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {isLive ? "Visit →" : "View →"}
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
              <span className="block text-white">AI meeting assistant I built.</span>
            </h2>
            <p className="text-lg text-gray-400 font-light mt-4 max-w-2xl">
              Before the meeting, the assistant reads in a stack of company documents, reports, dashboards, contracts, market feeds. During the meeting, one model transcribes the conversation in real time while a second model runs silently in the background, cross-referencing what's said against the loaded context. When it catches a misstated number, an unanswered question, or a piece of relevant context no one raised, it drops a note with a citation back to the source. The conversation flows uninterrupted.
            </p>
            <p className="text-lg text-gray-300 font-light mt-4 max-w-2xl">
              This is one example of a custom AI assistant I can build for your team.
            </p>
          </div>

          <Suspense fallback={<div className="h-96 rounded-2xl border border-white/5 bg-white/[0.02]" />}>
            <MeetingAssistantDemo />
          </Suspense>

          <p className="text-sm text-gray-500 font-light mt-8 max-w-2xl leading-relaxed">
            A scripted walkthrough of a Q4 review meeting at a fake SaaS company.
            The demo isn't connected to a live LLM, it's a faithful recreation of
            a prototype I built and previously deployed. I'd build a real version for you.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid var(--app-border-soft)" }}
      />

      {/* Interested CTA */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            Interested in working together?
          </h2>
          <p className="text-gray-400 font-light mb-8">
            See how I charge and what a typical project looks like.
          </p>
          <Link
            to="/interested"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
            style={{
              backgroundColor: "var(--app-button-bg)",
              color: "var(--app-button-fg)",
            }}
          >
            See Pricing →
          </Link>
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
          &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{' '}
          <a href="mailto:hudsonturansky@gmail.com" className="hover:text-gray-400 transition-colors">
            hudsonturansky@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default WorkPage;
