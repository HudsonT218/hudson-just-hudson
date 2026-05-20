Polish pass — leads page + admin shell. Presentation-only; no data, route, or dependency changes.

**1. Loading / empty / error states**

- `LeadBoard.tsx`: accept optional `loading?: boolean`. When loading, render 3 skeleton cards per column (animated `bg` with `admin.surface2`, `animate-pulse`). Per-column empty: small "No leads" line styled in `admin.textDim`. Whole-board empty (all columns empty, not loading): centered `EmptyState` above the columns row.
- `LeadListView.tsx`: skeleton rows when `loading`; empty state when no rows (already present) — restyle to use theme tokens; preserve status filter.
- `Leads.tsx`: replace the bare "Loading…" text with the board/list rendering passing `loading`. Promote inline error block to a small `ErrorBanner` helper using `admin.*` tokens (red tinted bg/border, already-themed). Apply same banner inside `LeadDetailModal` (already styled — keep).

**2. Responsive**

- Board already scrolls horizontally (`overflow-x-auto`); confirm columns keep `shrink-0` and `width: 300`.
- `Leads.tsx` page padding: change `px-10 py-10` → `px-4 sm:px-6 lg:px-10 py-6 lg:py-10` so the header doesn't crowd on narrow widths.
- `AdminPageHeader`: allow actions to wrap (`flex-wrap`) so SegmentedToggle + Add Lead don't overflow.
- Search input: keep `max-w-sm`, but width `w-full` on small.
- `AdminLayout.tsx`: sidebar stays 220px fixed (per project rule). Add `overflow-x-hidden` on main to prevent horizontal page bleed.

**3. Accessibility**

- `LeadBoard.tsx`: keyboard drag already wired via `KeyboardSensor`. Add `aria-label` on `DndContext` wrapper container ("Leads board, drag with space then arrow keys"). Each column gets `role="list"` + `aria-label="{Status} column, {n} leads"`.
- `LeadCard.tsx`: add `aria-label="Drag {lead.name}, status {status}"` on the draggable element, and `role="button"` already implicit via listeners; add `tabIndex={0}` already from dnd-kit attributes.
- `Leads.tsx`: `aria-label="Search leads by name or company"` on the search input; SegmentedToggle buttons get `aria-pressed={active}` and a wrapping `role="group" aria-label="View mode"` — update `SegmentedToggle` primitive in `ui.tsx`.
- `LeadDetailModal.tsx`: shadcn Dialog already traps focus and restores; add a visible accessible name (replace `VisuallyHidden` title with the lead name as the actual heading inside the header instead of the bare `<input>` — keep the input editable but mark with `aria-label`). Already has aria-label, good.
- **prefers-reduced-motion**: in `index.css` add a global rule that disables `transition` and `animation` and dnd-kit transform animations when `(prefers-reduced-motion: reduce)`. Also gate the `transition` prop on `LeadCard`'s sortable style to `undefined` when reduced motion is preferred (small `useReducedMotion`-style hook reading `matchMedia`).

**4. Dead column**

- Confirm `opacity: 0.65` reads well; keep as-is. Add `aria-label` including the count so SR users get the same emphasis cue verbally.

**5. Verification**

- After edits: read updated files, then visually verify the preview at `/admin/leads` (board renders, list toggles, drag works, modal opens/closes via row click and ESC). Look for TS errors via build output.

**Files touched**

- edit `src/pages/admin/Leads.tsx`
- edit `src/pages/admin/_components/LeadBoard.tsx`
- edit `src/pages/admin/_components/LeadCard.tsx`
- edit `src/pages/admin/_components/LeadListView.tsx`
- edit `src/pages/admin/_components/ui.tsx` (SegmentedToggle a11y; add `SkeletonCard` helper)
- edit `src/components/admin/AdminLayout.tsx` (main overflow guard)
- edit `src/index.css` (reduced-motion global)

No new dependencies. No data-layer changes.