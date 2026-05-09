import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
import { getLead, listProjects, updateLead } from "@/lib/lead-os-db";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  type Lead,
  type LeadStatus,
  type LeadUpdate,
  type ProjectWithStats,
} from "@/lib/lead-os-types";
import { ProjectStatusBadge, ProjectTypeBadge } from "./_components/StatusBadge";
import { formatCurrency, formatDate } from "./_components/format";
import { AddProjectDrawer } from "./_components/AddProjectDrawer";

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);
  const [projectDrawerOpen, setProjectDrawerOpen] = useState(false);

  const refresh = async () => {
    if (!id) return;
    try {
      const [l, ps] = await Promise.all([getLead(id), listProjects({ leadId: id })]);
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
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getLead(id), listProjects({ leadId: id })])
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
  }, [id]);

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

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-10 py-10 text-sm text-gray-500">Loading…</div>
      </AdminLayout>
    );
  }

  if (!lead) {
    return (
      <AdminLayout>
        <div className="px-10 py-10">
          <p className="text-sm text-gray-500 mb-4">Lead not found.</p>
          <Link to="/admin/leads" className="text-sm text-blue-400 hover:text-blue-300">
            ← Back to leads
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>{lead.name} — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10 max-w-3xl" key={lead.id}>
        <Link
          to="/admin/leads"
          className="text-xs text-gray-500 hover:text-white transition-colors mb-6 inline-block"
        >
          ← Leads
        </Link>

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

        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <input
              aria-label="Lead name"
              defaultValue={lead.name}
              onBlur={(e) => saveField("name", e.target.value.trim() || lead.name)}
              className="text-3xl font-extrabold text-white bg-transparent border-none outline-none w-full mb-1"
              style={{ letterSpacing: "-0.02em" }}
            />
            <p className="text-xs text-gray-500">
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
              onBlur={(e) => saveField("what_they_might_need", e.target.value.trim() || null)}
            />
          </FieldRow>
        </Section>

        <Section title="Notes">
          <Textarea
            rows={6}
            defaultValue={lead.notes ?? ""}
            placeholder="Running notes log — auto-saves when you click out."
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
            <p className="text-sm text-gray-500">No projects connected to this lead yet.</p>
          ) : (
            <ul>
              {projects.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/admin/projects/${p.id}`}
                    className="block py-3 px-4 rounded-md hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-sm font-medium text-white">{p.name}</span>
                      <div className="flex gap-2">
                        <ProjectTypeBadge type={p.project_type} />
                        <ProjectStatusBadge status={p.status} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
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
          className="rounded-2xl p-6 mt-8 text-sm text-gray-600"
          style={{
            backgroundColor: "rgba(255,255,255,0.01)",
            border: "1px dashed rgba(255,255,255,0.06)",
          }}
        >
          Outreach drafts — coming in Phase 2 (Claude-powered draft generator).
        </div>
      </div>

      <AddProjectDrawer
        open={projectDrawerOpen}
        onOpenChange={setProjectDrawerOpen}
        presetLeadId={lead.id}
        onCreated={() => {
          setProjectDrawerOpen(false);
          refresh();
        }}
      />
    </AdminLayout>
  );
};

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
      <h2 className="text-xs uppercase tracking-widest text-gray-500 font-medium">
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
    <Label className="text-xs text-gray-500 mb-1 block">{label}</Label>
    {children}
  </div>
);

export default LeadDetail;
