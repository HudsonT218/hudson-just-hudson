// Warm Lead Generation — domain types.
// Mirrors supabase/migrations/{003,004}_warm_leads_*.sql.
// snake_case to match DB rows directly (same convention as lead-os-types).

// ----------------------------------------------------------------------------
// Sources
// ----------------------------------------------------------------------------
export type WarmLeadSourceId = "reddit" | "linkedin";

export const WARM_LEAD_SOURCE_IDS: WarmLeadSourceId[] = ["reddit", "linkedin"];

export const WARM_LEAD_SOURCE_LABEL: Record<WarmLeadSourceId, string> = {
  reddit: "Reddit",
  linkedin: "LinkedIn",
};

// 'edge_function' sources are scraped by supabase/functions/scrape-warm-leads.
// 'local_agent'  sources are pushed in by a browser agent running on Hudson's
// PC (Hermes) via supabase/functions/intake-warm-lead. The kind determines
// which runtime owns the source's execution.
export type WarmLeadSourceKind = "edge_function" | "local_agent";

export const WARM_LEAD_SOURCE_KIND_LABEL: Record<WarmLeadSourceKind, string> = {
  edge_function: "Cloud",
  local_agent: "Mac",
};

export interface WarmLeadSource {
  id: WarmLeadSourceId;
  label: string;
  kind: WarmLeadSourceKind;
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
// Settings (singleton row)
// ----------------------------------------------------------------------------
export interface WarmLeadSettings {
  id: "singleton";
  // Master on/off. When false, the scraper bails out early and the intake
  // endpoint rejects everything with reason=automation_off.
  enabled: boolean;
  // "Find me N leads per run". Each Run-Now (or each Hermes session) stops
  // inserting once it has surfaced this many above-threshold candidates.
  target_per_run: number;
  // Min classifier score (0–100) for a candidate to enter the inbox.
  threshold: number;
  // Voice/context Hudson's drafting LLM uses when writing replies.
  outreach_voice: string;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

export type WarmLeadSettingsUpdate = Partial<
  Pick<
    WarmLeadSettings,
    "enabled" | "target_per_run" | "threshold" | "outreach_voice"
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
