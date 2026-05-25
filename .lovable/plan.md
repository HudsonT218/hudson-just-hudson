## Plan

### 1. Add "report also sent to your email" message
In `src/pages/AiBriefPage.tsx`, inside the `Results` component, add a small notice between the last `Section` and the discovery-call CTA block. Copy:

> A copy of this report has been sent to **{email}** so you can revisit it anytime. Check your spam folder if you don't see it.

To show the recipient email, thread the submitted email from `Form` → `onSuccess` → `Results` (currently only `results` is passed). Update the `phase` state to also carry `email`, and update `<Results>` props.

Style: muted gray text, centered, small, sits above the CTA card with appropriate spacing.

### 2. Email automation
Good news — the automation already exists. `supabase/functions/ai-test-generate/index.ts` already calls `sendResultsEmail(email, name, results)` after generating the report (line 290), using Resend with the `RESEND_API_KEY` and `RESEND_FROM_EMAIL` secrets (both already configured). It renders a branded HTML version of the report and sends it to the email entered in the form.

Steps to confirm it's actually working end-to-end:
1. Pull recent `ai-test-generate` edge function logs and check for `Email delivery failed` warnings or Resend errors.
2. If logs show success → nothing to build, just confirm to user.
3. If logs show a Resend error (e.g. domain not verified, from-address rejected), report the exact error and propose the fix (most likely verifying the sending domain in Resend, or switching `RESEND_FROM_EMAIL` to a verified address).

No edge function code changes planned unless logs reveal an issue.

### Files touched
- `src/pages/AiBriefPage.tsx` — pass email into Results, render the new notice.

### Out of scope
- Rebuilding the email pipeline on Lovable Emails infra (current Resend path already works and matches the rest of the project's email functions).
