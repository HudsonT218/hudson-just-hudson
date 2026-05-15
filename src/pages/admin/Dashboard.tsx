import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  getDashboardStats,
  listActiveDashboardProjects,
  listNextActions,
} from "@/lib/lead-os-db";
import {
  LEAD_STATUS_LABEL,
  PROJECT_STATUS_LABEL,
} from "@/lib/lead-os-types";
import { getWarmLeadStats, listWarmLeads } from "@/lib/warm-leads-db";
import { LeadStatusBadge, ProjectStatusBadge } from "./_components/StatusBadge";
import {
  WarmLeadScorePill,
  WarmLeadStatusBadge,
} from "./_components/WarmLeadStatusBadge";
import { formatCurrency, formatDate } from "./_components/format";

const Dashboard = () => {
  const statsQ = useQuery({ queryKey: ["admin", "dashboard-stats"], queryFn: getDashboardStats });
  const naQ = useQuery({ queryKey: ["admin", "next-actions"], queryFn: listNextActions });
  const apQ = useQuery({ queryKey: ["admin", "active-projects"], queryFn: listActiveDashboardProjects });
  const wlStatsQ = useQuery({
    queryKey: ["admin", "warm-leads", "stats"],
    queryFn: getWarmLeadStats,
  });
  const wlNewQ = useQuery({
    queryKey: ["admin", "warm-leads", "list", "new-preview"],
    queryFn: () => listWarmLeads({ status: "new", limit: 5 }),
  });

  const stats = statsQ.data;
  const nextActions = naQ.data ?? [];
  const activeProjects = apQ.data ?? [];
  const warmStats = wlStatsQ.data;
  const newWarmLeads = wlNewQ.data ?? [];
  const loading = (statsQ.isLoading || naQ.isLoading || apQ.isLoading) && !stats;
  const error = ((statsQ.error ?? naQ.error ?? apQ.error) as Error | null)?.message ?? null;

  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10">
        <h1
          className="text-2xl font-extrabold text-white mb-8"
          style={{ letterSpacing: "-0.02em" }}
        >
          Dashboard
        </h1>

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Cold leads" value={stats?.cold_count ?? "—"} loading={loading} />
          <StatCard label="Warm leads" value={stats?.warm_count ?? "—"} loading={loading} />
          <StatCard
            label="Active projects"
            value={stats?.active_project_count ?? "—"}
            loading={loading}
          />
          <StatCard
            label="New (automation)"
            value={warmStats?.total_new ?? "—"}
            loading={wlStatsQ.isLoading && !warmStats}
            to="/admin/warm-leads"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Next Actions">
            {loading ? (
              <EmptyHint>Loading…</EmptyHint>
            ) : nextActions.length === 0 ? (
              <EmptyHint>Nothing due. Add a next-action date on a lead to populate this list.</EmptyHint>
            ) : (
              <ul>
                {nextActions.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={`/admin/leads/${lead.id}`}
                      className="block px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-sm font-medium text-white">{lead.name}</span>
                        <LeadStatusBadge status={lead.status} />
                      </div>
                      <div className="text-xs text-gray-500 flex gap-3">
                        <span>{formatDate(lead.next_action_date)}</span>
                        <span className="text-gray-400 truncate">
                          {lead.next_action ?? "—"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Active Projects">
            {loading ? (
              <EmptyHint>Loading…</EmptyHint>
            ) : activeProjects.length === 0 ? (
              <EmptyHint>No active or proposal-sent projects.</EmptyHint>
            ) : (
              <ul>
                {activeProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/admin/projects/${p.id}`}
                      className="block px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {p.name}
                          {p.lead_name ? (
                            <span className="text-gray-500 font-normal ml-2">
                              · {p.lead_name}
                            </span>
                          ) : null}
                        </span>
                        <ProjectStatusBadge status={p.status} />
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.hours_logged.toFixed(1)} hrs logged · {formatCurrency(p.amount_billed)} billed
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="mt-6">
          <Panel
            title={`Warm Lead Inbox${
              warmStats ? ` · ${warmStats.total_new} new` : ""
            }`}
          >
            {wlNewQ.isLoading && newWarmLeads.length === 0 ? (
              <EmptyHint>Loading…</EmptyHint>
            ) : newWarmLeads.length === 0 ? (
              <EmptyHint>
                No new warm leads. Open{" "}
                <Link
                  to="/admin/warm-leads"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Warm Leads
                </Link>{" "}
                to run the scraper or adjust settings.
              </EmptyHint>
            ) : (
              <ul>
                {newWarmLeads.map((wl) => (
                  <li key={wl.id}>
                    <Link
                      to={`/admin/warm-leads/${wl.id}`}
                      className="block px-5 py-4 hover:bg-white/[0.02] transition-colors"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {wl.raw_title?.trim() || wl.raw_excerpt.slice(0, 80)}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <WarmLeadScorePill score={wl.score} />
                          <WarmLeadStatusBadge status={wl.status} />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 flex gap-3 truncate">
                        <span className="font-mono uppercase tracking-widest text-[10px]">
                          {wl.source_label}
                        </span>
                        {wl.author_handle && <span>@{wl.author_handle}</span>}
                        <span className="text-gray-600 truncate">
                          {wl.score_reasoning ?? wl.raw_excerpt.slice(0, 100)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <p className="text-xs text-gray-700 mt-12">
          Status reference: lead {Object.values(LEAD_STATUS_LABEL).join(" · ")} · project{" "}
          {Object.values(PROJECT_STATUS_LABEL).join(" · ")}
        </p>
      </div>
    </AdminLayout>
  );
};

const StatCard = ({
  label,
  value,
  loading,
  to,
}: {
  label: string;
  value: number | string;
  loading: boolean;
  to?: string;
}) => {
  const inner = (
    <div
      className="rounded-2xl p-6 h-full transition-colors"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
        {label}
      </p>
      <p
        className="text-4xl font-extrabold text-white"
        style={{ letterSpacing: "-0.03em" }}
      >
        {loading ? "…" : value}
      </p>
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
};

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{
      backgroundColor: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <h2 className="px-5 py-4 text-sm font-semibold text-white">{title}</h2>
    {children}
  </div>
);

const EmptyHint = ({ children }: { children: React.ReactNode }) => (
  <p
    className="px-5 py-8 text-sm text-gray-500 font-light"
    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
  >
    {children}
  </p>
);

export default Dashboard;
