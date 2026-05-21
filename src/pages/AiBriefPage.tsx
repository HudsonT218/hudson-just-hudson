// Free Personalized AI Brief, single-file page covering:
//   - prerendered landing intro (this is what crawlers see)
//   - 5-step quiz (React Hook Form + Zod)
//   - email gate
//   - submission loading
//   - results view (the "brief")
//   - already-received and error states
//
// Backend: supabase/functions/ai-test-generate. (Kept the internal function
// name to avoid orphaning the deployed edge function on Lovable Cloud, the
// public-facing label was the only thing that needed to change.) Edge
// function validates + length-limits everything we send, so the client-side
// validation here is for UX, not security.

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import {
  EFFORT_COLOR,
  EFFORT_LABEL,
  type AiTestResults,
  type GenerateResponse,
  type QuizAnswers,
} from "@/lib/ai-brief-types";
import { SOURCE_OPTIONS } from "@/lib/tracking";

// ---------------------------------------------------------------------------
// Quiz schema
// ---------------------------------------------------------------------------

const quizSchema = z.object({
  name: z.string().max(100).optional(),
  role: z.string().min(2, "Tell me what you do, even one word helps.").max(200),
  industry: z.string().min(1, "Pick the closest match.").max(80),
  team_size: z.string().min(1, "Pick one."),
  time_drains: z.array(z.string()).min(1, "Pick at least one.").max(8),
  daily_tools: z.array(z.string()).max(15).optional().default([]),
  repetitive_part: z.string().max(500).optional(),
  life_streamline: z.array(z.string()).max(8).optional().default([]),
  personal_goal: z.string().max(300).optional(),
  hobbies: z.string().max(300).optional(),
  ai_usage: z.string().min(1, "Pick one."),
  ai_tools_tried: z.array(z.string()).max(10).optional().default([]),
  tech_comfort: z.string().min(1, "Pick one."),
  hand_to_ai: z.string().min(5, "A sentence is enough.").max(500),
});

type QuizForm = z.infer<typeof quizSchema>;

const emailSchema = z.object({
  email: z.string().email("That doesn't look like an email."),
  source: z.string().min(1, "Pick one, even \"Other\" helps."),
  consent: z.literal(true, { errorMap: () => ({ message: "Tick the box to continue." }) }),
});

type EmailForm = z.infer<typeof emailSchema>;

// ---------------------------------------------------------------------------
// Quiz option lists
// ---------------------------------------------------------------------------

const INDUSTRIES = [
  "Professional services (legal, accounting, consulting)",
  "Contractor / trades",
  "Real estate",
  "E-commerce / retail",
  "Agency / marketing",
  "Healthcare / wellness",
  "Hospitality / restaurant",
  "Education / coaching",
  "Tech / SaaS",
  "Other",
];

const TEAM_SIZES = [
  "Solo (just me)",
  "2–5 people",
  "6–20 people",
  "21–100 people",
  "100+ people",
];

const TIME_DRAINS = [
  "Intake / scheduling",
  "Email triage",
  "Document processing",
  "Research",
  "Customer support",
  "Content / writing",
  "Reporting / dashboards",
  "Internal coordination",
  "Sales follow-up",
  "Bookkeeping / invoicing",
];

const DAILY_TOOLS = [
  "Email",
  "Calendar",
  "Slack",
  "Google Workspace",
  "Microsoft 365",
  "Notion",
  "CRM (HubSpot, Salesforce, etc.)",
  "Spreadsheets",
  "Custom internal tools",
  "Stripe / billing",
];

const LIFE_STREAMLINE = [
  "Meal planning / groceries",
  "Family scheduling",
  "Financial / budgeting",
  "Shopping / errands",
  "Learning / studying",
  "Fitness / health",
  "Travel planning",
  "Social / events",
];

const AI_USAGE = [
  "Never",
  "Once a month",
  "Weekly",
  "Daily",
  "Multiple times a day",
];

const AI_TOOLS_TRIED = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Microsoft Copilot",
  "Perplexity",
  "Notion AI",
  "Custom AI tool",
  "Other",
];

const TECH_COMFORT = [
  "I write code",
  "I'm comfortable with most apps",
  "I get by",
  "I prefer when others set things up",
];

// ---------------------------------------------------------------------------
// Step config, defines which fields belong to which step + step labels
// ---------------------------------------------------------------------------

const STEPS: Array<{ title: string; fields: FieldPath<QuizForm>[] }> = [
  { title: "About you", fields: ["name", "role", "industry", "team_size"] },
  { title: "Your work", fields: ["time_drains", "daily_tools", "repetitive_part"] },
  { title: "Your life outside work", fields: ["life_streamline", "personal_goal", "hobbies"] },
  { title: "Your AI experience", fields: ["ai_usage", "ai_tools_tried", "tech_comfort"] },
  { title: "The big one", fields: ["hand_to_ai"] },
];

type Phase =
  | { kind: "intro" }
  | { kind: "quiz" }
  | { kind: "email" }
  | { kind: "submitting" }
  | { kind: "results"; results: AiTestResults }
  | { kind: "already_used"; message: string }
  | { kind: "error"; message: string };

// ===========================================================================
// Component
// ===========================================================================

const AiBriefPage = () => {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" });

  return (
    <div id="main-content" role="main" className="min-h-screen relative z-10">
      <Helmet>
        <title>Personalized AI Brief for Small Businesses · Hudson Turansky</title>
        <meta
          name="description"
          content="A free 5-minute personalized brief. Answer a few questions about your work and life and get 6–10 specific AI ideas you could actually use, tagged by effort, with the build-worthy ones flagged."
        />
        <link rel="canonical" href="https://hudsonturansky.com/ai-brief" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hudsonturansky.com/ai-brief" />
        <meta property="og:title" content="Personalized AI Brief for Small Businesses" />
        <meta
          property="og:description"
          content="A free 5-minute personalized brief. Get 6–10 specific AI ideas you could actually use, tagged by effort."
        />
        <meta property="og:image" content="https://hudsonturansky.com/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Personalized AI Brief for Small Businesses" />
        <meta
          name="twitter:description"
          content="A free 5-minute personalized brief. Get 6–10 specific AI ideas, tagged by effort."
        />
        <meta name="twitter:image" content="https://hudsonturansky.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(LANDING_JSONLD)}</script>
      </Helmet>
      <Navbar />

      <section className="relative pt-32 pb-12 px-6">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(59,130,246,0.06) 0%, transparent 60%)" }} />
        <div className="relative max-w-3xl mx-auto">
          {phase.kind === "intro" && <Intro onStart={() => setPhase({ kind: "quiz" })} />}
          {phase.kind === "quiz" && (
            <Quiz
              onComplete={() => setPhase({ kind: "email" })}
              onBackToIntro={() => setPhase({ kind: "intro" })}
              setSubmissionState={setPhase}
            />
          )}
          {phase.kind === "email" && (
            <EmailGate
              onSubmitting={() => setPhase({ kind: "submitting" })}
              onSuccess={(results) => setPhase({ kind: "results", results })}
              onAlreadyUsed={(message) => setPhase({ kind: "already_used", message })}
              onError={(message) => setPhase({ kind: "error", message })}
            />
          )}
          {phase.kind === "submitting" && <Submitting />}
          {phase.kind === "results" && <Results results={phase.results} />}
          {phase.kind === "already_used" && <AlreadyUsed message={phase.message} />}
          {phase.kind === "error" && (
            <ErrorState
              message={phase.message}
              onRetry={() => setPhase({ kind: "email" })}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AiBriefPage;

// ===========================================================================
// Pieces
// ===========================================================================

const LANDING_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Personalized AI Brief",
  description:
    "Free 5-minute personalized brief that generates 6–10 specific AI use-case ideas based on the taker's work and life.",
  url: "https://hudsonturansky.com/ai-brief",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: {
    "@type": "Person",
    name: "Hudson Turansky",
    url: "https://hudsonturansky.com",
  },
};

// ---- Intro (the prerendered landing content) -----------------------------

const SAMPLE_OUTPUTS: Array<{ persona: string; sections: Array<{ heading: string; ideas: Array<{ title: string; description: string; effort: "easy" | "medium" | "needs_building" }> }> }> = [
  {
    persona: "Solo real-estate agent · 25 listings/year",
    sections: [
      {
        heading: "At work",
        ideas: [
          {
            title: "Listing description generator",
            description: "A ChatGPT prompt that turns raw listing facts into 3 description variants in your voice. ~2 hrs saved per listing.",
            effort: "easy",
          },
          {
            title: "Showing-request triager",
            description: "AI assistant that reads incoming \"can I see this house?\" emails, checks your calendar, and proposes 2–3 time slots in your voice.",
            effort: "needs_building",
          },
        ],
      },
      {
        heading: "In your life",
        ideas: [
          {
            title: "Weekly meal plan from what's in your fridge",
            description: "A ChatGPT prompt that builds a 7-day meal plan around what you already have and your dietary preferences.",
            effort: "easy",
          },
        ],
      },
    ],
  },
  {
    persona: "Small accounting firm · 4 partners",
    sections: [
      {
        heading: "At work",
        ideas: [
          {
            title: "Client onboarding intake assistant",
            description: "Custom chat assistant that walks new clients through a structured intake, captures every field, and writes the result to your CRM.",
            effort: "needs_building",
          },
          {
            title: "Q4 tax-prep client comms drafter",
            description: "ChatGPT prompt that generates personalized client emails for each tax-prep stage in your firm's voice.",
            effort: "easy",
          },
        ],
      },
    ],
  },
];

const Intro = ({ onStart }: { onStart: () => void }) => {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-5">
        Free Personalized AI Brief
      </p>
      <h1
        className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6"
        style={{ letterSpacing: "-0.04em" }}
      >
        Find out which AI ideas are{" "}
        <span
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          actually worth your time.
        </span>
      </h1>
      <p className="text-lg text-gray-400 font-light max-w-2xl mb-8 leading-relaxed">
        A free 5-minute personalized brief. Answer a few questions about your work and life, your role, the
        tasks that eat your time, what tools you live in, what you'd hand to an AI tomorrow, and a
        purpose-built assistant generates a brief with{" "}
        <strong className="text-gray-200">6–10 specific AI use-case ideas</strong> based on your answers,
        grouped <em>At Work</em> and <em>In Your Life</em>, and tagged by effort.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <BadgeCard label="Free, 5 minutes" sub="One use per email." />
        <BadgeCard label="Personalized" sub="Ideas reference your specific answers." />
        <BadgeCard label="Honest" sub="Easy + medium ideas → DIY. Needs-building → I tell you." />
      </div>

      <div className="mb-12">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-md transition-colors duration-200"
          style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--app-button-bg-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--app-button-bg)"; }}
        >
          Get my brief →
        </button>
        <p className="mt-3 text-xs text-gray-600">No pitch on the way in. Your results are yours, and the build-worthy ones get flagged.</p>
      </div>

      <div className="border-t border-white/[0.06]" />

      {/* What you get */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white mb-6" style={{ letterSpacing: "-0.02em" }}>
          What you get
        </h2>
        <ul className="space-y-3 text-gray-400 font-light leading-relaxed">
          <li>· <strong className="text-gray-200">6–10 ideas</strong>, most briefs end up with a mix of low-effort wins and a few ambitious "needs building" projects.</li>
          <li>· Each idea has a <strong className="text-gray-200">title, one-line description, and a personalized "how this helps you"</strong> that references your actual answers.</li>
          <li>· Effort tag on every idea: <span style={{ color: "rgba(16,185,129,0.9)" }}>Easy</span> (do it yourself with ChatGPT) · <span style={{ color: "rgba(245,158,11,0.9)" }}>Medium</span> (off-the-shelf AI tool) · <span style={{ color: "rgba(96,165,250,1)" }}>Needs building</span> (where I can help).</li>
          <li>· Honest "this is just ChatGPT" answers when that's the right call, no upsell pressure.</li>
        </ul>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* Sample outputs */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-white mb-6" style={{ letterSpacing: "-0.02em" }}>
          Sample outputs
        </h2>
        <p className="text-sm text-gray-500 mb-6">Two anonymized previews so you know the shape before you take it.</p>
        <div className="space-y-6">
          {SAMPLE_OUTPUTS.map((s) => (
            <div
              key={s.persona}
              className="rounded-2xl p-6"
              style={{ backgroundColor: "var(--app-card-bg)", border: "1px solid var(--app-border-med)" }}
            >
              <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-3">Persona</p>
              <p className="text-white font-medium mb-5">{s.persona}</p>
              {s.sections.map((sec) => (
                <div key={sec.heading} className="mb-5 last:mb-0">
                  <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">{sec.heading}</p>
                  <div className="space-y-3">
                    {sec.ideas.map((idea) => (
                      <div key={idea.title} className="flex items-start gap-3">
                        <span
                          className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0"
                          style={{
                            backgroundColor: "var(--app-card-bg-hover)",
                            color: EFFORT_COLOR[idea.effort],
                            border: `1px solid ${EFFORT_COLOR[idea.effort]}`,
                          }}
                        >
                          {idea.effort === "easy" ? "EASY" : idea.effort === "medium" ? "MED" : "BUILD"}
                        </span>
                        <div>
                          <p className="text-white font-medium text-sm mb-1">{idea.title}</p>
                          <p className="text-gray-500 text-sm font-light leading-relaxed">{idea.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div className="border-t border-white/[0.06]" />

      {/* CTA repeat */}
      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
          Ready?
        </h2>
        <p className="text-gray-400 mb-6">5 minutes. One use per email.</p>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-md transition-colors duration-200"
          style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
        >
          Get my brief →
        </button>
      </section>
    </div>
  );
};

const BadgeCard = ({ label, sub }: { label: string; sub: string }) => (
  <div
    className="rounded-2xl p-5"
    style={{ backgroundColor: "var(--app-card-bg)", border: "1px solid var(--app-border-soft)" }}
  >
    <p className="text-white font-semibold mb-1 text-sm">{label}</p>
    <p className="text-gray-500 text-xs font-light leading-relaxed">{sub}</p>
  </div>
);

// ---- Quiz ----------------------------------------------------------------

interface QuizProps {
  onComplete: () => void;
  onBackToIntro: () => void;
  setSubmissionState: (p: Phase) => void;
}

// Keep the form values outside the Quiz component so EmailGate can read them
// after the user navigates forward. Module-scoped is fine, only one test
// flow runs at a time per browser tab.
let savedQuizValues: QuizAnswers | null = null;

const Quiz = ({ onComplete, onBackToIntro }: QuizProps) => {
  const [step, setStep] = useState(0);

  const { control, handleSubmit, trigger, formState: { errors } } = useForm<QuizForm>({
    resolver: zodResolver(quizSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      role: "",
      industry: "",
      team_size: "",
      time_drains: [],
      daily_tools: [],
      repetitive_part: "",
      life_streamline: [],
      personal_goal: "",
      hobbies: "",
      ai_usage: "",
      ai_tools_tried: [],
      tech_comfort: "",
      hand_to_ai: "",
    },
  });

  const onValid = (data: QuizForm) => {
    savedQuizValues = data;
    onComplete();
  };

  const goNext = async () => {
    const fields = STEPS[step].fields;
    const valid = await trigger(fields);
    if (!valid) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else handleSubmit(onValid)();
  };

  const goBack = () => {
    if (step === 0) onBackToIntro();
    else setStep(step - 1);
  };

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{current.title}</span>
        </div>
        <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="space-y-6">
        {/* Step 1, About you */}
        {step === 0 && (
          <>
            <FieldText name="name" label="Your name (optional)" placeholder="e.g. Maria" control={control} error={errors.name} />
            <FieldText name="role" label="What work do you currently do?" placeholder="e.g. Real estate agent, solo accountant, agency owner…" control={control} error={errors.role} required />
            <FieldSingleSelect name="industry" label="Closest industry" options={INDUSTRIES} control={control} error={errors.industry} required />
            <FieldSingleSelect name="team_size" label="Team / business size" options={TEAM_SIZES} control={control} error={errors.team_size} required />
          </>
        )}

        {/* Step 2, Your work */}
        {step === 1 && (
          <>
            <FieldMultiSelect name="time_drains" label="Which tasks eat the most time at work?" options={TIME_DRAINS} control={control} error={errors.time_drains} required hint="Pick all that apply." />
            <FieldMultiSelect name="daily_tools" label="Tools you use daily" options={DAILY_TOOLS} control={control} error={errors.daily_tools} hint="Optional. Helps me recommend things that actually integrate with your stack." />
            <FieldTextarea name="repetitive_part" label="What's the most repetitive part of your work?" placeholder="One or two sentences. The more specific, the better." control={control} error={errors.repetitive_part} />
          </>
        )}

        {/* Step 3, Your life outside work */}
        {step === 2 && (
          <>
            <FieldMultiSelect name="life_streamline" label="Personal / household time you'd love to streamline" options={LIFE_STREAMLINE} control={control} error={errors.life_streamline} hint="Optional. Skip if nothing fits." />
            <FieldTextarea name="personal_goal" label="A personal goal you never have time for" placeholder={'e.g. "learn Spanish," "actually plan vacations," "meal-prep on Sundays."'} control={control} error={errors.personal_goal} />
            <FieldTextarea name="hobbies" label="Hobbies or interests" placeholder="Optional. Helps tailor the 'In your life' ideas." control={control} error={errors.hobbies} />
          </>
        )}

        {/* Step 4, Your AI experience */}
        {step === 3 && (
          <>
            <FieldSingleSelect name="ai_usage" label="How often do you use AI today?" options={AI_USAGE} control={control} error={errors.ai_usage} required />
            <FieldMultiSelect name="ai_tools_tried" label="Which AI tools have you tried?" options={AI_TOOLS_TRIED} control={control} error={errors.ai_tools_tried} hint="Optional." />
            <FieldSingleSelect name="tech_comfort" label="Tech comfort level" options={TECH_COMFORT} control={control} error={errors.tech_comfort} required />
          </>
        )}

        {/* Step 5, The big one */}
        {step === 4 && (
          <>
            <FieldTextarea
              name="hand_to_ai"
              label="If you could wave a magic wand and make one part of your week disappear, what would it be?"
              placeholder="Be specific. Even a single tedious task counts."
              control={control}
              error={errors.hand_to_ai}
              rows={5}
              required
            />
          </>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={goBack}
            className="text-sm text-gray-500 hover:text-white transition-colors"
          >
            ← {step === 0 ? "Back to intro" : "Back"}
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md transition-colors duration-200"
            style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
          >
            {step === STEPS.length - 1 ? "Get my results →" : "Next →"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ---- Email gate ----------------------------------------------------------

interface EmailGateProps {
  onSubmitting: () => void;
  onSuccess: (results: AiTestResults) => void;
  onAlreadyUsed: (message: string) => void;
  onError: (message: string) => void;
}

const EmailGate = ({ onSubmitting, onSuccess, onAlreadyUsed, onError }: EmailGateProps) => {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "", source: "", consent: false as unknown as true },
  });

  const onSubmit = async (data: EmailForm) => {
    if (!savedQuizValues) {
      onError("Your answers were lost, please start the brief again.");
      return;
    }
    onSubmitting();
    try {
      const { data: resp, error: invokeError } = await supabase.functions.invoke<GenerateResponse>(
        "ai-test-generate",
        { body: { email: data.email, source: data.source, answers: savedQuizValues } },
      );
      if (invokeError) {
        // Try to read the structured body anyway, supabase-js puts non-2xx
        // bodies on `error.context` in some versions.
        const ctx = (invokeError as unknown as { context?: { error?: string; message?: string } }).context;
        if (ctx?.error === "already_used") {
          onAlreadyUsed(ctx.message ?? alreadyUsedFallback);
          return;
        }
        if (ctx?.message) {
          onError(ctx.message);
          return;
        }
        onError("Something went wrong sending your answers. Please try again in a minute.");
        return;
      }
      if (!resp) {
        onError("No response from the server. Please try again.");
        return;
      }
      if (resp.ok && "results" in resp) {
        onSuccess(resp.results);
        return;
      }
      const err = resp as { error?: string; message?: string };
      if (err.error === "already_used") {
        onAlreadyUsed(err.message ?? alreadyUsedFallback);
        return;
      }
      onError(err.message ?? "Could not generate your results. Please try again.");
    } catch (e) {
      console.error(e);
      onError("Network error. Please try again in a minute.");
    }
  };

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-4">Final step</p>
      <h2 className="text-3xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
        Where should I send your results?
      </h2>
      <p className="text-gray-400 font-light mb-8 leading-relaxed">
        One use per email. You'll see your personalized AI ideas on the next screen. I'll also email you a
        copy for later. No spam, no list, just this report.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
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
              {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>}
            </div>
          )}
        />

        <Controller
          control={control}
          name="source"
          render={({ field }) => (
            <div>
              <label className="block text-sm text-gray-400 mb-3">How did you hear about this?</label>
              <div className="flex flex-wrap gap-2">
                {SOURCE_OPTIONS.map((opt) => {
                  const selected = field.value === opt;
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => field.onChange(opt)}
                      className="text-sm font-light px-3 py-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: selected ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${selected ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.08)"}`,
                        color: selected ? "#fff" : "#9ca3af",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {errors.source && <p className="mt-2 text-xs text-red-400">{errors.source.message}</p>}
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
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-white/[0.04]"
                />
                <span className="text-sm text-gray-400 font-light leading-relaxed">
                  I agree to receive my AI use-case results by email. I understand my answers are stored to
                  generate the results and may be reviewed by Hudson. See the{" "}
                  <a
                    href="/privacy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    privacy note
                  </a>
                  .
                </span>
              </label>
              {errors.consent && <p className="mt-2 text-xs text-red-400">{errors.consent.message}</p>}
            </div>
          )}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-3 rounded-md transition-colors duration-200 disabled:opacity-50"
          style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
        >
          {isSubmitting ? "Generating…" : "Get my results →"}
        </button>
      </form>
    </div>
  );
};

const alreadyUsedFallback =
  "This email has already received a free personalized AI brief. Book a discovery call to talk through your results in more detail.";

// ---- Submitting ----------------------------------------------------------

const Submitting = () => (
  <div className="text-center py-20">
    <div className="inline-flex items-center gap-3 text-gray-400 font-light">
      <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
      <span>Generating your personalized ideas…</span>
    </div>
    <p className="mt-4 text-xs text-gray-600">~15–30 seconds. Don't close the tab.</p>
  </div>
);

// ---- Results -------------------------------------------------------------

const Results = ({ results }: { results: AiTestResults }) => {
  const atWork = results.at_work ?? [];
  const inLife = results.in_your_life ?? [];

  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-4">Your results</p>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
        Your personalized AI use-case map.
      </h2>
      {results.summary && (
        <p className="text-lg text-gray-400 font-light leading-relaxed mb-10">{results.summary}</p>
      )}

      {atWork.length > 0 && (
        <Section heading="At work" ideas={atWork} />
      )}
      {inLife.length > 0 && (
        <Section heading="In your life" ideas={inLife} />
      )}

      <div
        className="mt-12 rounded-2xl p-8 text-center"
        style={{
          backgroundColor: "var(--app-blue-tint-strong)",
          border: "1px solid var(--app-blue-tint-border)",
        }}
      >
        <p className="text-white font-semibold mb-2">Got a "needs building" idea you want to scope?</p>
        <p className="text-gray-400 text-sm font-light mb-5">
          Book a free 30-minute call. I'll tell you honestly whether it's worth building, what it would cost,
          and how long it would take.
        </p>
        <a
          href="https://calendly.com/hudsonturansky/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md"
          style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
        >
          Book a discovery call →
        </a>
      </div>
    </div>
  );
};

const Section = ({ heading, ideas }: { heading: string; ideas: AiTestResults["at_work"] }) => (
  <section className="mb-10">
    <h3 className="text-sm uppercase tracking-widest text-gray-500 font-medium mb-4">{heading}</h3>
    <div className="space-y-3">
      {ideas.map((idea, i) => (
        <div
          key={`${heading}-${i}`}
          className="rounded-2xl p-6"
          style={{ backgroundColor: "var(--app-card-bg)", border: "1px solid var(--app-border-med)" }}
        >
          <div className="flex items-start gap-3 mb-2">
            <span
              className="font-mono text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 mt-1"
              style={{
                backgroundColor: "var(--app-card-bg-strong)",
                color: EFFORT_COLOR[idea.effort],
                border: `1px solid ${EFFORT_COLOR[idea.effort]}`,
              }}
              title={EFFORT_LABEL[idea.effort]}
            >
              {idea.effort === "easy" ? "EASY" : idea.effort === "medium" ? "MED" : "BUILD"}
            </span>
            <h4 className="text-white font-semibold leading-tight">{idea.title}</h4>
          </div>
          <p className="text-gray-400 text-sm font-light leading-relaxed mb-2">{idea.description}</p>
          <p className="text-gray-500 text-sm font-light leading-relaxed">
            <span className="text-gray-600">How this helps you:</span> {idea.how_it_helps}
          </p>
          {idea.effort === "needs_building" && (
            <a
              href="https://calendly.com/hudsonturansky/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-medium mt-3 text-blue-400 hover:text-blue-300"
            >
              Scope this with Hudson →
            </a>
          )}
        </div>
      ))}
    </div>
  </section>
);

// ---- Already used / error -----------------------------------------------

const AlreadyUsed = ({ message }: { message: string }) => (
  <div className="text-center py-12">
    <p className="text-xs uppercase tracking-widest text-blue-400 font-medium mb-4">Already used</p>
    <h2 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
      You've already received your brief.
    </h2>
    <p className="text-gray-400 font-light max-w-xl mx-auto mb-8 leading-relaxed">{message}</p>
    <a
      href="https://calendly.com/hudsonturansky/30min"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-md"
      style={{ backgroundColor: "var(--app-button-bg)", color: "var(--app-button-fg)" }}
    >
      Book a 30-minute call instead →
    </a>
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-center py-12">
    <h2 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>
      Something didn't work.
    </h2>
    <p className="text-gray-400 font-light max-w-xl mx-auto mb-8">{message}</p>
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

// ---- Footer --------------------------------------------------------------

const Footer = () => (
  <footer
    className="py-8 px-6 text-center"
    style={{ backgroundColor: "var(--app-page-bg)", borderTop: "1px solid var(--app-border-soft)" }}
  >
    <p className="text-xs text-gray-600">
      &copy; {__BUILD_YEAR__} Hudson Turansky &middot;{" "}
      <Link to="/" className="hover:text-gray-400 transition-colors">
        hudsonturansky.com
      </Link>
    </p>
  </footer>
);

// ===========================================================================
// Form field components, keep these in this file so the page is one unit.
// ===========================================================================

interface FieldBaseProps<T extends FieldPath<QuizForm>> {
  name: T;
  label: string;
  control: ReturnType<typeof useForm<QuizForm>>["control"];
  error?: { message?: string };
  required?: boolean;
  hint?: string;
}

const FieldText = <T extends FieldPath<QuizForm>>({
  name, label, placeholder, control, error, required,
}: FieldBaseProps<T> & { placeholder?: string }) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          {label}{required && <span className="text-red-400/70 ml-1">*</span>}
        </label>
        <input
          {...field}
          value={(field.value as string) ?? ""}
          type="text"
          placeholder={placeholder}
          className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none"
          style={{
            backgroundColor: "var(--app-card-bg-strong)",
            border: "1px solid var(--app-border-strong)",
          }}
        />
        {error?.message && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
      </div>
    )}
  />
);

const FieldTextarea = <T extends FieldPath<QuizForm>>({
  name, label, placeholder, control, error, required, rows = 3,
}: FieldBaseProps<T> & { placeholder?: string; rows?: number }) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <div>
        <label className="block text-sm text-gray-400 mb-2">
          {label}{required && <span className="text-red-400/70 ml-1">*</span>}
        </label>
        <textarea
          {...field}
          value={(field.value as string) ?? ""}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none resize-y"
          style={{
            backgroundColor: "var(--app-card-bg-strong)",
            border: "1px solid var(--app-border-strong)",
          }}
        />
        {error?.message && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
      </div>
    )}
  />
);

const FieldSingleSelect = <T extends FieldPath<QuizForm>>({
  name, label, options, control, error, required,
}: FieldBaseProps<T> & { options: string[] }) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <div>
        <label className="block text-sm text-gray-400 mb-3">
          {label}{required && <span className="text-red-400/70 ml-1">*</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const selected = field.value === opt;
            return (
              <button
                type="button"
                key={opt}
                onClick={() => field.onChange(opt)}
                className="text-sm font-light px-3 py-2 rounded-full transition-colors"
                style={{
                  backgroundColor: selected ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.08)"}`,
                  color: selected ? "#fff" : "#9ca3af",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {error?.message && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
      </div>
    )}
  />
);

const FieldMultiSelect = <T extends FieldPath<QuizForm>>({
  name, label, options, control, error, required, hint,
}: FieldBaseProps<T> & { options: string[] }) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => {
      const current = (field.value as string[]) ?? [];
      const toggle = (opt: string) => {
        if (current.includes(opt)) field.onChange(current.filter((x) => x !== opt));
        else field.onChange([...current, opt]);
      };
      return (
        <div>
          <label className="block text-sm text-gray-400 mb-3">
            {label}{required && <span className="text-red-400/70 ml-1">*</span>}
          </label>
          {hint && <p className="text-xs text-gray-600 mb-3 -mt-2">{hint}</p>}
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => {
              const selected = current.includes(opt);
              return (
                <button
                  type="button"
                  key={opt}
                  onClick={() => toggle(opt)}
                  className="text-sm font-light px-3 py-2 rounded-full transition-colors"
                  style={{
                    backgroundColor: selected ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selected ? "rgba(96,165,250,0.6)" : "rgba(255,255,255,0.08)"}`,
                    color: selected ? "#fff" : "#9ca3af",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {error?.message && <p className="mt-2 text-xs text-red-400">{error.message}</p>}
        </div>
      );
    }}
  />
);
