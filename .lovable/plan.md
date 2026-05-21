## Goal

Get per-route titles, meta, OG tags, and JSON-LD into the HTML that crawlers (Google, GPTBot, ClaudeBot, PerplexityBot, LinkedIn, Slack) see — while staying on Lovable hosting.

## Why the current setup doesn't work on Lovable

The repo already has a full SSR + prerender pipeline (`src/entry-server.tsx`, `scripts/prerender.mjs`, the long `build` npm script). It just isn't running on Lovable: the published site at hudsonturansky.com serves the same ~3KB SPA shell on every route with an empty `<div id="root">` and a single generic `<title>`. Lovable's publish step only runs the equivalent of `vite build` (client only), so the SSR build + prerender steps never execute.

## Approach

Two layers, both compatible with Lovable's vanilla `vite build`:

1. **Commit prerendered HTML into `public/`** for the small set of public, indexable routes. Lovable's build copies `public/` verbatim into `dist/`, and its static hosting serves `public/work/index.html` for `/work` before falling back to the SPA shell. Result: crawlers get fully-rendered HTML with correct meta, JSON-LD, and visible content — exactly like the existing prerender output, just shipped via a different mechanism.

2. **Add `react-helmet-async` for per-route head** so any non-prerendered route (and client-side navigation) still gets correct title/description/canonical/OG tags for Googlebot.

## What changes

### 1. New script: `scripts/prerender-to-public.mjs`
Adapted from the existing `scripts/prerender.mjs`. Runs the SSR build, renders each route, writes the output into `public/<route>/index.html` instead of `dist/`. Routes to prerender: `/`, `/work`, `/interested`, `/ai-test`. The root `/` writes to `public/index.html` — but we keep the source `index.html` (Vite's entry) untouched; the prerender output overrides only at build time via `public/` copy. Actually we'll write `/` output to a separate name and let Vite's index.html handling stay normal — details in the technical section.

### 2. New npm script: `prerender:commit`
`"prerender:commit": "vite build && vite build --ssr src/entry-server.tsx --outDir dist-server && node scripts/prerender-to-public.mjs"`. You run this locally before clicking Publish whenever public-page content changes. Output files get committed.

### 3. Add `react-helmet-async`
- Install package.
- Wrap app in `<HelmetProvider>` in `src/main.tsx`.
- Add `<Helmet>` blocks to `Index`, `WorkPage`, `InterestedPage`, `AiTestPage` with the right title/description/canonical/OG/JSON-LD per page.
- Remove the static `<link rel="canonical">` from `index.html` so it doesn't conflict with per-route Helmet canonicals.

### 4. Update sitemap (already exists, just verify)
Make sure `public/sitemap.xml` lists the four public routes pointing at `https://hudsonturansky.com`.

## What this gets you

| Crawler | Behavior |
|---|---|
| Googlebot | Sees full prerendered HTML for `/`, `/work`, `/interested`, `/ai-test`. Other routes: shell + Helmet-updated head after JS executes (Google does run JS). |
| GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot | Full prerendered HTML on the four key routes. (These don't run JS, so other routes still look empty — but admin/auth/configurator routes shouldn't be indexed anyway.) |
| LinkedIn / Slack / Facebook OG | Correct per-page OG tags on the four prerendered routes. |

## Workflow you adopt

Whenever you change content on a public page, run `npm run prerender:commit` locally, then commit the updated `public/**/*.html` files, then Publish from Lovable. One extra command before publishing — that's the trade for staying on Lovable without losing build-time SEO.

If you'd rather not run a local command each time, the alternative is migrating to a host that runs the full `npm run build` (Vercel/Netlify/Cloudflare Pages). I'd recommend trying this approach first since you want to stay on Lovable.

## Technical notes

- The existing `scripts/prerender.mjs` writes to `dist/`. The new script reuses the same render function from `dist-server/entry-server.js` but writes to `public/` so the output survives Lovable's `vite build`.
- For the root route, Vite's build uses `index.html` as its entry — we can't put a prerendered `public/index.html` because Vite would refuse (filename collision). Two options:
  - **Option A (preferred):** generate prerendered content directly into `index.html` (root of repo), replacing the empty `<div id="root"></div>` with the rendered tree and injecting Helmet head tags. The prerender script writes there during `prerender:commit`. Vite's HMR in dev still works because `hydrateRoot` adopts existing DOM.
  - **Option B:** post-build hook that copies a prerendered root file over `dist/index.html`. Requires Lovable to run something after vite build, which it doesn't.
  Option A is the right move.
- For sub-routes (`/work`, `/interested`, `/ai-test`), Lovable's static hosting will serve `public/work/index.html` when a request comes in for `/work` (standard static-server behavior) before falling back to the SPA `index.html`. If testing reveals Lovable doesn't do this, we fall back to react-helmet-async only and accept that AI crawlers see the shell on those routes — but we should test first.
- Helmet conflict: keep sitewide OG tags in `index.html` as social-preview fallback for routes that aren't prerendered; remove canonical from `index.html` since it conflicts with per-route Helmet canonicals.
- The existing `scripts/prerender.mjs` and the long `build` script can stay in the repo for future use (or if you ever migrate hosts) — they don't break anything.

## Open question before implementing

Confirm you're OK running `npm run prerender:commit` locally as part of your publish flow. If you'd rather not touch the command line at all, the realistic answer becomes "use react-helmet-async only" — Google will be fine but AI/social crawlers will see less. Let me know which trade-off you prefer.
