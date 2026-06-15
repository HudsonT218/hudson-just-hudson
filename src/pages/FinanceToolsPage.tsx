// Finance Tools hub — /finance-tools.
//
// The home for a growing set of small, free finance tools. The first is the
// Filing Summarizer; more cards (backtester, watchlist monitor, …) slot in as
// they ship. Styled with the repo's CSS-var theme so it adapts to light/dark,
// and prerendered for SEO via scripts/prerender*.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

interface ToolCard {
  name: string;
  blurb: string;
  to?: string;
  badge: string;
  status: "live" | "soon";
}

const TOOLS: ToolCard[] = [
  {
    name: "Filing Summarizer",
    blurb:
      "Turn a company's latest SEC filing (10-K or 10-Q) into a plain-English one-page brief — key numbers, what changed, risks, and a jargon glossary.",
    to: "/finance-tools/filing-summarizer",
    badge: "3 free runs",
    status: "live",
  },
  {
    name: "Backtester",
    blurb:
      "Test a simple rules-based strategy against historical prices and see how it would have done — no spreadsheet wrangling.",
    badge: "Coming soon",
    status: "soon",
  },
  {
    name: "Watchlist Monitor",
    blurb:
      "Track a handful of tickers and get a plain-English heads-up when something material changes.",
    badge: "Coming soon",
    status: "soon",
  },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Finance Tools",
  description:
    "Free finance tools by Hudson Turansky, starting with a Filing Summarizer that turns SEC filings into plain-English briefs.",
  url: "https://hudsonturansky.com/finance-tools",
  hasPart: [
    {
      "@type": "WebApplication",
      name: "Filing Summarizer",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://hudsonturansky.com/finance-tools/filing-summarizer",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

const FinanceToolsPage = () => {
  return (
    <div
      id="main-content"
      role="main"
      className="min-h-screen relative z-10"
      style={{ color: "var(--app-text-strong)" }}
    >
      <Helmet>
        <title>Finance Tools · Hudson Turansky</title>
        <meta
          name="description"
          content="Free finance tools that turn dense data into plain English. Start with the Filing Summarizer: a one-page brief of any company's latest SEC filing. 3 free runs."
        />
        <link rel="canonical" href="https://hudsonturansky.com/finance-tools" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/finance-tools" />
        <meta property="og:title" content="Finance Tools · Hudson Turansky" />
        <meta
          property="og:description"
          content="Free finance tools that turn dense data into plain English. Start with the Filing Summarizer."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Finance Tools · Hudson Turansky" />
        <meta
          name="twitter:description"
          content="Free finance tools that turn dense data into plain English."
        />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(JSONLD)}</script>
      </Helmet>
      <Navbar />

      <section className="relative pt-32 pb-12 px-6">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest font-medium mb-5"
            style={{ color: "#60a5fa" }}
          >
            Finance Tools
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold mb-6"
            style={{ color: "var(--app-text-strong)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
          >
            Finance tools, free to try.
          </h1>
          <p
            className="text-lg font-light max-w-2xl mb-4 leading-relaxed"
            style={{ color: "var(--app-text-med)" }}
          >
            Small, focused tools that turn dense financial data into something a normal person can
            actually read. Each one gives you{" "}
            <strong style={{ color: "var(--app-text-strong)", fontWeight: 500 }}>
              3 free runs
            </strong>{" "}
            — just an email, no account.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
          {TOOLS.map((tool) => (
            <ToolCardView key={tool.name} tool={tool} />
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-10">
          <p className="text-xs font-light leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
            Free runs are tracked per email — light friction so I can keep these tools free, not a
            hard paywall. Want a custom finance tool, dashboard, or automation built?{" "}
            <Link
              to="/free-build"
              className="underline decoration-1 underline-offset-4"
              style={{ color: "var(--app-text-strong)" }}
            >
              I build those →
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FinanceToolsPage;

// ---------------------------------------------------------------------------

const ToolCardView = ({ tool }: { tool: ToolCard }) => {
  const inner = (
    <div
      className="h-full rounded-2xl p-6 transition-colors duration-200"
      style={{
        backgroundColor: "var(--app-card-bg)",
        border: "1px solid var(--app-border-med)",
        opacity: tool.status === "soon" ? 0.6 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full"
          style={{
            color: tool.status === "live" ? "#60a5fa" : "var(--app-text-muted)",
            border: `1px solid ${
              tool.status === "live" ? "rgba(96,165,250,0.5)" : "var(--app-border-med)"
            }`,
          }}
        >
          {tool.badge}
        </span>
        {tool.status === "live" && (
          <span className="text-sm" style={{ color: "var(--app-text-muted)" }} aria-hidden>
            →
          </span>
        )}
      </div>
      <h2
        className="text-xl font-semibold mb-2"
        style={{ color: "var(--app-text-strong)", letterSpacing: "-0.01em" }}
      >
        {tool.name}
      </h2>
      <p className="text-sm font-light leading-relaxed" style={{ color: "var(--app-text-med)" }}>
        {tool.blurb}
      </p>
      {tool.status === "live" && (
        <p className="mt-4 text-sm font-medium" style={{ color: "#60a5fa" }}>
          Open tool →
        </p>
      )}
    </div>
  );

  if (tool.to) {
    return (
      <Link to={tool.to} className="block focus:outline-none">
        {inner}
      </Link>
    );
  }
  return <div aria-disabled>{inner}</div>;
};

const Footer = () => (
  <footer
    className="py-8 px-6 text-center"
    style={{ backgroundColor: "var(--app-page-bg)", borderTop: "1px solid var(--app-border-soft)" }}
  >
    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
      &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{" "}
      <Link to="/" className="hover:underline transition-colors" style={{ color: "var(--app-text-med)" }}>
        hudsonturansky.com
      </Link>
    </p>
  </footer>
);
