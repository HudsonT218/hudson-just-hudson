// /resources/is-your-data-safe-with-ai, sixth long-form guide.
// Pattern source: src/pages/resources/AiForSmallBusiness.tsx — copy structure
// verbatim. SPA route, prerendered via prerenderPlugin so crawlers see the
// full article HTML on first fetch.

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";

const CANONICAL = "https://hudsonturansky.com/resources/is-your-data-safe-with-ai";
const PUBLISHED = "2026-05-28";

// FAQ, single source of truth. Visible answers must match JSON-LD answers
// character-for-character (Google penalizes FAQ schema where the marked-up
// answer differs from the on-page answer).
const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Does ChatGPT train on my conversations?",
    a: "On the free and Plus consumer tiers, yes by default, though you can opt out in Settings, Data Controls. On ChatGPT Business, Enterprise, and the API, no, your data is contractually excluded from model training. The opt-out for consumer tiers is forward-looking only: data already used in past training runs cannot be retroactively removed. One gotcha: clicking thumbs-up or thumbs-down on a response can authorize training on that specific chat even if you've opted out.",
  },
  {
    q: "What about Claude, is it different?",
    a: "As of August 28, 2025, Anthropic changed its consumer policy. Claude Free, Pro, and Max plans now default to a 5-year data retention period and training opt-in unless you decline. Declining reverts to 30-day retention with no training. Claude Team, Enterprise, Government, Education, and API access are governed by Commercial Terms and are not used for training by default. If you use Claude Pro for business work, opt out of training in Settings now.",
  },
  {
    q: "What's the cheapest tier that actually protects my business data?",
    a: "Google Workspace Business Standard at $14 per user per month is the cheapest tier across major vendors with a contractual no-training guarantee, no human review, and EU Data Boundary support. Microsoft 365 Copilot Business at $18 per user per month (locked at that price until June 30, 2026) is the next step up if you want the full Office integration. ChatGPT Business is around $25 to $30 per user per month. Skip $20 per month ChatGPT Plus for any business work involving client data.",
  },
  {
    q: "Is ChatGPT HIPAA-compliant?",
    a: "The free, Plus, and standard Business tiers of ChatGPT are not HIPAA-compliant. ChatGPT Business specifically does not get a BAA. Only ChatGPT Enterprise, ChatGPT Edu, the OpenAI API (BAA available via baa at openai.com), and the dedicated ChatGPT for Healthcare product launched in January 2026 support a Business Associate Agreement. If you handle PHI, do not paste it into any consumer-tier AI tool. The same restriction applies to Claude Free and Pro, and to Gemini consumer.",
  },
  {
    q: "If I delete a ChatGPT conversation, is it really gone?",
    a: "Not always. OpenAI's standard policy is to remove deleted chats within 30 days unless longer retention is required by law. But on May 13, 2025, a court preservation order in the New York Times copyright case required OpenAI to retain all output log data indefinitely, including deleted chats and Temporary Chat mode, until September 26, 2025. Data preserved under that order remains preserved. Operators can also access conversations flagged by abuse monitoring. The realistic mental model: deleted is best-effort, not guaranteed.",
  },
  {
    q: "What's the biggest privacy mistake small businesses actually make?",
    a: "Letting employees use personal AI accounts for work. Eighty-five percent of companies have at least one team member doing this. There's no audit trail, no DLP, no contractual no-training guarantee, and if the employee's credentials get stolen, which happened to over 225,000 ChatGPT users in 2025, your client data ends up on the dark web with no way to know. Move everyone to a workspace account on a Business or Enterprise tier. That single change closes most of the realistic risk for an SMB.",
  },
];

const ARTICLE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Is your data safe when you use AI? A small-business owner's guide",
  description:
    "A plain-English guide to what ChatGPT, Claude, Gemini, and Copilot actually do with your data, which tier protects you, what the real risks are, and the defensive moves that don't require a security team.",
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

const IsYourDataSafeWithAi = () => {
  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>
          Is your data safe when you use AI? A small business owner's guide · Hudson Turansky
        </title>
        <meta
          name="description"
          content="A plain-English guide to what ChatGPT, Claude, Gemini, and Copilot actually do with your data — which tier protects you, what the real risks are, and the defensive moves that don't require a security team."
        />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={CANONICAL} />
        <meta
          property="og:title"
          content="Is your data safe when you use AI? A small business owner's guide · Hudson Turansky"
        />
        <meta
          property="og:description"
          content="What ChatGPT, Claude, Gemini, and Copilot actually do with your data — which tier protects you, what the real risks are, and the defensive moves that don't require a security team."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="article:published_time" content={PUBLISHED} />
        <meta property="article:author" content="Hudson Turansky" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Is your data safe when you use AI? A small business owner's guide"
        />
        <meta
          name="twitter:description"
          content="What ChatGPT, Claude, Gemini, and Copilot actually do with your data, and how to protect a small business in 2026."
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
          {/* Breadcrumb */}
          <p className="text-sm text-gray-500 mb-6">
            <Link to="/resources" className="hover:text-gray-300 transition-colors">
              Resources
            </Link>
            <span className="mx-2 text-gray-700">/</span>
            <span className="text-gray-400">Is your data safe when you use AI?</span>
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
            Is your data{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              safe when you use AI
            </span>
            ?
          </h1>

          {/* TL;DR lede card */}
          <div
            className="rounded-2xl p-6 mb-12"
            style={{
              backgroundColor: "var(--app-blue-tint)",
              border: "1px solid var(--app-blue-tint-border-strong)",
              borderLeft: "3px solid #3b82f6",
            }}
          >
            <p className="text-gray-200 font-light leading-relaxed text-base">
              <strong className="text-white font-semibold">TL;DR.</strong> The way most
              small-business owners think about AI privacy, "is it training on my data?", is the
              wrong question. Training-related leakage is statistically rare and hard to
              weaponize. The risks that actually hurt small businesses are different: the vendor
              getting breached, employees pasting client data into personal accounts with no
              audit trail, court orders preserving "deleted" chats, and accidentally indexed
              shares. None of those are solved by a privacy toggle, they're solved by buying the
              right tier (<strong className="text-gray-100">$14 to $30 per user per month</strong>),
              enforcing team accounts, and having a one-page "what we never paste" rule for your
              team.
            </p>
          </div>

          {/* Section 1 */}
          <Section heading="The wrong question, and the right one">
            <p>
              Most owners ask "are they training on my data?" That's the wrong place to start.
              Training-related leakage exists in theory, model weights are updated with your
              inputs, and extraction attacks have demonstrated training data can leak, but it's
              statistically rare for one-off inputs and hard to weaponize against a specific
              business.
            </p>
            <p>The right questions are simpler and scarier:</p>
            <Bullets>
              <li>Where does my data sit, and for how long?</li>
              <li>Who, at the vendor, can read it?</li>
              <li>
                What happens if (a) the vendor gets breached, (b) my account gets stolen, or (c)
                I get sued and someone subpoenas the logs?
              </li>
            </Bullets>
            <p>
              This guide walks through each of those, what the four major AI vendors actually do
              as of May 2026, what the real risk patterns look like at small businesses, and the
              cheapest tier that gets you contractual protection.
            </p>
          </Section>

          {/* Section 2 */}
          <Section heading="What each tier actually does with your data (May 2026)">
            <p>
              Quick reference, by vendor. The pattern is the same everywhere: the consumer tier
              is the risky one, and the cheapest business tier is the one worth buying.
            </p>
            <Bullets>
              <li>
                <strong>ChatGPT Free and Plus ($20/mo):</strong> Trains on conversations by
                default; 30-day retention; opt-out toggle exists in Settings → Data Controls;
                abuse-monitoring access by OpenAI staff. Don't use for client data.
              </li>
              <li>
                <strong>ChatGPT Business ($25 to $30 per user per month):</strong> Contractually
                not used for training. Data Processing Agreement included. No BAA available, so
                not for PHI.
              </li>
              <li>
                <strong>ChatGPT Enterprise:</strong> Adds BAA, encryption key management (EKM),
                custom retention, SCIM, audit logs. Sales-quoted, usually 150+ seats.
              </li>
              <li>
                <strong>Claude Free, Pro, Max:</strong> As of August 28, 2025, defaults to 5-year
                retention and training opt-in unless you decline at signup. If you have an
                existing Pro account, check your privacy settings.
              </li>
              <li>
                <strong>Claude Team and Enterprise:</strong> Commercial Terms apply; not used for
                training by default. Enterprise can get Zero Data Retention.
              </li>
              <li>
                <strong>Gemini consumer:</strong> Trains by default; opt out at
                myaccount.google.com → Data and Privacy → Gemini Apps Activity.
              </li>
              <li>
                <strong>Google Workspace Business Standard ($14 per user per month):</strong>{" "}
                Cheapest contractual no-training tier across major vendors. No human review. EU
                Data Boundary supported.
              </li>
              <li>
                <strong>Microsoft Copilot consumer:</strong> Standard consumer ToS. Default
                18-month chat history.
              </li>
              <li>
                <strong>
                  Microsoft 365 Copilot Business ($18/user/month until June 30, 2026; $21 after):
                </strong>{" "}
                Contractually not used for training under Entra ID. The cheapest serious tier if
                you're already in Microsoft 365.
              </li>
              <li>
                <strong>Microsoft 365 Personal and Family:</strong> Notably, Microsoft does not
                train on Copilot conversations from these consumer paid plans either. Unusual
                carve-out for solo operators.
              </li>
            </Bullets>
          </Section>

          {/* Section 3 */}
          <Section heading="The 'training on your data' misconception">
            <p>
              Most owners hear "they train on my data" and picture an attacker typing their
              company name into ChatGPT and reading the conversation back. That's not really what
              happens. Training-related leakage is probabilistic and rare for non-repeated
              inputs.
            </p>
            <p>The real risks are duller and more important:</p>
            <Bullets>
              <li>
                <strong>Retention and logging.</strong> Even with training off, conversations are
                stored for 30+ days for abuse monitoring on consumer tiers. Court orders can
                extend retention indefinitely (see below).
              </li>
              <li>
                <strong>Human review.</strong> Flagged conversations are read by employees and
                third-party contractors.
              </li>
              <li>
                <strong>Vendor breach.</strong> Your data sits on a vendor's server. If they get
                hit, so do you.
              </li>
              <li>
                <strong>Account compromise.</strong> Credential theft means your full chat
                history is dumped to the attacker.
              </li>
              <li>
                <strong>Indexing accidents.</strong> AI products are still shipping bugs that
                make "private" data public.
              </li>
              <li>
                <strong>Subpoena and eDiscovery.</strong> Even properly-stored chats can be
                pulled into litigation.
              </li>
            </Bullets>
            <p>
              One distinction worth knowing: "no retention," "no training," and "no logging" are
              three separate guarantees. Vendors sometimes claim one and not the others. A real
              privacy posture needs all three.
            </p>
          </Section>

          {/* Section 4 */}
          <Section heading="What actually happens to your data, the four real risks">
            <ol className="list-decimal pl-5 space-y-4 text-gray-400 font-light leading-relaxed">
              <li>
                <strong>Retention: deleted is not always deleted.</strong> On May 13, 2025, a
                court order in the New York Times v. OpenAI copyright case required OpenAI to
                retain all output log data indefinitely, including deleted chats and Temporary
                Chat mode, regardless of user deletion requests. The order applied to 400
                million-plus users and stayed in force until September 26, 2025. Data already
                preserved under it remains preserved. The realistic mental model is: deleted is
                best-effort, not guaranteed.
              </li>
              <li>
                <strong>Vendor breach.</strong> In February 2025, OmniGPT leaked over 34 million
                lines of user conversations to the dark web, affecting roughly 30,000 user
                accounts, including business client uploads. In November 2025, OpenAI's vendor
                Mixpanel suffered a breach exposing the names, emails, locations, and technical
                system details of OpenAI API business customers. Neither of these is theoretical,
                and your data sat on those servers regardless of your privacy settings.
              </li>
              <li>
                <strong>Account theft.</strong> Over 225,000 ChatGPT credentials were harvested
                by malware and offered for sale on dark web markets in 2025. A bought credential
                gets the buyer your full chat history. If anything sensitive ever went into that
                account, it goes with the credentials.
              </li>
              <li>
                <strong>Indexing accidents.</strong> Between July and August 2025, OpenAI's
                "Share" feature was missing a <code>noindex</code> tag, which let Google index
                conversations users believed were private. Conversations were retrievable via
                Google search until the bug was caught.
              </li>
            </ol>
          </Section>

          {/* Section 5 */}
          <Section heading="The Samsung pattern (and why it happens at small businesses too)">
            <p>
              In March 2023, Samsung had three separate AI data-leak incidents in 20 days. An
              engineer pasted faulty Samsung source code into ChatGPT to debug. Another pasted
              code for identifying defective equipment. A third recorded an internal meeting,
              transcribed it, and pasted the transcript into ChatGPT to generate notes. Samsung
              banned generative AI inside the company, then imposed a 1024-byte upload cap when
              it allowed AI back.
            </p>
            <p>
              The Samsung story makes headlines because Samsung is Samsung, but the shape is
              mundane and happens at small businesses constantly. The 2026 numbers:
            </p>
            <Bullets>
              <li>98% of organizations have employees using unsanctioned AI tools.</li>
              <li>
                67% of regular professional AI users access AI through personal accounts
                unauthorized by IT.
              </li>
              <li>47% bypass enterprise AI controls.</li>
              <li>38% have shared sensitive company data with AI tools without permission.</li>
              <li>
                About 60% of organizations have had at least one data exposure event from public
                AI use.
              </li>
              <li>
                31% of users say their employer provides no AI training; 50% are unaware of
                shadow AI risks.
              </li>
            </Bullets>
            <p>
              The pattern is always the same: well-meaning employee pastes something they
              shouldn't into a tool they're not supposed to use, on an account nobody knows
              about. The fix is not better employees, it's a workspace account.
            </p>
          </Section>

          {/* Section 6 */}
          <Section heading="What the regulatory landscape actually requires in May 2026">
            <p>
              Most regulation does not yet bite small businesses directly. The headlines are
              scarier than the practice. What you need to know:
            </p>
            <Bullets>
              <li>
                <strong>EU AI Act:</strong> On May 7, 2026, EU lawmakers reached a provisional
                agreement to delay enforcement of high-risk AI rules by 16 months.
                Employment-decision AI compliance was pushed from August 2026 to December 2027.
                SMEs got reduced fees, sandbox access, and fines capped proportional to revenue.
                If you're a US small business under about 50 employees not selling into Europe,
                you can largely stop worrying.
              </li>
              <li>
                <strong>HIPAA:</strong> Consumer ChatGPT, Claude, and Gemini are not
                HIPAA-compliant. ChatGPT Business specifically does not get a BAA, only
                Enterprise, Edu, the API (baa at openai.com), and the dedicated ChatGPT for
                Healthcare product (launched January 2026). Pasting PHI into a consumer tier is a
                HIPAA violation, full stop.
              </li>
              <li>
                <strong>State laws:</strong> Texas TRAIGA effective January 1, 2026 (prohibits
                behavioral manipulation, discrimination, deepfakes, child exploitation). Colorado
                SB 26-189 (signed May 14, 2026) replaces the earlier Colorado AI Act with a
                narrower notice-and-transparency model; effective January 1, 2027. California's
                CCPA / CPPA Automated Decision-Making Technology rules took effect January 1,
                2026.
              </li>
              <li>
                <strong>FTC:</strong> Operation AI Comply has targeted false AI marketing claims
                (Workado, Air AI, EEB settlements). Most SMB use of AI does not run afoul of
                these, but anyone selling "AI-powered" anything should make sure the claim is
                true.
              </li>
            </Bullets>
          </Section>

          {/* Section 7 */}
          <Section heading="A simple 'what to buy' decision">
            <p>For most small businesses, the answer is one of four tiers:</p>
            <Bullets>
              <li>
                <strong>You only need writing, research, summarization.</strong> Google Workspace
                Business Standard at $14/user/month, or Microsoft 365 Personal or Family if
                you're a solo operator. Both are contractually not used for training, with real
                protections on a cheap tier.
              </li>
              <li>
                <strong>You have a team and want everyone on one AI tool.</strong> ChatGPT
                Business at $25 to $30/user/month, or Microsoft 365 Copilot Business at
                $18/user/month (price locked until June 30, 2026, then $21). Workspace accounts,
                admin controls, kill shadow AI in one move.
              </li>
              <li>
                <strong>
                  You handle PHI, sensitive client data, or face compliance audits.
                </strong>{" "}
                Enterprise tier with a BAA and a Data Processing Agreement. Budget $60+/user/month
                and a procurement conversation. ChatGPT Enterprise, Claude Enterprise, Microsoft
                365 Copilot Enterprise.
              </li>
              <li>
                <strong>You're a solo creator with a Claude Pro habit.</strong> Open Settings,
                opt out of training, revert to 30-day retention. Don't paste client data either
                way.
              </li>
            </Bullets>
          </Section>

          {/* Section 8 */}
          <Section heading="The 'never paste' list">
            <p>
              The single most useful document any small business can hand to its team. One page,
              refrigerator-grade.
            </p>
            <p>Never paste into any AI tool:</p>
            <Bullets>
              <li>Customer PII, Social Security numbers, dates of birth, addresses</li>
              <li>Payment card numbers, CVV codes, full bank account numbers</li>
              <li>Passwords, API keys, security configuration details</li>
              <li>Protected Health Information of any kind, unless your tier has a BAA</li>
              <li>Privileged legal communications</li>
              <li>Unreleased financials, M&amp;A material, strategic plans</li>
              <li>Contracts under NDA</li>
              <li>Source code with proprietary algorithms or trade secrets</li>
            </Bullets>
            <p>
              Rule of thumb that covers the rest:{" "}
              <strong className="text-gray-200">
                if you wouldn't publish it on your website, don't paste it.
              </strong>
            </p>
          </Section>

          {/* Section 9 */}
          <Section heading="Vendor terms red flags">
            <p>
              Five phrases to scan for in any AI vendor's terms of service. Any one of these is a
              yellow flag; two or more is a deal-breaker.
            </p>
            <Bullets>
              <li>
                <strong>"Improve our services"</strong> or <strong>"improve our models"</strong>{" "}
                or <strong>"service improvement."</strong> Generic enough to cover model
                training.
              </li>
              <li>
                <strong>"Aggregated, de-identified data."</strong> Re-identification is
                increasingly feasible, especially against external datasets. De-identification is
                not permanent protection.
              </li>
              <li>
                <strong>"Default opt-in to training with opt-out available."</strong> The
                riskiest pattern: the vendor uses everything unless you find the toggle.
              </li>
              <li>
                <strong>No Data Processing Agreement available on request.</strong> Disqualify.
              </li>
              <li>
                <strong>No public subprocessor list.</strong> Opacity. Real vendors publish who
                they share your data with.
              </li>
            </Bullets>
          </Section>

          {/* Section 10 */}
          <Section heading="Five defensive moves that don't require a security team">
            <ol className="list-decimal pl-5 space-y-4 text-gray-400 font-light leading-relaxed">
              <li>
                <strong>Move everyone off personal accounts onto a workspace.</strong> This
                single change closes 70 to 80 percent of realistic SMB risk. It costs $14 to $30
                per user per month.
              </li>
              <li>
                <strong>
                  Turn off chat history and training in any consumer account anyone is still
                  using.
                </strong>{" "}
                A backstop, not a substitute for the workspace move.
              </li>
              <li>
                <strong>
                  Disable thumbs-up and thumbs-down feedback on consumer-tier conversations.
                </strong>{" "}
                The feedback flow re-authorizes training on that specific conversation even if
                global training is off.
              </li>
              <li>
                <strong>Audit browser extensions.</strong> Between 2024 and 2025, 16 fake
                "ChatGPT enhancer" extensions (15 in Chrome, 1 in Edge) were caught harvesting
                data. If anyone has installed one, remove it and rotate their AI passwords.
              </li>
              <li>
                <strong>Write a one-page AI acceptable-use policy.</strong> Even a bad one beats
                nothing. Cover: which tools are allowed, what data is forbidden, requirement to
                use a work account, ban on thumbs-up feedback on sensitive chats, requirement to
                report incidents. One page, signed by every employee, refreshed annually.
              </li>
            </ol>
          </Section>

          {/* Soft attribution footer */}
          <div
            className="mt-12 rounded-2xl p-6"
            style={{
              backgroundColor: "var(--app-card-bg)",
              border: "1px solid var(--app-border-med)",
            }}
          >
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Written by{" "}
              <Link to="/" className="text-gray-200 hover:text-white transition-colors underline">
                Hudson Turansky
              </Link>
              , who builds custom websites, AI tools, and software for small businesses. If you
              have a specific scenario you'd like to think through, the{" "}
              <Link
                to="/ai-brief"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                free personalized AI brief
              </Link>{" "}
              can help you sort it.
            </p>
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

export default IsYourDataSafeWithAi;

// ---------------------------------------------------------------------------
// Tiny inline helpers, keep body styles consistent across sections.
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
