Add a decorative blue light-bar accent to the top of the `<main>` content area in `src/components/admin/AdminLayout.tsx` so it appears on every admin page.

Changes:
1. Add `relative` to the `<main>` element.
2. Insert a decorative wrapper as the first child of `<main>` containing two layers:
   - **Crisp line:** 1px tall, full width, `linear-gradient(90deg, transparent, ${admin.accent} 0.7 opacity, transparent)`, sticky to top, z-index above content background.
   - **Glow:** 4px tall, same gradient at 0.2 opacity, `blur(4px)`, positioned behind the crisp line.
3. Both elements get `pointer-events: none` and `aria-hidden` to remain purely decorative and non-interactive.

No other layout, routing, or sidebar behavior changes.