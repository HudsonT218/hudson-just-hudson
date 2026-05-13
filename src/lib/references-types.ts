// References collection — domain types.
// Mirrors supabase/migrations/003_references_system.sql.
// snake_case fields match DB rows directly.

export type ReferenceRequestStatus = "pending" | "submitted" | "expired" | "revoked";

export const REFERENCE_REQUEST_STATUSES: ReferenceRequestStatus[] = [
  "pending",
  "submitted",
  "expired",
  "revoked",
];

export const REFERENCE_REQUEST_STATUS_LABEL: Record<ReferenceRequestStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  expired: "Expired",
  revoked: "Revoked",
};

export type ReferenceStatus = "pending_review" | "approved" | "rejected" | "hidden";

export const REFERENCE_STATUSES: ReferenceStatus[] = [
  "pending_review",
  "approved",
  "rejected",
  "hidden",
];

export const REFERENCE_STATUS_LABEL: Record<ReferenceStatus, string> = {
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  hidden: "Hidden",
};

export interface ReferenceRequest {
  id: string;
  created_at: string;
  invited_email: string;
  invited_name: string | null;
  token: string;
  expires_at: string;
  submitted_at: string | null;
  status: ReferenceRequestStatus;
  notes: string | null;
}

export interface Reference {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  role_title: string;
  email: string;
  headline: string;
  linkedin_url: string | null;
  status: ReferenceStatus;
  approved_at: string | null;
  display_order: number;
}

export interface ReferenceWithRequest extends Reference {
  invited_email: string | null;
}

// Shape of the approved_references_public view — safe for public consumption.
export interface PublicApprovedReference {
  id: string;
  name: string;
  role_title: string;
  headline: string;
  linkedin_url: string | null;
  display_order: number;
  created_at: string;
}
