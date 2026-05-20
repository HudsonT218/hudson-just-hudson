## Open-surface leads board

Refactor the leads board from four bordered, tinted panels into a single open surface separated by whitespace, with status color moved onto each card as a left accent stripe.

### 1. `theme.ts` — add a `strong` status color

Extend `LEAD_STATUS_COLORS` with a `strong` field per status (used for the card accent stripe). Keep `dot` and `soft` for backward compatibility (not used by board anymore, but `dot` is still used by `StatusDot` elsewhere, e.g. `LeadDetailModal`/`StatusBadge`).

```ts
export const LEAD_STATUS_COLORS: Record<LeadStatus, { dot: string; soft: string; strong: string }> = {
  cold:   { dot: "rgb(156,163,175)", soft: "rgba(255,255,255,0.06)",  strong: "rgb(156,163,175)" },
  warm:   { dot: "#60a5fa",          soft: "rgba(59,130,246,0.15)",   strong: "#3b82f6" },
  client: { dot: "#34d399",          soft: "rgba(16,185,129,0.15)",   strong: "#10b981" },
  dead:   { dot: "rgb(252,165,165)", soft: "rgba(127,29,29,0.25)",    strong: "#ef4444" },
};
```

### 2. `LeadBoard.tsx` — open surface

- Remove the `tint`, `border`, and rounded panel styling from `Column`. The column becomes a plain vertical stack:
  - Header row: status label (existing micro-uppercase style in `admin.textDim`) on the left, count in mono on the right.
  - Remove `<StatusDot>` from the header.
  - Below the header row, a 1px hairline (`borderBottom: 1px solid ${admin.border}`) sits directly under the title — small bottom margin before the cards.
- Keep column width `300`, keep `shrink-0`, keep `opacity: 0.65` on Dead.
- Drag feedback: when `isOver` from `useDroppable`, set the cards container's background to `admin.surface2` with a subtle `rounded-xl` and a short transition. No permanent panel background otherwise (transparent).
- Keep `SortableContext`, the `min-h-[120px]` droppable area, skeletons, the "No leads" empty text, and the outer `flex gap-4 overflow-x-auto` row exactly as today.
- Keep `aria-label`/`role="list"` on the column for accessibility (label still uses the status name + count).

### 3. `LeadCard.tsx` — left accent stripe

- Wrap the card content in a `relative` container with `overflow-hidden` so the inner stripe respects the rounded corners (no `border-left`, no clipped corners).
- Add an absolutely positioned inner bar:
  ```tsx
  <span aria-hidden style={{
    position: "absolute", left: 0, top: 6, bottom: 6, width: 3,
    borderRadius: 9999,
    backgroundColor: LEAD_STATUS_COLORS[lead.status].strong,
  }} />
  ```
  (Small top/bottom inset so the pill reads as an inner accent rather than touching the card edge.)
- Add `paddingLeft` ~`12px` (so text doesn't collide with the stripe) while keeping current `p-3` for the other sides.
- Everything else — drag/sortable wiring, click-vs-drag pointer logic, name + company, last contact, next-action overdue amber, hover/focus ring, `opacity 0.5` while dragging — stays unchanged.

### 4. Out of scope

- No changes to data layer, dnd-kit setup, optimistic updates, modal, list view, or `Leads.tsx`.
- No new dependencies.
- `StatusDot` itself is not removed (still used elsewhere) — just no longer rendered in the column header.

### Verification

- Board renders as one continuous dark surface with four labeled columns separated only by gap whitespace.
- Each card shows a thin colored stripe matching its status; corners remain fully rounded.
- Dragging a card highlights the hovered column with a faint `surface2` background.
- Drag-and-drop between columns still updates status; clicking a card still opens the modal at `/admin/leads/:id`.
- No TypeScript or build errors.
