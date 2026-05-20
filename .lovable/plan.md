Restyle `src/pages/admin/Projects.tsx` to match the Leads page design system. Visual-only — no data, filtering, or behavior changes.

### What to change

1. **Imports**
   - Add `AdminPageHeader`, `AdminCard`, `SkeletonBlock`, `ErrorBanner`, `EmptyState` from `./_components/ui`.
   - Add `admin` from `./_components/theme`.

2. **Page header**
   - Replace the inline `<h1>` + `<Button>` row with `<AdminPageHeader title="Projects" actions={<Button onClick={() => setDrawerOpen(true)}>+ New Project</Button>} className="mb-8" />`.

3. **Filter tab strip**
   - Keep all filter buttons, counts, and click behavior exactly as-is.
   - Restyle the container to a `rounded-full` pill row: background `admin.surface`, border `1px solid ${admin.border}`, padding `p-1`.
   - Active pill: `backgroundColor: admin.surface2`, `color: admin.text`, `rounded-full`.
   - Inactive pill: `backgroundColor: transparent`, `color: admin.textMuted`.
   - Count text uses `admin.textMuted`.

4. **Error state**
   - Replace the inline red `<div>` with `<ErrorBanner>{errMsg}</ErrorBanner>`.

5. **Loading state**
   - Replace `Loading…` text with a `SkeletonBlock` grid placeholder (e.g., a 2-column grid of 4 `SkeletonBlock` cards with `h-28` and full width).

6. **Empty state**
   - Replace the bare `<p>` with `<EmptyState>`.

7. **Project cards**
   - Wrap each `<Link>` grid item in `<AdminCard>` (or apply `AdminCard` styling directly: `admin.surface` bg, `1px solid ${admin.border}` border, `rounded-2xl p-5`).
   - Hover: `hover:[background-color:${admin.surface2}]` or `hover:bg-[rgba(255,255,255,0.04)]`.
   - Keep them as `Link` to `/admin/projects/:id`.
   - Swap all hardcoded colors:
     - `text-white` → `admin.text`
     - `text-gray-500` → `admin.textMuted`
     - `text-gray-400` / `text-gray-600` → `admin.textDim`
   - Remove inline `style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '...' }}` on cards in favor of `AdminCard` or `admin` tokens.

8. **What stays the same**
   - `useQuery` calls, query keys, `filter` state logic, `AddProjectDrawer`, `counts`, `visible`, all navigation.
   - No new dependencies.

### Out of scope
- No changes to data layer, routes, `theme.ts`, `ui.tsx`, or any other file.

### Verification
- TypeScript compiles clean (`bunx tsc --noEmit`).