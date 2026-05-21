// /resources/what-small-businesses-use-ai-for, "12 Things Small Businesses
// Are Actually Using AI For in 2026" guide. SPA route, prerendered via
// prerenderPlugin.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CANONICAL = "https://hudsonturansky.com/resources/what-small-businesses-use-ai-for";
const PUBLISHED = "2026-05-21";

interface UseCase {
  number: number;
  title: string;
  description: string;
  bestFor: string;
  effort: string;
  diyOrBuild: string;
}

const USE_CASES: UseCase[] = [
  {
    number: 1,
    title: "Handling customer inquiries",
    description:
      "An AI agent answers incoming questions, from phone, email, and your website form, the way you would, then books or routes the ones that need a human.",
    bestFor: "service businesses with steady inbound.",
    effort: "moderate.",
    diyOrBuild: "usually a build, it needs to know your business and connect to your channels.",
  },
  {
    number: 2,
    title: "Appointment scheduling",
    description: "AI books, reschedules, and sends reminders so you stop playing phone tag.",
    bestFor: "clinics, salons, trades, consultants.",
    effort: "low.",
    diyOrBuild: "often off-the-shelf, good scheduling products with AI built in already exist.",
  },
  {
    number: 3,
    title: "Email triage and drafting",
    description:
      "AI sorts your inbox, flags what actually needs you, and drafts replies in your voice for approval.",
    bestFor: "anyone drowning in email.",
    effort: "low to moderate.",
    diyOrBuild: "DIY-able to start; worth building once a whole team needs it to work consistently.",
  },
  {
    number: 4,
    title: "Quotes and proposals",
    description:
      "AI generates a quote or proposal from your own pricing rules and a short description of the job.",
    bestFor: "contractors, agencies, B2B service businesses.",
    effort: "moderate.",
    diyOrBuild: "usually a build, it has to encode your pricing logic to be trustworthy.",
  },
  {
    number: 5,
    title: "Invoicing and payment follow-up",
    description:
      "AI drafts and sends polite payment reminders on a schedule, so unpaid invoices stop slipping.",
    bestFor: "any business chasing payments.",
    effort: "low to moderate.",
    diyOrBuild:
      "a mix, some accounting tools include it; a custom version fits your tone and timing.",
  },
  {
    number: 6,
    title: "Customer support answers",
    description:
      "An AI answers common questions using your own help docs and FAQs, and hands off the rest.",
    bestFor:
      "product businesses, software, anyone fielding the same questions repeatedly.",
    effort: "moderate.",
    diyOrBuild: "a build, it has to be grounded in your own content to be accurate.",
  },
  {
    number: 7,
    title: "Lead follow-up",
    description:
      "AI makes sure no inquiry goes cold, it follows up automatically, on a sensible schedule, until the person replies.",
    bestFor: "anyone losing business to slow or forgotten follow-up.",
    effort: "moderate.",
    diyOrBuild: "usually a build, connected to wherever your leads live.",
  },
  {
    number: 8,
    title: "Pulling data out of documents",
    description:
      "AI reads invoices, receipts, forms, and contracts and extracts the figures into a spreadsheet or system, no more manual typing.",
    bestFor: "bookkeeping, operations, any admin-heavy role.",
    effort: "moderate.",
    diyOrBuild:
      "a build, accuracy and your specific format matter too much for a generic tool.",
  },
  {
    number: 9,
    title: "Marketing content",
    description:
      "AI drafts social posts, newsletters, product descriptions, and blog posts for you to edit and approve.",
    bestFor: "essentially everyone.",
    effort: "low.",
    diyOrBuild: "mostly DIY, this is exactly what a $20/month subscription is good at.",
  },
  {
    number: 10,
    title: "Meeting and call notes",
    description:
      "AI records, transcribes, and summarizes calls with clear action items, so nothing gets lost.",
    bestFor: "consultants, sales, client-service businesses.",
    effort: "low.",
    diyOrBuild: "off-the-shelf, strong dedicated products already exist.",
  },
  {
    number: 11,
    title: "Inventory and ordering",
    description: "AI flags low stock and drafts purchase orders before you run out.",
    bestFor: "retail, restaurants, trades carrying materials.",
    effort: "moderate.",
    diyOrBuild:
      "depends on your systems, off-the-shelf if your stock software supports it, a build if it doesn't.",
  },
  {
    number: 12,
    title: "Searching your own information",
    description:
      "An internal assistant answers questions like \"what did we quote this client last year?\" from your own files, emails, and records.",
    bestFor: "any business where knowledge is buried across folders and inboxes.",
    effort: "moderate.",
    diyOrBuild: "a build, the whole value is that it knows your information.",
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What is the most common use of AI in small business?",
    a: "The most common high-value uses are handling repetitive admin, customer inquiries, scheduling, email, quotes, and invoicing follow-up. These beat flashier uses because they happen constantly and follow a predictable pattern, so removing them frees real, recurring hours.",
  },
  {
    q: "What can AI do that actually saves a small business money?",
    a: "AI saves money mainly by removing repetitive labor: routing inquiries, drafting quotes, chasing payments, extracting data from documents, and following up with leads. The savings come from hours returned to you and your team each week, plus business that no longer slips through the cracks.",
  },
  {
    q: "Does my small business need a website chatbot?",
    a: "Often not, a website chatbot is one of the most visible uses but rarely the highest-value one. For most small businesses, removing internal admin work (quotes, inquiries, document data) returns more time and money than a chat widget on the homepage.",
  },
  {
    q: "Which of these AI use cases can I do myself?",
    a: "Marketing content, meeting notes, email drafting, and basic scheduling are all reasonable to do yourself with an off-the-shelf subscription. The ones tied to your own data, pricing, or systems, inquiries, quotes, document extraction, internal search, usually need to be built.",
  },
  {
    q: "What's a good first AI project for a small business?",
    a: "The task that costs you the most time and runs the same way every time. Don't start with the most exciting idea; start with your biggest predictable time drain, that's where AI pays back fastest.",
  },
  {
    q: "How much do these cost to set up?",
    a: "DIY uses run about $20–200/month. Builds for the data- and system-specific uses are typically a one-time $1,500–$15,000 plus small running costs. See the cost guide for the full breakdown.",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "12 Things Small Businesses Are Actually Using AI For in 2026",
  description:
    "Twelve concrete, real-world ways small businesses use AI in 2026, with the rough effort and cost of each, and whether you can do it yourself or need it built.",
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

const WhatSmallBusinessesUseAiFor = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>12 things small businesses are actually using AI for in 2026 · Hudson Turansky</title>
        <meta
          name="description"
          content="Twelve concrete, real-world ways small businesses use AI in 2026, with the rough effort and cost of each, and whether you can do it yourself or need it built."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta
          property="og:title"
          content="12 things small businesses are actually using AI for in 2026"
        />
        <meta
          property="og:description"
          content="Twelve concrete, real-world uses, customer inquiries, scheduling, quotes, document data, with effort and cost for each."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta property="article:author" content="Hudson Turansky" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="12 things small businesses are actually using AI for in 2026"
        />
        <meta
          name="twitter:description"
          content="Twelve real-world AI use cases, with effort, cost, and DIY-or-build for each."
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
            <span className="text-gray-400">12 things small businesses use AI for</span>
          </p>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Guide · 2026
          </p>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8 leading-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            12 things small businesses are{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              actually using AI for
            </span>{" "}
            in 2026
          </h1>

          <div
            className="rounded-2xl p-6 mb-12"
            style={{
              backgroundColor: "rgba(59,130,246,0.04)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <p className="text-gray-200 font-light leading-relaxed text-base">
              <strong className="text-white font-semibold">
                The most useful AI for a small business in 2026 usually isn't a chatbot on your
                website, it's the quiet removal of repetitive admin work that eats your week.
              </strong>{" "}
              The most common real-world uses, across businesses with fewer than 50 people, are
              handling customer inquiries, scheduling, email triage, quotes and proposals,
              invoicing follow-up, support answers, lead follow-up, pulling data out of documents,
              marketing content, meeting notes, inventory and ordering, and searching your own
              internal information.
            </p>
            <p className="text-gray-300 font-light leading-relaxed text-base mt-4">
              None of these are futuristic. They're all in everyday use right now. Below are
              twelve specific use cases. For each one you get what it does, who it helps most,
              the rough effort to set up, and whether it's something you can do yourself with
              off-the-shelf tools or something worth having built. The pattern you'll notice: the
              highest-value uses are almost always the boring, repetitive tasks, not the flashy
              ones.
            </p>
          </div>

          <section className="mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              The 12 use cases
            </h2>
            <div className="space-y-5">
              {USE_CASES.map((u) => (
                <div
                  key={u.number}
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <span
                      className="font-mono text-xs font-medium text-blue-400 flex-shrink-0 mt-0.5"
                      style={{ letterSpacing: "0.05em" }}
                    >
                      {String(u.number).padStart(2, "0")}
                    </span>
                    <h3
                      className="text-lg font-semibold text-white leading-tight"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {u.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm font-light leading-relaxed mb-3">
                    {u.description}
                  </p>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">
                    <strong className="text-gray-300">Best for:</strong> {u.bestFor}{" "}
                    <strong className="text-gray-300 ml-2">Effort:</strong> {u.effort}{" "}
                    <strong className="text-gray-300 ml-2">DIY or build:</strong> {u.diyOrBuild}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Section heading="How to pick where to start">
            <p>
              The best first project isn't the most exciting one on the list, it's the one that
              is, at the same time, <strong>(a) costing you the most time right now</strong> and{" "}
              <strong>(b) the same every time</strong>. Run down the twelve and find the single
              task that drains your week <em>and</em> follows a predictable pattern. That
              intersection is your starting point. One well-chosen project beats five
              half-finished ones.
            </p>
          </Section>

          <Section heading="DIY versus build, at a glance">
            <p>
              <strong>Mostly DIY-able</strong> with a $20–200/month subscription: marketing
              content, meeting notes, basic scheduling, email drafting. Start here, it's cheap
              and immediate.
            </p>
            <p>
              <strong>Almost always worth building</strong>, because they depend on your data,
              your pricing, or your systems: handling customer inquiries, quotes and proposals,
              document data extraction, customer support answers, lead follow-up, and internal
              knowledge search. These are the ones a generic tool can't really do, and also the
              ones that save the most time.
            </p>
            <p>
              For how to think about the cost of a build, see{" "}
              <Link
                to="/resources/what-custom-ai-costs"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                what custom AI actually costs
              </Link>
              ; for deciding whether a given task is yours to DIY or worth handing off, see{" "}
              <Link
                to="/resources/hire-ai-help-or-do-it-yourself"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                hire someone or do it yourself
              </Link>
              .
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

          <RelatedFooter
            relatedLinks={[
              { to: "/resources/what-custom-ai-costs", label: "What custom AI actually costs" },
              {
                to: "/resources/hire-ai-help-or-do-it-yourself",
                label: "Should you hire someone or use ChatGPT yourself?",
              },
              {
                to: "/resources/ai-glossary-for-business-owners",
                label: "A plain-English AI glossary for business owners",
              },
            ]}
            ctaPrompt="Want this matched to your own business?"
          />
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

export default WhatSmallBusinessesUseAiFor;

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
      to get 6–10 specific ideas for your situation, or{" "}
      <a
        href="/#contact"
        className="text-blue-400 hover:text-blue-300 transition-colors underline"
      >
        get in touch
      </a>
      .
    </p>
  </div>
);
