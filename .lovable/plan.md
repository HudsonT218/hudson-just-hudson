**Goal:** Replace the placeholder "List view coming soon" on the Leads page with a fully styled table view.

**What will be built**
1. **New file:** `src/pages/admin/_components/LeadListView.tsx`
   - A shadcn `Table` with columns: **Name**, **Company**, **Status** (using existing `LeadStatusBadge`), **Last contact**, **Next action**.
   - Each row is clickable and navigates to `/admin/leads/<id>` to open the detail modal.
   - Overdue next-action dates shown in amber (`#f59e0b`), same logic as `LeadCard`.
   - A status-filter dropdown ("All statuses" + each lead status) placed above the table.
   - Styled entirely with `theme.ts` tokens (`admin.*` colors, borders, surfaces).
   - Empty state when no leads match filters.

2. **Edit:** `src/pages/admin/Leads.tsx`
   - Import `LeadListView`.
   - Replace the `<EmptyState>List view coming soon.</EmptyState>` placeholder with `<LeadListView leads={filtered} />`.
   - The existing search input continues to apply (parent already filters `leads` before passing them down).

**What will NOT change**
- No data layer, API, or backend changes.
- No new npm dependencies.
- No route or modal changes.
- Board view stays exactly as-is.

**Validation:** TypeScript and build will be checked after edits.