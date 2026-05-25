import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings-db";
import { readUtmParams } from "@/lib/tracking";

const SKELETON_COUNTER = "— free spots left";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(254),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().optional(), // honeypot — must stay empty
});

type SignupFormValues = z.infer<typeof signupSchema>;

const FreeBuildPage = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [utmSource, setUtmSource] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Counter + UTM both touch `window` / supabase. Defer to client mount so the
  // SSR render and the first client render match exactly (see codebase-map §9).
  useEffect(() => {
    let cancelled = false;
    getSiteSettings()
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .catch((e) => {
        console.warn("Could not load site settings", e);
      });
    setUtmSource(readUtmParams(window.location.search).utm_source);
    return () => {
      cancelled = true;
    };
  }, []);

  const isFull =
    settings !== null && (!settings.campaign_open || settings.free_projects_remaining <= 0);
  const counterText =
    settings === null
      ? SKELETON_COUNTER
      : isFull
        ? `All ${settings.free_projects_total} spots are currently full — join the waitlist`
        : `${settings.free_projects_remaining} of ${settings.free_projects_total} free spots left`;

  const submitButtonLabel = isFull ? "Join the waitlist" : "Claim my free spot";

  return (
    <div
      id="main-content"
      role="main"
      className="min-h-screen relative z-10"
      style={{ color: "var(--app-text-strong)" }}
    >
      <Helmet>
        <title>I'm building 20 projects for free · Hudson Turansky</title>
        <meta
          name="description"
          content="A limited batch of free builds — websites, AI tools, automations. No payment, no catch. Book a free discovery call and I'll scope something useful for your business."
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://hudsonturansky.com/free-build" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/free-build" />
        <meta property="og:title" content="I'm building 20 projects for free" />
        <meta
          property="og:description"
          content="A limited batch of free builds — websites, AI tools, automations. No payment, no catch. Book a free discovery call."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="I'm building 20 projects for free" />
        <meta
          name="twitter:description"
          content="A limited batch of free builds — websites, AI tools, automations. No payment, no catch."
        />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
      </Helmet>

      {/* Minimal header — wordmark only, no nav. */}
      <header className="pt-8 pb-2 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/"
            className="text-sm font-medium tracking-tight transition-colors"
            style={{ color: "var(--app-text-strong)", letterSpacing: "-0.01em" }}
          >
            Hudson Turansky
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-12 pb-16 px-6">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, var(--app-radial-tint) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto">
          <p
            className="text-xs uppercase tracking-widest font-medium mb-5"
            style={{ color: "#60a5fa" }}
          >
            Limited free projects
          </p>
          <h1
            className="text-3xl sm:text-4xl font-extrabold mb-6"
            style={{
              color: "var(--app-text-strong)",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            I'm building 20 projects for free.
          </h1>
          <p
            className="text-base sm:text-lg font-light leading-relaxed mb-8"
            style={{ color: "var(--app-text-med)" }}
          >
            I'd rather show you than tell you. I'm taking on a limited batch of free builds —
            websites, AI tools, automations — to do great work and let it speak for itself. No
            payment, no catch. If there's something you want built, or even just a hunch that AI
            could help your business, let's talk.
          </p>

          {settings === null ? (
            <p
              className="text-sm font-medium mb-8"
              style={{ color: "var(--app-text-dim)" }}
            >
              {SKELETON_COUNTER}
            </p>
          ) : isFull ? (
            <p
              className="text-sm font-medium mb-8"
              style={{ color: "var(--app-text-dim)" }}
            >
              All {settings.free_projects_total} spots are currently full — join the waitlist
            </p>
          ) : (
            <div className="inline-flex items-center gap-3 mb-8">
              {/* tally */}
              <div className="flex items-baseline gap-1">
                <span
                  className="text-xl sm:text-2xl font-semibold tabular-nums"
                  style={{
                    color: "#3b82f6",
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {settings.free_projects_remaining}
                </span>
                <span
                  className="text-lg sm:text-xl font-light"
                  style={{ color: "var(--app-text-muted)" }}
                >
                  /
                </span>
                <span
                  className="text-xl sm:text-2xl font-semibold tabular-nums"
                  style={{
                    color: "var(--app-text-med)",
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {settings.free_projects_total}
                </span>
              </div>

              {/* hairline divider */}
              <div
                className="h-px w-3"
                style={{ backgroundColor: "var(--app-border)" }}
              />

              {/* label */}
              <span
                className="text-xs uppercase tracking-widest font-medium"
                style={{ color: "var(--app-text-dim)" }}
              >
                Free spots left
              </span>

              {/* underglow */}
              <div
                className="absolute pointer-events-none"
                style={{
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: "rgba(59,130,246,0.3)",
                  filter: "blur(1px)",
                }}
              />
            </div>
          )}

          <div>
            <a
              href="#signup"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200"
              style={{
                backgroundColor: "var(--app-button-bg)",
                color: "var(--app-button-fg)",
              }}
            >
              {isFull ? "Join the waitlist →" : "Claim a free spot →"}
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-semibold mb-8"
            style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}
          >
            How it works
          </h2>
          <ol className="space-y-5">
            {HOW_IT_WORKS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-2xl p-5 sm:p-6"
                style={{
                  backgroundColor: "var(--app-card-bg)",
                  border: "1px solid var(--app-border-med)",
                  backdropFilter: "blur(20px) saturate(180%)",
                  WebkitBackdropFilter: "blur(20px) saturate(180%)",
                }}
              >
                <div className="flex items-baseline gap-3 mb-1.5">
                  <span
                    className="text-sm font-medium tabular-nums"
                    style={{ color: "#60a5fa" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "var(--app-text-strong)", letterSpacing: "-0.01em" }}
                  >
                    {step.title}
                  </h3>
                </div>
                <p
                  className="text-base font-light leading-relaxed"
                  style={{ color: "var(--app-text-med)" }}
                >
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* "Don't know what you want? Good." */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              backgroundColor: "var(--app-blue-soft)",
              border: "1px solid var(--app-blue-tint-border-strong)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
            }}
          >
            <h2
              className="text-xl sm:text-2xl font-semibold mb-3"
              style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}
            >
              Don't know what you want? Good.
            </h2>
            <p
              className="text-base font-light leading-relaxed"
              style={{ color: "var(--app-text-med)" }}
            >
              You do <strong style={{ color: "var(--app-text-strong)", fontWeight: 500 }}>not</strong> need a
              finished idea to book a call. Most business owners sense that AI could help them
              somewhere — they just can't point at exactly what. That's the whole point of the call.
              Tell me how your business actually works day to day, and I'll help you spot the
              automations, AI integrations, and small tools that would genuinely move the needle.
              You'll leave with a concrete idea whether or not we end up working together.
            </p>
          </div>
        </div>
      </section>

      {/* Why free */}
      <section className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl sm:text-3xl font-semibold mb-4"
            style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}
          >
            Why free?
          </h2>
          <p
            className="text-base sm:text-lg font-light leading-relaxed"
            style={{ color: "var(--app-text-med)" }}
          >
            Simple: great free work is how I grow. Every project becomes something I can point to,
            and the people I help tend to tell other people. I'd rather earn that than advertise for
            it.
          </p>
        </div>
      </section>

      {/* Form */}
      <section id="signup" className="px-6 pt-8 pb-20 scroll-mt-12">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <SuccessState />
          ) : (
            <SignupForm
              isFull={isFull}
              submitLabel={submitButtonLabel}
              utmSource={utmSource}
              onSuccess={() => setSubmitted(true)}
              error={submitError}
              setError={setSubmitError}
            />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-10"
        style={{ borderTop: "1px solid var(--app-border-med)" }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p
            className="text-sm font-light"
            style={{ color: "var(--app-text-med)" }}
          >
            Curious what I've built?{" "}
            <Link
              to="/work"
              className="underline decoration-1 underline-offset-4 transition-colors"
              style={{ color: "var(--app-text-strong)" }}
            >
              Explore the full site →
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FreeBuildPage;

// ---------------------------------------------------------------------------

const HOW_IT_WORKS: Array<{ title: string; body: string }> = [
  {
    title: "Book a discovery call.",
    body:
      "A relaxed 30 minutes. We talk through your business — how it runs, where the friction is.",
  },
  {
    title: "I scope something useful.",
    body:
      "Based on the call, I'll pin down a project worth doing — and tell you honestly if AI isn't the answer.",
  },
  {
    title: "I build it, free.",
    body: "You keep it. No invoice, no strings.",
  },
];

// ---- Form ------------------------------------------------------------------

interface SignupFormProps {
  isFull: boolean;
  submitLabel: string;
  utmSource: string | null;
  onSuccess: () => void;
  error: string | null;
  setError: (e: string | null) => void;
}

const SignupForm = ({
  isFull,
  submitLabel,
  utmSource,
  onSuccess,
  error,
  setError,
}: SignupFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      message: "",
      phone: "",
      website: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setError(null);
    try {
      const { data: resp, error: invokeError } = await supabase.functions.invoke<{
        ok?: boolean;
        error?: string;
        message?: string;
      }>("discovery-call-signup", {
        body: {
          name: data.name,
          email: data.email,
          company: data.company || undefined,
          phone: data.phone || undefined,
          message: data.message || undefined,
          website: data.website, // honeypot
          utm_source: utmSource || undefined,
        },
      });
      if (invokeError) {
        const ctx = (invokeError as unknown as { context?: { message?: string } }).context;
        setError(
          ctx?.message ?? "Something went wrong submitting your signup. Please try again in a minute.",
        );
        return;
      }
      if (resp && resp.ok) {
        onSuccess();
        return;
      }
      setError(resp?.message ?? "Could not save your signup. Please try again.");
    } catch (e) {
      console.error(e);
      setError("Network error. Please try again in a minute.");
    }
  };

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        backgroundColor: "var(--app-card-bg-strong)",
        border: "1px solid var(--app-border-strong)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <h2
        className="text-2xl sm:text-3xl font-semibold mb-2"
        style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}
      >
        {isFull ? "Join the waitlist" : "Claim a free spot"}
      </h2>
      <p
        className="text-sm font-light mb-7"
        style={{ color: "var(--app-text-med)" }}
      >
        {isFull
          ? "All spots are claimed for now. Leave your details and I'll reach out when the next batch opens."
          : "Quick 30 seconds. I'll email you within 24 hours to find a time."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Field label="Name" error={errors.name?.message}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                }}
              />
            )}
          />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <input
                {...field}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                }}
              />
            )}
          />
        </Field>

        <Field label="Business name" optional error={errors.company?.message}>
          <Controller
            control={control}
            name="company"
            render={({ field }) => (
              <input
                {...field}
                type="text"
                autoComplete="organization"
                placeholder="Optional"
                className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                }}
              />
            )}
          />
        </Field>

        <Field
          label="What do you want built?"
          optional
          error={errors.message?.message}
        >
          <Controller
            control={control}
            name="message"
            render={({ field }) => (
              <textarea
                {...field}
                rows={4}
                placeholder="Describe it if you know — or leave this blank, that's completely fine. We'll figure it out on the call."
                className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none resize-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                }}
              />
            )}
          />
        </Field>

        <Field label="Phone" optional error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <input
                {...field}
                type="tel"
                autoComplete="tel"
                placeholder="Optional"
                className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none"
                style={{
                  backgroundColor: "var(--app-card-bg-strong)",
                  border: "1px solid var(--app-border-strong)",
                }}
              />
            )}
          />
        </Field>

        {/* Honeypot — bots fill every text input. Real users never see this. */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: "auto",
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          <label htmlFor="website-hp">Website (leave blank)</label>
          <Controller
            control={control}
            name="website"
            render={({ field }) => (
              <input
                {...field}
                id="website-hp"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            )}
          />
        </div>

        {error && (
          <div
            className="text-sm rounded-md px-4 py-3"
            role="alert"
            style={{
              color: "#fecaca",
              backgroundColor: "rgba(127,29,29,0.18)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "var(--app-button-bg)",
              color: "var(--app-button-fg)",
            }}
          >
            {isSubmitting ? "Sending…" : `${submitLabel} →`}
          </button>
          <p
            className="text-xs mt-3 font-light"
            style={{ color: "var(--app-text-muted)" }}
          >
            I'll email you within 24 hours to find a time. No spam, ever.
          </p>
        </div>
      </form>
    </div>
  );
};

interface FieldProps {
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

const Field = ({ label, optional, error, children }: FieldProps) => (
  <div>
    <label
      className="block text-sm mb-2 font-light"
      style={{ color: "var(--app-text-med)" }}
    >
      {label}
      {optional && (
        <span
          className="ml-1.5 text-xs"
          style={{ color: "var(--app-text-muted)" }}
        >
          (optional)
        </span>
      )}
    </label>
    {children}
    {error && (
      <p className="text-xs mt-1.5" style={{ color: "#fca5a5" }}>
        {error}
      </p>
    )}
  </div>
);

// ---- Success state ---------------------------------------------------------

const SuccessState = () => (
  <div
    className="rounded-2xl p-8 sm:p-10 text-center"
    style={{
      backgroundColor: "var(--app-card-bg-strong)",
      border: "1px solid var(--app-border-strong)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
    }}
  >
    <h2
      className="text-3xl sm:text-4xl font-extrabold mb-4"
      style={{ color: "var(--app-text-strong)", letterSpacing: "-0.02em" }}
    >
      You're on the list.
    </h2>
    <p
      className="text-base font-light leading-relaxed mb-6 max-w-prose mx-auto"
      style={{ color: "var(--app-text-med)" }}
    >
      I'll email you within 24 hours to set up your discovery call. In the meantime, feel free to
      look around.
    </p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-md transition-colors duration-200"
      style={{
        backgroundColor: "var(--app-button-bg)",
        color: "var(--app-button-fg)",
      }}
    >
      hudsonturansky.com →
    </Link>
  </div>
);
