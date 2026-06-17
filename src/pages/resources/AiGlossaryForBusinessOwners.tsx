// /resources/ai-glossary, "A Plain-English AI Glossary" guide. SPA route,
// prerendered via prerenderPlugin.
// The differentiator on this page (kept structurally intact per the
// markdown handoff): every term has a plain definition, a "why you'd care"
// line, and a "Decision impact" tag.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CANONICAL = "https://hudsonturansky.com/resources/ai-glossary";
const PUBLISHED = "2026-05-21";

interface Term {
  term: string;
  definition: React.ReactNode;
  whyYoudCare: React.ReactNode;
  decisionImpact: "matters" | "matters-most" | "matters-question" | "nice-to-know";
  decisionLine: React.ReactNode;
}

const TERMS: Term[] = [
  {
    term: "LLM (Large Language Model)",
    definition:
      "The engine behind ChatGPT and similar tools, software trained on an enormous amount of text that can read and write language.",
    whyYoudCare: "it's the thing doing the \"thinking\" inside every AI tool you'll touch.",
    decisionImpact: "nice-to-know",
    decisionLine: <em>Nice to know.</em>,
  },
  {
    term: "ChatGPT / Claude / Gemini",
    definition:
      "The three leading AI assistants, from OpenAI, Anthropic, and Google respectively.",
    whyYoudCare:
      "for everyday business tasks they're broadly similar; you don't need to agonize over which.",
    decisionImpact: "nice-to-know",
    decisionLine: <><em>Nice to know.</em> Pick whichever you find pleasant to use.</>,
  },
  {
    term: "Prompt",
    definition: "The instruction you give an AI, the message you type.",
    whyYoudCare: (
      <>
        the quality of what you get out depends heavily on the prompt. "Prompting well" is a real,
        learnable skill, and it's most of what separates people who find AI useful from people who
        don't.
      </>
    ),
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters</em>, especially if you plan to use AI yourself rather than have tools built.
      </>
    ),
  },
  {
    term: "AI agent",
    definition:
      "AI that doesn't just answer questions but takes actions and completes multi-step tasks on its own, for example, reading an inquiry, drafting a quote, and booking a slot, start to finish.",
    whyYoudCare: "this is what \"custom AI\" for a small business usually means in practice.",
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters.</em> When someone proposes building you "an agent," this is what they mean.
      </>
    ),
  },
  {
    term: "Chatbot vs. agent",
    definition: "A chatbot answers questions. An agent gets things done.",
    whyYoudCare: (
      <>
        people say "chatbot" for everything, but a chatbot that only answers is often the{" "}
        <em>least</em> valuable option, you usually want something that acts.
      </>
    ),
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters.</em> Make sure you're buying the one you actually need.
      </>
    ),
  },
  {
    term: "Automation / workflow",
    definition: 'A fixed sequence of steps that runs without you, "when X happens, do Y, then Z."',
    whyYoudCare:
      "a lot of what gets sold as \"AI\" is really automation with a bit of AI inside, and that's fine, automation is often the cheaper, sturdier part of the solution.",
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters.</em> The best small-business solutions are usually automation plus a little
        AI, not AI alone.
      </>
    ),
  },
  {
    term: "Integration / API",
    definition:
      'The connection that lets one piece of software talk to another. An API is the "socket" software exposes so other software can plug in.',
    whyYoudCare:
      "whether your existing tools can connect is often what decides if a project is quick and cheap or slow and expensive.",
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters.</em> Early on, ask "does everything I use have an API?", the answer shapes
        the cost.
      </>
    ),
  },
  {
    term: "RAG (Retrieval-Augmented Generation)",
    definition: (
      <>
        A technique that lets an AI answer using <em>your</em> documents and data, instead of
        only its general training.
      </>
    ),
    whyYoudCare:
      "this is how you get an AI that actually knows your business, your pricing, your policies, your past work, rather than giving generic answers.",
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters.</em> It's the difference between a generic assistant and a useful one. If
        you want AI that "knows our stuff," you want RAG.
      </>
    ),
  },
  {
    term: "Fine-tuning",
    definition: "Further-training an AI model on your own examples so it behaves a particular way.",
    whyYoudCare:
      "it's often suggested when the simpler, cheaper approach (RAG) would do the job. It has real uses, but it's not usually the first thing a small business needs.",
    decisionImpact: "matters-question",
    decisionLine: (
      <>
        <em>Matters, as a thing to question.</em> If someone leads with "we'll fine-tune a model
        for you," ask why RAG wouldn't be cheaper and faster.
      </>
    ),
  },
  {
    term: "Hallucination",
    definition: "When an AI states something false while sounding completely confident.",
    whyYoudCare:
      "it's the single biggest reason anything customer-facing or money-related needs guardrails and a human check.",
    decisionImpact: "matters",
    decisionLine: (
      <>
        <em>Matters.</em> For any AI your customers see, ask how wrong answers are prevented or
        caught.
      </>
    ),
  },
  {
    term: "Token / context window",
    definition:
      "Roughly, how much text an AI can hold \"in mind\" at once. The context window is its working memory.",
    whyYoudCare:
      "it occasionally explains why a tool struggles with a very large document or a very long conversation.",
    decisionImpact: "nice-to-know",
    decisionLine: (
      <>
        <em>Nice to know.</em> A builder handles this for you; you rarely decide anything based
        on it.
      </>
    ),
  },
  {
    term: "Model",
    definition:
      "A specific version of an AI engine, for example, a GPT-class model or a Claude model, in various sizes.",
    whyYoudCare:
      "newer and larger models cost more per use. A well-built tool quietly uses the cheapest model that does the job well.",
    decisionImpact: "nice-to-know",
    decisionLine: (
      <>
        <em>Nice to know.</em> Worth asking, if you're cost-conscious, "are we using the
        right-sized model for this?"
      </>
    ),
  },
  {
    term: "No-code / low-code",
    definition: "Building working software with little or no traditional programming.",
    whyYoudCare:
      "many small-business automations are built this way, faster and cheaper than building from scratch.",
    decisionImpact: "nice-to-know",
    decisionLine: (
      <>
        <em>Nice to know.</em> It's one reason custom work costs less than it used to.
      </>
    ),
  },
  {
    term: "Off-the-shelf vs. custom",
    definition:
      "Off-the-shelf is a product anyone can buy. Custom is something built specifically for your business.",
    whyYoudCare:
      "this is the single biggest cost-and-fit decision you'll make with AI. Off-the-shelf is cheaper and faster but you take it as-is; custom fits your process exactly but costs more.",
    decisionImpact: "matters-most",
    decisionLine: (
      <>
        <em>Matters most of all.</em> Nearly every AI spending decision comes back to this one.
      </>
    ),
  },
];

const IMPACT_BADGE: Record<
  Term["decisionImpact"],
  { label: string; color: string; border: string }
> = {
  matters: {
    label: "MATTERS",
    color: "rgba(96,165,250,0.9)",
    border: "rgba(96,165,250,0.4)",
  },
  "matters-most": {
    label: "MATTERS MOST",
    color: "rgba(96,165,250,1)",
    border: "rgba(96,165,250,0.6)",
  },
  "matters-question": {
    label: "MATTERS · QUESTION IT",
    color: "rgba(245,158,11,0.95)",
    border: "rgba(245,158,11,0.4)",
  },
  "nice-to-know": {
    label: "NICE TO KNOW",
    color: "rgba(156,163,175,0.9)",
    border: "rgba(156,163,175,0.3)",
  },
};

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "What does LLM stand for?",
    a: "LLM stands for Large Language Model, the text-trained software that powers ChatGPT and similar AI tools. It's the engine doing the reading and writing inside every AI product you'll use.",
  },
  {
    q: "What is an AI agent, in simple terms?",
    a: "An AI agent is AI that takes actions and completes multi-step tasks on its own, rather than only answering questions. For a small business, an agent might take a customer inquiry, draft a quote, and book an appointment from start to finish.",
  },
  {
    q: "What's the difference between a chatbot and an AI agent?",
    a: "A chatbot answers questions. An agent gets things done, it can take actions across multiple steps and systems. For most business problems the agent is the more valuable of the two.",
  },
  {
    q: "What is RAG and why does it matter?",
    a: "RAG (Retrieval-Augmented Generation) is a technique that lets an AI answer using your own documents and data instead of only its general knowledge. It matters because it's how you get an AI that actually knows your business rather than giving generic answers.",
  },
  {
    q: "Do I need to understand any of this to use AI?",
    a: "No, you can use AI well without understanding how it works. You only need enough vocabulary to follow a conversation and make good decisions, which is what this glossary gives you. Focus on the terms marked \"Matters for your decision.\"",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "A Plain-English AI Glossary (2026)",
  description:
    "The AI terms that actually matter, each explained simply, with why you'd care and whether it affects your decisions.",
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

const AiGlossaryForBusinessOwners = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>A plain-English AI glossary (2026) · Hudson Turansky</title>
        <meta
          name="description"
          content="The AI terms that actually matter, each explained simply, with why you'd care and whether it affects your decisions."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta
          property="og:title"
          content="A plain-English AI glossary (2026)"
        />
        <meta
          property="og:description"
          content="A dozen-or-so AI terms that actually matter, with plain definitions and decision impact for each."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta property="article:author" content="Hudson Turansky" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="A plain-English AI glossary (2026)"
        />
        <meta
          name="twitter:description"
          content="The AI terms that actually matter."
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
              "radial-gradient(ellipse at 50% 25%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p className="text-sm text-gray-500 mb-6">
            <Link to="/resources" className="hover:text-gray-300 transition-colors">
              Resources
            </Link>
            <span className="mx-2 text-gray-700">/</span>
            <span className="text-gray-400">A plain-English AI glossary</span>
          </p>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Guide · 2026
          </p>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8 leading-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            A{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              plain-English AI glossary
            </span>{" "}
            (2026)
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
                You don't need to understand how AI works to use it well, you need to understand
                about a dozen terms well enough to follow a conversation and make good decisions.
              </strong>{" "}
              This glossary covers exactly those terms, and nothing you don't need.
            </p>
            <p className="text-gray-300 font-light leading-relaxed text-base mt-4">
              Most AI glossaries just define words. This one does three things for each term: a
              plain definition, <em>why a business owner would care</em>, and whether it actually{" "}
              <strong className="text-gray-100">matters for a decision</strong> you'll make, or
              is just nice to know. If you're short on time, read only the terms marked "Matters
              for your decision" and skip the rest with a clear conscience.
            </p>
          </div>

          <section className="mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-6"
              style={{ letterSpacing: "-0.02em" }}
            >
              The terms
            </h2>
            <div className="space-y-5">
              {TERMS.map((t) => {
                const badge = IMPACT_BADGE[t.decisionImpact];
                return (
                  <div
                    key={t.term}
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: "var(--app-card-bg)",
                      border: "1px solid var(--app-border-soft)",
                    }}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-3">
                      <h3
                        className="text-lg font-semibold text-white leading-tight"
                        style={{ letterSpacing: "-0.01em" }}
                      >
                        {t.term}
                      </h3>
                      <span
                        className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: "var(--app-card-bg-strong)",
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm font-light leading-relaxed mb-3">
                      {t.definition}
                    </p>
                    <p className="text-gray-500 text-sm font-light leading-relaxed mb-2">
                      <strong className="text-gray-300">Why you'd care:</strong> {t.whyYoudCare}
                    </p>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      <strong className="text-gray-300">Decision impact:</strong> {t.decisionLine}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mb-12">
            <h2
              className="text-2xl sm:text-3xl font-bold text-white mb-4"
              style={{ letterSpacing: "-0.02em" }}
            >
              How to use this glossary
            </h2>
            <p className="text-gray-400 font-light leading-relaxed">
              You're now equipped for almost any AI conversation you'll have as a business owner.
              If you remember just three things, make them these: an <strong>agent</strong> does
              work (a chatbot only talks), <strong>RAG</strong> is how AI learns your business,
              and <strong>off-the-shelf vs. custom</strong> is the decision that drives the cost.
              Everything else you can look up when it comes up.
            </p>
          </section>

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

          <div className="mt-16 space-y-6 text-sm text-gray-500 font-light leading-relaxed">
            <p className="italic">
              Related:{" "}
              <Link
                to="/resources/what-custom-ai-costs"
                className="text-gray-300 hover:text-white transition-colors underline"
              >
                What custom AI actually costs
              </Link>
              <span className="mx-2 text-gray-700">·</span>
              <Link
                to="/resources/hire-ai-help-or-do-it-yourself"
                className="text-gray-300 hover:text-white transition-colors underline"
              >
                Should you hire someone or use ChatGPT yourself?
              </Link>
              <span className="mx-2 text-gray-700">·</span>
              <Link
                to="/resources/what-small-businesses-use-ai-for"
                className="text-gray-300 hover:text-white transition-colors underline"
              >
                12 things small businesses are actually using AI for
              </Link>
            </p>
            <p className="italic">
              Ready to move from terms to a plan?{" "}
              <Link
                to="/ai-brief"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Take the free Personalized AI Brief
              </Link>
              , or{" "}
              <a
                href="/#contact"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                get in touch
              </a>{" "}
              for a straight conversation about your business.
            </p>
          </div>
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

export default AiGlossaryForBusinessOwners;
