Restyle `src/pages/admin/References.tsx` to match the admin design system. Visual-only — keep every Supabase call, dnd-kit logic, toast call, query, and handler unchanged.

### What to change

1. **Imports** — add `admin` from `./_components/theme` and `AdminPageHeader, AdminCard, ErrorBanner, EmptyState` from `./_components/ui`. Remove the `sectionCard` style constant.

2. **Page shell**
   - Replace `<h1>References</h1>` with `<AdminPageHeader title="References" />`.
   - Replace inline red error `<div>` with `<ErrorBanner>{errorMsg}</ErrorBanner>`.

3. **Reusable section heading style** — all five section `<h2>` headings use:
   ```tsx
   <h2 className="text-lg font-semibold mb-4" style={{ color: admin.text, letterSpacing: "-0.01em" }}>
   ```

4. **InviteSection (Section 1)**
   - Replace `<form ... style={sectionCard}>` wrapper with `<AdminCard>` and put the form inside (form keeps its flex layout & inputs unchanged).

5. **InvitesTable (Section 2)**
   - Wrap the table area in `<AdminCard className="p-0 overflow-hidden">`.
   - Loading/empty → `<EmptyState>` (wrap inside an `AdminCard` for consistent surface, or render directly inside the card).
   - `TableRow` header: `hover:bg-transparent` with `borderColor: admin.border` via Tailwind arbitrary `[border-color:rgba(255,255,255,0.06)]` or inline style. Same for body rows. Hover: `hover:[background-color:rgba(255,255,255,0.04)]`.
   - Cell text colors: email = `admin.text`, name = `admin.textMuted`, date cells = `admin.textDim`, "—" placeholder = `admin.textDim`.
   - Keep Resend / Revoke buttons; restyle Revoke text via `text-destructive`-style classes — but spec says keep functions — so use `style={{ color: "#fca5a5" }}` (still red) → simpler: leave existing `text-red-400 hover:text-red-300` for Revoke (semantic red is OK).

6. **PendingReviewSection (Section 3)**
   - Loading/empty → `<EmptyState>`.
   - Each card: replace `<div ... style={sectionCard}>` with `<AdminCard>`.
   - Card heading name → `style={{ color: admin.text }}`; role → `admin.textMuted`; headline → `admin.text` with `opacity 0.9`; meta line → `admin.textDim`; LinkedIn link → `admin.accent`.
   - "Approve" button: replace `bg-white text-black hover:bg-gray-200` with default primary (`<Button size="sm">`), aligning to shared accent.
   - "Reject" outline button: keep red palette (semantic).
   - "View Raw" toggle button: color = `admin.textMuted`.
   - Raw JSON `<pre>`: bg `admin.surface2`, color `admin.textMuted`.

7. **LiveOnSiteSection (Section 4) & SortableRow**
   - Loading/empty → `<EmptyState>`.
   - SortableRow: render as a div with `backgroundColor: admin.surface`, `border: 1px solid ${admin.border}`, `rounded-xl px-3 py-3 flex items-center gap-3`. (Skip AdminCard since it has fixed `p-5`; replicate token styles inline.)
   - Drag handle button: color `admin.textDim` → hover `admin.text`.
   - Name: `admin.text`; role/headline: `admin.textMuted` / `admin.textDim`.
   - Hide button: color `admin.textMuted`.

8. **ArchiveSection (Section 5)**
   - `AccordionItem` border → `[border-color:rgba(255,255,255,0.06)]` (`admin.border`).
   - `AccordionTrigger`: color `admin.text`, font-semibold.
   - Empty → `<EmptyState>`.
   - Each row: same inline-styled rounded surface (matching SortableRow) using `admin.surface` + `admin.border`. Name → `admin.text`; role → `admin.textMuted`; Un-archive button color `admin.textMuted`.

### Out of scope
- No changes to queries, dnd-kit logic, toast calls, handlers, AlertDialog markup, or routing.
- No new dependencies; no changes to `theme.ts`, `ui.tsx`, or other files.

### Verification
- TypeScript compiles clean. Visual parity with Leads/Projects pages.