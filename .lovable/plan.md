## References Collection System — Backend Phase

Build a backend-only references collection workflow: admins invite people via email, recipients submit a short reference via a tokenized public link, admin moderates, approved entries are publicly readable.

### 1. Migration
New file: `supabase/migrations/003_references_system.sql`

- `reference_requests` table (id, invited_email, invited_name, token unique, expires_at, submitted_at, status pending|submitted|expired|revoked, notes) + indexes on token & status
- Trigger `normalize_reference_request_email` lowercases/trims `invited_email` on insert/update
- `references` table (FK→requests on delete cascade, name, role_title, email, headline ≤140, linkedin_url, status pending_review|approved|rejected|hidden, approved_at, display_order) + indexes + UNIQUE(request_id) so each request yields at most one reference
- RLS enabled on both; admin-only ALL via `has_role(auth.uid(),'admin')`; public SELECT on `references` where status='approved'
- View `approved_references_public` exposing only safe fields, granted to anon + authenticated

### 2. Frontend types & data layer (no UI)
- `src/lib/references-types.ts` — hand-rolled `ReferenceRequest`, `Reference`, status enums + label maps, `PublicApprovedReference` (view shape). Mirror snake_case style of `lead-os-types.ts`.
- `src/lib/references-db.ts` — mirrors `lead-os-db.ts` (cast shared client to `any`). Functions:
  - `listReferenceRequests`, `listPendingReviewReferences` (joins parent request for invited_email), `listApprovedReferencesPublic` (queries the view), `listArchivedReferences` (rejected+hidden), `updateReferenceStatus`, `updateReferenceDisplayOrder`, `revokeReferenceRequest`

### 3. Edge functions
All follow `notify-feedback`'s Deno shape + `_shared/cors.ts`. Service-role Supabase client used for DB writes inside functions.

- **`send-reference-invite`** — admin-gated. Validates auth + admin via `has_role`. Normalizes email, revokes prior pending requests for same email, generates 32-char URL-safe token (crypto.getRandomValues + base64url), inserts request with `expires_at = now() + 7 days`, sends Resend email from `hudson@hudsonturansky.com` (fallback `onboarding@resend.dev` w/ TODO comment) with reply-to `hudsonturansky@gmail.com`. Returns `{ ok, request_id }`.
- **`verify-reference-access`** — public. Looks up token; flips expired-pending rows to `expired`; returns `{ valid, reason?, expires_at? }`. Never leaks `invited_email`.
- **`submit-reference`** — public. Validates lengths, email format, optional linkedin URL regex, strips control chars. Re-runs validity checks; rejects 403 if `invited_email !== email`. Inserts reference row `pending_review`, updates request to `submitted` + `submitted_at`. Sends notification email to `hudsonturansky@gmail.com`. Returns `{ ok }`.
- **`revoke-reference-invite`** — admin-gated. Sets request `status='revoked'`. Returns `{ ok }`.

Each new function gets a `supabase/config.toml` block only if needed; public functions (`verify-reference-access`, `submit-reference`) deploy with `verify_jwt = false`.

### 4. robots.txt
Append `Disallow: /reference/` to `public/robots.txt`.

### Secrets check
`RESEND_API_KEY` is **not** currently in the project secrets (only `GEMINI_API_KEY`, Supabase keys, `LOVABLE_API_KEY` are set). I'll request it via the secrets tool before deploying the email-sending functions.

### Sanity check
RLS policies reference `public.has_role(uuid, app_role)` — already exists (used throughout `lead_os_schema.sql` policies and visible in `<db-functions>`), so the policies will compile against current schema.

### Out of scope (this phase)
No App.tsx routes, no admin UI, no `/reference/:token` page, no changes to existing configurator/admin code.

### Files touched
- `supabase/migrations/003_references_system.sql` (new)
- `src/lib/references-types.ts` (new)
- `src/lib/references-db.ts` (new)
- `supabase/functions/send-reference-invite/index.ts` (new)
- `supabase/functions/verify-reference-access/index.ts` (new)
- `supabase/functions/submit-reference/index.ts` (new)
- `supabase/functions/revoke-reference-invite/index.ts` (new)
- `public/robots.txt` (append one line)