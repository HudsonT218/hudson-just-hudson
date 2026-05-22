
# Warm-leads — finish UX + swap OpenAI → Lovable AI

Adapt to the schema we already have. No DB changes. No new statuses. Only file touched outside the warm-leads UI is the scraper edge function (minimum-surgery provider swap).

## Status mapping (reuse existing enum)

Existing enum stays as-is: `new | approved | sent | rejected | converted | dismissed`.

- "Mark replied" → write `status = 'sent'` (same as detail page)
- "Archive / dismiss" → write `status = 'dismissed'`
- Default inbox filter stays `new`; existing filter pills cover all 6 statuses

## 1. Swap classifier provider: OpenAI → Lovable AI (minimum-surgery)

Only the network call is touched. Prompts, scoring rubric, threshold, draft logic, and the new auth gate stay byte-for-byte identical.

In `supabase/functions/scrape-warm-leads/index.ts`:

- Replace the `OPENAI_API_KEY` lookup with `LOVABLE_API_KEY`. If missing → same heuristic fallback as today (no behavior change).
- Replace the URL `https://api.openai.com/v1/chat/completions` → `https://ai.gateway.lovable.dev/v1/chat/completions`.
- Replace the default model `gpt-4o-mini` → `google/gemini-3-flash-preview` (per Lovable AI default-model guidance). Allow override via a new optional env `LOVABLE_AI_MODEL`.
- Keep the request body shape — Lovable AI is OpenAI-compatible (`messages`, `response_format`, `tools`, `tool_choice` all pass through).
- Add explicit `429` (rate limit) and `402` (credits) branches that surface a clear error string into the existing `errors[]` array so the admin toast shows it. No crash, no behavior change for the rest of the pipeline.
- Update the top-of-file comment block to list the new env vars.

Deploy after edit. Verify with one manual "Run now" from the admin UI; confirm `inserted`/`scored`/`scanned` still come back.

`OPENAI_API_KEY` secret is left in place (don't delete) until you've validated a real run — that way you can roll back the file from git with no extra secret-management step.

## 2. Run-now toast — surface scanned / scored / inserted

Edge function already returns `{ scanned, scored, inserted, errors }`.

- Update `TriggerScrapeResult` (or inline type) in `src/lib/warm-leads-db.ts` to include `scored: number`.
- Update `handleRunNow` in `WarmLeads.tsx` so the message reads:
  `"Scanned N · scored M · inserted K"` (+ `· P error(s)` when present).

## 3. Inline action buttons on each card

`WarmLeadCard` is currently a single `<Link>` wrapper. Refactor so the body stays a link to the detail page, but action buttons sit in their own row and don't trigger navigation:

- **Copy reply** — copies `drafted_message`, sonner toast confirm, disabled when empty.
- **Open ↗** — `lead.url` in new tab.
- **Mark replied** — `updateWarmLead(id, { status: 'sent' })`.
- **Dismiss** — `updateWarmLead(id, { status: 'dismissed' })`.
- `e.stopPropagation()` + `e.preventDefault()` on every button so clicks don't bubble into the wrapping `<Link>`.
- Mutations: optimistic via React Query `setQueryData(KEYS.list, ...)`, then `invalidateQueries(KEYS.list)` and `KEYS.stats`. On error, roll back and show sonner error toast.
- Buttons styled as ghost using existing `admin.textMuted` / `admin.surface2` theme tokens — same look as detail-page action bar.

## 4. Subreddit chips editor in Configure drawer

Add a section inside `ConfigDrawer`, rendered only when the Reddit source row exists (regardless of enabled, so you can edit while paused):

- Read `sources.find(s => s.id === 'reddit').config.subreddits` (string array, default `[]`).
- Render removable chips (× on each).
- Below: text input. Enter or comma adds. Normalize: trim, lowercase, strip leading `r/`, dedupe.
- Persist via `updateWarmLeadSource('reddit', { config: { ...existingConfig, subreddits } })` — spread existing config so we don't drop other JSONB keys.
- Wire into the existing Save button (single save action). Source enable/disable toggles still save immediately as today.

Bluesky terms editor explicitly skipped (per scope).

## 5. Relative timestamps on cards

- Add `formatRelative(iso)` to `src/pages/admin/_components/format.ts`: returns `just now`, `Nm ago`, `Nh ago`, `Nd ago`, falls back to `formatDate` after 7d. No deps.
- Use it in `WarmLeadCard` only. Detail page keeps absolute `formatDate`.

## Files touched

- `supabase/functions/scrape-warm-leads/index.ts` — provider swap only
- `src/lib/warm-leads-db.ts` — `scored` in return type
- `src/pages/admin/_components/format.ts` — add `formatRelative`
- `src/pages/admin/WarmLeads.tsx` — toast text, inline card actions, subreddit chips in drawer

## Explicitly NOT doing

- No DB migration, no new statuses, no RLS changes
- No edits to the auth-gate logic in the edge function
- No prompt / rubric / threshold changes
- No Bluesky editor (source stays disabled)
- No seed data
- No changes to any non-warm-leads files
- Not deleting `OPENAI_API_KEY` secret (kept for easy rollback)

## Risk / safety

- Provider swap is a 4-line diff in one function; rolls back via git revert + redeploy.
- All UI changes are additive on the existing page; if anything regresses, the existing detail-page workflow still works unchanged.
- Optimistic updates have rollback paths, so a failed mutation can't desync the list.
