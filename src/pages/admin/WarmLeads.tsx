import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  getWarmLeadSettings,
  getWarmLeadStats,
  listWarmLeads,
  listWarmLeadSources,
  triggerScrapeNow,
  updateWarmLeadSettings,
  updateWarmLeadSource,
} from "@/lib/warm-leads-db";
import {
  WARM_LEAD_MODES,
  WARM_LEAD_MODE_LABEL,
  WARM_LEAD_MODE_HELP,
  WARM_LEAD_STATUSES,
  WARM_LEAD_STATUS_LABEL,
  type WarmLeadMode,
  type WarmLeadSettings,
  type WarmLeadSettingsUpdate,
  type WarmLeadSource,
  type WarmLeadStatus,
  type WarmLeadWithSource,
} from "@/lib/warm-leads-types";
import {
  WarmLeadScorePill,
  WarmLeadStatusBadge,
} from "./_components/WarmLeadStatusBadge";
import { formatDate } from "./_components/format";
import { AdminPageHeader, ErrorBanner, InfoBanner } from "./_components/ui";
import { admin } from "./_components/theme";

type Filter = "all" | WarmLeadStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  ...WARM_LEAD_STATUSES.map((s) => ({
    value: s as Filter,
    label: WARM_LEAD_STATUS_LABEL[s],
  })),
];

const KEYS = {
  list: ["admin", "warm-leads", "list"] as const,
  stats: ["admin", "warm-leads", "stats"] as const,
  settings: ["admin", "warm-leads", "settings"] as const,
  sources: ["admin", "warm-leads", "sources"] as const,
};

const WarmLeads = () => {
  const qc = useQueryClient();
  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: KEYS.list,
    queryFn: () => listWarmLeads(),
  });
  const { data: stats } = useQuery({
    queryKey: KEYS.stats,
    queryFn: getWarmLeadStats,
  });
  const { data: settings } = useQuery({
    queryKey: KEYS.settings,
    queryFn: getWarmLeadSettings,
  });
  const { data: sources = [] } = useQuery({
    queryKey: KEYS.sources,
    queryFn: listWarmLeadSources,
  });

  const [filter, setFilter] = useState<Filter>("new");
  const [configOpen, setConfigOpen] = useState(false);
  const [scrapeRunning, setScrapeRunning] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const loading = isLoading && leads.length === 0;
  const errMsg = mutationError ?? (error instanceof Error ? error.message : null);

  const counts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const l of leads) acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, [leads]);

  const visible = useMemo(
    () => (filter === "all" ? leads : leads.filter((l) => l.status === filter)),
    [filter, leads],
  );

  const handleRunNow = async () => {
    setScrapeRunning(true);
    setScrapeMsg(null);
    try {
      const r = await triggerScrapeNow();
      setScrapeMsg(
        `Done — ${r.inserted} new lead${r.inserted === 1 ? "" : "s"}` +
          (r.errors?.length ? ` · ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}` : ""),
      );
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.stats });
      qc.invalidateQueries({ queryKey: KEYS.settings });
      qc.invalidateQueries({ queryKey: KEYS.sources });
    } catch (e) {
      setScrapeMsg(e instanceof Error ? e.message : "Scrape failed");
    } finally {
      setScrapeRunning(false);
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Warm Leads — Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <AdminPageHeader
          title="Warm Leads"
          actions={
            <>
              <Button
                variant="ghost"
                onClick={() => setConfigOpen(true)}
                className="text-sm"
                style={{ color: admin.textMuted }}
              >
                ⚙ Configure
              </Button>
              <Button onClick={handleRunNow} disabled={scrapeRunning}>
                {scrapeRunning ? "Scraping…" : "Run now"}
              </Button>
            </>
          }
        />

        <p className="text-xs mt-2 mb-8" style={{ color: admin.textDim }}>
          Automation surfaces public posts that look like "I need someone to build me X".
          Review the drafted reply, then promote, edit, or skip.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="New in inbox" value={stats?.total_new ?? "—"} />
          <StatCard label="Found this week" value={stats?.total_this_week ?? "—"} />
          <StatCard label="Sent this week" value={stats?.total_sent_this_week ?? "—"} />
          <StatCard
            label="Avg score (30d)"
            value={stats?.avg_score_30d ?? "—"}
          />
        </div>

        <ModeBanner settings={settings} sources={sources} />

        {scrapeMsg && (
          <div className="mb-6">
            <InfoBanner>{scrapeMsg}</InfoBanner>
          </div>
        )}

        <div
          role="tablist"
          className="inline-flex items-center gap-1 rounded-full p-1 mb-6"
          style={{
            backgroundColor: admin.surface,
            border: `1px solid ${admin.border}`,
          }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.value;
            const count = f.value === "all" ? leads.length : counts[f.value] ?? 0;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                aria-pressed={active}
                className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  backgroundColor: active ? admin.surface2 : "transparent",
                  color: active ? admin.text : admin.textMuted,
                }}
              >
                {f.label}
                <span
                  className="ml-2 font-mono text-[11px]"
                  style={{ color: admin.textDim }}
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
          <p className="text-sm" style={{ color: admin.textDim }}>Loading…</p>
        ) : visible.length === 0 ? (
          <EmptyState filter={filter} settings={settings} />
        ) : (
          <div className="space-y-2">
            {visible.map((lead) => (
              <WarmLeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      <ConfigDrawer
        open={configOpen}
        onOpenChange={setConfigOpen}
        settings={settings}
        sources={sources}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: KEYS.settings });
          qc.invalidateQueries({ queryKey: KEYS.sources });
        }}
        onError={setMutationError}
      />
    </AdminLayout>
  );
};

// ----------------------------------------------------------------------------
// Small UI bits
// ----------------------------------------------------------------------------
const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <div
    className="rounded-2xl p-5"
    style={{
      backgroundColor: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
    }}
  >
    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium mb-2">
      {label}
    </p>
    <p
      className="text-3xl font-extrabold text-white"
      style={{ letterSpacing: "-0.03em" }}
    >
      {value}
    </p>
  </div>
);

const ModeBanner = ({
  settings,
  sources,
}: {
  settings: WarmLeadSettings | undefined;
  sources: WarmLeadSource[];
}) => {
  if (!settings) return null;
  const enabledSources = sources.filter((s) => s.enabled);
  const colors: Record<WarmLeadMode, { bg: string; fg: string }> = {
    capped: { bg: "rgba(59,130,246,0.10)", fg: "#93c5fd" },
    always_on: { bg: "rgba(16,185,129,0.12)", fg: "#6ee7b7" },
    paused: { bg: "rgba(255,255,255,0.05)", fg: "rgb(156,163,175)" },
  };
  const c = colors[settings.mode];
  const progress =
    settings.mode === "capped"
      ? `${settings.this_week_count} / ${settings.target_per_week} this week`
      : settings.mode === "always_on"
        ? `${settings.this_week_count} this week (no cap)`
        : "Paused";
  return (
    <div
      className="mb-6 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap"
      style={{ backgroundColor: c.bg, border: `1px solid ${c.fg}33` }}
    >
      <div>
        <span
          className="font-mono text-[10px] uppercase tracking-widest font-medium"
          style={{ color: c.fg }}
        >
          {WARM_LEAD_MODE_LABEL[settings.mode]}
        </span>
        <p className="text-sm text-white mt-1">{progress}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Threshold ≥ {settings.threshold} · Last run{" "}
          {settings.last_run_at ? formatDate(settings.last_run_at) : "never"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500 mb-1">Enabled sources</p>
        <p className="text-sm text-white font-mono">
          {enabledSources.length === 0
            ? "none"
            : enabledSources.map((s) => s.label).join(" · ")}
        </p>
      </div>
    </div>
  );
};

const EmptyState = ({
  filter,
  settings,
}: {
  filter: Filter;
  settings: WarmLeadSettings | undefined;
}) => {
  if (filter !== "all" && filter !== "new") {
    return (
      <p className="text-sm text-gray-500">
        No leads in '{WARM_LEAD_STATUS_LABEL[filter]}' yet.
      </p>
    );
  }
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px dashed rgba(255,255,255,0.08)",
      }}
    >
      <p className="text-sm text-gray-400 mb-2">No warm leads yet.</p>
      <p className="text-xs text-gray-600 max-w-md mx-auto">
        Click <span className="text-white">Run now</span> to scrape the enabled
        sources. The classifier will surface posts that score{" "}
        {settings ? `≥ ${settings.threshold}` : "high"} as
        "actively-asking-for-help" candidates.
      </p>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Lead card
// ----------------------------------------------------------------------------
const WarmLeadCard = ({ lead }: { lead: WarmLeadWithSource }) => {
  const headline = lead.raw_title?.trim() || lead.raw_excerpt.slice(0, 120);
  return (
    <Link
      to={`/admin/warm-leads/${lead.id}`}
      className="block rounded-xl p-4 transition-colors hover:bg-white/[0.03]"
      style={{
        backgroundColor: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <WarmLeadScorePill score={lead.score} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
            {lead.source_label}
          </span>
          {lead.author_handle && (
            <span className="font-mono text-[11px] text-gray-400">
              @{lead.author_handle}
            </span>
          )}
        </div>
        <WarmLeadStatusBadge status={lead.status} />
      </div>
      <p className="text-sm text-white font-medium mb-1 line-clamp-1">
        {headline}
      </p>
      <p className="text-xs text-gray-500 line-clamp-2 mb-2">
        {lead.raw_excerpt}
      </p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-600">
        {lead.matched_keywords.length > 0 && (
          <span>matched: {lead.matched_keywords.join(", ")}</span>
        )}
        {lead.score_reasoning && (
          <span className="italic">{lead.score_reasoning}</span>
        )}
        <span>{formatDate(lead.posted_at ?? lead.created_at)}</span>
      </div>
    </Link>
  );
};

// ----------------------------------------------------------------------------
// Config drawer
// ----------------------------------------------------------------------------
const ConfigDrawer = ({
  open,
  onOpenChange,
  settings,
  sources,
  onSaved,
  onError,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  settings: WarmLeadSettings | undefined;
  sources: WarmLeadSource[];
  onSaved: () => void;
  onError: (msg: string | null) => void;
}) => {
  const [mode, setMode] = useState<WarmLeadMode>("capped");
  const [target, setTarget] = useState(7);
  const [threshold, setThreshold] = useState(60);
  const [voice, setVoice] = useState("");
  const [saving, setSaving] = useState(false);

  // Hydrate from settings whenever the drawer opens.
  useEffect(() => {
    if (open && settings) {
      setMode(settings.mode);
      setTarget(settings.target_per_week);
      setThreshold(settings.threshold);
      setVoice(settings.outreach_voice);
    }
  }, [open, settings]);

  const handleSave = async () => {
    setSaving(true);
    onError(null);
    try {
      const patch: WarmLeadSettingsUpdate = {
        mode,
        target_per_week: Math.max(1, Math.min(100, target)),
        threshold: Math.max(0, Math.min(100, threshold)),
        outreach_voice: voice,
      };
      await updateWarmLeadSettings(patch);
      onSaved();
      onOpenChange(false);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSource = async (id: WarmLeadSource["id"], enabled: boolean) => {
    onError(null);
    try {
      await updateWarmLeadSource(id, { enabled });
      onSaved();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to update source");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Warm Lead Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div>
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as WarmLeadMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WARM_LEAD_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {WARM_LEAD_MODE_LABEL[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              {WARM_LEAD_MODE_HELP[mode]}
            </p>
          </div>

          {mode === "capped" && (
            <div>
              <Label htmlFor="wl-target">Target leads per week</Label>
              <Input
                id="wl-target"
                type="number"
                min={1}
                max={100}
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value, 10) || 0)}
              />
              <p className="text-xs text-gray-500 mt-2">
                Scraper stops adding to the inbox once {target} leads have been
                surfaced this week.
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="wl-threshold">
              Score threshold ({threshold} / 100)
            </Label>
            <Input
              id="wl-threshold"
              type="number"
              min={0}
              max={100}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum classifier score to surface in the inbox. 60+ is a good
              starting point.
            </p>
          </div>

          <div>
            <Label htmlFor="wl-voice">Outreach voice / context</Label>
            <Textarea
              id="wl-voice"
              rows={5}
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Used by the drafting LLM to write replies in your voice. Mention
              what you build, your tone, and what NOT to say.
            </p>
          </div>

          <div>
            <Label className="mb-3 block">Sources</Label>
            <div className="space-y-2">
              {sources.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-md px-3 py-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <p className="text-sm text-white">{s.label}</p>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {s.last_run_at
                        ? `last run ${formatDate(s.last_run_at)}`
                        : "not yet run"}
                      {s.last_error ? ` · ⚠ ${s.last_error.slice(0, 30)}…` : ""}
                    </p>
                  </div>
                  <Switch
                    checked={s.enabled}
                    onCheckedChange={(c) => handleToggleSource(s.id, c)}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Keywords and subreddits for each source live in the DB
              (warm_lead_sources.config) — edit via SQL for now.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WarmLeads;
