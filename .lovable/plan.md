## What to change

### 1. Whitelist `@hudsonturansky.com` in the edge function
File: `supabase/functions/ai-test-generate/index.ts`

Right after we lowercase the email (around line 90–100), set a flag:
```ts
const isOwner = email.endsWith('@hudsonturansky.com');
```
Then skip both gates when `isOwner`:
- skip the `daily_cap_reached` check (lines 110–131)
- skip the `already_used` check (lines 133–152)

This lets you re-submit the brief as many times as you want from any `@hudsonturansky.com` address. Everyone else still gets one use per email + the daily cost cap.

### 2. Make `name` required on the AI Brief form
File: `src/pages/AiBriefPage.tsx`

- Line 37: change the zod schema from
  `name: z.string().max(100).optional()`
  to
  `name: z.string().trim().min(1, "Please enter your name").max(100)`
- Line 540: change the label from `"Your name (optional)"` to `"Your name"` and add the `required` prop so the field shows the required asterisk and validates.

### 3. Add "Delete lead" on the admin side
The data layer already has `deleteLead(id)` in `src/lib/lead-os-db.ts` — we just need UI.

Files:
- `src/pages/admin/_components/LeadDetailModal.tsx` — add a small destructive "Delete lead" button in the modal footer that:
  1. Confirms via `window.confirm("Delete this lead? This cannot be undone.")`
  2. Calls `deleteLead(id)`
  3. Invalidates the `["admin", "leads"]` query and closes the modal
- `src/pages/admin/Leads.tsx` — wire an `onDelete` handler into the modal so the parent can close + refresh after a successful delete.

This gives you a clean way to remove the duplicate leads created while testing.

### 4. The runtime error you saw
That overlay is just the `409 already_used` response from the edge function being logged by `supabase.functions.invoke` before the frontend handles it. The frontend already shows the proper "you've already used this" screen. After change #1, that response will not fire for your email at all, which makes the overlay go away during your testing. No additional code change needed.

## Out of scope
- Editing the AI Brief content/results UI itself — happy to do that as a follow-up once you can get to the end of the form again.
