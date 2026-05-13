## Codebase Cleanup Plan

Goal: remove unused pages and components while preserving the live site (Home, Work, Interested, 404) and the entire **Build-Your-Own-Site (Configurator)** product including admin/lead management.

### What stays (in active use)

- **Public site**: `Index.tsx`, `WorkPage.tsx`, `InterestedPage.tsx`, `NotFound.tsx`
- **Shared components**: `Navbar.tsx`, `NavLink.tsx`, `WhatIBuild.tsx`, `Contact.tsx`, `DottedSurface.tsx`
- **Configurator product** (untouched): all of `src/pages/configurator/*` (LoginPage, SignupPage, ForgotPasswordPage, ResetPasswordPage, ConfiguratorPage, DashboardPage, OrderDetailPage, PreviewPage), all of `src/components/configurator/*`, `src/component-library/*`, `src/lib/configurator-*`, `src/lib/stripe.ts`, `src/hooks/use-draft.ts`
- **Lead Management OS / Admin**: `src/pages/admin/*`, `src/components/admin/*`, `src/lib/lead-os-*`
- **Edge functions in use**: `create-checkout`, `stripe-webhook`, `notify-feedback`, `notify-preview-ready`, `_shared`
- **Assets used**: `happy-tails.png`, `chesapeake-pantry.png`
- **MeetingAssistantDemo** (rendered on WorkPage)

### What gets deleted (zero importers, confirmed)

**Unused pages**
- `src/pages/Packages.tsx` — orphan; the `/packages` route is a redirect to `/work` and doesn't import this file. Keep the redirect route in `App.tsx`, just delete the file.

**Unused top-level components**
- `src/components/ConfiguratorPromo.tsx`
- `src/components/Services.tsx`
- `src/components/Process.tsx`
- `src/components/Work.tsx` (the page is `WorkPage.tsx`; this older component is unused)

**Unused ChatWidget (entire directory)**
- `src/components/ChatWidget/` — `index.tsx`, `ChatPanel.tsx`, `ChatInput.tsx`, `ChatMessage.tsx`, `TypingIndicator.tsx`, `CalendlyCard.tsx`, `useChatSession.ts`, `types.ts`. Nothing in the app imports it.

**Duplicate/legacy admin pages inside the configurator folder** (the live admin lives under `/admin/*` via `src/pages/admin/`)
- `src/pages/configurator/AdminPage.tsx`
- `src/pages/configurator/AdminOrderDetailPage.tsx`

**Unused edge function**
- `supabase/functions/chat/` — only the deleted ChatWidget called it.

### Small `App.tsx` edits

- Remove the now-dead `Packages` import path (it's already not imported, just confirm clean).
- Keep the `/packages → /work` redirect route (cheap, protects any old links).

### Risk check

- All four "unused component" files have **zero** import sites across `src/`.
- Configurator content schema references the strings "Process" / "Work" / "Services" as section *names*, not as imports of these component files — safe.
- `Navbar`, `NavLink`, `Contact` appear inside `src/component-library/sections/*` template files (string references in JSX templates for the configurator), but those are self-contained and don't import the top-level deleted files.
- Deleting `supabase/functions/chat/` only affects the removed widget.

### Result

~14 files + 1 edge function removed. No change to the live UI or to the Build-Your-Own-Site flow.

After approval, I'll execute the deletions in one pass and verify the build.