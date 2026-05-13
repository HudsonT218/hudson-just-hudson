## Accessibility Hardening

Add ARIA landmarks, keyboard navigation parity, skip-to-content link, reduced-motion guard, and focus visibility across the public site. No visible layout changes except the skip-link appearing on keyboard focus.

### Changes

1. **src/components/Navbar.tsx**
   - Logo `aria-label="Hudson Turansky — Home"`
   - Mobile toggle: `aria-expanded={open}`, `aria-controls="mobile-nav"`
   - Mobile dropdown: `id="mobile-nav"`, `role="menu"`
   - Nav links (desktop + mobile): `aria-current="page"` when active

2. **src/App.tsx**
   - Add skip-to-content link as first child inside `BrowserRouter`

3. **src/pages/Index.tsx, WorkPage.tsx, InterestedPage.tsx**
   - Top-level `<div>`: `id="main-content"`, `role="main"`

4. **src/index.css**
   - Add `prefers-reduced-motion` guard in `@layer base`

5. **src/components/WhatIBuild.tsx**
   - Keyboard focus parity with hover using `focusedIdx` state
   - Cards: `tabIndex={0}`, `onFocus`, `onBlur`
   - Visible focus ring when focused

### Verification
- Confirm no layout shifts
- Test focus order: skip link → logo → nav links → "Book a Call" → About → cards → contact CTA → footer