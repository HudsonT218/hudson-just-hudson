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
import { admin } from "./_components/theme";
import {
  AdminPageHeader,
  AdminCard,
  SectionLabel,
  SkeletonBlock,
  ErrorBanner,
  EmptyState,
} from "./_components/ui";

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
        <title>Dashboard, Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10">
        <AdminPageHeader title="Dashboard" className="mb-8" />

        {error && (
          <div className="mb-6">
            <ErrorBanner>{error}</ErrorBanner>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard label="Cold leads" value={stats?.cold_count ?? "-"} loading={loading} />
          <StatCard label="Warm leads" value={stats?.warm_count ?? "-"} loading={loading} />
          <StatCard
            label="Active projects"
            value={stats?.active_project_count ?? "-"}
            loading={loading}
          />
          <StatCard
            label="New (automation)"
            value={warmStats?.total_new ?? "-"}
            loading={wlStatsQ.isLoading && !warmStats}
            to="/admin/warm-leads"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel title="Next Actions">
            {naQ.isLoading && nextActions.length === 0 ? (
              <PanelSkeleton />
            ) : nextActions.length === 0 ? (
              <PanelEmpty>
                Nothing due. Add a next-action date on a lead to populate this list.
              </PanelEmpty>
            ) : (
              <ul>
                {nextActions.map((lead) => (
                  <li key={lead.id}>
                    <Link
                      to={`/admin/leads/${lead.id}`}
                      className="block px-5 py-4 transition-colors hover:[background-color:rgba(255,255,255,0.04)]"
                      style={{ borderTop: `1px solid ${admin.border}` }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span className="text-sm font-medium" style={{ color: admin.text }}>
                          {lead.name}
                        </span>
                        <LeadStatusBadge status={lead.status} />
                      </div>
                      <div className="text-xs flex gap-3" style={{ color: admin.textDim }}>
                        <span>{formatDate(lead.next_action_date)}</span>
                        <span className="truncate" style={{ color: admin.textMuted }}>
                          {lead.next_action ?? "-"}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Active Projects">
            {apQ.isLoading && activeProjects.length === 0 ? (
              <PanelSkeleton />
            ) : activeProjects.length === 0 ? (
              <PanelEmpty>No active or proposal-sent projects.</PanelEmpty>
            ) : (
              <ul>
                {activeProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/admin/projects/${p.id}`}
                      className="block px-5 py-4 transition-colors hover:[background-color:rgba(255,255,255,0.04)]"
                      style={{ borderTop: `1px solid ${admin.border}` }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: admin.text }}
                        >
                          {p.name}
                          {p.lead_name ? (
                            <span
                              className="font-normal ml-2"
                              style={{ color: admin.textDim }}
                            >
                              · {p.lead_name}
                            </span>
                          ) : null}
                        </span>
                        <ProjectStatusBadge status={p.status} />
                      </div>
                      <div className="text-xs" style={{ color: admin.textDim }}>
                        {p.hours_logged.toFixed(1)} hrs logged ·{" "}
                        {formatCurrency(p.amount_billed)} billed
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
              <PanelSkeleton />
            ) : newWarmLeads.length === 0 ? (
              <PanelEmpty>
                No new warm leads. Open{" "}
                <Link
                  to="/admin/warm-leads"
                  style={{ color: admin.accent }}
                  className="hover:opacity-80"
                >
                  Warm Leads
                </Link>{" "}
                to run the scraper or adjust settings.
              </PanelEmpty>
            ) : (
              <ul>
                {newWarmLeads.map((wl) => (
                  <li key={wl.id}>
                    <Link
                      to={`/admin/warm-leads/${wl.id}`}
                      className="block px-5 py-4 transition-colors hover:[background-color:rgba(255,255,255,0.04)]"
                      style={{ borderTop: `1px solid ${admin.border}` }}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: admin.text }}
                        >
                          {wl.raw_title?.trim() || wl.raw_excerpt.slice(0, 80)}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <WarmLeadScorePill score={wl.score} />
                          <WarmLeadStatusBadge status={wl.status} />
                        </div>
                      </div>
                      <div
                        className="text-xs flex gap-3 truncate"
                        style={{ color: admin.textDim }}
                      >
                        <span className="font-mono uppercase tracking-widest text-[10px]">
                          {wl.source_label}
                        </span>
                        {wl.author_handle && <span>@{wl.author_handle}</span>}
                        <span className="truncate" style={{ color: admin.textMuted }}>
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

        <p
          className="text-xs mt-12"
          style={{ color: admin.textDim, opacity: 0.7 }}
        >
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
        backgroundColor: admin.surface,
        border: `1px solid ${admin.border}`,
      }}
    >
      <p
        className="text-[10px] uppercase tracking-[0.14em] font-medium mb-3"
        style={{ color: admin.textDim }}
      >
        {label}
      </p>
      {loading ? (
        <SkeletonBlock className="h-9 w-20" />
      ) : (
        <p
          className="text-4xl font-extrabold"
          style={{ color: admin.text, letterSpacing: "-0.03em" }}
        >
          {value}
        </p>
      )}
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
  <AdminCard className="p-0 overflow-hidden">
    <div className="px-5 py-4">
      <SectionLabel>{title}</SectionLabel>
    </div>
    {children}
  </AdminCard>
);

const PanelSkeleton = () => (
  <div>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="px-5 py-4"
        style={{ borderTop: `1px solid ${admin.border}` }}
      >
        <SkeletonBlock className="h-4 w-2/3 mb-2" />
        <SkeletonBlock className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);

const PanelEmpty = ({ children }: { children: React.ReactNode }) => (
  <div style={{ borderTop: `1px solid ${admin.border}` }}>
    <EmptyState>{children}</EmptyState>
  </div>
);

export default Dashboard;
