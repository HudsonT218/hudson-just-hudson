// /updates, a building-in-public feed: short, chronological posts on what I'm
// making and learning. Each post has an "Email me about this" link with the
// subject pre-filled to the post title, so replies self-sort. No comment
// backend. SPA route, prerendered via prerenderPlugin.
//
// Add a post by prepending an entry to UPDATES (newest first). Dates are stored
// as fixed strings so the prerendered HTML and the hydrated client match.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

interface Update {
  id: string;
  date: string; // display, e.g. "June 17, 2026"
  dateISO: string; // machine, e.g. "2026-06-17"
  title: string;
  body: ReactNode;
}

const UPDATES: Update[] = [
  {
    id: "filing-summarizer",
    date: "June 17, 2026",
    dateISO: "2026-06-17",
    title: "Shipped: a Filing Summarizer",
    body: (
      <>
        <p>
          The first finance tool is live. The{" "}
          <Link
            to="/finance-tools/filing-summarizer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Filing Summarizer
          </Link>{" "}
          takes any public company's latest SEC filing (a 10-K or 10-Q) and turns it into a
          plain-English one-page brief: the key numbers, what changed this period, the risks that
          matter, and a glossary for the jargon.
        </p>
        <p>
          I built it mostly to learn the filings myself. Reading a 10-Q cold is rough, so I made the
          thing I wanted: pull the document straight from SEC EDGAR, strip it down, and hand it to a
          model with a tight brief. You get 3 free runs per email, and you can have the brief sent to
          you as a PDF.
        </p>
        <p>
          Next up: more finance tools, and notes on what I'm learning about markets as I go.
        </p>
      </>
    ),
  },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Updates · Hudson Turansky",
  description: "Short notes on what Hudson Turansky is building and learning across AI and finance.",
  url: "https://hudsonturansky.com/updates",
  isPartOf: { "@type": "WebSite", name: "Hudson Turansky", url: "https://hudsonturansky.com" },
};

function emailHref(title: string): string {
  return `mailto:hudsonturansky@gmail.com?subject=${encodeURIComponent(title)}`;
}

const UpdatesPage = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Updates · Hudson Turansky</title>
        <meta
          name="description"
          content="Building in public: short notes on what I'm making and learning across AI and finance."
        />
        <link rel="canonical" href="https://hudsonturansky.com/updates" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/updates" />
        <meta property="og:title" content="Updates · Hudson Turansky" />
        <meta
          property="og:description"
          content="Building in public: short notes on what I'm making and learning across AI and finance."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Updates · Hudson Turansky" />
        <meta
          name="twitter:description"
          content="Building in public: short notes on what I'm making and learning."
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
        <div className="relative max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Updates
          </p>
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em", lineHeight: 1.05 }}
          >
            Building in public.
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-2xl leading-relaxed mb-16">
            Short notes on what I'm making and learning. If a post sparks something, the reply link
            goes straight to my inbox.
          </p>

          <div className="space-y-6">
            {UPDATES.map((u) => (
              <article
                key={u.id}
                className="rounded-2xl p-6 sm:p-8"
                style={{
                  backgroundColor: "var(--app-card-bg)",
                  border: "1px solid var(--app-border-med)",
                }}
              >
                <time
                  dateTime={u.dateISO}
                  className="text-xs uppercase tracking-widest text-gray-500 font-medium"
                >
                  {u.date}
                </time>
                <h2
                  className="text-2xl font-bold text-white mt-2 mb-4"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {u.title}
                </h2>
                <div className="space-y-4 text-gray-400 font-light leading-relaxed">{u.body}</div>
                <div className="mt-6">
                  <a
                    href={emailHref(u.title)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Email me about this →
                  </a>
                </div>
              </article>
            ))}
          </div>
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
          <a href="mailto:hudsonturansky@gmail.com" className="hover:text-gray-400 transition-colors">
            hudsonturansky@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
};

export default UpdatesPage;
