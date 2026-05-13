## Cleanup, 404 fix, social-proof slot

1. **Delete** `src/components/NavLink.tsx` (verified: zero imports in src/).
2. **`src/components/Navbar.tsx`** — update stale comment from `/packages` → `/work`.
3. **`src/pages/NotFound.tsx`** — rewrite to match marketing pages: dark bg, Navbar, Helmet noindex, big "404" gradient heading, "Page not found" subhead, return-home button styled like the hero CTA. Keeps the `console.error` effect.
4. **NEW `src/components/SocialProof.tsx`** — placeholder "Collaborators & References" row with TODO comment at top, eyebrow "Trust", H3, and 4–6 uppercase gray-500 placeholder labels in a flex-wrap row.
5. **`src/pages/WorkPage.tsx`** — import and mount `<SocialProof />` between the divider after Portfolio and the divider before the AI meeting assistant demo.

### Files modified
- deleted: `src/components/NavLink.tsx`
- edited: `src/components/Navbar.tsx`, `src/pages/NotFound.tsx`, `src/pages/WorkPage.tsx`
- created: `src/components/SocialProof.tsx`