I found the reset request succeeds, but the reset page only waits for an auth event/session. If that event is missed or delayed, it stays stuck on “Verifying reset link…” and looks like the link is expired.

Plan:

1. Update `src/pages/configurator/ResetPasswordPage.tsx`
   - Add explicit URL recovery handling for reset links.
   - Support both modern `?code=...` links via `supabase.auth.exchangeCodeForSession(code)` and hash/session links.
   - Show a real invalid/expired message only after verification fails, not immediately while waiting.
   - Keep the existing new-password form and `updateUser({ password })` behavior.

2. Improve reset UX copy
   - Replace the current “If this hangs…” message with clear loading, invalid, and submit-error states.
   - Keep the “Request a new one” fallback link.

3. Verify the flow safely
   - Check the route compiles structurally and confirm it no longer depends on a race-prone auth event only.
   - No dev server run.