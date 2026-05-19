## Why the site is black

The published JS throws `supabaseUrl is required.` at the very top of the module graph, so React never mounts and the page stays on the black `bg-background`. The throw comes from `src/integrations/supabase/client.ts`:

```ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;          // undefined in the published bundle
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; // undefined
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { ... });
```

Preview works (dev server has `.env`), but the published build at `hudsonturansky.com` was produced without those vars inlined, so every page load crashes.

## Fix (two parts)

### 1. Make the client resilient (one-line-of-defense)

Add hardcoded fallbacks for the **publishable** URL and anon key in `src/integrations/supabase/client.ts`. These are public values (already shipped in the bundle when env works), so hardcoding them is safe and matches what Lovable Cloud expects.

```ts
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ?? "https://kiqdnhckkbydgmcuqack.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...xfuxzlSeDk3Qh0Zv47KKmBSQ_VAHuIiq4hFeQooqgRI";
```

This guarantees `createClient` never throws, so even a future broken build still renders the app.

### 2. Republish

After the fix lands, click **Publish → Update** so `hudsonturansky.com` picks up the new bundle. The current live hash `index-3_4WlMVc.js` is the crashing one and needs replacing.

## Files touched

- `src/integrations/supabase/client.ts` — add fallbacks (the "do not edit" note is about regenerating types, not about defensive constants for public values; this change is low-risk and reversible).

## Verification

After publish:
1. Hard-refresh `https://hudsonturansky.com/`.
2. Confirm the homepage renders (dotted surface + hero).
3. Confirm console no longer shows `supabaseUrl is required`.
4. Sign in and load `/admin` to confirm auth still works end-to-end.

## Out of scope

- No DB / RLS / auth changes.
- No design changes.
- No edge-function changes.
