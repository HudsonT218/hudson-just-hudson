import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteLead, getLead, listProjects, updateLead } from "@/lib/lead-os-db";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
  type LeadUpdate,
  type ProjectWithStats,
} from "@/lib/lead-os-types";
import { ProjectStatusBadge, ProjectTypeBadge } from "./StatusBadge";
import { formatCurrency, formatDate } from "./format";
import { AddProjectDrawer } from "./AddProjectDrawer";
import { admin } from "./theme";

export function LeadDetailModal({
  leadId,
  open,
  onClose,
}: {
  leadId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);

  const refresh = async () => {
    if (!leadId) return;
    try {
      const [l, ps] = await Promise.all([getLead(leadId), listProjects({ leadId })]);
      setLead(l);
      setProjects(ps);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!leadId) return;
    let cancelled = false;
    setLoading(true);
    setLead(null);
    Promise.all([getLead(leadId), listProjects({ leadId })])
      .then(([l, ps]) => {
        if (cancelled) return;
        setLead(l);
        setProjects(ps);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  const saveField = async <K extends keyof LeadUpdate>(field: K, value: LeadUpdate[K]) => {
    if (!lead) return;
    if (lead[field as keyof Lead] === value) return;
    setSavingField(String(field));
    try {
      const updated = await updateLead(lead.id, { [field]: value } as LeadUpdate);
      setLead(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingField(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent
          className="max-w-3xl w-full p-0 overflow-hidden flex flex-col"
          style={{
            backgroundColor: admin.bg,
            border: `1px solid ${admin.border}`,
            color: admin.text,
            maxHeight: "85vh",
          }}
        >
          <VisuallyHidden>
            <DialogTitle>{lead?.name ?? "Lead"}</DialogTitle>
          </VisuallyHidden>

          {loading ? (
            <div className="px-6 py-10 text-sm" style={{ color: admin.textDim }}>
              Loading…
            </div>
          ) : !lead ? (
            <div className="px-6 py-10">
              <p className="text-sm mb-4" style={{ color: admin.textDim }}>
                Lead not found.
              </p>
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                className="flex items-start justify-between gap-4 px-6 py-4 shrink-0"
                style={{ borderBottom: `1px solid ${admin.border}` }}
              >
                <div className="flex-1 min-w-0 pr-8">
                  <input
                    aria-label="Lead name"
                    key={lead.id}
                    defaultValue={lead.name}
                    onBlur={(e) => saveField("name", e.target.value.trim() || lead.name)}
                    className="text-2xl font-semibold bg-transparent border-none outline-none w-full"
                    style={{ color: admin.text, letterSpacing: "-0.02em" }}
                  />
                  <p className="text-xs mt-1" style={{ color: admin.textDim }}>
                    Last updated {formatDate(lead.updated_at)}
                    {savingField ? " · saving…" : ""}
                  </p>
                </div>
                <Select
                  value={lead.status}
                  onValueChange={(v) => saveField("status", v as LeadStatus)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {LEAD_STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto px-6 py-5" key={lead.id}>
                {error && (
                  <div
                    className="mb-6 rounded-md p-4 text-sm text-red-300"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.2)",
                    }}
                  >
                    {error}
                  </div>
                )}

                <Section title="Info">
                  <div className="grid grid-cols-2 gap-4">
                    <FieldRow label="Email">
                      <Input
                        defaultValue={lead.email ?? ""}
                        onBlur={(e) => saveField("email", e.target.value.trim() || null)}
                      />
                    </FieldRow>
                    <FieldRow label="Phone">
                      <Input
                        defaultValue={lead.phone ?? ""}
                        onBlur={(e) => saveField("phone", e.target.value.trim() || null)}
                      />
                    </FieldRow>
                    <FieldRow label="Company">
                      <Input
                        defaultValue={lead.company ?? ""}
                        onBlur={(e) => saveField("company", e.target.value.trim() || null)}
                      />
                    </FieldRow>
                    <FieldRow label="Last contact">
                      <Input
                        type="date"
                        defaultValue={lead.last_contact_date ?? ""}
                        onBlur={(e) => saveField("last_contact_date", e.target.value || null)}
                      />
                    </FieldRow>
                  </div>
                  <FieldRow label="How I know them">
                    <Input
                      defaultValue={lead.how_i_know_them ?? ""}
                      onBlur={(e) => saveField("how_i_know_them", e.target.value.trim() || null)}
                    />
                  </FieldRow>
                  <FieldRow label="What they might need">
                    <Textarea
                      rows={3}
                      defaultValue={lead.what_they_might_need ?? ""}
                      onBlur={(e) =>
                        saveField("what_they_might_need", e.target.value.trim() || null)
                      }
                    />
                  </FieldRow>
                </Section>

                <Section title="Notes">
                  <Textarea
                    rows={6}
                    defaultValue={lead.notes ?? ""}
                    placeholder="Running notes log, auto-saves when you click out."
                    onBlur={(e) => saveField("notes", e.target.value.trim() || null)}
                  />
                </Section>

                <Section title="Next Action">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Input
                        placeholder="What's next?"
                        defaultValue={lead.next_action ?? ""}
                        onBlur={(e) => saveField("next_action", e.target.value.trim() || null)}
                      />
                    </div>
                    <Input
                      type="date"
                      defaultValue={lead.next_action_date ?? ""}
                      onBlur={(e) => saveField("next_action_date", e.target.value || null)}
                    />
                  </div>
                </Section>

                <Section
                  title="Projects"
                  action={
                    <Button size="sm" onClick={() => setProjectDrawerOpen(true)}>
                      + New Project
                    </Button>
                  }
                >
                  {projects.length === 0 ? (
                    <p className="text-sm" style={{ color: admin.textDim }}>
                      No projects connected to this lead yet.
                    </p>
                  ) : (
                    <ul>
                      {projects.map((p) => (
                        <li key={p.id}>
                          <Link
                            to={`/admin/projects/${p.id}`}
                            className="block py-3 px-4 rounded-md hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <span className="text-sm font-medium" style={{ color: admin.text }}>
                                {p.name}
                              </span>
                              <div className="flex gap-2">
                                <ProjectTypeBadge type={p.project_type} />
                                <ProjectStatusBadge status={p.status} />
                              </div>
                            </div>
                            <p className="text-xs" style={{ color: admin.textDim }}>
                              {p.hours_logged.toFixed(1)} hrs ·{" "}
                              {formatCurrency(p.amount_billed)} billed
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>

                <div
                  className="rounded-2xl p-6 mt-8 text-sm"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.01)",
                    border: `1px dashed ${admin.border}`,
                    color: admin.textDim,
                  }}
                >
                  Outreach drafts, coming in Phase 2 (Claude-powered draft generator).
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {lead && (
        <AddProjectDrawer
          open={projectDrawerOpen}
          onOpenChange={setProjectDrawerOpen}
          presetLeadId={lead.id}
          onCreated={() => {
            setProjectDrawerOpen(false);
            refresh();
          }}
        />
      )}
    </>
  );
}

const Section = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <div className="flex items-center justify-between mb-3">
      <h2
        className="text-[10px] uppercase font-medium"
        style={{ color: admin.textDim, letterSpacing: "0.14em" }}
      >
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

const FieldRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-3">
    <Label className="text-xs mb-1 block" style={{ color: admin.textDim }}>
      {label}
    </Label>
    {children}
  </div>
);

export default LeadDetailModal;
