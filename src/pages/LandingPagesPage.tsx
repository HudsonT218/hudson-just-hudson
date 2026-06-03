// /landing-pages, productized landing-page offer.
// Share-link page (not in primary Navbar). Mirrors the composition rhythm
// of Index.tsx + WorkPage.tsx: same Navbar/Contact reuse, same section
// dividers, same FAQ + JSON-LD pattern. DottedSurface is rendered at the
// app level in App.tsx, so this page only needs the standard wrapper.

import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import happyTailsCover from "@/assets/happy-tails.png";
import chesapeakePantryCover from "@/assets/chesapeake-pantry.png";

const CANONICAL = "https://hudsonturansky.com/landing-pages";

type ExampleItem = {
  label: string;
  title: string;
  desc: string;
  url: string;
  image: string;
};

// Two existing demos from the Work page, reused verbatim so the two pages
// stay in sync. Append future walk-in demos here.
const EXAMPLES: ExampleItem[] = [
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

// FAQ, single source of truth. Visible answers must match JSON-LD answers
// character-for-character (Google penalizes FAQ schema where the marked-up
// answer differs from the on-page answer).
const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Do I need a domain?",
    a: "No, you don't need one before we start. If you already own one, we'll connect it. If you don't, I'll help you pick and register one during the build. Either way, your site will live at your own address, not a subdomain of mine.",
  },
  {
    q: "What if I already have a website?",
    a: "That's fine. We can either replace it with a faster, cleaner page or run the new one in parallel while you decide. I'll look at your current site on the first call and tell you honestly whether it's worth keeping or starting over.",
  },
  {
    q: "What's not included?",
    a: "The $200 covers one focused landing page, design, copy support, your photos and branding, basic SEO, and going live on your own domain. It does not include ongoing maintenance, multi-page websites, e-commerce checkout, custom backend work, or paid hosting beyond a normal domain. Any of those can be added; we'll scope them honestly if you want them.",
  },
  {
    q: "Can you do more than a landing page?",
    a: "Yes. I also build AI tools and automations, multi-page sites, internal dashboards, and custom software. A landing page is just the best place to start for most small businesses because it's the fastest way to show up online looking professional. Once that's live, we can talk about what to build next.",
  },
];

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const LandingPagesPage = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Landing Pages · Hudson Turansky</title>
        <meta
          name="description"
          content="Clean, fast, mobile-first landing pages for local businesses. $200 flat, $100 for the first five clients, live in about a week."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:title" content="Landing Pages · Hudson Turansky" />
        <meta
          property="og:description"
          content="Clean, fast, mobile-first landing pages for local businesses. $200 flat, $100 for the first five clients, live in about a week."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Landing Pages · Hudson Turansky" />
        <meta
          name="twitter:description"
          content="Clean, fast, mobile-first landing pages for local businesses, built in days."
        />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(FAQ_JSONLD)}</script>
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
            Landing pages
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            A landing page that makes your business{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              look the part.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto mb-10">
            Clean, fast, mobile-first websites for local businesses. Built in days, not weeks.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://calendly.com/hudsonturansky/30min"
              target="_blank"
              rel="noopener noreferrer"
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
            <a
              href="#examples"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md text-white transition-colors"
              style={{
                backgroundColor: "var(--app-card-bg-strong)",
                border: "1px solid var(--app-border-strong)",
              }}
            >
              See examples
              <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
      </section>

      <Divider />

      {/* What you get */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            What you get
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-8"
            style={{ letterSpacing: "-0.03em" }}
          >
            Everything a small business actually needs.
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-400 font-light leading-relaxed">
            <li>Modern, mobile-first design that looks right on a phone first.</li>
            <li>Fast load times so customers don't bounce.</li>
            <li>Your photos and branding, not stock templates.</li>
            <li>A clear call-to-action and contact path so people can actually reach you.</li>
            <li>Basic SEO so you show up when people Google you.</li>
            <li>
              AI search visibility so you show up when people ask ChatGPT, Claude, or Perplexity
              for local businesses.
            </li>
            <li>Live on your own domain, yours from day one.</li>
          </ul>
        </div>
      </section>

      <Divider />

      {/* Price */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Pricing
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-8"
            style={{ letterSpacing: "-0.03em" }}
          >
            $200 for a complete landing page.
          </h2>
          <div
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: "var(--app-blue-tint)",
              border: "1px solid var(--app-blue-tint-border-strong)",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <p className="text-gray-200 font-light leading-relaxed text-base">
              <strong className="text-white font-semibold">First 5 clients: $100.</strong> I'm
              building my track record, so the first five businesses I work with lock in half off.
            </p>
          </div>
          <p className="text-gray-400 font-light leading-relaxed">Live in about a week.</p>
        </div>
      </section>

      <Divider />

      {/* How it works */}
      <section className="py-28 px-6">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            How it works
          </p>
          <h2
            className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-8"
            style={{ letterSpacing: "-0.03em" }}
          >
            Four simple steps.
          </h2>
          <ol className="list-decimal pl-5 space-y-4 text-gray-400 font-light leading-relaxed">
            <li>
              <strong className="text-gray-200">Quick call or in-person chat.</strong> Fifteen
              minutes is usually enough to figure out what you need.
            </li>
            <li>
              <strong className="text-gray-200">I build a draft from your info.</strong> Photos,
              branding, the basics about what you do, and I put together a first version.
            </li>
            <li>
              <strong className="text-gray-200">
                You review, up to 2 rounds of changes.
              </strong>{" "}
              Tweaks to copy, colors, layout, photos, whatever's not quite right.
            </li>
            <li>
              <strong className="text-gray-200">It goes live.</strong> On your own domain. You own
              the site.
            </li>
          </ol>
        </div>
      </section>

      <Divider />

      {/* Examples */}
      <section id="examples" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              Examples
            </p>
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-white leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              What this can look like.
            </h2>
            <p className="text-sm text-gray-500 font-light mt-4">
              More real-client examples coming soon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXAMPLES.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                }}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <p
                    className="text-xs uppercase tracking-widest font-medium mb-4"
                    style={{ color: "hsl(217, 91%, 60%)" }}
                  >
                    {p.label}
                  </p>
                  <h3
                    className="text-base font-semibold mb-3"
                    style={{
                      letterSpacing: "-0.01em",
                      color: "var(--app-text-strong)",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    className="text-sm font-light leading-relaxed mb-6 flex-1"
                    style={{ color: "var(--app-text-med)" }}
                  >
                    {p.desc}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 text-sm font-medium"
                    style={{ color: "hsl(217, 91%, 60%)" }}
                  >
                    Visit →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* FAQ */}
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
              <span className="block text-white">Common questions.</span>
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
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

      <Divider />

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

export default LandingPagesPage;

const Divider = () => (
  <div
    className="max-w-5xl mx-auto"
    style={{ borderTop: "1px solid var(--app-border-soft)" }}
  />
);
