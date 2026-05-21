// /resources — single doorway to free tools and guides.
// SPA route, prerendered via prerenderPlugin so crawlers see the rendered
// cards on first fetch. The page is split into two sections — Tools at the
// top (interactive, higher engagement) and Guides below — both styled with
// the home page's design system.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

interface ResourceCard {
  to: string;
  label: string;
  title: string;
  description: string;
}

const TOOLS: ResourceCard[] = [
  {
    to: "/ai-brief",
    label: "Tool · 5 min",
    title: "Personalized AI Brief",
    description:
      "Answer a few questions about your work and life. Get a brief with 6–10 specific AI use-case ideas you could actually use — tagged by effort, with the build-worthy ones flagged. Free, one brief per email.",
  },
];

const GUIDES: ResourceCard[] = [
  {
    to: "/resources/ai-for-small-business",
    label: "Guide · 2026",
    title: "How to add AI to your small business in 2026",
    description:
      "A 4-step framework: audit your week, match each task to the right level of investment ($20 / $50–200/mo / $1,500–$15,000 custom), pick a first project, and avoid the most common mistakes.",
  },
];

const COLLECTION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Resources — Hudson Turansky",
  description:
    "Free tools and plain-English guides for small-business owners on how to add AI, what custom builds cost, when to hire a consultant, and how to scope a project.",
  url: "https://hudsonturansky.com/resources/",
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
        <title>Resources — Hudson Turansky</title>
        <meta
          name="description"
          content="Free tools and plain-English guides for small-business owners on how to add AI, what custom AI costs, when to hire a consultant, and how to scope a custom build."
        />
        <link rel="canonical" href="https://hudsonturansky.com/resources/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/resources/" />
        <meta property="og:title" content="Resources — Hudson Turansky" />
        <meta
          property="og:description"
          content="Free tools and plain-English guides for small-business owners on adding AI, custom builds, and the right level of investment for each."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resources — Hudson Turansky" />
        <meta
          name="twitter:description"
          content="Free tools and plain-English guides on adding AI to a small business."
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
              "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 60%)",
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
            Free tools and guides for{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              small-business owners.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-2xl leading-relaxed mb-16">
            Short, specific resources for figuring out whether AI is the right tool for your problem,
            what custom builds actually cost, and when to hire versus DIY.
          </p>

          {/* Tools section */}
          <section className="mb-14">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-5">
              Tools
            </p>
            <ul className="space-y-4 list-none p-0 m-0">
              {TOOLS.map((r) => (
                <li key={r.to}>
                  <ResourceCardLink {...r} accentColor="hsl(217, 91%, 60%)" />
                </li>
              ))}
            </ul>
          </section>

          {/* Guides section */}
          <section>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-5">
              Guides
            </p>
            <ul className="space-y-4 list-none p-0 m-0">
              {GUIDES.map((r) => (
                <li key={r.to}>
                  <ResourceCardLink {...r} accentColor="hsl(217, 91%, 60%)" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <footer
        className="py-8 px-6 text-center"
        style={{
          backgroundColor: "#09090b",
          borderTop: "1px solid rgba(255,255,255,0.05)",
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

interface ResourceCardLinkProps extends ResourceCard {
  accentColor: string;
}

const ResourceCardLink = ({ to, label, title, description, accentColor }: ResourceCardLinkProps) => (
  <Link
    to={to}
    className="block rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
    style={{
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
    }}
  >
    <p
      className="text-xs uppercase tracking-widest font-medium mb-3"
      style={{ color: accentColor }}
    >
      {label}
    </p>
    <h2 className="text-lg font-semibold text-white mb-2" style={{ letterSpacing: "-0.01em" }}>
      {title}
    </h2>
    <p className="text-sm text-gray-400 font-light leading-relaxed mb-4">{description}</p>
    <span className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: accentColor }}>
      Open →
    </span>
  </Link>
);
