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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  getWarmLeadSettings,
  getWarmLeadStats,
  listWarmLeads,
  listWarmLeadSources,
  triggerScrapeNow,
  updateWarmLead,
  updateWarmLeadSettings,
  updateWarmLeadSource,
} from "@/lib/warm-leads-db";
import {
  WARM_LEAD_STATUSES,
  WARM_LEAD_STATUS_LABEL,
  type WarmLeadSettings,
  type WarmLeadSettingsUpdate,
  type WarmLeadSource,
  type WarmLeadSourceId,
  type WarmLeadStatus,
  type WarmLeadWithSource,
} from "@/lib/warm-leads-types";
import {
  WarmLeadScorePill,
  WarmLeadStatusBadge,
} from "./_components/WarmLeadStatusBadge";
import { formatDate, formatRelative } from "./_components/format";
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

const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));

const sourceKindBadge = (kind: WarmLeadSource["kind"]) =>
  kind === "local_agent" ? "💻 Mac" : "☁ Cloud";

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

  // Inline per-run target next to the Run-Now button. Pre-fills from settings;
  // editing it doesn't persist back — it's a one-time override for this run.
  // The persistent default lives in the settings drawer.
  const [runTarget, setRunTarget] = useState<number>(5);
  useEffect(() => {
    if (settings?.target_per_run) setRunTarget(settings.target_per_run);
  }, [settings?.target_per_run]);

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
      const r = await triggerScrapeNow({ target_per_run: runTarget });
      if (r.skipped) {
        setScrapeMsg(`Skipped — ${r.reason ?? "see logs"}`);
      } else {
        const errPart = r.errors?.length
          ? ` · ${r.errors.length} error${r.errors.length === 1 ? "" : "s"}`
          : "";
        setScrapeMsg(
          `Scanned ${r.scanned} · scored ${r.scored} · inserted ${r.inserted}${errPart}`,
        );
      }
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
        <title>Warm Leads, Admin</title>
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
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: admin.textDim }}>
                  Find
                </span>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={runTarget}
                  onChange={(e) =>
                    setRunTarget(clamp(parseInt(e.target.value, 10) || 1, 1, 50))
                  }
                  className="w-16 h-9 text-center"
                  aria-label="Leads to find this run"
                />
                <span className="text-xs" style={{ color: admin.textDim }}>
                  leads
                </span>
                <Button
                  onClick={handleRunNow}
                  disabled={scrapeRunning || !settings?.enabled}
                  title={
                    !settings?.enabled
                      ? "Automation is off — turn it on in Configure"
                      : undefined
                  }
                >
                  {scrapeRunning ? "Scraping…" : "Run now"}
                </Button>
              </div>
            </>
          }
        />

        <p className="text-xs mt-2 mb-8" style={{ color: admin.textDim }}>
          Cloud sources are scraped by Run-Now. Local-agent sources (LinkedIn)
          push leads in via Hermes — they only fill while the agent is running
          on your Mac.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard label="New in inbox" value={stats?.total_new ?? "-"} />
          <StatCard
            label="Found this week"
            value={stats?.total_this_week ?? "-"}
          />
          <StatCard
            label="Sent this week"
            value={stats?.total_sent_this_week ?? "-"}
          />
          <StatCard
            label="Avg score (30d)"
            value={stats?.avg_score_30d ?? "-"}
          />
        </div>

        <StatusBanner settings={settings} sources={sources} />

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
          <p className="text-sm" style={{ color: admin.textDim }}>
            Loading…
          </p>
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
// Top-of-page status banner
// ----------------------------------------------------------------------------
const StatusBanner = ({
  settings,
  sources,
}: {
  settings: WarmLeadSettings | undefined;
  sources: WarmLeadSource[];
}) => {
  if (!settings) return null;
  const enabledSources = sources.filter((s) => s.enabled);
  return (
    <div
      className="mb-6 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
      style={{
        backgroundColor: admin.surface,
        border: `1px solid ${admin.border}`,
      }}
    >
      <div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.14em] font-medium"
          style={{ color: settings.enabled ? "#6ee7b7" : admin.textMuted }}
        >
          {settings.enabled ? "Automation ON" : "Automation OFF"}
        </span>
        <p className="text-sm mt-1" style={{ color: admin.text }}>
          Find {settings.target_per_run} leads per run · Threshold ≥{" "}
          {settings.threshold}
        </p>
        <p className="text-xs mt-0.5" style={{ color: admin.textDim }}>
          Last run{" "}
          {settings.last_run_at ? formatDate(settings.last_run_at) : "never"}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs mb-1" style={{ color: admin.textDim }}>
          Enabled sources
        </p>
        <p className="text-sm font-mono" style={{ color: admin.text }}>
          {enabledSources.length === 0
            ? "none"
            : enabledSources
                .map((s) => `${s.label} ${sourceKindBadge(s.kind)}`)
                .join(" · ")}
        </p>
      </div>
    </div>
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
      backgroundColor: admin.surface,
      border: `1px solid ${admin.border}`,
    }}
  >
    <p
      className="text-[10px] uppercase tracking-[0.14em] font-medium mb-2"
      style={{ color: admin.textDim }}
    >
      {label}
    </p>
    <p
      className="text-3xl font-semibold"
      style={{ color: admin.text, letterSpacing: "-0.03em" }}
    >
      {value}
    </p>
  </div>
);

const EmptyState = ({
  filter,
  settings,
}: {
  filter: Filter;
  settings: WarmLeadSettings | undefined;
}) => {
  if (filter !== "all" && filter !== "new") {
    return (
      <p className="text-sm" style={{ color: admin.textDim }}>
        No leads in '{WARM_LEAD_STATUS_LABEL[filter]}' yet.
      </p>
    );
  }
  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{
        backgroundColor: admin.surface,
        border: `1px dashed ${admin.border}`,
      }}
    >
      <p className="text-sm mb-2" style={{ color: admin.textMuted }}>
        No warm leads yet.
      </p>
      <p className="text-xs max-w-md mx-auto" style={{ color: admin.textDim }}>
        Click <span style={{ color: admin.text }}>Run now</span> to scrape the
        enabled cloud sources, or start Hermes on your Mac to push LinkedIn
        leads in. The classifier surfaces posts scoring{" "}
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
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const headline = lead.raw_title?.trim() || lead.raw_excerpt.slice(0, 120);

  const mutateStatus = async (status: WarmLeadStatus, label: string) => {
    if (busy) return;
    setBusy(true);
    const prev = qc.getQueryData<WarmLeadWithSource[]>(KEYS.list);
    if (prev) {
      qc.setQueryData<WarmLeadWithSource[]>(
        KEYS.list,
        prev.map((l) => (l.id === lead.id ? { ...l, status } : l)),
      );
    }
    try {
      await updateWarmLead(lead.id, { status });
      toast.success(label);
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.stats });
    } catch (e) {
      if (prev) qc.setQueryData(KEYS.list, prev);
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!lead.drafted_message) return;
    try {
      await navigator.clipboard.writeText(lead.drafted_message);
      toast.success("Draft copied");
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="rounded-2xl p-4 transition-colors hover:[background-color:rgba(255,255,255,0.04)] hover:[border-color:rgba(255,255,255,0.12)]"
      style={{
        backgroundColor: admin.surface,
        border: `1px solid ${admin.border}`,
      }}
    >
      <Link to={`/admin/warm-leads/${lead.id}`} className="block">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <WarmLeadScorePill score={lead.score} />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.14em]"
              style={{ color: admin.textDim }}
            >
              {lead.source_label}
            </span>
            {lead.author_handle && (
              <span
                className="font-mono text-[11px]"
                style={{ color: admin.textMuted }}
              >
                @{lead.author_handle}
              </span>
            )}
          </div>
          <WarmLeadStatusBadge status={lead.status} />
        </div>
        <p
          className="text-sm font-medium mb-1 line-clamp-1"
          style={{ color: admin.text }}
        >
          {headline}
        </p>
        <p
          className="text-xs line-clamp-2 mb-2"
          style={{ color: admin.textMuted }}
        >
          {lead.raw_excerpt}
        </p>
        <div
          className="flex flex-wrap gap-x-4 gap-y-1 text-[11px]"
          style={{ color: admin.textDim }}
        >
          {lead.matched_keywords.length > 0 && (
            <span>matched: {lead.matched_keywords.join(", ")}</span>
          )}
          {lead.score_reasoning && (
            <span className="italic">{lead.score_reasoning}</span>
          )}
          <span>{formatRelative(lead.posted_at ?? lead.created_at)}</span>
        </div>
      </Link>

      <div
        className="flex flex-wrap gap-1 mt-3 pt-3"
        style={{ borderTop: `1px solid ${admin.border}` }}
        onClick={stop}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={!lead.drafted_message}
          style={{ color: admin.textMuted }}
        >
          📋 Copy reply
        </Button>
        <a href={lead.url} target="_blank" rel="noreferrer" onClick={stop}>
          <Button variant="ghost" size="sm" style={{ color: admin.textMuted }}>
            ↗ Open
          </Button>
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            stop(e);
            mutateStatus("sent", "Marked replied");
          }}
          disabled={busy || lead.status === "sent"}
          style={{ color: admin.textMuted }}
        >
          ✓ Mark replied
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            stop(e);
            mutateStatus("dismissed", "Dismissed");
          }}
          disabled={busy || lead.status === "dismissed"}
          style={{ color: admin.textDim }}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// Reusable tag input (used for keywords + Reddit subreddits)
// ----------------------------------------------------------------------------
const TagInput = ({
  label,
  items,
  onChange,
  placeholder,
  prefix = "",
  normalize,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  prefix?: string;
  normalize?: (raw: string) => string;
}) => {
  const [input, setInput] = useState("");
  const add = (raw: string) => {
    const cleaned = (normalize ? normalize(raw) : raw.trim()).trim();
    if (!cleaned) return;
    if (items.includes(cleaned)) return;
    onChange([...items, cleaned]);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && items.length) {
      onChange(items.slice(0, -1));
    }
  };
  return (
    <div>
      <Label className="mb-1.5 block text-[11px]" style={{ color: admin.textDim }}>
        {label}
      </Label>
      <div
        className="rounded-md p-2 flex flex-wrap gap-1.5 min-h-[36px]"
        style={{
          backgroundColor: admin.surface2,
          border: `1px solid ${admin.border}`,
        }}
      >
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: admin.surface,
              border: `1px solid ${admin.border}`,
              color: admin.text,
            }}
          >
            {prefix}
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((i) => i !== item))}
              aria-label={`Remove ${item}`}
              className="ml-1 hover:[color:rgb(252,165,165)]"
              style={{ color: admin.textDim }}
            >
              ×
            </button>
          </span>
        ))}
        {items.length === 0 && (
          <span className="text-xs" style={{ color: admin.textDim }}>
            None set.
          </span>
        )}
      </div>
      <Input
        className="mt-2"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (input.trim()) {
            add(input);
            setInput("");
          }
        }}
      />
    </div>
  );
};

// ----------------------------------------------------------------------------
// Per-source config row inside the settings drawer
// ----------------------------------------------------------------------------
type SourceConfigState = {
  enabled: boolean;
  keywords: string[];
  subreddits?: string[];
};

const SourceConfigRow = ({
  source,
  config,
  onChange,
}: {
  source: WarmLeadSource;
  config: SourceConfigState;
  onChange: (next: SourceConfigState) => void;
}) => {
  return (
    <div
      className="rounded-md p-3 space-y-3"
      style={{
        backgroundColor: admin.surface,
        border: `1px solid ${admin.border}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: admin.text }}
          >
            {source.label}
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: admin.surface2,
                color: admin.textDim,
              }}
            >
              {sourceKindBadge(source.kind)}
            </span>
          </p>
          <p
            className="text-[10px] font-mono mt-0.5"
            style={{ color: admin.textDim }}
          >
            {source.last_run_at
              ? `last run ${formatDate(source.last_run_at)}`
              : "not yet run"}
            {source.last_error
              ? ` · ⚠ ${source.last_error.slice(0, 30)}…`
              : ""}
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => onChange({ ...config, enabled: checked })}
        />
      </div>

      <TagInput
        label="Keywords"
        items={config.keywords}
        onChange={(keywords) => onChange({ ...config, keywords })}
        placeholder="add keyword, press Enter (e.g. need a website)"
      />

      {config.subreddits !== undefined && (
        <TagInput
          label="Subreddits"
          items={config.subreddits}
          onChange={(subreddits) => onChange({ ...config, subreddits })}
          placeholder="add subreddit, press Enter (e.g. smallbusiness)"
          prefix="r/"
          normalize={(s) =>
            s.trim().toLowerCase().replace(/^\/?r\//, "").replace(/\s+/g, "")
          }
        />
      )}

      {source.kind === "local_agent" && (
        <p className="text-[11px]" style={{ color: admin.textDim }}>
          Push-only source. Triggered by your local agent (Hermes), not by Run-Now.
        </p>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------------
// Settings drawer
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
  const [enabled, setEnabled] = useState(false);
  const [targetPerRun, setTargetPerRun] = useState(5);
  const [threshold, setThreshold] = useState(60);
  const [voice, setVoice] = useState("");
  const [sourceState, setSourceState] = useState<
    Record<string, SourceConfigState>
  >({});
  const [saving, setSaving] = useState(false);

  // Hydrate from settings + sources whenever the drawer opens.
  useEffect(() => {
    if (!open) return;
    if (settings) {
      setEnabled(settings.enabled);
      setTargetPerRun(settings.target_per_run);
      setThreshold(settings.threshold);
      setVoice(settings.outreach_voice);
    }
    const next: Record<string, SourceConfigState> = {};
    for (const s of sources) {
      const cfg = (s.config ?? {}) as {
        keywords?: unknown;
        subreddits?: unknown;
      };
      next[s.id] = {
        enabled: s.enabled,
        keywords: Array.isArray(cfg.keywords)
          ? (cfg.keywords as unknown[]).map(String)
          : [],
        subreddits: Array.isArray(cfg.subreddits)
          ? (cfg.subreddits as unknown[]).map(String)
          : s.id === "reddit"
            ? []
            : undefined,
      };
    }
    setSourceState(next);
  }, [open, settings, sources]);

  const handleSave = async () => {
    setSaving(true);
    onError(null);
    try {
      const patch: WarmLeadSettingsUpdate = {
        enabled,
        target_per_run: clamp(targetPerRun, 1, 50),
        threshold: clamp(threshold, 0, 100),
        outreach_voice: voice,
      };
      await updateWarmLeadSettings(patch);

      for (const s of sources) {
        const next = sourceState[s.id];
        if (!next) continue;
        const newConfig: Record<string, unknown> = {
          ...(s.config ?? {}),
          keywords: next.keywords,
        };
        if (next.subreddits !== undefined) {
          newConfig.subreddits = next.subreddits;
        }
        await updateWarmLeadSource(s.id as WarmLeadSourceId, {
          enabled: next.enabled,
          config: newConfig,
        });
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      onError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Warm Lead Settings</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Master toggle */}
          <div
            className="flex items-center justify-between rounded-md px-3 py-3"
            style={{
              backgroundColor: admin.surface,
              border: `1px solid ${admin.border}`,
            }}
          >
            <div className="pr-3">
              <p
                className="text-sm font-medium"
                style={{ color: admin.text }}
              >
                Automation
              </p>
              <p
                className="text-xs"
                style={{ color: admin.textDim }}
              >
                When on, Run-Now scrapes cloud sources and your local agent can
                push leads in. When off, everything pauses.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Per-run target */}
          <div>
            <Label htmlFor="wl-target">Find me leads per run</Label>
            <Input
              id="wl-target"
              type="number"
              min={1}
              max={50}
              value={targetPerRun}
              onChange={(e) =>
                setTargetPerRun(
                  clamp(parseInt(e.target.value, 10) || 1, 1, 50),
                )
              }
            />
            <p className="text-xs mt-2" style={{ color: admin.textDim }}>
              Each run stops once {targetPerRun} above-threshold lead
              {targetPerRun === 1 ? "" : "s"} have been surfaced. The Run-Now
              button can override this for a single run.
            </p>
          </div>

          {/* Threshold */}
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
              onChange={(e) =>
                setThreshold(
                  clamp(parseInt(e.target.value, 10) || 0, 0, 100),
                )
              }
            />
            <p className="text-xs mt-2" style={{ color: admin.textDim }}>
              Minimum classifier score to surface in the inbox. 60+ is a good
              starting point.
            </p>
          </div>

          {/* Outreach voice */}
          <div>
            <Label htmlFor="wl-voice">Outreach voice / context</Label>
            <Textarea
              id="wl-voice"
              rows={5}
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
            />
            <p className="text-xs mt-2" style={{ color: admin.textDim }}>
              Used by the drafting LLM to write replies in your voice. Mention
              what you build, your tone, and what NOT to say.
            </p>
          </div>

          {/* Sources */}
          <div>
            <Label className="mb-3 block">Sources</Label>
            <div className="space-y-3">
              {sources.map((s) => {
                const cfg = sourceState[s.id];
                if (!cfg) return null;
                return (
                  <SourceConfigRow
                    key={s.id}
                    source={s}
                    config={cfg}
                    onChange={(next) =>
                      setSourceState((prev) => ({ ...prev, [s.id]: next }))
                    }
                  />
                );
              })}
              {sources.length === 0 && (
                <p className="text-xs" style={{ color: admin.textDim }}>
                  No sources configured.
                </p>
              )}
            </div>
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
