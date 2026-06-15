## Goal
Pause new project intake: replace all "Book a Call" Calendly links with email (`mailto:hudsonturansky@gmail.com`), and replace the Free Builds page hero with a "not taking on new work" message.

## Changes

### 1. Replace Calendly CTAs with email
For each occurrence, swap `https://calendly.com/hudsonturansky/30min` → `mailto:hudsonturansky@gmail.com`, change button labels from "Book a Call" / "Book a discovery call" → "Email me", and soften surrounding copy where it references scheduling.

Files:
- `src/components/Contact.tsx` — OPEN badge → "PAUSED — not taking on new projects right now"; button "Book a Call" → "Email me"; subtext → "Reach out by email and I'll get back when I'm taking on work again."
- `src/pages/InterestedPage.tsx` (line 258) — swap link + label to email.
- `src/pages/LandingPagesPage.tsx` (line 139) — swap link + label to email.
- `src/pages/AiBriefPage.tsx` (lines 836, 879, 903 and "Book a discovery call" copy at 782/842) — swap to email + relabel.

### 2. Free Builds page hero pause
`src/pages/FreeBuildPage.tsx`: replace the hero (badge, headline, subhead, counter, signup CTA) with a centered pause message:
- Badge: "Currently paused"
- Headline: "Not taking on new work at the moment."
- Subhead: "I've stepped back from new projects for now. If you'd like to be in touch about future availability, send me an email."
- Single button: "Email me" → `mailto:hudsonturansky@gmail.com`
- Hide the form, the "Why free" CTA buttons, and the discovery-call signup flow below.
- Keep page route and SEO title/meta updated to reflect the pause.

### 3. llms.txt
`public/llms.txt`: replace the three Calendly references with "Currently not taking on new projects — email hudsonturansky@gmail.com."

## Out of scope
- Configurator `contentSchema.ts` placeholders (internal tool examples, user-facing only inside the configurator).
- Admin pages.
- No backend/edge function changes.
