## References Admin UI — Phase B

Build the admin moderation UI for the references system. All work is admin-side; public pages and configurator are untouched.

### 1. Status badge support
Extend `src/pages/admin/_components/StatusBadge.tsx` with two new exports:
- `ReferenceRequestStatusBadge` — pending=gray, submitted=green, expired=amber, revoked=red
- `ReferenceStatusBadge` — pending_review=amber, approved=green, rejected=red, hidden=gray

Reuses the existing `Pill` component for visual consistency.

### 2. New admin page: `src/pages/admin/References.tsx`
Wraps `<AdminLayout>` + `<Helmet noindex>`. Matches `Leads.tsx` styling (dark theme, semi-opaque cards, mono pills, `letter-spacing: -0.02em` headings).

**Section 1 — Request a Reference (form row)**
Inline `<form>` with email input, name input, "Send Invite" button. Calls `supabase.functions.invoke('send-reference-invite', { body: { email, name } })`. Sonner toasts on success/error; refreshes the invites table.

**Section 2 — Invites Sent (table)**
- `listReferenceRequests()` powers the rows.
- Columns: Email · Name · Status · Sent · Expires · Submitted · Actions.
- Status chip uses new `ReferenceRequestStatusBadge`.
- Actions on `pending` rows: **Resend** (re-invokes `send-reference-invite` with same email; server revokes old + creates new), **Revoke** (invokes `revoke-reference-invite`).
- Empty state: "No invites yet. Send your first one above."

**Section 3 — Pending Review (cards)**
- `listPendingReviewReferences()`.
- Card: name + role/title (gray-400, sm), headline (`text-lg italic`), submitted date, LinkedIn (target=_blank, rel=noopener), buttons: **Approve** (white bg) → `updateReferenceStatus(id,'approved')`, **Reject** (red border) → AlertDialog confirm → `updateReferenceStatus(id,'rejected')`, **View Raw** (ghost) → toggles a `<pre>` JSON view of the record.
- Empty state: "No pending references."

**Section 4 — Live on Site (sortable list)**
- `listApprovedReferencesPublic()` → ordered by `display_order` asc.
  - Note: this view exposes `id, name, role_title, headline, linkedin_url, display_order, created_at` — sufficient for the row UI. The admin RLS already allows full reads, but using the view keeps a single source of truth for ordering.
- `@dnd-kit/core` + `@dnd-kit/sortable` (already installed for the configurator). Vertical `SortableContext` with `verticalListSortingStrategy`.
- Each row: drag handle (`GripVertical` lucide icon, left, `cursor-grab`), name + role, headline truncated to one line. Right side: **Hide** button → `updateReferenceStatus(id,'hidden')`.
- On drag-end: optimistic local reorder, then `updateReferenceDisplayOrder(updates)` with new indices for all moved items (simple full-resequence on change).
- Empty state: "No approved references yet."

**Section 5 — Archive (collapsible)**
- shadcn `Accordion` (single, collapsed by default) at the bottom.
- `listArchivedReferences()` → rejected + hidden.
- Row: name + role + status chip + **Un-archive** → `updateReferenceStatus(id,'pending_review')`.

Local state pattern follows `Leads.tsx`: per-section loading/error, single `refresh()` reloads everything, `useEffect` initial fetch with `cancelled` guard.

### 3. Sidebar nav
Add `{ label: "References", to: "/admin/references" }` to the `NAV` array in `src/components/admin/AdminLayout.tsx`.

### 4. Routing
In `src/App.tsx`:
```ts
const AdminReferences = lazy(() => import("./pages/admin/References.tsx"));
```
Add the route alongside the other admin routes:
```tsx
<Route path="/admin/references" element={
  <ConfiguratorBoundary><AdminRoute><AdminReferences /></AdminRoute></ConfiguratorBoundary>
} />
```

### Files touched
- `src/pages/admin/References.tsx` (new)
- `src/pages/admin/_components/StatusBadge.tsx` (extend)
- `src/components/admin/AdminLayout.tsx` (nav entry)
- `src/App.tsx` (lazy import + route)

### Out of scope
Public `/reference/:token` submit page (Phase C), public references display on `/work` or `/`, any changes to the configurator, public marketing pages, or edge functions.