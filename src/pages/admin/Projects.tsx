import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { listProjects } from "@/lib/lead-os-db";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABEL,
  type ProjectStatus,
} from "@/lib/lead-os-types";
import { ProjectStatusBadge, ProjectTypeBadge } from "./_components/StatusBadge";
import { formatCurrency } from "./_components/format";
import { AddProjectDrawer } from "./_components/AddProjectDrawer";
import { admin } from "./_components/theme";
import {
  AdminPageHeader,
  AdminCard,
  SkeletonBlock,
  ErrorBanner,
  EmptyState,
} from "./_components/ui";

type Filter = "all" | ProjectStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  ...PROJECT_STATUSES.map((s) => ({ value: s as Filter, label: PROJECT_STATUS_LABEL[s] })),
];

const PROJECTS_KEY = ["admin", "projects"] as const;

const Projects = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: () => listProjects(),
  });
  const [filter, setFilter] = useState<Filter>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loading = isLoading && projects.length === 0;
  const errMsg = error instanceof Error ? error.message : null;

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const p of projects) acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, [projects]);

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [filter, projects],
  );

  return (
    <AdminLayout>
      <Helmet>
        <title>Projects, Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10">
        <AdminPageHeader
          title="Projects"
          className="mb-8"
          actions={<Button onClick={() => setDrawerOpen(true)}>+ New Project</Button>}
        />

        <div
          className="inline-flex flex-wrap items-center gap-1 rounded-full p-1 mb-6"
          style={{
            backgroundColor: admin.surface,
            border: `1px solid ${admin.border}`,
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const count = f.value === "all" ? projects.length : counts[f.value] ?? 0;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? admin.surface2 : "transparent",
                  color: active ? admin.text : admin.textMuted,
                }}
              >
                {f.label}
                <span
                  className="ml-2 font-mono text-[11px]"
                  style={{ color: admin.textMuted }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {errMsg && (
          <div className="mb-6">
            <ErrorBanner>{errMsg}</ErrorBanner>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState>
            {filter === "all"
              ? "No projects yet. Click + New Project to create one."
              : `No projects in '${PROJECT_STATUS_LABEL[filter]}' yet.`}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {visible.map((p) => (
              <Link
                key={p.id}
                to={`/admin/projects/${p.id}`}
                className="block transition-colors"
              >
                <AdminCard className="hover:[background-color:rgba(255,255,255,0.04)]">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="min-w-0">
                      <p
                        className="text-base font-semibold"
                        style={{ color: admin.text, letterSpacing: "-0.01em" }}
                      >
                        {p.name}
                      </p>
                      {p.lead_name ? (
                        <p className="text-xs mt-0.5" style={{ color: admin.textMuted }}>
                          {p.lead_name}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <ProjectTypeBadge type={p.project_type} />
                      <ProjectStatusBadge status={p.status} />
                    </div>
                  </div>

                  <div
                    className="flex flex-wrap gap-x-5 gap-y-1 text-xs"
                    style={{ color: admin.textMuted }}
                  >
                    <span>
                      {p.hours_logged.toFixed(1)} /{" "}
                      {p.estimated_hours != null ? Number(p.estimated_hours).toFixed(1) : "-"} hrs
                    </span>
                    <span>{formatCurrency(p.amount_billed)} billed</span>
                    <span>${Number(p.hourly_rate).toFixed(0)}/hr</span>
                  </div>
                </AdminCard>
              </Link>
            ))}
          </div>
        )}
      </div>

      <AddProjectDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onCreated={(projectId) => {
          setDrawerOpen(false);
          qc.invalidateQueries({ queryKey: PROJECTS_KEY });
          navigate(`/admin/projects/${projectId}`);
        }}
      />
    </AdminLayout>
  );
};

export default Projects;
