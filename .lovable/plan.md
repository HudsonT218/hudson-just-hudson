Convert lead detail from a full page to a centered modal over the leads board.

## Files

### New: `src/pages/admin/_components/LeadDetailModal.tsx`
- Props: `{ leadId: string; open: boolean; onClose: () => void }`.
- Move the entire body/logic of `LeadDetail.tsx` here, dropping the outer `AdminLayout` wrapper and the `← Leads` back link.
- Wrap content in shadcn `Dialog` (`open`, `onOpenChange={(o) => !o && onClose()}`). Use `DialogContent` with `max-w-3xl w-full max-h-[85vh] p-0 overflow-hidden` and apply theme tokens via inline style (`backgroundColor: admin.bg`, `border: 1px solid admin.border`, `color: admin.text`).
- Internal layout:
  - Sticky header (`DialogHeader`) inside DialogContent: lead-name input + saving indicator on left, status `Select` on right, padding `px-6 py-4`, `borderBottom: 1px solid admin.border`. Visually-hidden `DialogTitle` set to `lead.name` for a11y.
  - Scrollable body `<div className="overflow-y-auto px-6 py-5">` containing the Info / Notes / Next Action / Projects sections + the dashed "Outreach drafts" placeholder.
- Replace hardcoded grays/rgba with `admin.text`, `admin.textMuted`, `admin.textDim`, `admin.surface`, `admin.border`, etc. Keep the red error banner as-is (semantic).
- Reuse internal `Section` and `FieldRow` helpers, restyled with tokens (label color `admin.textDim`).
- Keep ALL existing behavior verbatim:
  - `useEffect` lead+projects load keyed on `leadId` (rename from `id`).
  - `saveField` inline-edit pattern, `savingField` indicator, `refresh()`.
  - Status `Select` with `LEAD_STATUSES`.
  - Projects list with `Link` to `/admin/projects/:id` and `ProjectTypeBadge` / `ProjectStatusBadge`.
  - `AddProjectDrawer` (Sheet) rendered as a sibling AFTER `Dialog` close tag so it portals independently and isn't trapped/closed by the Dialog. Both Dialog and Sheet use Radix portals + focus traps; Radix supports nested modals — confirm in preview that opening the project drawer doesn't dismiss the Dialog.
- Loading state: render Dialog with a small centered "Loading…" body. Not-found state: render Dialog with "Lead not found" + Close action.

### Edit: `src/App.tsx`
- Remove `const AdminLeadDetail = lazy(...)` import (line 40).
- Change `/admin/leads/:id` route to render `<AdminRoute><AdminLeads /></AdminRoute>` (same as `/admin/leads`).

### Edit: `src/pages/admin/Leads.tsx`
- Import `useParams`, `useNavigate` from react-router-dom and `LeadDetailModal`.
- Inside `Leads`: `const { id: detailId } = useParams<{ id: string }>();` and `const navigate = useNavigate();`.
- After existing render, conditionally render `{detailId && <LeadDetailModal leadId={detailId} open onClose={() => navigate("/admin/leads")} />}`.
- When the modal closes (X, escape, overlay click, or post-action), `navigate("/admin/leads")` so the URL syncs and the browser back button keeps working naturally (deep links work because the route renders `<AdminLeads />` for both paths, and `useParams` extracts the id).
- `LeadCard` already navigates to `/admin/leads/<id>` on click — no change there. (LeadRow in the future List view should do the same.)
- After save/delete actions inside the modal, invalidate `["admin","leads"]` so the underlying board reflects edits when the modal closes. Add a `qc.invalidateQueries` call in the `onClose` handler.

### Edit: `src/components/admin/AdminLayout.tsx`
- Remove the `void import("@/pages/admin/LeadDetail")` line from `preloadAdminChunks`.

### Delete: `src/pages/admin/LeadDetail.tsx`
- Remove the file once all references are gone.

## Technical notes
- No new dependencies. `Dialog` (`@/components/ui/dialog`) and `Sheet` already exist.
- Nested Radix modals (Dialog containing a Sheet trigger): supported — confirm interactively in preview after build.
- Deep linking: visiting `/admin/leads/abc` directly will render `<AdminLeads />` (board) with the modal open immediately. Back button pops the URL back to `/admin/leads`, which closes the modal.
- No type changes; `LeadUpdate` and `getLead`/`updateLead` signatures unchanged.

## Verification
- TS build passes.
- `/admin/leads` shows board; clicking a card opens centered modal with all fields editable; clicking a card's `+ New Project` opens the Sheet without closing the Dialog; closing the Dialog returns to board; deep link works; browser back closes the modal.