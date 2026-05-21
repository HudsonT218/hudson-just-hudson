// /resources/ai-for-small-business — first long-form guide.
// SPA route. Prerendered via prerenderPlugin so crawlers see the full
// article HTML on the first fetch. Visual language matches the home page
// (Navbar, DottedSurface background, gradient text, dark theme cards).

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CANONICAL = "https://hudsonturansky.com/resources/ai-for-small-business";
const PUBLISHED = "2026-05-21";

// FAQ — single source of truth. Visible answers must match JSON-LD answers
// character-for-character (Google penalizes FAQ schema where the marked-up
// answer differs from the on-page answer).
const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What is the cheapest way to add AI to a small business?",
    a: "A $20/month ChatGPT Plus or Claude Pro subscription is the cheapest way to start. It covers solo use for drafting emails, summarizing documents, basic research, and one-off writing tasks. It will not solve workflow problems where the AI needs to see your specific data, integrate with your tools, or run on its own schedule. For those, you need either an off-the-shelf vertical AI tool ($50–200/month) or a custom build ($1,500–$15,000+ one-time).",
  },
  {
    q: "How do I know whether to build custom or subscribe?",
    a: "Subscribe when (a) an off-the-shelf product already does 80%+ of what you want, (b) you don't need it integrated with your specific data, and (c) the monthly cost is less than ~10 hours of saved time. Build custom when (a) the AI needs to read your specific knowledge base, (b) it needs to act inside your existing tools (CRM, Slack, Notion), (c) you'd put it in front of customers, or (d) you need multi-step automation no consumer tool reaches.",
  },
  {
    q: "What's the fastest first AI project for a service business?",
    a: "Customer intake automation. Replace your contact form with a custom AI assistant that asks the right qualifying questions in conversation, captures the details, and writes the result back to your CRM. Most service businesses (contractors, professional services, agencies) close 20–40% more discovery calls after this. Build cost is typically $2,000–$4,000 and it ships in 2–3 weeks.",
  },
  {
    q: "Do I need to be technical to add AI to my business?",
    a: "No. The audit step (list your 3 most repetitive weekly tasks) is non-technical, and a good consultant or builder will scope a project in plain language and tell you honestly which level of investment fits — including telling you when $20/month is the right answer instead of a custom build.",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to add AI to your small business in 2026",
  description:
    "A 4-step framework for small-business owners: audit your week, match each task to the right investment, and decide build vs. subscribe.",
  url: CANONICAL,
  datePublished: PUBLISHED,
  dateModified: PUBLISHED,
  author: { "@type": "Person", name: "Hudson Turansky", url: "https://hudsonturansky.com" },
  publisher: {
    "@type": "Organization",
    name: "Hudson Turansky",
    url: "https://hudsonturansky.com",
  },
};

const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const AiForSmallBusiness = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>How to add AI to your small business in 2026 — Hudson Turansky</title>
        <meta
          name="description"
          content="A 4-step framework for small-business owners: audit your week, match each task to the right investment ($20 / $50–200/mo / $1,500–$15,000 custom), and decide build vs. subscribe."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta
          property="og:title"
          content="How to add AI to your small business in 2026 — Hudson Turansky"
        />
        <meta
          property="og:description"
          content="A 4-step framework for SMB owners: audit, match-to-investment, decide build vs. subscribe, avoid common mistakes."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta property="article:author" content="Hudson Turansky" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="How to add AI to your small business in 2026"
        />
        <meta name="twitter:description" content="A 4-step framework for SMB owners." />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(ARTICLE_JSONLD)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_JSONLD)}</script>
      </Helmet>
      <Navbar />

      <article className="relative pt-32 pb-12 px-6">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 25%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <p className="text-sm text-gray-500 mb-6">
            <Link to="/resources" className="hover:text-gray-300 transition-colors">
              Resources
            </Link>
            <span className="mx-2 text-gray-700">/</span>
            <span className="text-gray-400">AI for small business</span>
          </p>

          {/* Eyebrow */}
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Guide · 2026
          </p>

          {/* Headline with gradient on the punchy phrase */}
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8 leading-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            How to add AI to your{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              small business
            </span>{" "}
            in 2026
          </h1>

          {/* TL;DR lede card */}
          <div
            className="rounded-2xl p-6 mb-12"
            style={{
              backgroundColor: "rgba(59,130,246,0.04)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <p className="text-gray-200 font-light leading-relaxed text-base">
              <strong className="text-white font-semibold">TL;DR.</strong> The fastest way to add
              AI to a small business in 2026 is to spend 30 minutes listing your 3 most repetitive
              weekly tasks, then match each one to the right level of investment: a{" "}
              <strong className="text-gray-100">$20/month ChatGPT subscription</strong> for solo
              writing and research, a{" "}
              <strong className="text-gray-100">$50–200/month vertical AI tool</strong> for niche
              needs (legal intake, scheduling, customer support), or a{" "}
              <strong className="text-gray-100">$1,500–$15,000 custom build</strong> when the AI
              needs to see your specific data or live inside your existing tools. Most service
              businesses get the biggest first win from{" "}
              <strong className="text-gray-100">customer intake automation</strong> — ~$2,000–$4,000
              to build, ships in 2–3 weeks, typically closes 20–40% more discovery calls. Skip the
              rest of this article and{" "}
              <a
                href="https://calendly.com/hudsonturansky/30min"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                book a free 30-minute discovery call
              </a>{" "}
              if you'd rather have someone scope this for you.
            </p>
          </div>

          {/* Step 1 */}
          <Section heading="Step 1 — Audit your week">
            <p>
              Block 30 minutes and write down the 3 most repetitive tasks you do every week. For
              each, estimate the hours per week and the dollar value of an hour of your time. This
              list is the input to every decision below.
            </p>
            <p>The patterns we see most often, by industry:</p>
            <Bullets>
              <li>
                <strong>Contractors</strong> — intake forms, scheduling, quote follow-ups, photo +
                document organization, weekly invoicing.
              </li>
              <li>
                <strong>Professional services</strong> (legal, accounting, consulting) — document
                review and summarization, client onboarding intake, recurring research, drafting
                standard documents.
              </li>
              <li>
                <strong>E-commerce</strong> — customer support email triage, inventory updates,
                returns/refund decisions, weekly performance reports.
              </li>
              <li>
                <strong>Agencies</strong> — proposal writing, lead qualification, status updates,
                client weekly summaries.
              </li>
            </Bullets>
          </Section>

          {/* Step 2 */}
          <Section heading="Step 2 — Match each task to the right level of investment">
            <p>
              For every task on your list, decide which bucket it belongs in. Most small businesses
              end up with a mix.
            </p>

            <h3 className="text-lg font-semibold text-white mt-8 mb-2" style={{ letterSpacing: "-0.01em" }}>
              $20/month — ChatGPT Plus or Claude Pro
            </h3>
            <p>
              Solo use. Drafting emails, summarizing documents, basic research, one-off writing
              tasks. Good for tasks you can do faster as the human-in-the-loop.{" "}
              <strong>Bad for</strong> tasks where the AI needs to see your specific data, integrate
              with your tools, or run on its own schedule.
            </p>

            <h3 className="text-lg font-semibold text-white mt-8 mb-2" style={{ letterSpacing: "-0.01em" }}>
              $50–200/month — Off-the-shelf vertical AI tool
            </h3>
            <p>
              Niche tools built for specific industries: legal intake (e.g. Clio Duo), AI scheduling
              assistants, customer support copilots, AI bookkeeping. Subscribe when the product
              already does 80%+ of what you want and the monthly cost is less than ~10 hours of your
              saved time. <strong>Caveat:</strong> these are getting commoditized fast, switching is
              often easy, and most don't integrate as deeply as a custom build.
            </p>

            <h3 className="text-lg font-semibold text-white mt-8 mb-2" style={{ letterSpacing: "-0.01em" }}>
              $1,500–$15,000+ one-time — Custom build
            </h3>
            <p>
              Right when (a) the AI needs to read <em className="text-gray-300">your</em> specific
              knowledge base, (b) it needs to act inside your existing tools (CRM, Slack, Notion,
              Google Workspace), (c) you'd put it in front of customers, or (d) you need multi-step
              automation no consumer tool reaches. <strong>Typical ranges:</strong> a focused custom
              AI assistant or automation runs $1,500–$5,000; a larger custom agent that does
              multi-step work or operates inside a workflow tool usually lands $5,000–$15,000.
            </p>
          </Section>

          {/* Step 3 */}
          <Section heading="Step 3 — Pick your first project">
            <p>
              The right first project is the one that's <strong>visible</strong>,{" "}
              <strong>repeatable</strong>, and <strong>safe to test on a small scope</strong>. For
              most service businesses, that's <strong>customer intake automation</strong>: replace
              your contact form with a custom AI assistant that asks the right qualifying questions
              in conversation, captures the details, and writes the result back to your CRM. Build
              cost is typically $2,000–$4,000 and it ships in 2–3 weeks. Service businesses that
              adopt this usually close 20–40% more discovery calls because qualifying happens before
              a human gets involved.
            </p>
            <p>Other strong first projects:</p>
            <Bullets>
              <li>
                <strong>Email triage assistant</strong> — categorizes incoming email and drafts
                replies in your voice. ~$2,500–$5,000. Ships in 3–4 weeks.
              </li>
              <li>
                <strong>Document intake processor</strong> (legal, accounting, contractors) —
                extracts structured fields from PDFs and writes them to your system. ~$2,000–$6,000.
              </li>
              <li>
                <strong>Internal research assistant</strong> tied to your company knowledge base.
                ~$3,000–$8,000.
              </li>
            </Bullets>
          </Section>

          {/* Step 4 */}
          <Section heading="Step 4 — Avoid the 3 most common mistakes">
            <ol className="list-decimal pl-5 space-y-3 text-gray-400 font-light leading-relaxed">
              <li>
                <strong>Building before testing with $20/month ChatGPT first.</strong> If a 2-week
                ChatGPT experiment doesn't solve your problem at all, a $5,000 custom build probably
                won't either. The goal of the audit is to confirm AI is the right tool before you
                spend on it.
              </li>
              <li>
                <strong>Letting a builder talk you into AI when automation alone would work.</strong>{" "}
                A lot of "AI" projects are really just better scripts. If your task is rule-based,
                you don't need an LLM in the middle — and you shouldn't pay for one.
              </li>
              <li>
                <strong>Skipping the "where AI doesn't belong" conversation.</strong> Anything where
                wrong answers cost real money (regulated industries, customer-facing decisions,
                financial calculations) needs careful scoping. A good builder will flag these.
              </li>
            </ol>
          </Section>

          {/* CTA card */}
          <div
            className="mt-12 rounded-2xl p-8 text-center"
            style={{
              backgroundColor: "rgba(59,130,246,0.05)",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <p className="text-white font-semibold mb-2">
              Want someone to scope your first AI project?
            </p>
            <p className="text-gray-400 text-sm font-light mb-5 max-w-md mx-auto leading-relaxed">
              Free 30-minute discovery call. No pitch, no commitment. I'll tell you honestly which
              bucket your idea falls in.
            </p>
            <a
              href="https://calendly.com/hudsonturansky/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
              style={{ backgroundColor: "#ffffff", color: "#09090b" }}
            >
              Book a call →
            </a>
          </div>

          {/* FAQ */}
          <section id="faq" className="mt-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
              FAQ
            </p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-white mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Common questions.
            </h2>
            <div className="space-y-3">
              {FAQ.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-2xl"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
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
          </section>
        </div>
      </article>

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

export default AiForSmallBusiness;

// ---------------------------------------------------------------------------
// Tiny inline helpers — keep body styles consistent across sections.
// ---------------------------------------------------------------------------

const Section = ({ heading, children }: { heading: string; children: React.ReactNode }) => (
  <section className="mb-12">
    <h2
      className="text-2xl sm:text-3xl font-bold text-white mb-4"
      style={{ letterSpacing: "-0.02em" }}
    >
      {heading}
    </h2>
    <div className="space-y-4 text-gray-400 font-light leading-relaxed">{children}</div>
  </section>
);

const Bullets = ({ children }: { children: React.ReactNode }) => (
  <ul className="list-disc pl-5 space-y-2 text-gray-400 font-light leading-relaxed">{children}</ul>
);
