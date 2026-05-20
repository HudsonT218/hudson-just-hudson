## Theme the leads board horizontal scrollbar

The horizontal scrollbar under the board renders with the OS default (bright white track + thumb), which clashes with the dark admin theme.

### Change

In `src/index.css`, add a scoped utility class `.admin-scroll-x` that themes both WebKit and Firefox scrollbars to match the admin tokens:

- Track: transparent
- Thumb: `rgba(255,255,255,0.08)` with `rgba(255,255,255,0.16)` on hover
- Height: 8px, rounded
- Firefox: `scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent;`

### Apply

In `src/pages/admin/_components/LeadBoard.tsx`, add `admin-scroll-x` to the existing `flex gap-4 overflow-x-auto pb-2 -mx-2 px-2` row.

No other changes. No data or dependency changes.
