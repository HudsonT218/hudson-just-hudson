import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createTimeEntry,
  deleteTimeEntry,
  getLead,
  getProject,
  listTimeEntries,
  updateProject,
} from "@/lib/lead-os-db";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABEL,
  PROJECT_TYPES,
  PROJECT_TYPE_LABEL,
  type Lead,
  type Project,
  type ProjectStatus,
  type ProjectType,
  type ProjectUpdate,
  type TimeEntry,
} from "@/lib/lead-os-types";
import { formatCurrency, formatDate, todayISO } from "./_components/format";

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [lead, setLead] = useState<Lead | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<string | null>(null);

  // Time entry form
  const [logDate, setLogDate] = useState(todayISO());
  const [logHours, setLogHours] = useState("");
  const [logDesc, setLogDesc] = useState("");
  const [logging, setLogging] = useState(false);

  const refresh = async () => {
    if (!id) return;
    try {
      const p = await getProject(id);
      setProject(p);
      const [es, l] = await Promise.all([
        listTimeEntries(id),
        p?.lead_id ? getLead(p.lead_id) : Promise.resolve(null),
      ]);
      setEntries(es);
      setLead(l);
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
    (async () => {
      try {
        const p = await getProject(id);
        if (cancelled) return;
        setProject(p);
        const [es, l] = await Promise.all([
          listTimeEntries(id),
          p?.lead_id ? getLead(p.lead_id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setEntries(es);
        setLead(l);
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const saveField = async <K extends keyof ProjectUpdate>(
    field: K,
    value: ProjectUpdate[K],
  ) => {
    if (!project) return;
    if (project[field as keyof Project] === value) return;
    setSavingField(String(field));
    try {
      const updated = await updateProject(project.id, { [field]: value } as ProjectUpdate);
      setProject(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingField(null);
    }
  };

  const handleLogTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const hoursNum = Number(logHours);
    if (!Number.isFinite(hoursNum) || hoursNum <= 0) {
      setError("Hours must be a positive number.");
      return;
    }
    if (!logDesc.trim()) {
      setError("Description is required.");
      return;
    }
    setLogging(true);
    setError(null);
    try {
      await createTimeEntry({
        project_id: project.id,
        date: logDate,
        hours: hoursNum,
        description: logDesc.trim(),
      });
      setLogHours("");
      setLogDesc("");
      const es = await listTimeEntries(project.id);
      setEntries(es);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to log time");
    } finally {
      setLogging(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!project) return;
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    try {
      await deleteTimeEntry(entryId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      const es = await listTimeEntries(project.id);
      setEntries(es);
    }
  };

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);
  const totalBilled = project ? totalHours * Number(project.hourly_rate) : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="px-10 py-10 text-sm text-gray-500">Loading…</div>
      </AdminLayout>
    );
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="px-10 py-10">
          <p className="text-sm text-gray-500 mb-4">Project not found.</p>
          <Link to="/admin/projects" className="text-sm text-blue-400 hover:text-blue-300">
            ← Back to projects
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Helmet>
        <title>{project.name} — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10 max-w-3xl" key={project.id}>
        <Link
          to="/admin/projects"
          className="text-xs text-gray-500 hover:text-white transition-colors mb-6 inline-block"
        >
          ← Projects
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
              aria-label="Project name"
              defaultValue={project.name}
              onBlur={(e) => saveField("name", e.target.value.trim() || project.name)}
              className="text-3xl font-extrabold text-white bg-transparent border-none outline-none w-full mb-1"
              style={{ letterSpacing: "-0.02em" }}
            />
            <p className="text-xs text-gray-500">
              {lead ? (
                <>
                  Client:{" "}
                  <Link
                    to={`/admin/leads/${lead.id}`}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {lead.name}
                  </Link>
                </>
              ) : (
                "No client connected"
              )}
              {savingField ? " · saving…" : ""}
            </p>
          </div>
          <Select
            value={project.status}
            onValueChange={(v) => saveField("status", v as ProjectStatus)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PROJECT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Section title="Info">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Type</Label>
              <Select
                value={project.project_type}
                onValueChange={(v) => saveField("project_type", v as ProjectType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {PROJECT_TYPE_LABEL[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Hourly rate</Label>
              <Input
                type="number"
                inputMode="decimal"
                defaultValue={project.hourly_rate}
                onBlur={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n > 0) saveField("hourly_rate", n);
                }}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Estimated hours</Label>
              <Input
                type="number"
                inputMode="decimal"
                defaultValue={project.estimated_hours ?? ""}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  saveField("estimated_hours", v === "" ? null : Number(v));
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Start date</Label>
              <Input
                type="date"
                defaultValue={project.start_date ?? ""}
                onBlur={(e) => saveField("start_date", e.target.value || null)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Target date</Label>
              <Input
                type="date"
                defaultValue={project.target_date ?? ""}
                onBlur={(e) => saveField("target_date", e.target.value || null)}
              />
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs text-gray-500 mb-1 block">Description</Label>
            <Textarea
              rows={2}
              defaultValue={project.description ?? ""}
              onBlur={(e) => saveField("description", e.target.value.trim() || null)}
            />
          </div>
        </Section>

        <Section title="Log Time">
          <form onSubmit={handleLogTime} className="grid grid-cols-12 gap-3 mb-4">
            <div className="col-span-3">
              <Input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                inputMode="decimal"
                placeholder="Hours"
                value={logHours}
                onChange={(e) => setLogHours(e.target.value)}
                required
                step="0.25"
                min="0"
              />
            </div>
            <div className="col-span-5">
              <Input
                placeholder="What did you work on?"
                value={logDesc}
                onChange={(e) => setLogDesc(e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <Button type="submit" disabled={logging} className="w-full">
                {logging ? "…" : "Log"}
              </Button>
            </div>
          </form>

          {entries.length === 0 ? (
            <p className="text-sm text-gray-500">No time logged yet.</p>
          ) : (
            <div
              className="rounded-md overflow-hidden"
              style={{
                backgroundColor: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium px-4 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium px-4 py-3">
                      Hrs
                    </th>
                    <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium px-4 py-3">
                      Description
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr
                      key={e.id}
                      style={{
                        borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                      }}
                    >
                      <td className="px-4 py-3 text-gray-400 font-light whitespace-nowrap">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-3 text-white font-mono">
                        {Number(e.hours).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-gray-300 font-light">{e.description}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteEntry(e.id)}
                          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
                          aria-label="Delete entry"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td className="px-4 py-3 text-xs uppercase tracking-widest text-gray-500 font-medium">
                      Total
                    </td>
                    <td className="px-4 py-3 text-white font-mono">{totalHours.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-400 font-light">
                      {formatCurrency(totalBilled)} billed
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Section>

        <Section title="Notes">
          <Textarea
            rows={5}
            defaultValue={project.notes ?? ""}
            placeholder="Project notes — auto-saves on blur."
            onBlur={(e) => saveField("notes", e.target.value.trim() || null)}
          />
        </Section>

        <div
          className="rounded-2xl p-6 mt-8 text-sm text-gray-600"
          style={{
            backgroundColor: "rgba(255,255,255,0.01)",
            border: "1px dashed rgba(255,255,255,0.06)",
          }}
        >
          Proposal — coming in Phase 2.
        </div>

        <div
          className="rounded-2xl p-6 mt-3 text-sm text-gray-600"
          style={{
            backgroundColor: "rgba(255,255,255,0.01)",
            border: "1px dashed rgba(255,255,255,0.06)",
          }}
        >
          Contract & Payment — coming in Phase 3.
        </div>
      </div>
    </AdminLayout>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="mb-8">
    <h2 className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
      {title}
    </h2>
    {children}
  </section>
);

export default ProjectDetail;
