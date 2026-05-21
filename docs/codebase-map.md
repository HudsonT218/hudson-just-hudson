# Codebase Map — hudsonturansky.com

> **Reference document for the LLM Visibility / GEO project.** Every prompt in the LLM-SEO work plan must read this file first.
>
> Audit date: 2026-05-21. Branch: `chore/codebase-audit`. **This audit makes zero code changes** — only adds this map and a baseline snapshot under `docs/baseline/`.
>
> Scope: enough context to do the LLM-visibility work in `LLM-SEO/llm-visibility-plan.md` safely. Not a full architecture guide — see the root `README.md` for product/architecture detail.

---

## 0. TL;DR for the next agent

- Site is a **Vite + React 18 + TypeScript SPA**, hosted on **Lovable** with **bidirectional GitHub↔Lovable sync** on `main`. Merging to `main` = production deploy. There is no staging.
- The two **public, indexable pages** in scope for SEO/GEO work are `/` (`src/pages/Index.tsx`) and `/work` (`src/pages/WorkPage.tsx`). Everything else is either configurator (`/configure`, `/dashboard`, `/preview`), auth (`/login`, `/signup`, `/forgot-password`, `/reset-password`), admin (`/admin/*`), or tokenized reference flow (`/reference/:token`) — and most of those are blocked in `public/robots.txt`.
- **SEO meta lives in two places** that must stay in sync: `index.html` (head tags + JSON-LD baked into the source) and `react-helmet-async` `<Helmet>` blocks in each page component. The `index.html` versions are the prerender/no-JS fallback; the Helmet versions override at runtime.
- **`react-helmet-async` is at v3.0.0** — this is the version with the known `HelmetProvider` named-export issue when used with `vite-react-ssg`. See danger zones (§9) and the SEO-compat doc for the mitigation.
- **`DottedSurface`** is a `three.js` background component (`src/components/DottedSurface.tsx`) rendered on every public route except configurator/admin/auth. All `window`/`document`/WebGL access is inside a `useEffect`, and the component itself returns a plain `<div>` — so it is already SSR-safe for prerendering. The render-time risk is mostly fine; the danger is layout shift / hydration. Details in §9.
- **There is currently no web analytics installed** (no `flock.js`, no GA, no Hotjar). The LLM-SEO plan mentions `flock.js` but it is not present in this repo. Phase 7 (measurement) will need analytics added before referral tracking can work.
- **Branches are not the team norm.** Per `README.md`: "Branches are not used — work directly on `main` or via PRs that merge to `main`." For LLM-SEO work we are deliberately deviating: every prompt ships on a feature branch with a PR (see §11 Safe Workflow). Merging is **always Hudson's call**.

---

## 1. Route inventory

All routes are defined in `src/App.tsx` lines 116–174. The router is `react-router-dom` v6.30.1 inside `<BrowserRouter>`.

| Path | Component | Source file | Auth gate | Public/crawlable | Linked from nav? |
|---|---|---|---|---|---|
| `/` | `Index` | `src/pages/Index.tsx` | — | ✅ Yes (sitemap, allowed) | Yes (logo) |
| `/work` | `WorkPage` | `src/pages/WorkPage.tsx` | — | ✅ Yes (sitemap, allowed) | Yes |
| `/interested` | `InterestedPage` | `src/pages/InterestedPage.tsx` | — | ⚠️ Reachable but `Disallow:` in robots.txt — not in sitemap | No (only linked from CTAs) |
| `/packages` | redirect → `/work` | App.tsx:120 (`<Navigate>`) | — | Disallowed in robots.txt | No |
| `/reference/:token` | `ReferencePage` (lazy) | `src/pages/ReferencePage.tsx` | Token in URL | Disallowed in robots.txt (`/reference/`) | No |
| `/configure` | `ConfiguratorPage` (lazy) | `src/pages/configurator/ConfiguratorPage.tsx` | Open through step 3, signed-in at step 4 | Disallowed | No |
| `/configure/:draftId` | same | same | `ProtectedRoute` | Disallowed | No |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | auth pages (lazy) | `src/pages/configurator/*Page.tsx` | — | Disallowed | No |
| `/dashboard`, `/dashboard/order/:orderId`, `/preview/:orderId` | customer dashboard (lazy) | `src/pages/configurator/*Page.tsx` | `ProtectedRoute` | Disallowed | No |
| `/admin`, `/admin/leads(/:id)`, `/admin/warm-leads(/:id)`, `/admin/projects(/:id)`, `/admin/references` | Lead Management OS (lazy) | `src/pages/admin/*.tsx` | `AdminRoute` (admin role) | Disallowed | No |
| `*` | `NotFound` | `src/pages/NotFound.tsx` | — | — | — |

### Notes
- The `CONFIGURATOR_PREFIXES` array (App.tsx:48–57) drives the `DottedSurface` opt-out: any route whose path matches one of `/configure`, `/dashboard`, `/preview`, `/admin`, `/login`, `/signup`, `/forgot-password`, `/reset-password` does **not** render the three.js background. The remaining public-facing routes (`/`, `/work`, `/interested`, `/reference/:token`) all get `DottedSurface`.
- **`/interested` is disallowed** in `public/robots.txt` even though it is a meaningful pricing page. That's a deliberate choice from a prior session — flag this for Hudson if Phase 3 wants to make pricing crawlable.
- The README lists routes but **does not mention `/reference/:token`** — that route exists (App.tsx:121, `ReferencePage.tsx`, 9 supporting edge functions, migrations, admin UI). It's a personal reference-collection flow.

---

## 2. Component dependency tree (public routes only)

### `src/App.tsx` — the provider chain (every route inherits these)

```
<HelmetProvider>                          // react-helmet-async ← v3.0.0, the SSG-incompatible version
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster /> + <Sonner />            // shadcn toasts
      <BrowserRouter>
        <SkipToContent link>
        <AppErrorBoundary>                // class component, App.tsx:71
          <AuthProvider>                  // src/components/configurator/auth/AuthProvider
            <AppRoutes>
              <ScrollToTop>               // resets scroll on path change (App.tsx:98)
              {!inConfigurator && <DottedSurface interactive={isHome} />}
              <Suspense fallback={<PageFallback />}>
                <Routes>...</Routes>
```

### `pages/Index.tsx` (`/`)

```
Index.tsx
├── react (useState, useEffect)
├── react-router-dom (Link)
├── react-helmet-async (Helmet)                ← per-page meta block at lines 21–36
├── @/components/Navbar
├── @/components/WhatIBuild                    ← public, no deps beyond react-router (Link)
├── @/components/Contact                       ← public, no hooks, Calendly link only
└── inline footer uses new Date().getFullYear() ← hydration risk for prerender, line 249
```

### `pages/WorkPage.tsx` (`/work`)

```
WorkPage.tsx
├── react (lazy, Suspense)
├── react-router-dom (Link)
├── react-helmet-async (Helmet)                ← per-page meta block at lines 60–75
├── @/components/Navbar
├── @/assets/happy-tails.png                   ← imported static asset
├── @/assets/chesapeake-pantry.png             ← imported static asset
├── @/components/Collaborators                 ← public
├── @/components/meeting-assistant-demo/MeetingAssistantDemo  ← LAZY, only loads after / paint
└── inline footer uses new Date().getFullYear() ← hydration risk, line 348
```

### Shared public components (used by both `/` and `/work`)

- `src/components/Navbar.tsx` — uses `useLocation`, `useNavigate`, scroll listener inside `useEffect`. **SSR-safe.**
- `src/components/DottedSurface.tsx` — see §9 danger zones. Returns `<div>` on initial render; all three.js setup is in `useEffect`. **SSR-safe as-is**, but lays out via `fixed inset-0`, so prerender must still keep its container or layout will shift.

### Blast radius for changes

| Change | Affects |
|---|---|
| `src/App.tsx` | Every route |
| `src/components/DottedSurface.tsx` | `/`, `/work`, `/interested`, `/reference/:token` |
| `src/components/Navbar.tsx` | `/`, `/work`, `/interested` |
| `src/pages/Index.tsx` | `/` only |
| `src/pages/WorkPage.tsx` | `/work` only |
| `src/components/Contact.tsx` | `/` only |
| `src/components/WhatIBuild.tsx` | `/` only |
| `src/components/Collaborators.tsx` | `/work` only |
| `src/components/meeting-assistant-demo/*` | `/work` only |
| `src/components/ui/*` (shadcn primitives) | Potentially everything — change with extreme care |
| `index.html` `<head>` | Every route's no-JS / bot-visible HTML |

---

## 3. SEO-critical code locations

Per the plan, every meta tag, JSON-LD block, canonical, OG/Twitter tag, and the verification tag — with exact file+line.

### `index.html` (root SEO baseline — what bots that don't run JS see today)

| What | Location |
|---|---|
| `<title>` | `index.html:6` — *"Hudson Turansky — AI Solutions & Web Development"* |
| `<meta name="description">` | `index.html:7` — *"I build custom websites, AI tools, and software for businesses and individuals. Hourly rates, transparent pricing, built with AI."* |
| `<meta name="author">` | `index.html:8` |
| `<meta name="google-site-verification">` | `index.html:9` — value: `NLJgc9VAfRHl698aCNv68xTdJXQvxfeCPE4mdq--GQY` |
| `<link rel="canonical">` | `index.html:12` — `https://hudsonturansky.com/` |
| Open Graph tags (`og:type`, `og:url`, `og:title`, `og:description`, `og:image`, `og:image:width`, `og:image:height`, `og:site_name`) | `index.html:15–22` |
| Twitter card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`) | `index.html:25–28` |
| `<link rel="icon">` | `index.html:30` |
| Inter font preconnect + stylesheet | `index.html:32–34` |
| JSON-LD `ProfessionalService` schema | `index.html:36–51` — `@type`, name, description, url, email, areaServed, serviceType, knowsAbout, priceRange, sameAs (currently `[]` with a TODO comment) |

### `react-helmet-async` injections per page (runtime override, hydration target)

Both pages use `<Helmet>` to **re-declare** title, description, canonical, OG, and Twitter. After hydration, Helmet's values win over `index.html`. So the static HTML in `index.html` is the **fallback for non-JS crawlers** (current state); the Helmet block is what Googlebot sees after rendering and what users see in the rendered DOM.

| Page | File:lines | Tags set |
|---|---|---|
| `/` | `src/pages/Index.tsx:21–36` | title, description, canonical, og:type/url/title/description/image/image:width/image:height, twitter:card/title/description/image |
| `/work` | `src/pages/WorkPage.tsx:60–75` | same set, with `og:image` → `og-work.png` and unique title/description |

**Drift watch:** the `index.html` description ("Hourly rates, transparent pricing, built with AI.") differs from the `Index.tsx` Helmet description ("Book a free call to talk through your project."). The Helmet version wins at runtime. Worth normalizing before/during the GEO work; either is defensible but consistency matters.

### `public/` static SEO files

| File | Bytes | Contents summary |
|---|---|---|
| `public/robots.txt` | 302 | `User-agent: *` with `Allow: /` and 11 `Disallow:` entries (admin/configurator/auth/interested/packages/reference). `Sitemap:` reference. No AI-bot-specific blocks yet (Phase 5 of the plan). |
| `public/sitemap.xml` | 434 | Two URLs: `/` and `/work`. `lastmod: 2026-05-13`. |
| `public/llms.txt` | 640 | Short well-formed file: H1, blockquote tagline, paragraph summary, "## Pages" with Home/Work, "## Contact" with email. Slim — Phase 5 of the plan expands this. |

### Lovable / build-time config that touches SEO

- `vite.config.ts` — pulls in `lovable-tagger` in dev mode only (`mode === "development"`). Production build is plain Vite. No SSR/SSG plugin installed yet.
- `eslint.config.js`, `tsconfig.app.json` — no SEO impact.

---

## 4. Do-not-touch files

### Explicitly auto-generated (per `README.md` line 25–27)

- `src/integrations/supabase/client.ts` — auto-generated Supabase client. Contains hardcoded fallback URL + anon (publishable) key — both are public values, intentional fallback. Project ID: `kiqdnhckkbydgmcuqack`.
- `src/integrations/supabase/types.ts` — auto-generated DB types (26k+ bytes). Regenerated on every migration apply.
- `.env` — not committed (gitignored); managed by Lovable.
- `supabase/config.toml` — project-level config, single line: `project_id = "kiqdnhckkbydgmcuqack"`.

### Lovable-owned

- `.lovable/plan.md` — Lovable's most-recent prompt/plan stash. Read-only from our side.
- `playwright.config.ts` — wraps `createLovableConfig` from the Lovable Playwright package. Don't override the import; can add overrides via the config callback if needed.
- The `lovable-tagger` Vite plugin in `vite.config.ts:4,15` — dev-only, don't remove.

### Untouchable LLM-SEO surface in this work-stream

- The `<head>` of `index.html` (apart from additive changes like a new JSON-LD block or a font-preload — never strip what's there).
- The `User-agent: *` block in `public/robots.txt`. Always append, never modify.
- `src/components/ui/*` shadcn primitives — modifying a primitive ripples into every page in the app.

---

## 5. Build pipeline

### Package manager

Both `bun.lock`/`bun.lockb` and `package-lock.json` exist. **Bun is the working PM** (lockfile is newer / fresher). `bun --version` = 1.3.1 locally. All scripts work under either runtime since `package.json` just shells out to bare CLIs.

### Scripts (`package.json:6–14`)

| Script | Command | Use |
|---|---|---|
| `dev` | `vite` | Local dev server on `localhost:8080`. |
| `build` | `vite build` | Production build → `dist/`. **The build the LLM-SEO work has to keep green.** |
| `build:dev` | `vite build --mode development` | Dev-mode build (keeps `lovable-tagger`). |
| `lint` | `eslint .` | Flat ESLint config in `eslint.config.js`. **Gate before every commit** — but see "Lint baseline" below: currently failing on `main`. |
| `preview` | `vite preview` | Serves the built `dist/` locally. |
| `test` | `vitest run` | Unit tests. Currently 1 trivial test (`src/test/example.test.ts`). **Gate before every commit.** Green as of 2026-05-21. |
| `test:watch` | `vitest` | TDD mode. |

### Lint baseline (as of 2026-05-21, on `main`)

`bun run lint` on `main` (before any LLM-SEO work) produces **26 problems — 17 errors, 9 warnings.** All errors are pre-existing and concentrated in:

- `supabase/functions/*/index.ts` — `@ts-nocheck` directives flagged by `@typescript-eslint/ban-ts-comment`. These are intentional (the edge functions run on Deno, not Node, so the type-check disable is on purpose), but the lint config doesn't whitelist them.
- A handful of `@typescript-eslint/no-explicit-any` errors in the same edge function files.
- `tailwind.config.ts:128` — a `require()` style import flagged by `@typescript-eslint/no-require-imports`.

**Implication for LLM-SEO work:** the safe-workflow gate that says "lint must pass before every commit" is **currently unsatisfiable on `main`**. Three options for the upcoming prompts:

1. **(Recommended)** Add a small pre-flight prompt to either suppress these specific rules for `supabase/functions/**` and `tailwind.config.ts:128`, or add the targeted `eslint-disable` lines so the baseline is clean. One small PR clears the gate for everything after.
2. Change the gate from "must pass" to "must not introduce new errors" — diff the lint output before/after and fail only on increase. More fragile.
3. Accept the failing gate and rely on review. Easiest, but defeats the point of the gate.

This audit recommends option 1 as a `chore/lint-baseline-cleanup` PR ahead of Phase 1.

### What `npm run build` outputs

- Output dir: `dist/` (Vite default; gitignored).
- Output shape: `dist/index.html` + `dist/assets/*.{js,css,png,svg}` with content-hashed filenames.
- `dist/index.html` is the only HTML emitted. **Every route is served this same file** (SPA fallback). React hydrates the route on the client. This is why GPTBot/ClaudeBot/PerplexityBot — which don't run JS — see the same empty shell on every URL.
- TypeScript is `strict: false` (`tsconfig.app.json:25`), `noUnusedLocals: false`, `noImplicitAny: false`. The build pipeline does not separately run `tsc --noEmit`; type errors only surface in editor/eslint.

### Vite config (`vite.config.ts`)

- `@vitejs/plugin-react-swc` (SWC, not Babel).
- `lovable-tagger` plugin in dev mode only.
- Alias: `@/` → `./src/`.
- Dedupe list ensures one copy of `react`, `react-dom`, `react/jsx-runtime`, `react/jsx-dev-runtime`, `@tanstack/react-query`, `@tanstack/query-core`. Important: prerendering libraries (e.g. `vite-react-ssg`) will require `react-helmet-async` to be on `ssr.noexternal` — do not break this dedupe list while adding that.
- Dev server: host `::`, port `8080`, HMR overlay disabled.

### Lovable deploy

Production deploys happen automatically when commits land on `main`. The Lovable side runs `bun install && bun run build` (or the npm equivalent) and serves `dist/`. No manual deploy command, no staging env.

---

## 6. Lovable sync mechanics

Confirmed from `README.md:166–168` and the codebase state:

- **GitHub `main` ↔ Lovable is bidirectional.** Pushes to `main` propagate to Lovable within seconds and ship to the live `hudsonturansky.com` deploy. Edits made inside Lovable commit back to `main` automatically (you'll see commits authored by Lovable show up).
- **There is no staging environment.** A change reaches production the moment it merges to `main`.
- **The Lovable convention is to not use branches** — README explicitly says "Branches are not used — work directly on `main` or via PRs that merge to `main`." For the LLM-SEO work-stream we are deliberately overriding this convention with a branch + PR per prompt, because:
  - Several upcoming changes (prerendering, `robots.txt`, JSON-LD additions) have high blast radius.
  - We want a human review gate before each merge.
  - Reverting is easy when each change is its own PR.
- **Implication:** every Claude Code prompt in this work-stream stages on a feature branch, opens a PR, and waits for Hudson to merge. **No agent should `git push origin main` directly during this work-stream.**
- **Schema changes propagate by way of the migration step:** `supabase/migrations/*.sql` lands on `main` → Lovable applies it → `src/integrations/supabase/types.ts` is regenerated → Lovable commits that regen back to `main`. The LLM-SEO work-stream should not directly edit `types.ts`.

---

## 7. Backend inventory

### Edge functions (Deno-based, in `supabase/functions/`)

| Function | One-liner |
|---|---|
| `_shared/cors.ts` | Shared CORS header constants used by every function below. |
| `create-checkout` | Configurator wizard → creates a Stripe Checkout session for the selected model (landing/business/portfolio/saas) and returns the session URL. |
| `stripe-webhook` | On `checkout.session.completed`: creates the `orders` row from session metadata + the draft's stashed spec, then sends the customer order-confirmation email via Resend. |
| `notify-feedback` | Emails Hudson when a customer submits feedback on a preview iteration. |
| `notify-preview-ready` | Emails the customer when Hudson marks a preview ready/approved. |
| `send-reference-invite` | Admin-only: generates a tokenized invite for someone to publicly endorse Hudson, emails them the link. |
| `verify-reference-access` | Public, no auth: validates a `/reference/:token` URL is still live. |
| `submit-reference` | Public, no auth: stores a submitted reference (name, role, headline, optional LinkedIn). |
| `revoke-reference-invite` | Admin-only: invalidates a pending reference invite. |
| `scrape-warm-leads` | Polls Hacker News + GitHub Issues (+ Bluesky/Reddit scaffolds) for buying-intent posts, scores them with OpenAI, drafts a reply in Hudson's voice, inserts qualifying candidates into `warm_leads`. Trigger: manual button on `/admin/warm-leads` or cron. |

### Migrations (in `supabase/migrations/`)

Append-only. Never edit one already applied; add a new migration to change schema.

| File | Purpose (from README + naming) |
|---|---|
| `001_initial_schema.sql` | Initial schema — configurator: `drafts`, `orders`, `feedback`, plus auth scaffolding. |
| `002_lead_os_schema.sql` | Lead Management OS — `leads`, `projects`, `time_entries`. README §3 confirms. |
| `003_warm_leads_schema.sql` | Warm-lead generation: `warm_leads`, `warm_lead_sources`, view + triggers. (See `docs/warm-leads-setup.md`.) |
| `20260430105556_*.sql` | Dated migration (one of multiple Lovable-generated incremental changes). |
| `20260513194034_*.sql` | Dated migration. |
| `20260513194052_*.sql` | Tiny (75 bytes) — likely a single ALTER or comment. |
| `20260518121833_*.sql` | Dated migration (large, 8.7k). |
| `20260518121929_*.sql` | Tiny (336 bytes). |
| `20260518122029_*.sql` | Tiny (314 bytes). |
| `20260518122102_*.sql` | Dated migration (3.7k). |

### RLS pattern (security-critical, per `README.md:137`)

- Every user-data table has RLS enabled.
- Admin role lives in a **separate `user_roles` table**, **not** on `profiles`.
- Roles are checked inside policies via a `SECURITY DEFINER` `has_role(user_id, role)` function — the `revoke-reference-invite` function uses this same RPC on line ~25–30.
- Never check admin from client-side storage; always go through the RPC.

### Hand-rolled types

Per README convention, when a migration is freshly added the regenerated `types.ts` may lag — until then, the source of truth is `src/lib/*-types.ts` (e.g. `configurator-types.ts`, `lead-os-types.ts`, `warm-leads-types.ts`). The corresponding `*-db.ts` modules cast the Supabase client to `any` at the boundary.

---

## 8. External integrations

### Third-party services

| Service | Where used | Notes |
|---|---|---|
| **Stripe** | `@stripe/stripe-js` (frontend, `package.json`), `create-checkout` + `stripe-webhook` (edge) | Checkout flow for the parked configurator product. |
| **Resend** | `notify-feedback`, `notify-preview-ready`, `stripe-webhook`, `send-reference-invite` (edge) | Transactional email. Functions skip email gracefully if `RESEND_API_KEY` is missing. |
| **OpenAI** | `scrape-warm-leads` (edge) | Classifier + drafter for warm-lead scoring. Defaults to `gpt-4o-mini`. |
| **GitHub Search API** | `scrape-warm-leads` (edge) | Optional token bumps 60 → 5000 req/hr. |
| **Hacker News (Algolia)** | `scrape-warm-leads` (edge) | No auth required. |
| **Bluesky / Reddit** | `scrape-warm-leads` (edge) | Scaffolded but disabled by default. |
| **Calendly** | `src/components/Contact.tsx:28,87` | Direct link to `https://calendly.com/hudsonturansky/30min`. No JS embed. |
| **Google Fonts** | `index.html:32–34` | Inter font, preconnected. |
| **Lovable Cloud (Supabase)** | Everywhere | Hosting, Postgres, auth, edge functions, storage. |

### Environment variables / secrets — **names only**

Build-time (Vite, available in browser bundle):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` *(anon key — public by design)*

Backend (Supabase secrets manager — never committed):

- `SUPABASE_URL` *(auto-injected by Supabase)*
- `SUPABASE_SERVICE_ROLE_KEY` *(auto-injected)*
- `SUPABASE_ANON_KEY` *(auto-injected)*
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` *(optional — emails silently skipped if absent)*
- `RESEND_FROM_EMAIL` *(default `builds@hudsonturansky.com`)*
- `ADMIN_EMAIL`
- `APP_URL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` *(default `gpt-4o-mini`)*
- `GITHUB_TOKEN` *(optional)*

### Web analytics

**None installed.** The LLM-SEO plan references `flock.js` in Phase 7 (measurement) but it is not present in this repo. There is no `<script>` for `flock`, `gtag`, `analytics`, or `hotjar` anywhere in `src/` or `index.html` as of 2026-05-21. To capture LLM referral traffic (per Phase 7), some analytics layer will need to be added — flag this when scoping that phase.

---

## 9. Danger zones (plain-English "if you change X, Y breaks")

1. **Touching `index.html` `<head>`.** That file is the source of `google-site-verification`, `og:site_name`, the `ProfessionalService` JSON-LD block, and the Inter font preconnect — none of which Helmet currently sets. Strip something here and Search Console will lose verification, structured data will break, or font flash will appear. Additive changes (e.g. adding a `FAQPage` JSON-LD block, expanding `ProfessionalService`) are safe. Replacement is dangerous.

2. **`react-helmet-async` v3.0.0 + any SSG plugin.** There's a known issue where `vite-react-ssg` fails on the `HelmetProvider` named export from v3. The fix is `ssr.noexternal: ['react-helmet-async']` in `vite.config.ts` — must be added the moment prerendering is introduced (Phase 1 prompt). Without it, the SSG build crashes and `<head>` is empty in prerendered HTML.

3. **`DottedSurface` and hydration.** The component already guards `three.js` inside `useEffect`, so SSR will not crash. The risk is layout shift: the initial server-rendered tree contains an empty `<div className="fixed inset-0 z-0 pointer-events-none" />`, which then mounts WebGL on hydration. That's fine, but **don't** add `Math.random()` / `Date.now()` / `window.matchMedia()` to its initial render — any of those would cause hydration mismatch warnings and Google has flagged divergent server/client HTML as cloaking-adjacent.

4. **Footer `new Date().getFullYear()`** in both `pages/Index.tsx:249` and `pages/WorkPage.tsx:348`. This is fine in the current SPA (rendered client-side), but during prerendering this evaluates at build time and the client then re-renders with the *same* value — no mismatch on year boundary unless the build was made in December and a user loads it on January 1st. Low risk, but worth a one-line `useState(new Date().getFullYear())` pattern if Phase 1 wants to be paranoid.

5. **`public/robots.txt` `User-agent: *` block.** A typo (e.g. `Disalow:` or `Allow: /\n`) can de-index the site. Any future edit must **append** new `User-agent` blocks (per Phase 5 prompt), never edit the wildcard.

6. **`index.html` description drift.** `index.html:7` has a different `<meta name="description">` than `pages/Index.tsx`'s Helmet block. Both end up in production output but Helmet's wins after hydration. Decide once which canonical text to use, then keep them identical.

7. **`src/integrations/supabase/types.ts`.** Auto-regenerated by Lovable on schema changes. Hand-editing it will be overwritten. If a new table needs types before regeneration lands, add them to the right `src/lib/*-types.ts`.

8. **Migrations are append-only.** Editing an applied migration creates drift between the Supabase project state and the file history. Always add a new migration.

9. **Merging to `main` = production deploy.** No staging. Every PR should be reviewed visually as well as functionally before merge.

10. **`CONFIGURATOR_PREFIXES` (App.tsx:48–57).** If a new public route is added without putting it on this list, it will (correctly) get `DottedSurface`. If a new admin/auth route is added and forgotten here, it will get `DottedSurface` and break the configurator/admin visual. When adding any prerender-only route, decide whether it needs the background.

11. **Lazy-loaded route file renames.** All lazy-loaded routes (everything in App.tsx:28–46) use string-literal import paths. A file rename without updating `App.tsx` makes the build pass but breaks the route at runtime with a chunk-load error.

12. **`src/components/ui/*` (shadcn).** Tempting to edit. Don't, unless absolutely necessary. They are shared primitives — a styling change ripples into every consumer.

13. **Lint baseline is red on `main`** (see §5 "Lint baseline"). Any future prompt that runs `bun run lint` as a hard gate will fail before it ever touches LLM-SEO code. Resolve as a one-time `chore/lint-baseline-cleanup` before Phase 1.

---

## 10. Baseline snapshot

See `docs/baseline/` for files generated alongside this audit:

- `docs/baseline/dist-index.html` — the production-built `dist/index.html` (captured from `bun run build` on 2026-05-21, build time **4.51s**). **This is the literal HTML payload that any non-JS bot (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-Web, PerplexityBot, CCBot) receives when it requests `https://hudsonturansky.com/`, `https://hudsonturansky.com/work`, or any other route on the site today.** The body is literally:

  ```html
  <body>
    <div id="root"></div>
  </body>
  ```

  Confirms the "site is functionally invisible to LLMs" diagnosis at the top of the LLM-visibility plan.
- `docs/baseline/build-output.txt` — full stdout of `bun run build`. Bookmark for future bundle-size regression checks.
- `docs/baseline/source-index.html` — copy of the source `index.html`, for quick side-by-side with future prerendered outputs. Diff against `dist-index.html` shows the only build-time differences are (a) Vite injects `<script type="module" crossorigin src="/assets/index-<hash>.js"></script>` + `<link rel="stylesheet" crossorigin href="/assets/index-<hash>.css">` into `<head>`, and (b) the bundler-emitted `<body>` is empty. Everything else (title, description, JSON-LD, OG, canonical, verification) survives the build unchanged.

### Key bundle sizes from this baseline build

| Asset | Raw | Gzip |
|---|---|---|
| `assets/index-DFWs_ckf.js` *(main public bundle: React, Router, Helmet, DottedSurface, Index, WorkPage, etc.)* | **1,070.57 kB** | **298.02 kB** |
| `assets/proxy-Du85iQys.js` *(Supabase client + deps)* | 125.31 kB | 41.25 kB |
| `assets/ConfiguratorPage-Cn3Ndnmy.js` *(lazy)* | 58.05 kB | 16.61 kB |
| `assets/sortable.esm-CfGkh0fs.js` *(dnd-kit, lazy)* | 46.45 kB | 15.43 kB |
| `assets/References-CVz7BoAs.js` *(admin, lazy)* | 22.83 kB | 7.33 kB |
| `assets/MeetingAssistantDemo-DFYMk_0U.js` *(lazy on /work)* | 18.95 kB | 6.00 kB |

Vite warns the main bundle is over its 500 kB chunk-size threshold. That's a separate optimization to address (manualChunks or further code-split), and the LLM-SEO work should track but not aggressively change this — prerendering reduces *perceived* load time more than bundle size will.

**Lighthouse / PageSpeed:** not captured in this audit (requires a headless Chrome run outside Lovable). Phase 9 verification (post-prerendering) is the right time to start tracking those; for now, the bundle sizes above are the only quantitative regression signal in-repo.

---

## 11. Safe workflow — every future prompt must obey this

Anchored to the LLM-SEO plan's Part 7 ("Working safely with Claude Code"). These rules override the README's "branches are not used" convention for this work-stream only:

1. **Feature branch per prompt.** Never commit directly to `main`. Branch names follow `feature/<scope>` or `chore/<scope>` (e.g. `feature/prerendering`, `feature/faq-schema`, `chore/codebase-audit`). One prompt = one branch = one PR.
2. **Read this map first.** Every LLM-SEO prompt begins with "read `docs/codebase-map.md` first."
3. **Three gates before every commit:** `bun run lint` (or `npm run lint`), `bun test` (or `npm test`), `bun run build` (or `npm run build`) — all must pass. A red gate is a hard stop.
4. **One PR per prompt.** Each session ends with `gh pr create` and a clear description that names the prompt it's executing. Do not bundle multiple prompts into one PR.
5. **Hudson reviews + merges.** Agents never `git push origin main` and never click "Merge" on a PR. Approval is a human action.
6. **Do-not-touch list (§4) is sacred.** Anything Lovable-owned is read-only from our side.
7. **No new frameworks.** Lovable supports Vite + React only. No Next.js, Remix, Astro, etc. Prerendering is via build-config (`vite-react-ssg` / `vite-plugin-prerender`), not a framework switch.
8. **No new backend services.** All backend work stays inside `supabase/functions/<name>/` and migrations. No standalone servers.
9. **Additive changes to existing SEO surfaces** — never strip what's already in `index.html`'s `<head>` or `public/robots.txt`'s wildcard block; only add.
10. **Verify after every merge** with the 6-point check in `LLM-SEO/seo-compatibility-check.md` (Search Console URL Inspection, Pages report, robots.txt tester, Rich Results Test, Schema.org Validator, `curl -A "Googlebot"` and `curl -A "GPTBot"` parity).
11. **Rollback is one `git revert <merge-commit>`.** Because every change is its own small PR, this is always available.

---

## Appendix A — companion documents

- `LLM-SEO/llm-visibility-plan.md` — the master plan this audit serves.
- `LLM-SEO/seo-compatibility-check.md` — the Google-SEO-impact analysis for every step of the plan.
- `README.md` (repo root) — product architecture, design system, backend conventions.
- `docs/warm-leads-setup.md` — separate doc for the warm-lead scraper (out of scope for LLM-SEO work but worth being aware of when touching `/admin/*`).
