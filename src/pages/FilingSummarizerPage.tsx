// Filing Summarizer — /finance-tools/filing-summarizer.
//
// Email-gated tool (3 free runs per email). Enter a ticker + pick a form, and a
// purpose-built assistant turns the company's latest SEC filing into a
// plain-English one-page brief. "Request report" emails a PDF you can keep;
// "Print / Save as PDF" gives an instant local copy.
//
// Backend: supabase/functions/summarize-filing (+ email-filing-report). The
// edge function validates and length-limits everything, so the client checks
// here are for UX, not security.

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import {
  FORM_OPTIONS,
  type FilingForm,
  type FilingBrief,
  type FilingResultMeta,
  type SummarizeResponse,
  type EmailReportResponse,
} from "@/lib/filing-types";

const TICKER_RE = /^[A-Za-z][A-Za-z.-]{0,9}$/;

const formSchema = z.object({
  ticker: z
    .string()
    .trim()
    .min(1, "Enter a ticker.")
    .regex(TICKER_RE, "Letters only, e.g. AAPL or BRK.B."),
  form: z.enum(["latest", "10-K", "10-Q"]),
  email: z.string().trim().toLowerCase().email("That doesn't look like an email."),
  consent: z.literal(true, { errorMap: () => ({ message: "Tick the box to continue." }) }),
});

type FormValues = z.infer<typeof formSchema>;

type Phase =
  | { kind: "idle" }
  | {
      kind: "results";
      results: FilingBrief;
      meta: FilingResultMeta;
      summaryId: string;
      email: string;
      usesRemaining: number | null;
    }
  | { kind: "limit"; message: string }
  | { kind: "error"; message: string };

const ACTIONABLE_ERRORS = new Set([
  "invalid_ticker",
  "ticker_not_found",
  "filing_not_found",
  "empty_filing",
  "sec_unavailable",
  "invalid_email",
  "rate_limited",
]);

const limitFallback =
  "You've used all your free filing summaries for this email. Book a call if you'd like a custom finance tool built.";

const FilingSummarizerPage = () => {
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });

  return (
    <div
      id="main-content"
      role="main"
      className="min-h-screen relative z-10"
      style={{ color: "var(--app-text-strong)" }}
    >
      <Helmet>
        <title>Filing Summarizer — SEC filings in plain English · Hudson Turansky</title>
        <meta
          name="description"
          content="Turn any company's latest SEC filing (10-K or 10-Q) into a plain-English one-page brief: key numbers, what changed, risks, and a jargon glossary. 3 free runs, just an email."
        />
        <link rel="canonical" href="https://hudsonturansky.com/finance-tools/filing-summarizer" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/finance-tools/filing-summarizer" />
        <meta property="og:title" content="Filing Summarizer — SEC filings in plain English" />
        <meta
          property="og:description"
          content="A one-page, plain-English brief of any company's latest SEC filing. 3 free runs."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Filing Summarizer — SEC filings in plain English" />
        <meta
          name="twitter:description"
          content="A one-page, plain-English brief of any company's latest SEC filing."
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
          <Link
            to="/finance-tools"
            className="text-xs font-medium transition-colors"
            style={{ color: "var(--app-text-muted)" }}
          >
            ← Finance Tools
          </Link>

          {phase.kind === "idle" && (
            <>
              <Hero />
              <SummarizeForm
                onSuccess={(results, meta, summaryId, email, usesRemaining) =>
                  setPhase({ kind: "results", results, meta, summaryId, email, usesRemaining })
                }
                onLimit={(message) => setPhase({ kind: "limit", message })}
                onError={(message) => setPhase({ kind: "error", message })}
              />
              <LandingContent />
            </>
          )}

          {phase.kind === "results" && (
            <Results
              results={phase.results}
              meta={phase.meta}
              summaryId={phase.summaryId}
              gateEmail={phase.email}
              usesRemaining={phase.usesRemaining}
              onReset={() => setPhase({ kind: "idle" })}
            />
          )}

          {phase.kind === "limit" && (
            <LimitReached message={phase.message} onReset={() => setPhase({ kind: "idle" })} />
          )}

          {phase.kind === "error" && (
            <ErrorState message={phase.message} onRetry={() => setPhase({ kind: "idle" })} />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FilingSummarizerPage;

// ===========================================================================
// Hero + landing content (prerendered — what crawlers see)
// ===========================================================================

const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Filing Summarizer",
  description:
    "Turns a company's latest SEC filing into a plain-English one-page brief with key numbers, what changed, risks, and a jargon glossary.",
  url: "https://hudsonturansky.com/finance-tools/filing-summarizer",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Person", name: "Hudson Turansky", url: "https://hudsonturansky.com" },
};

const Hero = () => (
  <div className="mt-5">
    <p className="text-xs uppercase tracking-widest font-medium mb-5" style={{ color: "#60a5fa" }}>
      Filing Summarizer
    </p>
    <h1
      className="text-4xl sm:text-5xl font-extrabold mb-6"
      style={{ color: "var(--app-text-strong)", letterSpacing: "-0.04em", lineHeight: 1.05 }}
    >
      SEC filings,{" "}
      <span
        style={{
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        in plain English.
      </span>
    </h1>
    <p
      className="text-lg font-light max-w-2xl mb-8 leading-relaxed"
      style={{ color: "var(--app-text-med)" }}
    >
      Enter a ticker and get a one-page brief of the company's latest 10-K or 10-Q — the key
      numbers, what changed, the risks that matter, and a glossary for any jargon. Built for normal
      humans, not Wall Street. <strong style={{ color: "var(--app-text-strong)", fontWeight: 500 }}>3 free runs</strong>, just an email.
    </p>
  </div>
);

const LandingContent = () => (
  <>
    <div className="border-t my-12" style={{ borderColor: "var(--app-border-soft)" }} />

    <section>
      <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}>
        How it works
      </h2>
      <ol className="space-y-3">
        {HOW_IT_WORKS.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="text-sm font-medium tabular-nums" style={{ color: "#60a5fa" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="text-base font-light leading-relaxed" style={{ color: "var(--app-text-med)" }}>
              {step}
            </p>
          </li>
        ))}
      </ol>
    </section>

    <div className="border-t my-12" style={{ borderColor: "var(--app-border-soft)" }} />

    <section>
      <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}>
        What's in the brief
      </h2>
      <ul className="space-y-3 font-light leading-relaxed" style={{ color: "var(--app-text-med)" }}>
        {WHATS_INSIDE.map((item) => (
          <li key={item.title}>
            · <strong style={{ color: "var(--app-text-strong)", fontWeight: 500 }}>{item.title}</strong>{" "}
            — {item.body}
          </li>
        ))}
      </ul>
    </section>

    <div className="border-t my-12" style={{ borderColor: "var(--app-border-soft)" }} />

    <Disclaimer />
  </>
);

const HOW_IT_WORKS = [
  "Enter a stock ticker (e.g. AAPL), pick which report you want, and drop in your email.",
  "We pull that company's latest filing straight from the SEC's public EDGAR database — no logins, no paywalls.",
  "A purpose-built assistant reads it and writes a clear one-page brief. Email yourself the PDF or print it.",
];

const WHATS_INSIDE: Array<{ title: string; body: string }> = [
  { title: "Key numbers", body: "revenue, profit, cash flow, EPS — with the change vs. last period and a one-line 'why'." },
  { title: "What changed", body: "the handful of things that actually moved this quarter or year." },
  { title: "Risks & watch-outs", body: "the material risks in plain words, plus things to be careful interpreting." },
  { title: "Glossary", body: "every finance term defined in one sentence, so nothing is a black box." },
];

const Disclaimer = () => (
  <section>
    <div
      className="rounded-2xl p-6"
      style={{ backgroundColor: "var(--app-card-bg)", border: "1px solid var(--app-border-soft)" }}
    >
      <p className="text-sm font-light leading-relaxed" style={{ color: "var(--app-text-muted)" }}>
        <strong style={{ color: "var(--app-text-med)", fontWeight: 500 }}>Educational only — not investment advice.</strong>{" "}
        This tool summarizes public SEC filings to help you understand them. It can make mistakes and
        may omit detail. Always verify against the original filing before making any decision. Source
        data: SEC EDGAR.
      </p>
    </div>
  </section>
);

// ===========================================================================
// Form
// ===========================================================================

interface SummarizeFormProps {
  onSuccess: (
    results: FilingBrief,
    meta: FilingResultMeta,
    summaryId: string,
    email: string,
    usesRemaining: number | null,
  ) => void;
  onLimit: (message: string) => void;
  onError: (message: string) => void;
}

const SummarizeForm = ({ onSuccess, onLimit, onError }: SummarizeFormProps) => {
  const [inlineError, setInlineError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: "",
      form: "latest",
      email: "",
      consent: false as unknown as true,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setInlineError(null);
    try {
      const { data: resp, error: invokeError } = await supabase.functions.invoke<SummarizeResponse>(
        "summarize-filing",
        {
          body: {
            email: data.email,
            ticker: data.ticker.toUpperCase(),
            form: data.form,
          },
        },
      );

      if (invokeError) {
        const ctx = (invokeError as unknown as { context?: { error?: string; message?: string } })
          .context;
        if (ctx?.error === "limit_reached") {
          onLimit(ctx.message ?? limitFallback);
          return;
        }
        if (ctx?.error && ACTIONABLE_ERRORS.has(ctx.error)) {
          setInlineError(ctx.message ?? "Please check your inputs and try again.");
          return;
        }
        onError(ctx?.message ?? "Something went wrong generating your brief. Please try again in a minute.");
        return;
      }

      if (!resp) {
        onError("No response from the server. Please try again.");
        return;
      }

      if ("ok" in resp && resp.ok) {
        onSuccess(resp.results, resp.meta, resp.summaryId, data.email, resp.uses_remaining);
        return;
      }

      const err = resp as { error?: string; message?: string };
      if (err.error === "limit_reached") {
        onLimit(err.message ?? limitFallback);
        return;
      }
      if (err.error && ACTIONABLE_ERRORS.has(err.error)) {
        setInlineError(err.message ?? "Please check your inputs and try again.");
        return;
      }
      onError(err.message ?? "Could not generate your brief. Please try again.");
    } catch (e) {
      console.error(e);
      onError("Network error. Please try again in a minute.");
    }
  };

  if (isSubmitting) return <Submitting />;

  return (
    <div
      className="mt-8 rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: "var(--app-card-bg-strong)",
        border: "1px solid var(--app-border-strong)",
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={control}
          name="ticker"
          render={({ field }) => (
            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--app-text-med)" }}>
                Stock ticker
              </label>
              <input
                {...field}
                type="text"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                placeholder="e.g. AAPL"
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                className="w-full rounded-md px-4 py-3 uppercase tracking-wide focus:outline-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                  color: "var(--app-text-strong)",
                }}
              />
              {errors.ticker && <p className="mt-2 text-xs" style={{ color: "#fca5a5" }}>{errors.ticker.message}</p>}
            </div>
          )}
        />

        <Controller
          control={control}
          name="form"
          render={({ field }) => (
            <div>
              <label className="block text-sm mb-3" style={{ color: "var(--app-text-med)" }}>
                Which report?
              </label>
              <div className="flex flex-wrap gap-2">
                {FORM_OPTIONS.map((opt) => {
                  const selected = field.value === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => field.onChange(opt.value)}
                      title={opt.hint}
                      className="text-sm font-light px-3 py-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: selected ? "rgba(59,130,246,0.15)" : "var(--app-card-bg)",
                        border: `1px solid ${selected ? "rgba(96,165,250,0.6)" : "var(--app-border-med)"}`,
                        color: selected ? "var(--app-text-strong)" : "var(--app-text-med)",
                      }}
                    >
                      {opt.label}
                      <span className="ml-1.5 text-xs" style={{ color: "var(--app-text-muted)" }}>
                        {opt.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <div>
              <label className="block text-sm mb-2" style={{ color: "var(--app-text-med)" }}>
                Email
              </label>
              <input
                {...field}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md px-4 py-3 focus:outline-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                  color: "var(--app-text-strong)",
                }}
              />
              {errors.email && <p className="mt-2 text-xs" style={{ color: "#fca5a5" }}>{errors.email.message}</p>}
            </div>
          )}
        />

        <Controller
          control={control}
          name="consent"
          render={({ field }) => (
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded"
                  style={{ accentColor: "#3b82f6" }}
                />
                <span className="text-sm font-light leading-relaxed" style={{ color: "var(--app-text-med)" }}>
                  I agree to receive my brief by email and understand this is an educational summary,
                  not investment advice. See the{" "}
                  <a
                    href="/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "#60a5fa" }}
                  >
                    privacy note
                  </a>
                  .
                </span>
              </label>
              {errors.consent && <p className="mt-2 text-xs" style={{ color: "#fca5a5" }}>{errors.consent.message}</p>}
            </div>
          )}
        />

        {inlineError && (
          <div
            className="text-sm rounded-md px-4 py-3"
            role="alert"
            style={{
              color: "#fecaca",
              backgroundColor: "rgba(127,29,29,0.18)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {inlineError}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
          >
            Summarize filing →
          </button>
          <p className="text-xs mt-3 font-light" style={{ color: "var(--app-text-muted)" }}>
            3 free runs per email. Data from SEC EDGAR. ~20–40 seconds.
          </p>
        </div>
      </form>
    </div>
  );
};

const Submitting = () => (
  <div
    className="mt-8 rounded-2xl p-10 text-center"
    style={{ backgroundColor: "var(--app-card-bg-strong)", border: "1px solid var(--app-border-strong)" }}
  >
    <div className="inline-flex items-center gap-3 font-light" style={{ color: "var(--app-text-med)" }}>
      <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
      <span>Pulling the filing and writing your brief…</span>
    </div>
    <p className="mt-4 text-xs" style={{ color: "var(--app-text-muted)" }}>
      This can take 20–40 seconds. Don't close the tab.
    </p>
  </div>
);

// ===========================================================================
// Results
// ===========================================================================

interface ResultsProps {
  results: FilingBrief;
  meta: FilingResultMeta;
  summaryId: string;
  gateEmail: string;
  usesRemaining: number | null;
  onReset: () => void;
}

const Results = ({ results, meta, summaryId, gateEmail, usesRemaining, onReset }: ResultsProps) => {
  const filed = [meta.form, meta.filingDate ? `filed ${meta.filingDate}` : ""].filter(Boolean).join(" · ");

  return (
    <div className="mt-8">
      <p className="text-xs uppercase tracking-widest font-medium mb-3" style={{ color: "#60a5fa" }}>
        Your brief
      </p>
      <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}>
        {meta.company} {meta.ticker ? <span style={{ color: "var(--app-text-muted)" }}>({meta.ticker})</span> : null}
      </h2>
      <p className="text-sm mb-1" style={{ color: "var(--app-text-muted)" }}>{filed}</p>
      {results.period && (
        <p className="text-sm font-light mb-6" style={{ color: "var(--app-text-med)" }}>{results.period}</p>
      )}

      {results.company_snapshot && (
        <p className="text-base font-light leading-relaxed mb-5" style={{ color: "var(--app-text-med)" }}>
          {results.company_snapshot}
        </p>
      )}

      {results.headline && (
        <div
          className="rounded-2xl p-6 mb-8"
          style={{ backgroundColor: "var(--app-blue-tint-strong)", border: "1px solid var(--app-blue-tint-border)" }}
        >
          <p className="text-lg font-semibold leading-snug" style={{ color: "var(--app-text-strong)" }}>
            {results.headline}
          </p>
        </div>
      )}

      {results.key_numbers.length > 0 && (
        <section className="mb-8">
          <SectionHeading>Key numbers</SectionHeading>
          <div>
            {results.key_numbers.map((n, i) => (
              <div
                key={`${n.label}-${i}`}
                className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 py-3"
                style={{ borderTop: "1px solid var(--app-border-soft)" }}
              >
                <div className="sm:pr-4">
                  <span className="font-medium" style={{ color: "var(--app-text-strong)" }}>{n.label}</span>
                  {n.note && (
                    <p className="text-xs font-light mt-0.5" style={{ color: "var(--app-text-muted)" }}>{n.note}</p>
                  )}
                </div>
                <div className="flex items-baseline gap-2 flex-shrink-0">
                  <span className="font-semibold tabular-nums" style={{ color: "var(--app-text-strong)" }}>{n.value}</span>
                  {n.change && n.change.toLowerCase() !== "n/a" && (
                    <span className="text-xs font-medium tabular-nums" style={{ color: changeColor(n.change) }}>
                      {n.change}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.what_changed.length > 0 && (
        <BulletSection heading="What changed this period" items={results.what_changed} />
      )}
      {results.risks.length > 0 && <BulletSection heading="Key risks" items={results.risks} />}
      {results.watch_outs.length > 0 && <BulletSection heading="Watch-outs" items={results.watch_outs} />}

      {results.glossary.length > 0 && (
        <section className="mb-8">
          <SectionHeading>Plain-English glossary</SectionHeading>
          <dl className="space-y-3">
            {results.glossary.map((g, i) => (
              <div key={`${g.term}-${i}`}>
                <dt className="text-sm font-medium" style={{ color: "var(--app-text-strong)" }}>{g.term}</dt>
                <dd className="text-sm font-light leading-relaxed" style={{ color: "var(--app-text-med)" }}>{g.plain}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {meta.truncated && (
        <p className="text-xs font-light mb-6" style={{ color: "var(--app-text-muted)" }}>
          Note: this filing was long, so the brief is based on its earlier sections (which usually
          hold the financial highlights and management discussion).
        </p>
      )}

      {meta.sourceUrl && (
        <p className="text-sm mb-8">
          <a
            href={meta.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-1 underline-offset-4"
            style={{ color: "#60a5fa" }}
          >
            View the original {meta.form} on SEC.gov →
          </a>
        </p>
      )}

      {/* Actions */}
      <div
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: "var(--app-card-bg)", border: "1px solid var(--app-border-med)" }}
      >
        <RequestReport summaryId={summaryId} defaultRecipient={gateEmail} />
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--app-border-soft)" }}>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-sm font-medium underline decoration-1 underline-offset-4"
            style={{ color: "var(--app-text-med)" }}
          >
            Print / Save as PDF
          </button>
          <span className="text-xs font-light ml-2" style={{ color: "var(--app-text-muted)" }}>
            instant local copy, no email needed
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
          style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
        >
          Summarize another →
        </button>
        {usesRemaining !== null && (
          <span className="text-xs font-light" style={{ color: "var(--app-text-muted)" }}>
            {usesRemaining} free {usesRemaining === 1 ? "run" : "runs"} left for {gateEmail}
          </span>
        )}
      </div>

      <div className="mt-8">
        <Disclaimer />
      </div>
    </div>
  );
};

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm uppercase tracking-widest font-medium mb-3" style={{ color: "var(--app-text-muted)" }}>
    {children}
  </h3>
);

const BulletSection = ({ heading, items }: { heading: string; items: string[] }) => (
  <section className="mb-8">
    <SectionHeading>{heading}</SectionHeading>
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5 text-base font-light leading-relaxed" style={{ color: "var(--app-text-med)" }}>
          <span aria-hidden style={{ color: "#60a5fa" }}>·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </section>
);

function changeColor(change: string): string {
  const t = change.trim();
  if (/^[+]|increase|up\b|higher/i.test(t)) return "rgba(16,185,129,0.95)"; // green
  if (/^[-−]|decrease|down\b|lower/i.test(t)) return "rgba(248,113,113,0.95)"; // red
  return "var(--app-text-muted)";
}

// ---- Request report (email a PDF) ----------------------------------------

const RequestReport = ({ summaryId, defaultRecipient }: { summaryId: string; defaultRecipient: string }) => {
  const [recipient, setRecipient] = useState(defaultRecipient);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const send = async () => {
    const to = recipient.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      setState("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setState("sending");
    setMessage(null);
    try {
      const { data: resp, error: invokeError } = await supabase.functions.invoke<EmailReportResponse>(
        "email-filing-report",
        { body: { summaryId, recipient: to } },
      );
      if (invokeError) {
        const ctx = (invokeError as unknown as { context?: { message?: string } }).context;
        setState("error");
        setMessage(ctx?.message ?? "Could not send the email. Please try again.");
        return;
      }
      if (resp && resp.ok) {
        setState("sent");
        setMessage(`Sent to ${to}. Check your inbox (and spam) for the PDF.`);
        return;
      }
      setState("error");
      setMessage(resp?.message ?? "Could not send the email. Please try again.");
    } catch (e) {
      console.error(e);
      setState("error");
      setMessage("Network error. Please try again.");
    }
  };

  if (state === "sent") {
    return (
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--app-text-strong)" }}>
          Report sent ✓
        </p>
        <p className="text-sm font-light mt-1" style={{ color: "var(--app-text-med)" }}>{message}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--app-text-strong)" }}>
        Email me the report (PDF)
      </p>
      <p className="text-xs font-light mb-3" style={{ color: "var(--app-text-muted)" }}>
        A clean one-pager you can keep. Send it anywhere — change the address if you like.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          inputMode="email"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-md px-4 py-2.5 text-sm focus:outline-none"
          style={{
            backgroundColor: "var(--app-card-bg-strong)",
            border: "1px solid var(--app-border-strong)",
            color: "var(--app-text-strong)",
          }}
        />
        <button
          type="button"
          onClick={send}
          disabled={state === "sending"}
          className="text-sm font-medium px-5 py-2.5 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
        >
          {state === "sending" ? "Sending…" : "Send PDF"}
        </button>
      </div>
      {state === "error" && message && (
        <p className="mt-2 text-xs" style={{ color: "#fca5a5" }}>{message}</p>
      )}
    </div>
  );
};

// ===========================================================================
// Limit / error / footer
// ===========================================================================

const LimitReached = ({ message, onReset }: { message: string; onReset: () => void }) => (
  <div className="mt-8 text-center py-12">
    <p className="text-xs uppercase tracking-widest font-medium mb-4" style={{ color: "#60a5fa" }}>
      Free runs used
    </p>
    <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}>
      You've used your free summaries.
    </h2>
    <p className="font-light max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: "var(--app-text-med)" }}>
      {message}
    </p>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <a
        href="https://calendly.com/hudsonturansky/30min"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md"
        style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
      >
        Book a 30-minute call →
      </a>
      <button
        type="button"
        onClick={onReset}
        className="text-sm font-medium underline decoration-1 underline-offset-4"
        style={{ color: "var(--app-text-med)" }}
      >
        Use a different email
      </button>
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="mt-8 text-center py-12">
    <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}>
      Something didn't work.
    </h2>
    <p className="font-light max-w-xl mx-auto mb-8" style={{ color: "var(--app-text-med)" }}>{message}</p>
    <button
      type="button"
      onClick={onRetry}
      className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md"
      style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
    >
      Try again
    </button>
  </div>
);

const Footer = () => (
  <footer
    className="py-8 px-6 text-center"
    style={{ backgroundColor: "var(--app-page-bg)", borderTop: "1px solid var(--app-border-soft)" }}
  >
    <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
      &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{" "}
      <Link to="/finance-tools" className="hover:underline" style={{ color: "var(--app-text-med)" }}>
        Finance Tools
      </Link>
    </p>
  </footer>
);
