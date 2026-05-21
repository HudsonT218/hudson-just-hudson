// Client-side tracking helpers — visit logger + source-attribution options.
// All writes are fire-and-forget; nothing here ever blocks render.
//
// See migration 005_tracking.sql for the tables this writes to, and
// LLM-SEO/measurement-and-tracking-plan.md for the rationale (Phase 7).

import { supabase } from "@/integrations/supabase/client";

// Surfaces that we don't want appearing in /admin/ai-visibility — auth,
// configurator, admin itself, preview, tokenized reference pages.
const TRACKING_EXCLUDED_PREFIXES = [
  "/admin",
  "/configure",
  "/dashboard",
  "/preview",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/reference",
];

export function shouldLogVisit(pathname: string): boolean {
  if (!pathname) return false;
  return !TRACKING_EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function classifyDevice(ua: string | undefined): "mobile" | "tablet" | "desktop" | "unknown" {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (/(ipad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(lower)) return "tablet";
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|windows phone/i.test(lower)) return "mobile";
  return "desktop";
}

// Pull UTM-style params off the URL. Length-limited so a hostile query string
// can't blow up storage.
export function readUtmParams(search: string): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
} {
  try {
    const params = new URLSearchParams(search);
    const clip = (v: string | null) => (v ? v.slice(0, 120) : null);
    return {
      utm_source: clip(params.get("utm_source")),
      utm_medium: clip(params.get("utm_medium")),
      utm_campaign: clip(params.get("utm_campaign")),
    };
  } catch {
    return { utm_source: null, utm_medium: null, utm_campaign: null };
  }
}

// Insert one row into traffic_events. Truly fire-and-forget — caller doesn't
// await, the promise is intentionally swallowed.
export function logVisit(pathname: string): void {
  if (typeof window === "undefined") return; // SSR — never run server-side
  if (!shouldLogVisit(pathname)) return;

  // Inline guard against accidental double-fires from React StrictMode or
  // race-y route renders within ~250 ms of each other.
  const now = Date.now();
  const last = (window as unknown as { __lastVisitLog?: { path: string; t: number } }).__lastVisitLog;
  if (last && last.path === pathname && now - last.t < 250) return;
  (window as unknown as { __lastVisitLog?: { path: string; t: number } }).__lastVisitLog = {
    path: pathname,
    t: now,
  };

  const referrer = (document.referrer || "").slice(0, 500);
  const utm = readUtmParams(window.location.search);
  const device = classifyDevice(window.navigator?.userAgent);

  void supabase
    .from("traffic_events")
    .insert({
      referrer: referrer || null,
      landing_path: pathname.slice(0, 500),
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      device_type: device,
    })
    .then((res) => {
      // Don't surface tracking errors to the user — log so we can debug if
      // we suspect data is missing.
      if (res.error) console.warn("[tracking] visit-log insert failed", res.error);
    });
}

// ---------------------------------------------------------------------------
// Self-reported attribution — options shown on lead-capture forms.
// Single source of truth so the values stored in leads.source are consistent
// across surfaces (AI test, future contact forms).
// ---------------------------------------------------------------------------

export const SOURCE_OPTIONS = [
  "ChatGPT",
  "Claude",
  "Perplexity",
  "Google / Google AI",
  "Other AI assistant",
  "Search engine",
  "Social media",
  "Referral / word of mouth",
  "Other",
] as const;

export type SourceOption = (typeof SOURCE_OPTIONS)[number];

// Known AI-assistant referrer hostnames — used by the admin AI Visibility view
// to classify traffic_events rows as "AI-sourced."
export const AI_REFERRER_HOSTS = [
  "chatgpt.com",
  "chat.openai.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "meta.ai",
  "you.com",
  "grok.com",
];

export function isAiReferrer(referrer: string | null | undefined): boolean {
  if (!referrer) return false;
  try {
    const host = new URL(referrer).host.toLowerCase();
    return AI_REFERRER_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

export function isAiSource(source: string | null | undefined): boolean {
  if (!source) return false;
  const lower = source.toLowerCase();
  return (
    lower.includes("chatgpt") ||
    lower.includes("claude") ||
    lower.includes("perplexity") ||
    lower.includes("ai") // catches "Google / Google AI", "Other AI assistant"
  );
}
