## Plan: InfoBanner primitive + restyle WarmLeads page (visual only)

### 1. `src/pages/admin/_components/ui.tsx` — add `InfoBanner`

Add a new component below `ErrorBanner`, mirroring its API:

```tsx
export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="rounded-md p-4 text-sm text-blue-200"
      style={{
        backgroundColor: "rgba(59,130,246,0.08)",
        border: "1px solid rgba(59,130,246,0.2)",
      }}
    >
      {children}
    </div>
  );
}
```

Reused on the Warm Lead detail page later.

### 2. `src/pages/admin/WarmLeads.tsx` — visual restyle

Imports — add:
```ts
import { AdminPageHeader, AdminCard, ErrorBanner, InfoBanner } from "./_components/ui";
import { admin } from "./_components/theme";
```

**Page shell (~lines 134–159)**
- Outer wrapper: change to `px-4 sm:px-6 lg:px-10 py-6 lg:py-10` to match Leads.
- Replace the manual header row with:
  ```tsx
  <AdminPageHeader
    title="Warm Leads"
    actions={
      <>
        <Button variant="ghost" onClick={() => setConfigOpen(true)}
          style={{ color: admin.textMuted }}>⚙ Configure</Button>
        <Button onClick={handleRunNow} disabled={scrapeRunning}>
          {scrapeRunning ? "Scraping…" : "Run now"}
        </Button>
      </>
    }
  />
  ```
- Keep the descriptive paragraph; restyle: `text-xs mt-2 mb-8` with `color: admin.textDim`.

**StatCard helper**
Rebuild on `admin` tokens:
```tsx
const StatCard = ({ label, value }) => (
  <div className="rounded-2xl p-5"
    style={{ backgroundColor: admin.surface, border: `1px solid ${admin.border}` }}>
    <p className="text-[10px] uppercase tracking-[0.14em] font-medium mb-2"
       style={{ color: admin.textDim }}>{label}</p>
    <p className="text-3xl font-semibold" style={{ color: admin.text, letterSpacing: "-0.03em" }}>
      {value}
    </p>
  </div>
);
```

**ModeBanner**
- Keep the per-mode `colors` map (capped/always_on/paused) for the accent label tint.
- Container: `rounded-2xl p-5 mb-6`, `backgroundColor: admin.surface`, `border: 1px solid ${admin.border}`.
- Mode label uses `c.fg` color; progress line uses `admin.text`; meta line uses `admin.textDim`.
- Right side labels: `admin.textDim` for label, `admin.text` for value.

**Scrape result + error**
- Replace blue `<div>` block with `<div className="mb-6"><InfoBanner>{scrapeMsg}</InfoBanner></div>`.
- Replace red `<div>` block with `<div className="mb-6"><ErrorBanner>{errMsg}</ErrorBanner></div>`.

**Status filter tabs**
Rounded-full pill row using the same tokens as `SegmentedToggle`, but keep the local map because each pill includes a count:
```tsx
<div role="tablist" className="inline-flex items-center gap-1 rounded-full p-1 mb-6"
  style={{ backgroundColor: admin.surface, border: `1px solid ${admin.border}` }}>
  {FILTERS.map(f => {
    const active = filter === f.value;
    const count = f.value === "all" ? leads.length : counts[f.value] ?? 0;
    return (
      <button key={f.value} onClick={() => setFilter(f.value)}
        aria-pressed={active}
        className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
        style={{
          backgroundColor: active ? admin.surface2 : "transparent",
          color: active ? admin.text : admin.textMuted,
        }}>
        {f.label}
        <span className="ml-2 font-mono text-[11px]"
          style={{ color: admin.textDim }}>{count}</span>
      </button>
    );
  })}
</div>
```

**Loading state**
- `<p style={{ color: admin.textDim }} className="text-sm">Loading…</p>`.

**Local EmptyState (keep name — do NOT import shared one)**
- Filter-specific branch: `<p className="text-sm" style={{ color: admin.textDim }}>…</p>`.
- Default branch: wrap in a token-styled card with dashed border:
  ```tsx
  <div className="rounded-2xl p-8 text-center"
    style={{ backgroundColor: admin.surface, border: `1px dashed ${admin.border}` }}>
    <p className="text-sm mb-2" style={{ color: admin.textMuted }}>No warm leads yet.</p>
    <p className="text-xs max-w-md mx-auto" style={{ color: admin.textDim }}>
      Click <span style={{ color: admin.text }}>Run now</span> to scrape…
    </p>
  </div>
  ```

**WarmLeadCard**
Convert the `<Link>` to use admin tokens (kept as a Link, all data unchanged):
- `backgroundColor: admin.surface`, `border: 1px solid ${admin.border}`, `rounded-2xl p-4`.
- Hover: `hover:[background-color:${admin.surface2}]` via Tailwind arbitrary; raise to `borderStrong` via inline `onMouseEnter` not needed — use Tailwind `transition-colors` + `hover:[border-color:rgba(255,255,255,0.12)]`.
- Source label / meta: `admin.textDim`; handle: `admin.textMuted`; headline: `admin.text`; excerpt: `admin.textMuted`; bottom meta row: `admin.textDim`.

**ConfigDrawer**
- Source-row container in the Sources list: swap to `admin.surface` + `admin.border`, keep `rounded-md px-3 py-2`. Wrap the entire Sources `<div className="space-y-2">` in nothing extra; only individual rows are restyled. The row text: name → `admin.text`, meta → `admin.textDim`.
- All helper `<p className="text-xs text-gray-500 mt-2">` blocks → use `style={{ color: admin.textDim }}`.
- The form-level container doesn't need an AdminCard wrapper (it lives inside a Sheet); only the source rows + helper texts get restyled.

### Out of scope
No changes to queries, `triggerScrapeNow`, `updateWarmLeadSettings`, `updateWarmLeadSource`, filter state, drawer open/close logic, or any handler. No new dependencies. TypeScript must compile clean.
