## Goal
Replace the stale Resend notification in `discovery-call-signup` with the new Lovable transactional email pipeline so notifications get logged in `email_send_log` and routed through the verified `notify.hudsonturansky.com` queue.

## Steps

1. **Create new email template** `supabase/functions/_shared/transactional-email-templates/free-build-signup.tsx`
   - React Email component matching the site's dark/blue brand styling (white body per rule)
   - Props: `name`, `email`, `company?`, `phone?`, `message?`, `utmSource?`
   - Subject: `New free-project signup: {name}`
   - Fixed `to:` = ADMIN_EMAIL (hudsonturansky@gmail.com) so it always lands in Hudson's inbox
   - `previewData` with sample values

2. **Register template** in `supabase/functions/_shared/transactional-email-templates/registry.ts`
   - Add import + `'free-build-signup'` entry

3. **Update `supabase/functions/discovery-call-signup/index.ts`**
   - Remove the `sendAdminNotification` Resend helper and all Resend env vars from the header comment
   - Replace with a single `admin.functions.invoke('send-transactional-email', { body: { templateName: 'free-build-signup', recipientEmail: 'hudsonturansky@gmail.com', idempotencyKey: \`free-build-signup-${leadId}\`, templateData: {...} } })` call
   - Service-role client → passes auth check in `send-transactional-email`
   - Keep best-effort try/catch — failure must not fail the signup
   - Capture `leadId` from the insert/update path for the idempotency key

4. **Deploy** both edge functions (`send-transactional-email`, `discovery-call-signup`)

5. **Verify**
   - Submit a test entry on /free-build
   - Confirm row in `leads` table
   - Confirm row in `email_send_log` with `template_name='free-build-signup'`, status `pending`→`sent`
   - Confirm email arrives at hudsonturansky@gmail.com

## Out of scope
- Not touching the user-facing confirmation flow (currently there is none — could be added later if desired)
- Not removing the old `RESEND_API_KEY` / `RESEND_FROM_EMAIL` secrets (they're unused after this; can be deleted manually anytime)
