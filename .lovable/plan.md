# SEO & Social Unfurl Truth-Up

No visible UI changes. No touching homepage layout, Navbar, DottedSurface, configurator, /admin, or /configure code.

## 1. Generate OG images

Use imagegen (premium for legible text) to produce two 1200×630 PNGs on a zinc-900 (#18181b) background:

- `public/og-image.png` — "Hudson Turansky" wordmark with blue→purple gradient (#3b82f6 → #8b5cf6), subtitle "AI Solutions · Web Development · Custom Software".
- `public/og-work.png` — same treatment, subtitle "Work · Capabilities · Portfolio".

QA each by viewing the generated PNG before moving on; regenerate if text is clipped/illegible.

## 2. `index.html` — replace `<head>` meta + JSON-LD

- Swap title, description, og:*, twitter:* to the new "AI Solutions & Web Development" positioning (verbatim from request).
- Add `og:image:width`/`og:image:height` (1200/630).
- Drop `<meta name="keywords">`.
- Replace the ProfessionalService JSON-LD with the new schema (3 serviceTypes, no fixed-price offers, `priceRange: "$$"`, empty `sameAs` with TODO comment above it).
- Keep charset, viewport, favicon, font preconnect/link, root div, main script untouched.

## 3. Per-page Helmet updates

- `src/pages/Index.tsx` — replace `<Helmet>` with full og:*/twitter:* block pointing at `/og-image.png`.
- `src/pages/WorkPage.tsx` — replace `<Helmet>` with full og:*/twitter:* block pointing at `/og-work.png`, canonical `/work`.
- `src/pages/InterestedPage.tsx` — replace `<Helmet>` to add canonical `/interested` alongside existing `noindex`; preserve title/description.

(All three use exact markup from the request.)

## 4. `public/sitemap.xml`

Full replacement: `/` (priority 1.0) and `/work` (priority 0.9), both `lastmod` 2026-05-13, `changefreq` monthly. `/interested` deliberately omitted (noindex). `/packages` removed (redirect).

## 5. `public/robots.txt`

Full replacement: single `User-agent: *` with `Allow: /` plus `Disallow:` for `/configure`, `/admin`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/dashboard`, `/preview`, `/packages`, `/interested`. Keep `Sitemap:` line.

## Files touched

1. `public/og-image.png` (new)
2. `public/og-work.png` (new)
3. `index.html`
4. `src/pages/Index.tsx`
5. `src/pages/WorkPage.tsx`
6. `src/pages/InterestedPage.tsx`
7. `public/sitemap.xml`
8. `public/robots.txt`

No build server run; verification limited to viewing generated OG images and re-reading edited files.
