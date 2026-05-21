// /resources/what-custom-ai-costs, "What Custom AI Actually Costs for a
// Small Business" guide. SPA route, prerendered via prerenderPlugin so
// crawlers see the full article HTML on the first fetch. Visual language
// matches the existing /resources/ai-for-small-business page (Navbar,
// DottedSurface background, gradient text, dark theme cards, details/summary
// FAQ).

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CANONICAL = "https://hudsonturansky.com/resources/what-custom-ai-costs";
const PUBLISHED = "2026-05-21";

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "How much does custom AI cost for a small business?",
    a: "A custom-built AI tool is typically a one-time build of about $1,500–$15,000 depending on complexity, plus ongoing running costs that are usually $20–100 per month. Simpler, single-purpose tools sit at the low end; tools that connect several systems sit at the high end.",
  },
  {
    q: "Is custom AI worth it for a small business?",
    a: "It's worth it when the task it removes is repetitive, happens often, and is specific to your business, because then the time it saves quickly outweighs the one-time build cost. It's not worth it for occasional, one-off work, which a $20/month tool handles fine.",
  },
  {
    q: "How much does an AI chatbot or AI agent cost?",
    a: "A simple agent built for one well-defined job can start around $1,500. One that handles inquiries across multiple channels and takes actions (booking, quoting, updating records) runs higher, toward the $5,000–$15,000 range, because it touches more systems and needs to be reliable.",
  },
  {
    q: "Why is custom AI cheaper than it used to be?",
    a: "Because AI now helps build the software itself. An AI-assisted build process is significantly faster than traditional development, so projects that once required a big agency budget are now realistic for a small business.",
  },
  {
    q: "What are the ongoing costs after a custom AI tool is built?",
    a: "Usually modest, roughly $20–100/month covering AI usage and hosting, plus occasional small changes as your business evolves. Most custom tools cost less to run than one off-the-shelf subscription.",
  },
  {
    q: "Do I have to pick just one tier?",
    a: "No. Most small businesses use a mix: an everyday AI subscription, perhaps one configured product, and one custom build aimed at their biggest time drain.",
  },
  {
    q: "How do I get a price for my specific project?",
    a: "The honest answer is that it depends on the three cost drivers above. The fastest way to a real number is a short conversation about the specific task, what it involves, what systems it touches, and how often it happens.",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Custom AI Actually Costs for a Small Business (2026)",
  description:
    "A plain, honest breakdown of what AI costs a small business in 2026, from $20/month tools to custom builds, and how to match the spend to your problem.",
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

const WhatCustomAiCosts = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>What Custom AI Actually Costs for a Small Business (2026) · Hudson Turansky</title>
        <meta
          name="description"
          content="A plain, honest breakdown of what AI costs a small business in 2026, from $20/month tools to custom builds, and how to match the spend to your problem."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta
          property="og:title"
          content="What Custom AI Actually Costs for a Small Business (2026)"
        />
        <meta
          property="og:description"
          content="From $20/month tools to $1,500–$15,000 custom builds, what AI actually costs a small business and how to pick the right tier."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta property="article:author" content="Hudson Turansky" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="What Custom AI Actually Costs for a Small Business (2026)"
        />
        <meta
          name="twitter:description"
          content="An honest breakdown of the three cost tiers and how to pick the right one for your situation."
        />
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
          <p className="text-sm text-gray-500 mb-6">
            <Link to="/resources" className="hover:text-gray-300 transition-colors">
              Resources
            </Link>
            <span className="mx-2 text-gray-700">/</span>
            <span className="text-gray-400">What custom AI actually costs</span>
          </p>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Guide · 2026
          </p>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8 leading-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            What custom AI{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              actually costs
            </span>{" "}
            for a small business (2026)
          </h1>

          <div
            className="rounded-2xl p-6 mb-12"
            style={{
              backgroundColor: "var(--app-blue-tint)",
              border: "1px solid var(--app-blue-tint-border-strong)",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <p className="text-gray-200 font-light leading-relaxed text-base">
              <strong className="text-white font-semibold">
                For a small business in 2026, AI costs fall into three tiers: ready-made tools at
                around $20 per month, configured software and automations at roughly $50–200 per
                month, and custom-built AI tools as a one-time build of about $1,500–$15,000.
              </strong>{" "}
              Most small businesses get the cost wrong in one of two directions, they reach for an
              expensive custom build when a $20 tool would do, or they force a generic tool to do
              a job that really needs something built, and quietly lose hours every week to the
              gap.
            </p>
            <p className="text-gray-300 font-light leading-relaxed text-base mt-4">
              The cost of AI isn't really about AI. It's about how <em>specific</em> the job is to
              your business. A task that thousands of businesses share is cheap to solve, because
              someone has already built and sold the tool. A task tied to your own data, your own
              pricing, or your own software costs more, because it has to be built for you. This
              guide breaks down each tier, what drives the price of a custom build, the ongoing
              costs people forget, and a simple way to tell which tier your problem belongs in.
            </p>
          </div>

          <Section heading="The three cost tiers">
            <h3
              className="text-lg font-semibold text-white mt-8 mb-2"
              style={{ letterSpacing: "-0.01em" }}
            >
              Tier 1, Ready-made AI tools (~$20/month)
            </h3>
            <p>
              This is ChatGPT Plus, Claude Pro, and similar assistants. One person, a web browser,
              general-purpose work: writing, drafting, research, brainstorming, summarizing,
              getting unstuck. It runs about $20 per user per month.
            </p>
            <p>
              <strong>Best when:</strong> the work is occasional, you're the person doing it, and
              nothing needs to connect to your other systems. <strong>Its limit:</strong> it
              doesn't know your business, it doesn't remember between sessions, and it can't do
              anything on its own, you have to be sitting there driving it. Most owners should
              start here. A $20 subscription and an hour spent learning to write good prompts
              covers a surprising amount of ground.
            </p>

            <h3
              className="text-lg font-semibold text-white mt-8 mb-2"
              style={{ letterSpacing: "-0.01em" }}
            >
              Tier 2, Configured AI software and automations (~$50–200/month)
            </h3>
            <p>
              This is AI features inside tools you may already use, a CRM with AI built in, an AI
              scheduling assistant, an AI phone-answering service, plus automation platforms like
              Zapier or Make that wire AI into your existing apps. Expect roughly $50–200 per
              month depending on volume and how many tools are involved, sometimes plus a few
              hours of one-time setup help to connect everything.
            </p>
            <p>
              <strong>Best when:</strong> a common, well-known workflow needs to run
              automatically, and an off-the-shelf product already covers about 80% of it.{" "}
              <strong>Its limit:</strong> you get the product the way it was built. If your
              process doesn't match how the tool works, you end up bending your business to fit
              the software.
            </p>

            <h3
              className="text-lg font-semibold text-white mt-8 mb-2"
              style={{ letterSpacing: "-0.01em" }}
            >
              Tier 3, Custom-built AI tools and agents (one-time build, ~$1,500–$15,000)
            </h3>
            <p>
              This is something built specifically for your business: an AI agent that handles
              customer inquiries the way you would, an internal tool that answers questions from
              your own data, an integration between AI and a piece of software that has no
              off-the-shelf connector. It's project-based work, typically ranging from about
              $1,500 for something focused to $15,000 for something that touches several systems,
              plus modest ongoing running costs (usually $20–100/month).
            </p>
            <p>
              <strong>Best when:</strong> the job is specific to your business, it repeats often
              enough to matter, it has to be reliable, or other people need to use it.{" "}
              <strong>Its strength:</strong> it fits your process exactly, instead of the other
              way around.
            </p>
          </Section>

          <Section heading="What actually drives the price of a custom build">
            <p>Two custom projects can be 5x apart in cost. The things that move the number:</p>
            <Bullets>
              <li>
                <strong>How many systems it touches.</strong> One tool is simple; stitching
                together five is not.
              </li>
              <li>
                <strong>Whether it just answers, or also takes action.</strong> Replying with
                information is cheaper than booking, sending, or updating records on its own.
              </li>
              <li>
                <strong>How much it depends on your data, and how messy that data is.</strong>{" "}
                Clean, organized information is quick to work with; scattered files and
                inconsistent records add time.
              </li>
              <li>
                <strong>How reliable it has to be.</strong> A draft for you to check is far
                cheaper than something customers see directly, which needs guardrails and testing.
              </li>
              <li>
                <strong>How many people use it, and whether it needs a polished interface.</strong>{" "}
                A tool just for you can be plain; a tool your whole team uses needs to be obvious
                to operate.
              </li>
            </Bullets>
            <p>
              Worth knowing: an AI-assisted build process, using AI to help write the software
              itself, makes custom builds meaningfully faster and cheaper than the rates
              traditional agencies quote. Work an agency might price at $20,000–$40,000 can often
              be done for a fraction of that. That shift is the main reason Tier 3 is now
              realistic for small businesses, not just big ones.
            </p>
          </Section>

          <Section heading="The ongoing costs people forget">
            <p>A custom build is mostly a one-time cost, but not entirely. Budget for:</p>
            <Bullets>
              <li>
                <strong>AI usage</strong>, the per-use cost of the AI itself. For a small business
                this is usually small, often $10–50/month.
              </li>
              <li>
                <strong>Hosting</strong>, frequently $0–25/month.
              </li>
              <li>
                <strong>Occasional changes</strong>, as your business shifts, you'll want small
                tweaks.
              </li>
            </Bullets>
            <p>
              In practice most custom tools cost <em>less to run</em> each month than a single
              Tier-2 subscription. The build is the spend; living with it is cheap.
            </p>
          </Section>

          <Section heading="A worked example">
            <p>
              Take a six-person home-services company. Every new customer inquiry arrives by
              phone, email, or the website form, and someone has to copy each one into their
              scheduling software and send a quote by hand. It eats roughly eight hours a week.
            </p>
            <Bullets>
              <li>
                <strong>Tier 1 ($20/mo):</strong> ChatGPT can help word the quotes faster, but a
                person still does all the copying and routing. Saves maybe an hour a week.
              </li>
              <li>
                <strong>Tier 2 ($50–200/mo):</strong> an off-the-shelf form handler plus an
                automation can auto-route the <em>website-form</em> inquiries, but the phone and
                email ones still land on someone's desk. Saves around three hours a week.
              </li>
              <li>
                <strong>Tier 3 (one-time build):</strong> a custom intake agent takes inquiries
                from all three channels, drafts each quote from the company's own pricing rules,
                and drops it straight into the scheduler. Saves around seven hours a week, and at
                a typical build cost, it pays for itself within a few months and keeps saving
                every week after.
              </li>
            </Bullets>
            <p>
              There's no single right answer here. The right tier is the one where the saving
              clearly beats the cost <em>for your specific situation</em>.
            </p>
          </Section>

          <Section heading="How to figure out which tier you need">
            <p>Ask three quick questions about the task:</p>
            <ol className="list-decimal pl-5 space-y-3 text-gray-400 font-light leading-relaxed">
              <li>
                <strong>Is this task shared by lots of businesses, or specific to mine?</strong>{" "}
                Shared → a tool already exists (Tier 1 or 2). Specific → likely a build (Tier 3).
              </li>
              <li>
                <strong>Is it occasional, or constant?</strong> Occasional → DIY it. Constant →
                it's worth removing properly.
              </li>
              <li>
                <strong>Does it need to know my data, or connect my software?</strong> If yes,
                you're almost certainly in Tier 3.
              </li>
            </ol>
            <p>
              Most businesses end up using a mix, a Tier 1 subscription for everyday work, maybe
              one Tier 2 product, and one well-chosen Tier 3 build that removes their single
              biggest time drain.
            </p>
          </Section>

          <section id="faq" className="mt-16">
            <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">FAQ</p>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-white mb-8"
              style={{ letterSpacing: "-0.03em" }}
            >
              Frequently asked questions.
            </h2>
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
          </section>

          <RelatedFooter
            relatedLinks={[
              { to: "/resources/hire-ai-help-or-do-it-yourself", label: "Should you hire someone or just use ChatGPT yourself?" },
              { to: "/resources/what-small-businesses-use-ai-for", label: "12 things small businesses are actually using AI for" },
              { to: "/resources/ai-glossary-for-business-owners", label: "A plain-English AI glossary for business owners" },
            ]}
            ctaPrompt="Not sure which tier your problem belongs in?"
          />
        </div>
      </article>

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

export default WhatCustomAiCosts;

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

interface RelatedFooterProps {
  relatedLinks: Array<{ to: string; label: string }>;
  ctaPrompt: string;
}

const RelatedFooter = ({ relatedLinks, ctaPrompt }: RelatedFooterProps) => (
  <div className="mt-16 space-y-6 text-sm text-gray-500 font-light leading-relaxed">
    <p className="italic">
      Related:{" "}
      {relatedLinks.map((link, i) => (
        <span key={link.to}>
          <Link to={link.to} className="text-gray-300 hover:text-white transition-colors underline">
            {link.label}
          </Link>
          {i < relatedLinks.length - 1 && <span className="mx-2 text-gray-700">·</span>}
        </span>
      ))}
    </p>
    <p className="italic">
      {ctaPrompt}{" "}
      <Link
        to="/ai-brief"
        className="text-blue-400 hover:text-blue-300 transition-colors underline"
      >
        Take the free Personalized AI Brief
      </Link>{" "}
      to get specific ideas matched to your situation, or{" "}
      <a
        href="/#contact"
        className="text-blue-400 hover:text-blue-300 transition-colors underline"
      >
        get in touch
      </a>{" "}
      for a straight answer on your project.
    </p>
  </div>
);
