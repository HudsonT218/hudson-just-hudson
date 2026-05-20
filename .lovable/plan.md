Update the decorative light bar in `src/components/admin/AdminLayout.tsx`:

1. **Crisp hairline:** Keep 1px tall, sticky to top. Update gradient to broad/centered: `linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.65) 50%, transparent 100%)`.

2. **Ambient bloom (new):** Add a separate decorative div anchored to top of `<main>`:
   - Absolute, top: 0, left/right: 0, height ~280px.
   - Background: `radial-gradient(ellipse 75% 100% at 50% 0%, rgba(59,130,246,0.14), transparent 72%)`.
   - `pointer-events: none`, `aria-hidden`, z-index above bg but below content (z-0; main children get implicit stacking).
   - Remove the previous blurred glow div.

No other changes to layout, routing, or sidebar.