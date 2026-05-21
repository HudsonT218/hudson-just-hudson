import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

type InvalidReason = "invalid" | "expired" | "already_submitted" | "revoked";
type State =
  | { kind: "loading" }
  | { kind: "invalid"; reason: InvalidReason }
  | { kind: "form" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "submit_error"; message: string };

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.05)",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INVALID_COPY: Record<InvalidReason, string> = {
  invalid:
    "This reference link isn't valid. If you think this is a mistake, reach out to Hudson at hudsonturansky@gmail.com.",
  expired: "This reference link expired. Ask Hudson to send a new one.",
  already_submitted: "Thanks, this reference was already submitted.",
  revoked: "This link is no longer active.",
};

const inputClass =
  "bg-white/[0.02] border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-blue-500/40";

const ReferencePage = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<State>({ kind: "loading" });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [headline, setHeadline] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setState({ kind: "invalid", reason: "invalid" });
        return;
      }
      const { data, error } = await supabase.functions.invoke(
        "verify-reference-access",
        { body: { token } },
      );
      if (cancelled) return;
      if (error || !data) {
        setState({ kind: "invalid", reason: "invalid" });
        return;
      }
      if (data.valid) {
        setState({ kind: "form" });
      } else {
        const reason = (data.reason as InvalidReason) ?? "invalid";
        setState({ kind: "invalid", reason });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const headlineLen = headline.length;
  const counterColor =
    headlineLen >= 140
      ? "text-red-400"
      : headlineLen > 120
        ? "text-amber-400"
        : "text-gray-500";

  const formValid =
    name.trim().length > 0 &&
    roleTitle.trim().length > 0 &&
    headline.trim().length > 0 &&
    headlineLen <= 140 &&
    EMAIL_RE.test(email.trim());

  const submitting = state.kind === "submitting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid || !token) return;
    setState({ kind: "submitting" });
    const { data, error } = await supabase.functions.invoke("submit-reference", {
      body: {
        token,
        name: name.trim(),
        role_title: roleTitle.trim(),
        email: email.trim(),
        headline: headline.trim(),
        linkedin_url: linkedinUrl.trim() || null,
      },
    });
    if (error) {
      setState({
        kind: "submit_error",
        message: error.message || "Something went wrong. Please try again.",
      });
      return;
    }
    if (data && data.ok === false) {
      setState({
        kind: "submit_error",
        message: data.error || "Something went wrong. Please try again.",
      });
      return;
    }
    setState({ kind: "success" });
  };

  return (
    <div
      id="main-content"
      role="main"
      className="min-h-screen relative z-10"
    >
      <Helmet>
        <title>Write a reference for Hudson Turansky</title>
        <meta name="description" content="Private reference form, share a short recommendation for Hudson Turansky's web development and AI work." />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={`https://hudsonturansky.com/reference/${token ?? ""}`} />
        <meta property="og:title" content="Write a reference for Hudson Turansky" />
        <meta property="og:description" content="Private reference form for Hudson Turansky." />
        <meta property="og:url" content={`https://hudsonturansky.com/reference/${token ?? ""}`} />
      </Helmet>

      {/* Hero */}
      <section className="relative pt-40 pb-12 px-6 text-center">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="relative max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
            Reference
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
            style={{ letterSpacing: "-0.04em" }}
          >
            Write a reference for{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Hudson.
            </span>
          </h1>
          <p className="text-lg text-gray-400 font-light max-w-xl mx-auto">
            Just a few fields. Should take 2 minutes.
          </p>
        </div>
      </section>

      <section className="pb-28 px-6">
        <div className="max-w-xl mx-auto">
          {state.kind === "loading" && (
            <div
              className="rounded-2xl p-8 text-center text-gray-500 font-light"
              style={CARD_STYLE}
            >
              Loading…
            </div>
          )}

          {state.kind === "invalid" && (
            <div
              className="rounded-2xl p-8 text-center"
              style={CARD_STYLE}
            >
              <p className="text-gray-300 font-light leading-relaxed">
                {INVALID_COPY[state.reason]}
              </p>
              <a
                href="mailto:hudsonturansky@gmail.com"
                className="inline-block mt-6 text-xs text-gray-500 hover:text-gray-300 transition-colors"
              >
                hudsonturansky@gmail.com
              </a>
            </div>
          )}

          {state.kind === "success" && (
            <div
              className="rounded-2xl p-10 text-center"
              style={CARD_STYLE}
            >
              <h2
                className="text-3xl font-extrabold text-white mb-4"
                style={{ letterSpacing: "-0.03em" }}
              >
                Thanks!
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Your reference is in. Hudson will review and publish it shortly.
                Feel free to close this tab.
              </p>
            </div>
          )}

          {(state.kind === "form" ||
            state.kind === "submitting" ||
            state.kind === "submit_error") && (
            <>
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl p-8 space-y-6"
                style={CARD_STYLE}
              >
                <Field label="Your name">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    required
                    disabled={submitting}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Your email"
                  helper="Must match the email this link was sent to."
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="Your role / title"
                  helper="What title would you like shown? (e.g. 'Founder, Acme Co')"
                >
                  <Input
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    maxLength={80}
                    required
                    disabled={submitting}
                    className={inputClass}
                  />
                </Field>

                <Field
                  label="One-line summary"
                  helper="This is what shows publicly on Hudson's site."
                >
                  <textarea
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value.slice(0, 140))}
                    rows={3}
                    maxLength={140}
                    required
                    disabled={submitting}
                    className="w-full rounded-md bg-white/[0.02] border border-white/10 text-white placeholder:text-gray-600 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 resize-none"
                  />
                  <div
                    className={`mt-1 text-xs text-right font-mono ${counterColor}`}
                  >
                    {headlineLen}/140
                  </div>
                </Field>

                <Field
                  label="LinkedIn URL"
                  helper="Optional, adds a small icon to your card on the site."
                >
                  <Input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    disabled={submitting}
                    className={inputClass}
                  />
                </Field>

                {state.kind === "submit_error" && (
                  <div
                    className="rounded-md px-4 py-3 text-sm text-red-300"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    {state.message}
                  </div>
                )}

                <div className="flex sm:justify-end pt-2">
                  <button
                    type="submit"
                    disabled={!formValid || submitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#09090b",
                    }}
                  >
                    {submitting ? "Sending…" : "Send Reference →"}
                  </button>
                </div>
              </form>

              <p className="mt-6 text-center text-xs text-gray-600">
                Questions?{" "}
                <a
                  href="mailto:hudsonturansky@gmail.com"
                  className="hover:text-gray-400 transition-colors"
                >
                  Email Hudson
                </a>
                .
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

const Field = ({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      {label}
    </label>
    {children}
    {helper && (
      <p className="mt-1.5 text-xs text-gray-500 font-light">{helper}</p>
    )}
  </div>
);

export default ReferencePage;
