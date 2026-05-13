Skipping Part A (Lovable hosting won't serve per-route static HTML). Implementing B/C/D.

### Part B — DottedSurface mobile perf
`src/components/DottedSurface.tsx`:
- Detect mobile + reduced-motion at the top of `useEffect`
- Use a local `GRID_LOCAL` (30 on mobile, 50 desktop) everywhere `GRID` is referenced inside the effect
- If reduced-motion: render one frame, skip `requestAnimationFrame` loop
- Wrap mousemove/click listeners in `if (interactive)` so non-home routes don't attach them

### Part C — Theme CSS bloat
- Remove the 8 `@import` theme lines from `src/index.css`
- Add them as side-effect imports inside `src/pages/configurator/ConfiguratorPage.tsx`

### Part D — Lazy MeetingAssistantDemo
`src/pages/WorkPage.tsx`:
- Convert import to `React.lazy` + `Suspense` with a 24rem placeholder skeleton

### Files modified
- `src/components/DottedSurface.tsx`
- `src/index.css`
- `src/pages/configurator/ConfiguratorPage.tsx`
- `src/pages/WorkPage.tsx`