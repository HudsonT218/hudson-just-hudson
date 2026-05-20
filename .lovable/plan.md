Rebuild `src/pages/admin/Leads.tsx` as a Board/List page (Board view this step). Presentation + drag-and-drop only — no backend, types, or dependency changes.

## Files

### New: `src/pages/admin/_components/LeadCard.tsx`
Sortable card consumed by the board.
- Props: `lead: Lead`.
- Uses `useSortable({ id: lead.id, data: { status: lead.status } })`.
- Spread `attributes`, `listeners`, `setNodeRef`; apply `CSS.Transform.toString(transform)` + `transition`.
- Wrapper styled with `admin.surface`, 1px `admin.border`, rounded-xl, padding ~12px. Hover state raises border to `admin.borderStrong`.
- Distinguish click vs drag: track pointerdown coords; if pointerup moves < 5px and not dragging, call `navigate(`/admin/leads/${lead.id}`)`. (Drag listeners stay attached so dnd-kit owns motion.) Simpler: render a small `View` affordance — but spec wants whole-card click. Implement using `onClick` on the wrapper that bails out if `isDragging` is true.
- Content:
  - Top: name in semibold white, company muted inline (`· {company}`).
  - `SectionLabel`-style "LAST CONTACT" micro-row with `formatDate(lead.last_contact_date)`.
  - `SectionLabel`-style "NEXT" micro-row with `next_action` + `next_action_date`; if `next_action_date < today`, color the date in amber (`#f59e0b`).

### New: `src/pages/admin/_components/LeadBoard.tsx`
- Props: `leads: Lead[]`, `onMove: (id: string, status: LeadStatus) => void`.
- Set up `DndContext` with `PointerSensor` (activationConstraint `{ distance: 5 }`) and `KeyboardSensor` (sortableKeyboardCoordinates).
- Group leads by status into 4 buckets: cold, warm, client, dead.
- Render 4 columns in a horizontally-scrolling flex row (`overflow-x-auto`), each column min-width ~280px.
- Each column:
  - Panel: 1px `admin.border`, rounded-2xl, background = column's `LEAD_STATUS_COLORS[status].soft` (already a faint tint).
  - Header row: `StatusDot` + uppercase letter-spaced label (reuse SectionLabel) + count on right in mono font (`font-mono text-xs`, `admin.textDim`).
  - Body: `SortableContext` (items = lead ids in that column, strategy `verticalListSortingStrategy`) wrapping a column drop target (a div registered via `useDroppable({ id: `column:${status}` })`) containing the LeadCards.
  - Dead column wrapper gets `opacity: 0.65`.
- `onDragEnd`:
  - Determine destination status: if `over.data.current?.sortable?.containerId` exists use that; else if `over.id` starts with `column:` use the suffix; else look up the over-id in the lead map and use its current status.
  - If destination differs from active lead's current status → call `onMove(activeId, newStatus)`.

### Rewrite: `src/pages/admin/Leads.tsx`
- Drop `FILTERS`, the filter tab strip, the existing inline `LeadCard`, and the `Link`/Select-based row layout.
- Keep `AddLeadDrawer` exactly as-is (move it below or leave inline — no behavior change).
- Header via `AdminPageHeader`:
  - title: "Leads"
  - actions: `SegmentedToggle<"board"|"list">` (options Board / List) + existing `Button` "+ Add Lead".
- View state persisted in `localStorage` key `admin.leads.view` (default `"board"`). Read in initial state via lazy initializer; write in a `useEffect` on change.
- Search input below header (full-width, max-width ~360px), styled with `admin.surface` + `admin.border`. Filters by `name` and `company` (case-insensitive substring). Applied to both views.
- Filtered leads passed to `<LeadBoard leads={filtered} onMove={handleStatusChange} />` when view === "board".
- When view === "list": render a temporary placeholder `<EmptyState>List view coming soon.</EmptyState>` (built next step).
- Keep `handleStatusChange` with the exact same optimistic React Query cache update + invalidation pattern; pass it to LeadBoard as `onMove`.
- Keep `LEADS_KEY`, query, error banner, loading state.

## Technical notes
- Cards & columns share the `admin.*` tokens — no new hardcoded rgba.
- Drag-vs-click: PointerSensor `{ distance: 5 }` ensures a real click never triggers a drag; the card's `onClick` runs only when no drag occurred.
- Overdue check: `new Date(lead.next_action_date) < startOfToday()` (compute startOfToday manually, no date-fns import needed).
- No dependency changes; `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` already in package.json.
- Lead detail modal route is built in the next step; navigation target `/admin/leads/:id` stays the same.

## Verification
TS build passes; `/admin/leads` renders 4 kanban columns; dragging across columns updates status optimistically and survives a refresh; click on a card navigates to detail route.