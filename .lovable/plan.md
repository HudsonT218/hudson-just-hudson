## Problem

Free-build signups save to `leads` correctly, but the admin notification email never sends. Edge function logs show `send-transactional-email` returns **401 UNAUTHORIZED_INVALID_JWT_FORMAT** when invoked from `discovery-call-signup`.

Cause: `admin.functions.invoke(...)` forwards the original request's Authorization header (the public form sends none), so the gateway rejects the call before it reaches our function. The `admin` client's service-role key is only used for DB calls, not auto-injected on `functions.invoke`.

## Fix

In `supabase/functions/discovery-call-signup/index.ts`, pass an explicit `Authorization: Bearer <service-role-key>` header on the invoke call:

```ts
await admin.functions.invoke('send-transactional-email', {
  headers: { Authorization: `Bearer ${serviceKey}` },
  body: { ... },
});
```

## Steps

1. Update `discovery-call-signup/index.ts` to pass the service-role bearer header on `functions.invoke`.
2. Deploy `discovery-call-signup`.
3. Submit a test form entry from `/free-build`.
4. Verify:
   - Row appears in `email_send_log` with `template_name='free-build-signup'`, status `pending` → `sent`.
   - Email lands in `hudsonturansky@gmail.com`.

No template, schema, or frontend changes needed.
