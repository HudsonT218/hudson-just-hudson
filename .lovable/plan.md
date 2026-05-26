## Problem

Even after passing `Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}` on the invoke call, `send-transactional-email` still returns **401 UNAUTHORIZED_INVALID_JWT_FORMAT**. The service-role key in this project is the new `sb_secret_…` format, not a JWT — so the Supabase Edge gateway rejects it on the way in. The gateway requires a JWT-formatted token (the legacy anon key still works).

## Fix

In `supabase/functions/discovery-call-signup/index.ts`, send the invoke with the `SUPABASE_ANON_KEY` as the Bearer token (it's a JWT). The downstream `send-transactional-email` function uses the service role internally — it doesn't need the caller to be the service role, it just needs to pass the gateway.

```ts
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
await admin.functions.invoke('send-transactional-email', {
  headers: { Authorization: `Bearer ${anonKey}` },
  body: { ... },
});
```

## Steps

1. Update `discovery-call-signup/index.ts` to use `SUPABASE_ANON_KEY` for the bearer header on the invoke.
2. Deploy `discovery-call-signup`.
3. Smoke test by hitting the deployed function directly with a unique email (e.g. `smoke-test+<timestamp>@hudsonturansky.com`).
4. Verify:
   - `discovery-call-signup` logs show no "Admin notification email failed" warning.
   - A new row appears in `email_send_log` with `template_name='free-build-signup'`, status `pending` → `sent`.
   - `send-transactional-email` logs show a clean run.
5. Tell user to also check Gmail Spam — first-time sends from `notify.hudsonturansky.com` can land there until reputation builds.

No template, schema, or frontend changes needed.
