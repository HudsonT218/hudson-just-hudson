// References collection — data access layer.
// The auto-generated Database type does not yet include the reference_requests,
// references, or approved_references_public view; until regeneration the client
// is cast to `any` and typing is enforced at the function boundary.
import { supabase as sharedClient } from "@/integrations/supabase/client";
import type {
  PublicApprovedReference,
  Reference,
  ReferenceRequest,
  ReferenceStatus,
  ReferenceWithRequest,
} from "./references-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = sharedClient as any;

// ============================================================================
// Reference requests (admin)
// ============================================================================

export async function listReferenceRequests(): Promise<ReferenceRequest[]> {
  const { data, error } = await supabase
    .from("reference_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReferenceRequest[];
}

export async function revokeReferenceRequest(id: string): Promise<void> {
  const { error } = await supabase
    .from("reference_requests")
    .update({ status: "revoked" })
    .eq("id", id);
  if (error) throw error;
}

// ============================================================================
// References (admin)
// ============================================================================

export async function listPendingReviewReferences(): Promise<ReferenceWithRequest[]> {
  const { data, error } = await supabase
    .from("references")
    .select("*, reference_requests!inner(invited_email)")
    .eq("status", "pending_review")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as Array<Reference & { reference_requests: { invited_email: string } | null }>).map(
    ({ reference_requests, ...ref }) => ({
      ...ref,
      invited_email: reference_requests?.invited_email ?? null,
    }),
  );
}

export async function listArchivedReferences(): Promise<Reference[]> {
  const { data, error } = await supabase
    .from("references")
    .select("*")
    .in("status", ["rejected", "hidden"])
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Reference[];
}

export async function updateReferenceStatus(
  id: string,
  status: ReferenceStatus,
): Promise<Reference> {
  const patch: Record<string, unknown> = { status };
  if (status === "approved") patch.approved_at = new Date().toISOString();
  const { data, error } = await supabase
    .from("references")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Reference;
}

export async function updateReferenceDisplayOrder(
  updates: { id: string; display_order: number }[],
): Promise<void> {
  await Promise.all(
    updates.map(({ id, display_order }) =>
      supabase.from("references").update({ display_order }).eq("id", id),
    ),
  );
}

// ============================================================================
// Public
// ============================================================================

export async function listApprovedReferencesPublic(): Promise<PublicApprovedReference[]> {
  const { data, error } = await supabase
    .from("approved_references_public")
    .select("*");
  if (error) throw error;
  return (data ?? []) as PublicApprovedReference[];
}
