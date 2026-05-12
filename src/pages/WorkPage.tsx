import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CAPABILITIES = [
  {
    label: "Web Development",
    body: "Landing pages, business sites, internal dashboards. Single-page or multi-page. Fast turnaround, clean code, always deployed and documented on handoff.",
  },
  {
    label: "AI Agents & Assistants",
    body: "Custom AI tools built on top of models like Claude and Gemini, including OpenClaw Agents and Hermes Agents. I work with MCP and CLI agents — chatbots, research assistants, document processors, workflow agents. I scope what's actually feasible before we build anything.",
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

const PORTFOLIO_PLACEHOLDERS = [
  { label: "Web · 2026", title: "Project Name" },
  { label: "AI · 2026", title: "Project Name" },
  { label: "Software · 2026", title: "Project Name" },
];

const WorkPage = () => {
  return (
    <div className="min-h-screen relative z-10">
      <Helmet>
        <title>Work — Hudson Turansky</title>
        <meta
          name="description"
          content="Web development, AI solutions, and custom software. A look at what I build and what I've shipped."
        />
        <link rel="canonical" href="https://hudsonturansky.com/work" />
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
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
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
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
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
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PORTFOLIO_PLACEHOLDERS.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 flex flex-col"
                style={{
                  backgroundColor: "rgba(255,255,255,0.01)",
                  border: "1px dashed rgba(255,255,255,0.08)",
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest font-medium mb-4"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  {p.label}
                </p>
                <h3
                  className="text-base font-semibold mb-3"
                  style={{
                    letterSpacing: "-0.01em",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {p.title}
                </h3>
                <p className="text-gray-600 text-sm font-light leading-relaxed mb-6 flex-1">
                  Project coming soon.
                </p>
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  View →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div
        className="max-w-5xl mx-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
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
              backgroundColor: "#ffffff",
              color: "#09090b",
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
          backgroundColor: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Hudson Turansky
        </p>
      </footer>
    </div>
  );
};

export default WorkPage;
