// Lead Management OS — data access layer.
// Wraps the shared Supabase client with helpers for leads, projects, and
// time_entries. The auto-generated Database type in src/integrations/supabase/types.ts
// won't include these tables until the 002 migration has been applied and Lovable
// regenerates that file. Until then, the client is cast to `any` for these queries —
// domain typing is enforced at the function boundary via hand-rolled types in
// ./lead-os-types.ts.
import { supabase as sharedClient } from "@/integrations/supabase/client";
import type {
  Lead,
  LeadInsert,
  LeadStatus,
  LeadUpdate,
  Project,
  ProjectInsert,
  ProjectStatus,
  ProjectUpdate,
  ProjectWithStats,
  TimeEntry,
  TimeEntryInsert,
} from "./lead-os-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = sharedClient as any;

// ============================================================================
// Leads
// ============================================================================

export async function listLeads(filter?: { status?: LeadStatus }): Promise<Lead[]> {
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (filter?.status) q = q.eq("status", filter.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase.from("leads").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Lead;
}

export async function createLead(input: LeadInsert): Promise<Lead> {
  const { data, error } = await supabase.from("leads").insert(input).select("*").single();
  if (error) throw error;
  return data as Lead;
}

export async function updateLead(id: string, patch: LeadUpdate): Promise<Lead> {
  const { data, error } = await supabase
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Projects
// ============================================================================

export async function listProjects(filter?: {
  status?: ProjectStatus | ProjectStatus[];
  leadId?: string;
}): Promise<ProjectWithStats[]> {
  let q = supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (filter?.status) {
    q = Array.isArray(filter.status)
      ? q.in("status", filter.status)
      : q.eq("status", filter.status);
  }
  if (filter?.leadId) q = q.eq("lead_id", filter.leadId);
  const { data: projects, error } = await q;
  if (error) throw error;
  if (!projects || projects.length === 0) return [];

  const projectIds = projects.map((p) => p.id);
  const leadIds = Array.from(new Set(projects.map((p) => p.lead_id).filter((x): x is string => !!x)));

  const [{ data: entries }, { data: leads }] = await Promise.all([
    supabase.from("time_entries").select("project_id, hours").in("project_id", projectIds),
    leadIds.length > 0
      ? supabase.from("leads").select("id, name").in("id", leadIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const hoursByProject = new Map<string, number>();
  for (const e of (entries ?? []) as { project_id: string; hours: number }[]) {
    hoursByProject.set(e.project_id, (hoursByProject.get(e.project_id) ?? 0) + Number(e.hours));
  }
  const leadNameById = new Map<string, string>();
  for (const l of (leads ?? []) as { id: string; name: string }[]) {
    leadNameById.set(l.id, l.name);
  }

  return (projects as Project[]).map((p) => {
    const hours = hoursByProject.get(p.id) ?? 0;
    return {
      ...p,
      hours_logged: hours,
      amount_billed: hours * Number(p.hourly_rate),
      lead_name: p.lead_id ? (leadNameById.get(p.lead_id) ?? null) : null,
    };
  });
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Project;
}

export async function createProject(input: ProjectInsert): Promise<Project> {
  const { data, error } = await supabase.from("projects").insert(input).select("*").single();
  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, patch: ProjectUpdate): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Project;
}

// ============================================================================
// Time Entries
// ============================================================================

export async function listTimeEntries(projectId: string): Promise<TimeEntry[]> {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("project_id", projectId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TimeEntry[];
}

export async function createTimeEntry(input: TimeEntryInsert): Promise<TimeEntry> {
  const { data, error } = await supabase
    .from("time_entries")
    .insert(input)
    .select("*")
    .single();
  if (error) throw error;
  return data as TimeEntry;
}

export async function deleteTimeEntry(id: string): Promise<void> {
  const { error } = await supabase.from("time_entries").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// Dashboard aggregates
// ============================================================================

export interface DashboardStats {
  cold_count: number;
  warm_count: number;
  active_project_count: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [cold, warm, active] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "cold"),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "warm"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
  ]);
  return {
    cold_count: cold.count ?? 0,
    warm_count: warm.count ?? 0,
    active_project_count: active.count ?? 0,
  };
}

export async function listNextActions(): Promise<Lead[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .not("next_action_date", "is", null)
    .lte("next_action_date", today)
    .order("next_action_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Lead[];
}

export async function listActiveDashboardProjects(): Promise<ProjectWithStats[]> {
  return listProjects({ status: ["active", "proposal_sent"] });
}
