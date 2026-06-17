// /resources, the doorway to free tools and plain-English writing on AI and
// finance. SPA route, prerendered via prerenderPlugin so crawlers see the
// rendered cards on first fetch.
//
// Content is a small data model (TOOLS + CATEGORIES) so new resources drop in
// by adding an entry. Each category renders its items, or a "coming soon" note
// when it has none yet.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

interface ResourceCard {
  to: string;
  label: string;
  title: string;
  description: string;
}

interface Category {
  key: string;
  title: string;
  blurb: string;
  items: ResourceCard[];
  note?: string;
}

// Interactive tools (highest engagement, shown first).
const TOOLS: ResourceCard[] = [
  {
    to: "/finance-tools/filing-summarizer",
    label: "Tool · Finance",
    title: "Filing Summarizer",
    description:
      "Turn any company's latest SEC filing (10-K or 10-Q) into a plain-English one-page brief: key numbers, what changed, risks, and a jargon glossary. 3 free runs.",
  },
  {
    to: "/ai-brief",
    label: "Tool · 5 min",
    title: "Personalized AI Brief",
    description:
      "Answer a few questions about your work and life and get 6 to 10 specific AI use-case ideas, tagged by effort, with the build-worthy ones flagged. Free, one brief per email.",
  },
];

// Article categories. Add a resource by dropping an entry into the right items
// array; add a category by adding to this list.
const CATEGORIES: Category[] = [
  {
    key: "ai",
    title: "AI, plainly",
    blurb: "Plain-English writing on how AI actually works and how to use it without the hype.",
    items: [
      {
        to: "/resources/is-your-data-safe-with-ai",
        label: "Guide · 2026",
        title: "Is your data safe when you use AI?",
        description:
          "What ChatGPT, Claude, Gemini, and Copilot actually do with your data, which tier protects you, what the real risks are, and the defensive moves that don't require a security team.",
      },
      {
        to: "/resources/ai-glossary",
        label: "Guide · 2026",
        title: "A plain-English AI glossary",
        description:
          "The dozen-or-so AI terms that actually matter, each with a plain definition, why you'd care, and whether it affects a real decision.",
      },
    ],
  },
  {
    key: "finance",
    title: "Finance and markets",
    blurb: "Notes from learning finance by building in it. More as I go.",
    items: [],
    note: "Notes are on the way. In the meantime, the Filing Summarizer above is the first finance tool.",
  },
];

const COLLECTION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Resources · Hudson Turansky",
  description:
    "Free tools and plain-English writing on AI and finance: an SEC filing summarizer, a personalized AI brief, and guides on using AI safely.",
  url: "https://hudsonturansky.com/resources",
  isPartOf: {
    "@type": "WebSite",
    name: "Hudson Turansky",
    url: "https://hudsonturansky.com",
  },
};

const ResourcesIndexPage = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Resources · Hudson Turansky</title>
        <meta
          name="description"
          content="Free tools and plain-English writing on AI and finance: an SEC filing summarizer, a personalized AI brief, and guides on using AI safely."
        />
        <link rel="canonical" href="https://hudsonturansky.com/resources" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/resources" />
        <meta property="og:title" content="Resources · Hudson Turansky" />
        <meta
          property="og:description"
          content="Free tools and plain-English writing on AI and finance."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resources · Hudson Turansky" />
        <meta
          name="twitter:description"
          content="Free tools and plain-English writing on AI and finance."
        />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(COLLECTION_JSONLD)}</script>
      </Helmet>
      <Navbar />

      <section className="relative pt-32 pb-12 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Resources
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Free tools and writing on{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI and finance.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-2xl leading-relaxed mb-16">
            Interactive tools you can use right now, plus plain-English notes on AI and, as I get
            deeper into it, finance.
          </p>

          {/* Tools */}
          <section className="mb-14">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-5">
              Tools
            </p>
            <ul className="space-y-4 list-none p-0 m-0">
              {TOOLS.map((r) => (
                <li key={r.to}>
                  <ResourceCardLink {...r} />
                </li>
              ))}
            </ul>
          </section>

          {/* Article categories */}
          {CATEGORIES.map((cat) => (
            <section key={cat.key} className="mb-14">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">
                {cat.title}
              </p>
              <p className="text-sm text-gray-500 font-light mb-5 max-w-2xl">{cat.blurb}</p>
              {cat.items.length > 0 ? (
                <ul className="space-y-4 list-none p-0 m-0">
                  {cat.items.map((r) => (
                    <li key={r.to}>
                      <ResourceCardLink {...r} />
                    </li>
                  ))}
                </ul>
              ) : (
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: "var(--app-card-bg)",
                    border: "1px dashed var(--app-border-med)",
                  }}
                >
                  <p className="text-sm text-gray-500 font-light leading-relaxed">{cat.note}</p>
                </div>
              )}
            </section>
          ))}
        </div>
      </section>

      <footer
        className="py-8 px-6 text-center"
        style={{
          backgroundColor: "var(--app-page-bg)",
          borderTop: "1px solid var(--app-border-soft)",
        }}
      >
        <p className="text-xs text-gray-600">
          &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{" "}
          <a
            href="mailto:hudsonturansky@gmail.com"
            className="hover:text-gray-400 transition-colors"
          >
            hudsonturansky@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default ResourcesIndexPage;

const ResourceCardLink = ({ to, label, title, description }: ResourceCard) => (
  <Link
    to={to}
    className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
    style={{
      backgroundColor: "var(--app-card-bg-strong)",
      border: "1px solid var(--app-border-strong)",
    }}
  >
    <p
      className="text-xs uppercase tracking-widest font-medium mb-3"
      style={{ color: "hsl(217, 91%, 60%)" }}
    >
      {label}
    </p>
    <h2 className="text-lg font-semibold text-white mb-2" style={{ letterSpacing: "-0.01em" }}>
      {title}
    </h2>
    <p className="text-sm text-gray-400 font-light leading-relaxed mb-4">{description}</p>
    <span
      className="inline-flex items-center gap-1 text-sm font-medium"
      style={{ color: "hsl(217, 91%, 60%)" }}
    >
      Open →
    </span>
  </Link>
);
