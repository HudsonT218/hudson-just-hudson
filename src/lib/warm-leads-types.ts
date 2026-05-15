// Warm Lead Generation — domain types.
// Mirrors supabase/migrations/003_warm_leads_schema.sql.
// snake_case to match DB rows directly (same convention as lead-os-types).

// ----------------------------------------------------------------------------
// Sources
// ----------------------------------------------------------------------------
export type WarmLeadSourceId =
  | "hackernews"
  | "github_issues"
  | "bluesky"
  | "reddit";

export const WARM_LEAD_SOURCE_IDS: WarmLeadSourceId[] = [
  "hackernews",
  "github_issues",
  "bluesky",
  "reddit",
];

export const WARM_LEAD_SOURCE_LABEL: Record<WarmLeadSourceId, string> = {
  hackernews: "Hacker News",
  github_issues: "GitHub Issues",
  bluesky: "Bluesky",
  reddit: "Reddit",
};

export interface WarmLeadSource {
  id: WarmLeadSourceId;
  label: string;
  enabled: boolean;
  config: Record<string, unknown>;
  last_run_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export type WarmLeadSourceUpdate = Partial<
  Pick<WarmLeadSource, "enabled" | "config">
>;

// ----------------------------------------------------------------------------
// Settings
// ----------------------------------------------------------------------------
export type WarmLeadMode = "capped" | "always_on" | "paused";

export const WARM_LEAD_MODES: WarmLeadMode[] = ["capped", "always_on", "paused"];

export const WARM_LEAD_MODE_LABEL: Record<WarmLeadMode, string> = {
  capped: "Capped (5–10 / week)",
  always_on: "Always-on",
  paused: "Paused",
};

export const WARM_LEAD_MODE_HELP: Record<WarmLeadMode, string> = {
  capped:
    "Stops surfacing new leads once the weekly target is hit. Threshold auto-tunes to keep you to ~the requested volume.",
  always_on:
    "Surfaces every candidate that clears the threshold. Use during a focused outreach push.",
  paused: "Scraper is off. No new leads will be discovered.",
};

export interface WarmLeadSettings {
  id: "singleton";
  mode: WarmLeadMode;
  target_per_week: number;
  threshold: number;
  outreach_voice: string;
  week_started_on: string;
  this_week_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export type WarmLeadSettingsUpdate = Partial<
  Pick<
    WarmLeadSettings,
    "mode" | "target_per_week" | "threshold" | "outreach_voice"
  >
>;

// ----------------------------------------------------------------------------
// Warm Leads
// ----------------------------------------------------------------------------
export type WarmLeadStatus =
  | "new"
  | "approved"
  | "sent"
  | "rejected"
  | "converted"
  | "dismissed";

export const WARM_LEAD_STATUSES: WarmLeadStatus[] = [
  "new",
  "approved",
  "sent",
  "rejected",
  "converted",
  "dismissed",
];

export const WARM_LEAD_STATUS_LABEL: Record<WarmLeadStatus, string> = {
  new: "New",
  approved: "Approved",
  sent: "Sent",
  rejected: "Rejected",
  converted: "Converted",
  dismissed: "Dismissed",
};

export interface WarmLead {
  id: string;
  created_at: string;
  updated_at: string;
  source_id: WarmLeadSourceId;
  external_id: string;
  url: string;
  author_handle: string | null;
  author_display_name: string | null;
  posted_at: string | null;
  raw_title: string | null;
  raw_excerpt: string;
  score: number;
  score_reasoning: string | null;
  matched_keywords: string[];
  drafted_message: string | null;
  draft_generated_at: string | null;
  status: WarmLeadStatus;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  promoted_lead_id: string | null;
}

export interface WarmLeadWithSource extends WarmLead {
  source_label: string;
}

export type WarmLeadUpdate = Partial<
  Pick<
    WarmLead,
    "status" | "reviewer_notes" | "drafted_message" | "promoted_lead_id"
  >
>;

// ----------------------------------------------------------------------------
// Stats (computed in the data layer)
// ----------------------------------------------------------------------------
export interface WarmLeadStats {
  total_new: number;
  total_this_week: number;
  total_sent_this_week: number;
  conversion_rate_30d: number; // 0–1, sent → converted
  avg_score_30d: number;
}
