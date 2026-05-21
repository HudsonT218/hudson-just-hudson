// Lead Management OS — domain types.
// These mirror the schema in supabase/migrations/002_lead_os_schema.sql.
// Field names are snake_case to match the DB rows directly (no mapper layer).

export type LeadStatus = "cold" | "warm" | "client" | "dead";

export const LEAD_STATUSES: LeadStatus[] = ["cold", "warm", "client", "dead"];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  cold: "Cold",
  warm: "Warm",
  client: "Client",
  dead: "Dead",
};

export type ProjectType = "web" | "ai" | "software" | "automation";

export const PROJECT_TYPES: ProjectType[] = ["web", "ai", "software", "automation"];

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  web: "Web",
  ai: "AI",
  software: "Software",
  automation: "Automation",
};

export type ProjectStatus =
  | "discovery"
  | "proposal_sent"
  | "active"
  | "delivered"
  | "invoiced"
  | "paid"
  | "cancelled";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "discovery",
  "proposal_sent",
  "active",
  "delivered",
  "invoiced",
  "paid",
  "cancelled",
];

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  discovery: "Discovery",
  proposal_sent: "Proposal Sent",
  active: "Active",
  delivered: "Delivered",
  invoiced: "Invoiced",
  paid: "Paid",
  cancelled: "Cancelled",
};

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  how_i_know_them: string | null;
  what_they_might_need: string | null;
  status: LeadStatus;
  last_contact_date: string | null;
  next_action: string | null;
  next_action_date: string | null;
  notes: string | null;
  // Self-reported attribution from the AI test (and future lead-capture
  // forms). One of SOURCE_OPTIONS in lib/tracking.ts. NULL for older leads.
  source: string | null;
}

export type LeadInsert = Omit<Lead, "id" | "created_at" | "updated_at">;
export type LeadUpdate = Partial<LeadInsert>;

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  lead_id: string | null;
  name: string;
  description: string | null;
  project_type: ProjectType;
  status: ProjectStatus;
  hourly_rate: number;
  estimated_hours: number | null;
  notes: string | null;
  start_date: string | null;
  target_date: string | null;
}

export type ProjectInsert = Omit<Project, "id" | "created_at" | "updated_at">;
export type ProjectUpdate = Partial<ProjectInsert>;

export interface TimeEntry {
  id: string;
  created_at: string;
  project_id: string;
  date: string;
  hours: number;
  description: string;
}

export type TimeEntryInsert = Omit<TimeEntry, "id" | "created_at">;

export interface ProjectWithStats extends Project {
  hours_logged: number;
  amount_billed: number;
  lead_name: string | null;
}
