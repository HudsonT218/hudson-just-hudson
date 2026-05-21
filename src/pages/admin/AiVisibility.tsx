// Admin → AI Visibility
// Tracks the three measurement signals from
// LLM-SEO/measurement-and-tracking-plan.md:
//   - leads grouped by self-reported source (with AI sources highlighted)
//   - traffic_events from known AI assistant domains (time series)
//   - AI Brief signups over time

import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { AI_REFERRER_HOSTS, isAiReferrer, isAiSource } from "@/lib/tracking";
import { admin } from "./_components/theme";
import { AdminPageHeader, AdminCard, SectionLabel, SkeletonBlock, ErrorBanner, EmptyState } from "./_components/ui";

const RANGE_DAYS = 30;

interface SourceRow {
  source: string | null;
  count: number;
}

interface DayBucket {
  day: string; // ISO YYYY-MM-DD
  count: number;
}

async function fetchLeadsBySource(): Promise<SourceRow[]> {
  // Supabase JS doesn't ship a GROUP BY helper for the REST client, so we
  // pull the source column for the last 90 days and aggregate in JS. This is
  // cheap at any realistic small-business lead volume.
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 90);
  const { data, error } = await supabase
    .from("leads")
    .select("source")
    .gte("created_at", since.toISOString());
  if (error) throw error;
  const counts = new Map<string | null, number>();
  for (const row of (data ?? []) as Array<{ source: string | null }>) {
    const key = row.source && row.source.trim() ? row.source : null;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

async function fetchAiTrafficSeries(): Promise<DayBucket[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - RANGE_DAYS);
  since.setUTCHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("traffic_events")
    .select("created_at, referrer")
    .gte("created_at", since.toISOString());
  if (error) throw error;
  return bucketByDay(
    ((data ?? []) as Array<{ created_at: string; referrer: string | null }>)
      .filter((r) => isAiReferrer(r.referrer))
      .map((r) => r.created_at),
  );
}

async function fetchAiTestSignupSeries(): Promise<DayBucket[]> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - RANGE_DAYS);
  since.setUTCHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("ai_test_submissions")
    .select("created_at")
    .gte("created_at", since.toISOString());
  if (error) throw error;
  return bucketByDay(((data ?? []) as Array<{ created_at: string }>).map((r) => r.created_at));
}

function bucketByDay(timestamps: string[]): DayBucket[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const buckets = new Map<string, number>();
  for (let i = RANGE_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const ts of timestamps) {
    const day = ts.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));
}

const AiVisibility = () => {
  const sourcesQ = useQuery({ queryKey: ["admin", "ai-visibility", "sources"], queryFn: fetchLeadsBySource });
  const aiTrafficQ = useQuery({ queryKey: ["admin", "ai-visibility", "ai-traffic"], queryFn: fetchAiTrafficSeries });
  const signupsQ = useQuery({ queryKey: ["admin", "ai-visibility", "signups"], queryFn: fetchAiTestSignupSeries });

  const sources = sourcesQ.data ?? [];
  const aiTraffic = aiTrafficQ.data ?? [];
  const signups = signupsQ.data ?? [];

  const totalLeads = sources.reduce((s, r) => s + r.count, 0);
  const aiLeads = sources.filter((r) => isAiSource(r.source)).reduce((s, r) => s + r.count, 0);
  const aiSharePct = totalLeads ? Math.round((aiLeads / totalLeads) * 100) : 0;
  const aiTrafficTotal = aiTraffic.reduce((s, b) => s + b.count, 0);
  const signupsTotal = signups.reduce((s, b) => s + b.count, 0);

  const error = (sourcesQ.error ?? aiTrafficQ.error ?? signupsQ.error) as Error | null;

  return (
    <AdminLayout>
      <Helmet>
        <title>AI Visibility, Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-10 py-10">
        <AdminPageHeader title="AI Visibility" className="mb-2" />
        <p className="text-sm text-gray-500 mb-8">
          Self-reported attribution + AI-referrer visits + AI Brief signups. Last 30 days unless noted.
        </p>

        {error && <div className="mb-6"><ErrorBanner>{error.message}</ErrorBanner></div>}

        {/* Top-line stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatTile
            label="Leads (90d)"
            value={sourcesQ.isLoading ? "-" : totalLeads}
          />
          <StatTile
            label="AI-sourced leads (90d)"
            value={sourcesQ.isLoading ? "-" : aiLeads}
            sub={sourcesQ.isLoading ? undefined : `${aiSharePct}% of total`}
          />
          <StatTile
            label="AI-referrer visits (30d)"
            value={aiTrafficQ.isLoading ? "-" : aiTrafficTotal}
          />
          <StatTile
            label="AI Brief signups (30d)"
            value={signupsQ.isLoading ? "-" : signupsTotal}
          />
        </div>

        {/* Leads by source */}
        <AdminCard className="mb-8">
          <SectionLabel className="mb-4">Leads by source (last 90 days)</SectionLabel>
          {sourcesQ.isLoading ? (
            <SkeletonBlock style={{ height: 120 }} />
          ) : sources.length === 0 ? (
            <EmptyState>No leads in the last 90 days.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${admin.border}` }}>
                  <th className="text-left text-xs uppercase tracking-widest text-gray-500 font-medium py-3">Source</th>
                  <th className="text-right text-xs uppercase tracking-widest text-gray-500 font-medium py-3">Leads</th>
                  <th className="text-right text-xs uppercase tracking-widest text-gray-500 font-medium py-3">% of total</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((row) => {
                  const ai = isAiSource(row.source);
                  const sourceLabel = row.source ?? "(not set, older lead)";
                  const pct = totalLeads ? Math.round((row.count / totalLeads) * 100) : 0;
                  return (
                    <tr key={sourceLabel} style={{ borderTop: `1px solid ${admin.border}` }}>
                      <td className="py-3" style={{ color: ai ? "#60a5fa" : admin.text }}>
                        {ai && <span aria-hidden className="mr-2">●</span>}
                        {sourceLabel}
                      </td>
                      <td className="py-3 text-right text-gray-300 font-mono text-xs">{row.count}</td>
                      <td className="py-3 text-right text-gray-500 font-mono text-xs">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </AdminCard>

        {/* AI traffic time series */}
        <AdminCard className="mb-8">
          <SectionLabel className="mb-2">AI-referrer visits (last 30 days)</SectionLabel>
          <p className="text-xs text-gray-500 mb-4">
            Includes referrer matches for {AI_REFERRER_HOSTS.join(", ")}. Most AI referral traffic strips the
            referrer header, so this undercounts, cross-check against "AI-sourced leads" above.
          </p>
          {aiTrafficQ.isLoading ? <SkeletonBlock style={{ height: 140 }} /> : <Sparkbars data={aiTraffic} />}
        </AdminCard>

        {/* AI Brief signups time series */}
        <AdminCard>
          <SectionLabel className="mb-4">AI Brief signups (last 30 days)</SectionLabel>
          {signupsQ.isLoading ? <SkeletonBlock style={{ height: 140 }} /> : <Sparkbars data={signups} />}
        </AdminCard>
      </div>
    </AdminLayout>
  );
};

export default AiVisibility;

// ---------------------------------------------------------------------------
// Tiny inline UI helpers, kept here to avoid adding to /admin/_components.
// ---------------------------------------------------------------------------

const StatTile = ({ label, value, sub }: { label: string; value: number | string; sub?: string }) => (
  <AdminCard className="py-5">
    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-2">{label}</p>
    <p className="text-3xl font-extrabold text-white" style={{ letterSpacing: "-0.02em" }}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </AdminCard>
);

// Lightweight bar chart, no chart library, just inline bars. Good enough
// for a 30-day daily count.
const Sparkbars = ({ data }: { data: DayBucket[] }) => {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div>
      <div className="flex items-end gap-[2px] h-32">
        {data.map((b) => (
          <div
            key={b.day}
            className="flex-1 relative group"
            style={{ minWidth: 4 }}
            title={`${b.day} · ${b.count}`}
          >
            <div
              className="absolute bottom-0 left-0 right-0 rounded-sm"
              style={{
                height: `${(b.count / max) * 100}%`,
                minHeight: b.count > 0 ? 2 : 0,
                background: b.count > 0 ? "rgba(96,165,250,0.5)" : "rgba(255,255,255,0.05)",
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono">
        <span>{data[0]?.day}</span>
        <span>{data[data.length - 1]?.day}</span>
      </div>
    </div>
  );
};
