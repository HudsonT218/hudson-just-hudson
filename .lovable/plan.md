Restyle `src/pages/admin/ProjectDetail.tsx` to match the admin design system. Visual-only — keep every handler, `saveField`, `useEffect` queries, time-entry form, and delete actions identical.

### What to change

1. **Imports**
   - Add `admin` from `./_components/theme`.
   - Add `AdminCard`, `SectionLabel`, `SkeletonBlock`, `ErrorBanner`, `EmptyState` from `./_components/ui`.

2. **Loading state**
   - Replace `<div className="px-10 py-10 text-sm text-gray-500">Loading…</div>` with a `px-10 py-10 max-w-3xl` shell containing a `SkeletonBlock` stack (e.g., one `h-8 w-1/2` title + 3 `h-32 w-full rounded-2xl` cards) using `admin` tokens.

3. **Not-found state**
   - Use `<EmptyState>Project not found.</EmptyState>` and restyle the back link to use `admin.textMuted` → `admin.text` on hover (`hover:text-white`).

4. **Back link ("← Projects")**
   - Color: `admin.textMuted`, hover `admin.text` via inline style + Tailwind hover class. Keep behavior.

5. **Error banner**
   - Replace inline red `<div>` with `<div className="mb-6"><ErrorBanner>{error}</ErrorBanner></div>`.

6. **Header row (name input + status select)**
   - Keep inline-editable `<input>` and the `<Select>` exactly. Just set `style={{ color: admin.text }}` on the input and change `text-gray-500` → use `admin.textMuted` inline. Keep `letterSpacing: "-0.02em"`. Blue link to lead → keep color `#60a5fa` (admin doesn't have a link token; safe to leave). Actually use `admin.accent` for the lead link to align with tokens.

7. **`Section` helper rebuild**
   - Render the title as `<SectionLabel className="mb-3">{title}</SectionLabel>`.
   - Wrap children in `<AdminCard>{children}</AdminCard>`.
   - Keep `<section className="mb-8">` wrapper.
   - All inputs/Selects/Textareas inside stay untouched.
   - Labels inside sections: change `text-xs text-gray-500` → inline `style={{ color: admin.textMuted }}` with `text-xs mb-1 block`.

8. **Time-entries table**
   - Wrapper: `rounded-md overflow-hidden` with `backgroundColor: admin.surface`, `border: 1px solid ${admin.border}`.
   - `thead` row border: `1px solid ${admin.border}`.
   - `th` cells: `text-[10px] uppercase tracking-[0.14em] font-medium` with `color: admin.textDim`.
   - `tbody tr` top border (non-first): `1px solid ${admin.border}`.
   - `td` colors:
     - Date: `admin.textMuted`
     - Hours: `admin.text` font-mono
     - Description: `admin.text` font-light (or `admin.textMuted`-ish; use `admin.text` for readability)
     - Delete button: `admin.textDim` → hover `text-red-400` (keep red)
   - `tfoot tr` top border: `1px solid ${admin.borderStrong}`.
   - Total label cell: `admin.textDim` small caps; total hours `admin.text` mono; billed cell `admin.textMuted`.
   - Empty entries text: replace with `<EmptyState>No time logged yet.</EmptyState>`.

9. **Time-entry form**
   - Keep markup/layout. No color overrides needed beyond shadcn defaults.

10. **Notes section**
   - No change beyond Section helper wrap.

11. **Dashed Phase 2/3 placeholders**
   - Keep dashed style. Update to:
     ```
     style={{
       backgroundColor: admin.surface,
       border: `1px dashed ${admin.border}`,
       color: admin.textDim,
     }}
     ```
   - Use existing `rounded-2xl p-6 mt-8 text-sm` / `mt-3` classes.

12. **All color swaps**
   - `text-gray-500/600/400/300` → token equivalents (`textMuted`, `textDim`, `text`).
   - `text-white` → `admin.text`.
   - `text-blue-400 hover:text-blue-300` for lead link → `admin.accent` inline color.
   - Any `rgba(...)` → admin token equivalent.

### Out of scope
- No changes to `saveField`, `refresh`, `useEffect`, `handleLogTime`, `handleDeleteEntry`, routing, types, or any other file.
- No new dependencies; no `theme.ts`/`ui.tsx` changes.

### Verification
- Visual match to Leads/Projects.
- TypeScript compiles cleanly.