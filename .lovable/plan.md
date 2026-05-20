## Plan: restyle `src/pages/admin/WarmLeadDetail.tsx` (visual only)

**Imports** — add:
```ts
import { admin } from "./_components/theme";
import { AdminCard, SectionLabel, ErrorBanner, InfoBanner, EmptyState } from "./_components/ui";
```

**Loading state** — replace with `<EmptyState>Loading…</EmptyState>` inside the existing `px-4 sm:px-6 lg:px-10 py-6 lg:py-10` wrapper.

**Not-found state** — `<EmptyState>Warm lead not found.</EmptyState>` plus a back link styled as `text-xs` with `color: admin.textDim` and hover `admin.text`.

**Page shell** — change wrapper to `px-4 sm:px-6 lg:px-10 py-6 lg:py-10 max-w-3xl`.

**Back link** — `text-xs inline-block mb-6` with `color: admin.textDim`, hover → `admin.text`.

**Banners**
- `{error && <div className="mb-6"><ErrorBanner>{error}</ErrorBanner></div>}`
- `{info && <div className="mb-6"><InfoBanner>{info}</InfoBanner></div>}`

**Header block** — keep structure (score pill, source label, handle link, date, title, status `Select`):
- Source label: `font-mono text-[10px] uppercase tracking-[0.14em]` with `color: admin.textDim`.
- Handle link: `color: admin.textMuted`, hover → `admin.accent`.
- Date: `color: admin.textDim`.
- Title h1: `text-2xl font-semibold` with `color: admin.text` and `letterSpacing: "-0.02em"`.

**Quick action bar** — keep every button and handler. Restyle ghost buttons with `style={{ color: admin.textMuted }}` (Skip uses `admin.textDim`). Spacing unchanged.

**`Section` helper** — rebuild as:
```tsx
const Section = ({ title, children }) => (
  <section className="mb-8">
    <SectionLabel className="mb-3">{title}</SectionLabel>
    <AdminCard>{children}</AdminCard>
  </section>
);
```

**Section content text colors**
- Original post `<p>`: `color: admin.text`.
- Reasoning `<p>`: `color: admin.textMuted`.
- Draft `<Label>`: `text-xs mb-2 block`, `color: admin.textDim`.
- `ai-drafted` line: `text-[10px] mt-2 font-mono`, `color: admin.textDim`.

**Matched-keyword pills** — token-based:
```tsx
style={{
  backgroundColor: admin.surface2,
  border: `1px solid ${admin.border}`,
  color: admin.textMuted,
}}
```

**Linked CRM line** — `text-xs` with `color: admin.textDim`; inner Link uses `color: admin.accent`, hover unchanged via Tailwind.

### Out of scope
No changes to handlers (`saveDraft`, `setStatus`, `copyDraft`, `handleApproveAndPromote`), `getWarmLead`/`updateWarmLead`/`promoteWarmLead` calls, routing, or state. No new deps. Must compile clean.
