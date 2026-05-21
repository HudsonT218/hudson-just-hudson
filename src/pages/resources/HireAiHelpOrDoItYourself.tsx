// /resources/hire-ai-help-or-do-it-yourself, "Should You Hire Someone to
// Build AI, or Just Use ChatGPT Yourself?" guide. SPA route, prerendered
// via prerenderPlugin so crawlers see the full article HTML on the first
// fetch.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CANONICAL = "https://hudsonturansky.com/resources/hire-ai-help-or-do-it-yourself";
const PUBLISHED = "2026-05-21";

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Can't I just do everything with ChatGPT myself?",
    a: "You can do a lot, and for occasional, one-off work you should. But ChatGPT can't connect to your other software, doesn't know your business data, can't run on its own, and only works as well as each prompt you type. For repetitive tasks tied to your systems, those limits are exactly what a custom tool removes.",
  },
  {
    q: "Is it worth paying someone to set up AI for a small business?",
    a: "It's worth it when the task involved is repetitive, specific to your business, and currently costing you real time every week, then the build pays for itself in saved hours. It's not worth it for occasional or one-off work. The deciding factor is the task, not the size of your business.",
  },
  {
    q: "What's the difference between using ChatGPT and a custom AI tool?",
    a: "ChatGPT is a general assistant you operate by hand, one conversation at a time. A custom AI tool is built around one specific job in your business, it knows your data, connects to your software, runs consistently for anyone, and can work without you driving it.",
  },
  {
    q: "How do I know if my idea is too small to be worth building?",
    a: "If the task takes you only a few minutes a week, it's probably too small, keep it DIY. If it takes hours a week and follows a predictable pattern, it's likely worth building, even if it feels minor. Add up the yearly hours before deciding it's \"too small.\"",
  },
  {
    q: "What if I'm not technical at all?",
    a: "That's the normal case, and it's fine. You don't need to understand how anything works, you need to be able to describe the task and what a good result looks like. A good builder handles the rest and explains things in plain language.",
  },
  {
    q: "How do I get started?",
    a: "Pick the one task that drains the most time and follows the most predictable pattern, then have a short conversation about it. You don't need a finished plan, just the problem.",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Should You Hire Someone to Build AI, or Just Use ChatGPT Yourself?",
  description:
    "An honest decision guide for small business owners: when using ChatGPT yourself is enough, and when it's worth hiring someone to build a custom AI tool.",
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

const HireAiHelpOrDoItYourself = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Should you hire someone to build AI, or use ChatGPT yourself? · Hudson Turansky</title>
        <meta
          name="description"
          content="An honest decision guide for small business owners: when using ChatGPT yourself is enough, and when it's worth hiring someone to build a custom AI tool."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta
          property="og:title"
          content="Should you hire someone to build AI, or use ChatGPT yourself?"
        />
        <meta
          property="og:description"
          content="The honest dividing line between DIY ChatGPT and a custom build, plus a simple test for which side your problem is on."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta property="article:author" content="Hudson Turansky" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Should you hire someone to build AI, or use ChatGPT yourself?"
        />
        <meta
          name="twitter:description"
          content="When DIY is enough, the signs you've outgrown it, and a one-question test."
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
            <span className="text-gray-400">Hire help or do it yourself</span>
          </p>

          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Guide · 2026
          </p>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-8 leading-tight"
            style={{ letterSpacing: "-0.04em" }}
          >
            Should you hire someone to build AI, or{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              use ChatGPT yourself?
            </span>
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
                Use ChatGPT yourself when the task is occasional, low-stakes, and you're the only
                person who does it. Hire someone to build a custom tool when the task is
                repetitive, depends on your own data or other software, has to be reliable, or
                other people need to use it.
              </strong>
            </p>
            <p className="text-gray-300 font-light leading-relaxed text-base mt-4">
              The dividing line is simple. ChatGPT in a browser gives you a one-off answer that's
              only as good as the prompt you typed that time. A built tool gives you a{" "}
              <em>system</em>, something that does the same job the same way every time, without
              anyone having to remember how. If you find yourself asking AI the same kind of
              question over and over, copying results between apps by hand, or wishing the AI
              just <em>knew</em> your business, you've outgrown the do-it-yourself tier. This
              guide gives you a clear way to tell which side of the line your problem is on, and
              it's honest about the fact that for a lot of tasks, DIY genuinely is the right
              answer.
            </p>
          </div>

          <Section heading="When using ChatGPT yourself is the right call">
            <p>You should keep it DIY when most of these are true:</p>
            <Bullets>
              <li>
                The task is <strong>occasional</strong>, a few times a week or less.
              </li>
              <li>
                It's <strong>low-stakes</strong>, a mistake is easy to spot and fix.
              </li>
              <li>
                <strong>You're the only person</strong> who does it.
              </li>
              <li>
                It <strong>doesn't need to connect</strong> to your other tools.
              </li>
              <li>
                <strong>Each instance is a bit different</strong>, it's judgment work, not a
                repeatable process.
              </li>
            </Bullets>
            <p>
              Examples that should stay DIY: drafting a one-off email, brainstorming names or
              ideas, summarizing a document, getting a second opinion on a decision, rewording
              something. For all of this, a $20/month subscription and an hour spent learning to
              prompt well is the whole answer. Anyone who tries to sell you a custom build for
              work like this is selling you something you don't need.
            </p>
          </Section>

          <Section heading="The signs you've outgrown do-it-yourself">
            <p>Start thinking about having something built when you notice:</p>
            <Bullets>
              <li>
                You, or your team, do <strong>the same AI task repeatedly</strong>, typing a
                similar prompt over and over.
              </li>
              <li>
                You're <strong>copying information by hand</strong> between AI and your other
                software.
              </li>
              <li>
                You keep <strong>wishing the AI knew</strong> your pricing, your customers, your
                process, your past work.
              </li>
              <li>
                The task <strong>can't afford to be inconsistent</strong>, different people would
                do it differently, and that matters.
              </li>
              <li>
                <strong>Other people need to do it</strong>, and they shouldn't each have to
                become good at prompting first.
              </li>
              <li>
                It needs to <strong>happen when you're not there.</strong>
              </li>
            </Bullets>
            <p>
              Each of these is the same message in a different form: the value isn't in a clever
              chat anymore, it's in a system.
            </p>
          </Section>

          <Section heading="The real difference: a chat versus a system">
            <p>
              A ChatGPT session is disposable. It lives in your head and your browser tab. It
              depends on how well you prompted <em>that time</em>. It can't run while you sleep,
              it doesn't scale to your team, and the knowledge of "how to get the good result"
              never leaves you.
            </p>
            <p>
              A built tool is the opposite. The right way to do the task gets worked out once and
              encoded into the tool. After that it runs the same way every time, for anyone,
              including when you're not around. You stop being the person who has to remember how,
              that's the thing you're actually paying for.
            </p>
            <p>
              That's why "I can already do that in ChatGPT" and "this should be built" are not
              contradictory. You <em>can</em> do it in ChatGPT. The question is whether you want
              to keep being the one who does.
            </p>
          </Section>

          <Section heading="The honest middle ground">
            <p>
              Hiring someone doesn't always mean a custom build. Sometimes the right answer is an
              off-the-shelf product or a no-code automation, the $50–200/month tier, and a good
              builder will tell you so. Be wary of anyone who recommends a custom build before
              they understand whether a cheaper, ready-made tool already solves your problem. The
              first job of someone worth hiring is to talk you <em>out</em> of spending money you
              don't need to spend.
            </p>
          </Section>

          <Section heading="A worked example">
            <p>
              Picture a bookkeeper running a small practice. She uses ChatGPT to draft client
              emails and explain things in plain language, occasional, low-stakes, hers alone.
              That should stay exactly where it is: DIY.
            </p>
            <p>
              But she also spends about five hours every week pulling figures out of client
              documents and into spreadsheets. That task is repetitive, it depends on specific
              data, the numbers have to be right, and it quietly drains a whole morning. DIY
              ChatGPT can't really fix it, it would mean manually feeding in every document and
              double-checking every number, which isn't much faster than doing it by hand. That
              one is a build.
            </p>
            <p>
              Same person, two AI tasks, two completely different answers. That's normal. The
              decision is made per task, not once for your whole business.
            </p>
          </Section>

          <Section heading="A simple test">
            <p>When you're not sure, ask yourself one question:</p>
            <blockquote
              className="rounded-2xl p-6 my-2"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: "3px solid rgba(96,165,250,0.6)",
              }}
            >
              <p className="text-gray-200 italic m-0">
                "If I hired a new assistant, could I explain this task once and trust them to do
                it the same way every time?"
              </p>
            </blockquote>
            <p>
              If <strong>yes</strong>, it's a process, and a process can be built into a tool. If{" "}
              <strong>no</strong>, because the task changes every time and genuinely needs your
              judgment, keep it in ChatGPT. That single question sorts most decisions correctly.
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
              { to: "/resources/what-small-businesses-use-ai-for", label: "12 things small businesses are actually using AI for" },
              { to: "/resources/ai-glossary-for-business-owners", label: "A plain-English AI glossary for business owners" },
            ]}
            ctaPrompt="Want a personalized read on which of your tasks are DIY and which are worth building?"
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

export default HireAiHelpOrDoItYourself;

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
      to get specific ideas for your situation, or{" "}
      <a
        href="/#contact"
        className="text-blue-400 hover:text-blue-300 transition-colors underline"
      >
        get in touch
      </a>{" "}
      to talk through a specific one.
    </p>
  </div>
);
