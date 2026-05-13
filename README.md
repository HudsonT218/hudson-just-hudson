# Hudson Turansky — Portfolio + Configurator + Lead OS

Personal site for Hudson Turansky. Three products live in one Vite/React app:

1. **Marketing site** — public portfolio (home, work, interested).
2. **Build-Your-Own-Site Configurator** — a 5-step wizard that lets visitors spec a landing page, pay via Stripe, and track delivery.
3. **Lead Management OS** — Hudson's private CRM at `/admin/*` for leads, projects, and time tracking.

Live: https://hudsonturansky.com · Built and maintained on [Lovable](https://lovable.dev) with bidirectional GitHub sync.

---

## Stack

- **Frontend:** React 18 + Vite 5 + TypeScript 5
- **Styling:** Tailwind CSS v3 + shadcn/ui (Radix primitives) — semantic tokens in `src/index.css` and `tailwind.config.ts`. Never hardcode colors in components.
- **State/data:** TanStack Query, React Hook Form + Zod
- **Routing:** react-router-dom v6
- **Animation:** framer-motion, three.js (the dotted hero surface)
- **Backend:** Lovable Cloud (managed Supabase) — Postgres + Auth + Edge Functions + Storage
- **Payments:** Stripe (`create-checkout` + `stripe-webhook` edge functions)
- **Email:** transactional via `notify-feedback`, `notify-preview-ready`
- **Tests:** Vitest (unit), Playwright (e2e fixture)

> ⚠️ Auto-generated, do **not** edit by hand:
> `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`, `supabase/config.toml` (project-level keys).

---

## Scripts

```bash
npm run dev          # vite dev server
npm run build        # production build
npm run lint         # eslint
npm test             # vitest run
```

---

## Routes

| Path | Page | Auth |
|---|---|---|
| `/` | `pages/Index.tsx` — home (hero, what-I-build, work teaser, contact, about) | public |
| `/work` | `pages/WorkPage.tsx` — case studies + `MeetingAssistantDemo` | public |
| `/interested` | `pages/InterestedPage.tsx` — lead capture form | public |
| `/packages` | redirect → `/work` (legacy) | — |
| `/configure`, `/configure/:draftId` | Configurator wizard (5 steps) | open through step 3, gated at step 4 |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | auth screens for the configurator | public |
| `/dashboard`, `/dashboard/order/:orderId`, `/preview/:orderId` | customer dashboard | `ProtectedRoute` |
| `/admin`, `/admin/leads(/:id)`, `/admin/projects(/:id)` | Lead Management OS | `AdminRoute` (admin role) |
| `*` | `NotFound` | — |

Routing lives in `src/App.tsx`. Configurator/admin pages are lazy-loaded; only the public site is in the initial bundle. The 3D `DottedSurface` background renders on public routes only.

---

## Directory map

```
src/
  pages/
    Index.tsx, WorkPage.tsx, InterestedPage.tsx, NotFound.tsx
    configurator/      # wizard, dashboard, auth, preview
    admin/             # Lead Management OS (Dashboard, Leads, Projects + detail views)
  components/
    Navbar.tsx, NavLink.tsx, Contact.tsx, WhatIBuild.tsx, DottedSurface.tsx
    ui/                # shadcn primitives (do not modify lightly)
    configurator/      # wizard steps, auth provider, route guards, live preview
    admin/             # AdminLayout shell
    meeting-assistant-demo/  # animated demo on /work
  component-library/   # configurator's section/theme registry (see below)
    registry.ts
    sections/<type>/<variant>/{component.tsx,metadata.json}
    themes/*.css
  lib/
    configurator-types.ts, configurator-constants.ts, configurator-db.ts
    lead-os-types.ts, lead-os-db.ts
    stripe.ts, utils.ts
  hooks/
    use-draft.ts       # autosaving wizard draft
    use-mobile.tsx, use-toast.ts
  integrations/supabase/  # AUTO-GENERATED — never edit
supabase/
  functions/
    create-checkout/   # Stripe Checkout session
    stripe-webhook/    # marks orders paid
    notify-feedback/   # emails Hudson on customer feedback
    notify-preview-ready/  # emails customer when preview lands
    _shared/cors.ts
  config.toml          # project-level — do not modify
  seed.sql
public/
  robots.txt, sitemap.xml, favicon.svg
```

---

## The three products

### 1. Marketing site
Static-feeling React pages with a shared `Navbar` and the `DottedSurface` three.js hero background. SEO via `react-helmet-async` per page. The "About" copy and contact section live inside `pages/Index.tsx` and `components/Contact.tsx`.

### 2. Configurator (Build Your Own Site)
A 5-step wizard at `/configure`:

1. **Model** — landing / business / portfolio / saas
2. **Theme** — one of 8 prebuilt themes in `component-library/themes/`
3. **Sections** — drag-and-drop builder over the section registry (`@dnd-kit`)
4. **Content intake** — auth-gated; users sign in here to save the draft
5. **Review + checkout** — Stripe Checkout via the `create-checkout` edge function

Drafts autosave through `hooks/use-draft.ts` (debounced upserts to the `drafts` table). After payment, `stripe-webhook` creates an `orders` row; the customer tracks status on `/dashboard` and reviews previews at `/preview/:orderId`. Feedback rounds are capped at `max_iterations` (default 3) per order.

The **section registry** in `src/component-library/registry.ts` maps `(sectionType, variant)` → React component + metadata. Adding a new section variant = drop a folder under `component-library/sections/<type>/<variant>/` with `component.tsx` and `metadata.json`, then register it.

Domain types: `src/lib/configurator-types.ts`. DB helpers: `src/lib/configurator-db.ts`.

### 3. Lead Management OS (`/admin`)
Hudson's private CRM. Tables: `leads`, `projects`, `time_entries` (see migration `002_lead_os_schema.sql`). Domain types in `src/lib/lead-os-types.ts`, data layer in `src/lib/lead-os-db.ts`. Gated by `AdminRoute`, which checks the `user_roles` table for `admin`.

**Roles pattern (security-critical):** roles live in a separate `user_roles` table with a `SECURITY DEFINER` `has_role()` function used inside RLS policies. **Never** store roles on `profiles`. **Never** check admin status from client-side storage.

---

## Backend conventions (Lovable Cloud / Supabase)

- All schema changes go through migrations in `supabase/migrations/`. After a migration, the regenerated `src/integrations/supabase/types.ts` will reflect new tables — until then, hand-rolled types in `lib/*-types.ts` are the source of truth and `lib/*-db.ts` casts the client to `any` at the boundary.
- Every user-data table has **RLS enabled** with policies that scope rows by `auth.uid()`.
- Use validation **triggers** instead of `CHECK` constraints for time-based rules (immutability requirement).
- Edge functions are auto-deployed; never tell users to deploy manually.
- Secrets (Stripe keys, Resend keys, etc.) are stored via the Lovable Cloud secrets manager — **never** committed.

The Supabase client is imported once:

```ts
import { supabase } from "@/integrations/supabase/client";
```

---

## Design system

- Tokens (HSL only) defined in `src/index.css` and exposed through `tailwind.config.ts`.
- Components must use semantic classes (`bg-background`, `text-foreground`, `border-border`, `text-primary`, etc.) — **no** raw `bg-white` / `text-black`.
- Configurator themes are scoped via `[data-theme="<id>"]` blocks in `component-library/themes/*.css` and toggled by `ConfiguratorPage` setting `documentElement.dataset.theme`.

---

## Working with Lovable + GitHub

This repo is bidirectionally synced with Lovable. Pushes to `main` from GitHub appear in Lovable within seconds; edits in Lovable commit back to `main` automatically. Branches are not used — work directly on `main` or via PRs that merge to `main`.

When another coding agent edits this repo:
- Don't touch the auto-generated files listed above.
- Don't add backend services beyond Lovable Cloud edge functions.
- Don't introduce other frameworks (Next.js, Remix, etc.) — Lovable only supports Vite + React.
- Keep frontend changes inside `src/`; keep edge function changes inside `supabase/functions/<name>/`.
- Run `npm run lint` and `npm test` before pushing.

---

## Quick orientation for a new agent

1. Read `src/App.tsx` to see every route.
2. Read `src/lib/configurator-types.ts` and `src/lib/lead-os-types.ts` to understand the domain.
3. Read `src/component-library/registry.ts` to understand the configurator's section system.
4. Look at `supabase/functions/` for backend logic.
5. Check `.lovable/plan.md` for the current/most-recent project plan.
