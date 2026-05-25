## Add shareable link section to Settings page

Add a new card on `/admin/settings`, directly below the existing "Free-projects landing page" card, that displays the public URL for the free projects landing page with a one-click copy button.

### What it looks like

- New card styled identically to the existing settings card (same `admin.surface`, border, radius, spacing).
- Heading: "Shareable link"
- Subtext: "Send this to prospects. Opens the public free-projects landing page."
- Read-only input showing the full URL: `https://hudsonturansky.com/free-build`
- Copy button next to the input. On click:
  - Uses `navigator.clipboard.writeText`
  - Shows a `sonner` toast ("Link copied")
  - Briefly swaps the button label/icon to "Copied" with a checkmark for ~1.5s
- Small "Open" link beside it that opens the URL in a new tab (nice-to-have, matches admin patterns).

### Technical notes

- Edit only `src/pages/admin/Settings.tsx`. No new files, no backend changes.
- URL is hardcoded to the production custom domain: `https://hudsonturansky.com/free-build`.
- Uses existing `Button`, `Input`, `toast` (sonner), and `Copy` / `Check` icons from `lucide-react` already used elsewhere in admin.
- Self-contained — no new state in the query/mutation flow; just a small local `useState` for the copied indicator.
