Redesign the admin sidebar in `src/components/admin/AdminLayout.tsx` into a polished dashboard shell, consuming the shared tokens in `src/pages/admin/_components/theme.ts` and the primitives in `ui.tsx`.

Scope: presentation-only. All routes, `isActive()`, `preloadAdminChunks()`, and `handleSignOut()` stay exactly the same. No data-layer changes. Only edit `AdminLayout.tsx`.

Changes:

1. **Imports**
   - Add `useAuth` from `src/components/configurator/auth/AuthProvider.tsx`.
   - Add `admin` token object from `src/pages/admin/_components/theme.ts`.
   - Import lucide-react icons: `LayoutDashboard`, `Flame`, `Users`, `FolderKanban`, `BookOpen`, `Target`, `Settings`, `LogOut`.

2. **Brand block (top)**
   - Replace the existing "HT admin" header with a stacked brand block.
   - Rounded-square icon (roughly 36×36) with a blue gradient background (`linear-gradient(135deg, #3b82f6, #1d4ed8)`) and a white `Target` lucide icon centered inside.
   - Wordmark "Lead OS" in `admin.text` (white), semibold, ~16px, tracking-tight.
   - Underneath: "v1 · admin" label in `admin.textDim`, ~11px.

3. **Navigation**
   - Extend `NAV` array so each item carries an icon component reference.
   - Render each nav item as a horizontal row: icon (16px) + label.
   - Active state: left accent bar (3px rounded-full `admin.accent`) OR `admin.accentSoft` fill + `admin.text` color. Use a visible left-bar treatment for the polished look.
   - Inactive state: `admin.textMuted` color, transparent background.
   - Keep the existing `isActive()` logic intact.

4. **Account block (bottom)**
   - Wrap the existing sign-out area into an account card.
   - Circular avatar (28px) showing the signed-in user's initials derived from `profile?.fullName` or `user?.email`.
   - Next to the avatar: the user's email truncated with ellipsis, and a "settings" label in `admin.textDim`.
   - Keep the Sign out action button below or beside, styled with `LogOut` icon + `admin.textMuted`.
   - `handleSignOut()` remains unchanged.

5. **Structural constraints**
   - Keep the `220px` fixed sidebar width and the `ml-[220px]` main content offset.
   - Use the `admin.*` tokens for all colors — no new hardcoded rgba values outside of the gradient definition.
   - No new dependencies.

Verification: run the TypeScript build after the edit to confirm zero errors and confirm the admin preview still renders.