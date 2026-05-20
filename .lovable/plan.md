# Restyle Admin Dashboard to match Leads page

Visual-only refactor of `src/pages/admin/Dashboard.tsx`. No changes to queries, data, routes, or behavior. No new files, no new deps.

## Changes (single file: `src/pages/admin/Dashboard.tsx`)

### Imports
Add: `AdminPageHeader, AdminCard, SectionLabel, SkeletonBlock, ErrorBanner, EmptyState` from `./_components/ui` and `admin` from `./_components/theme`.

### Page shell
- Replace the `<h1>Dashboard</h1>` with `<AdminPageHeader title="Dashboard" className="mb-8" />`.
- Keep the existing `<div className="px-10 py-10">` wrapper and `<Helmet>`.

### Error state
- Replace the inline red error `<div>` with `{error && <ErrorBanner>{error}</ErrorBanner>}` wrapped in a `mb-6` container.

### StatCard helper (rewritten, same props/signature)
- Card: `rounded-2xl p-6 h-full` with inline style `{ backgroundColor: admin.surface, border: 1px solid ${admin.border} }`.
- Label: small uppercase, `tracking-[0.14em]`, `text-[10px]`, color `admin.textDim` (reusing the same look as `SectionLabel`).
- Value: large number, `text-4xl font-extrabold`, color `admin.text`, `letterSpacing: -0.03em`.
- Loading: render a `SkeletonBlock` sized like the number (`h-9 w-20`) instead of `…`.
- Keep optional `to` → `<Link>` wrap unchanged.

### Panel helper (rewritten)
- Outer: `AdminCard` with `className="p-0 overflow-hidden"` (override default padding so list rows stretch edge-to-edge).
- Header: a `px-5 py-4` row containing `<SectionLabel>{title}</SectionLabel>`.
- Children render below, unchanged in structure.
- List row dividers: replace `borderTop: 1px solid rgba(255,255,255,0.05)` with `borderTop: 1px solid ${admin.border}`.
- Row hover: replace `hover:bg-white/[0.02]` with an inline hover via Tailwind arbitrary value using the token, e.g. `hover:[background-color:rgba(255,255,255,0.04)]` (matches `surface2`).
- Inner text colors: replace `text-white` → `style={{ color: admin.text }}`; `text-gray-500/600` → `admin.textDim`; `text-gray-400` → `admin.textMuted`. The blue link inside the warm-leads empty hint stays themed via `admin.accent`.

### Empty + loading states
- Replace the `EmptyHint` helper with the `EmptyState` primitive (drop the local helper).
- Replace the bare `"Loading…"` placeholders inside each Panel with a small stack of `SkeletonBlock`s (e.g. 3 rows of `h-12 w-full` with `border-top` dividers using `admin.border`) so the panels show structured shimmer instead of text.

### Footer reference line
- Keep the existing `<p>` text; change `text-gray-700` to inline `style={{ color: admin.textDim, opacity: 0.7 }}` (or just `admin.textDim`).

## Out of scope
- No changes to `useQuery` calls, query keys, fetched fields, routes, or status badge components.
- No new tokens added to `theme.ts`; existing tokens are sufficient.
- No edits to `ui.tsx` or any other file.

## Verification
- TypeScript compiles (helper signatures preserved).
- Visual parity with Leads page: same surface, border, radius, header label treatment, skeletons, empty/error styling.
