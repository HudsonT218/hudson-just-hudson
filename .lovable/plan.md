# Make admin navigation feel instant

## Why it's slow today

Every admin click triggers three sequential "Loading…" states:

1. **Auth re-init** — Each route is wrapped in its own `<ConfiguratorBoundary>` which mounts a fresh `<AuthProvider>`. On every navigation it remounts, sets `loading=true`, calls `supabase.auth.getSession()`, and re-fetches the profile. `<AdminRoute>` blocks rendering on this with "Loading…".
2. **Lazy chunk load** — Each admin page is `lazy()`-imported, so the Suspense fallback ("Loading…") shows on first visit to each page.
3. **Per-page data fetch** — Each page sets `loading=true` on mount and refetches the same data from scratch, with no cache. React Query is installed but unused.

Together, switching tabs feels like a hard reload every time.

## What to change

### 1. Hoist a single AuthProvider above the routes
- In `src/App.tsx`, wrap `<AppRoutes />` (inside `<BrowserRouter>`) with one `<AuthProvider>` and one top-level `<Suspense fallback={<PageFallback />}>`.
- Remove the per-route `<ConfiguratorBoundary>` wrappers — keep only `<ProtectedRoute>` / `<AdminRoute>` where they were.
- Result: auth state is fetched once per session, and `useAuth()` returns immediately on every navigation.

### 2. Stop AdminRoute from blocking re-renders
- `src/components/configurator/layout/AdminRoute.tsx`: only show "Loading…" when there is no cached `user` yet (i.e., `loading && !user`). Once auth is known, navigations should pass through instantly.

### 3. Preload admin chunks after first admin visit
- Add lightweight `.preload()` helpers (or call the dynamic `import()` once on `AdminLayout` mount) for `Dashboard`, `Leads`, `LeadDetail`, `Projects`, `ProjectDetail`, `References` so the next tab click has the JS already in memory. No Suspense fallback after the first hop.

### 4. Cache list data with React Query (stale-while-revalidate)
- Convert each admin page's `useEffect`+`useState` data fetch to `useQuery`:
  - `Dashboard.tsx` → `['admin','dashboard-stats']`, `['admin','next-actions']`, `['admin','active-projects']`
  - `Leads.tsx` → `['admin','leads']`
  - `Projects.tsx` → `['admin','projects']`
  - `References.tsx` → `['admin','references']` (single combined query keeping the existing `Promise.all`)
  - Detail pages: `['admin','lead', id]`, `['admin','project', id]`
- Set `staleTime: 30_000` so revisits render the cached data instantly and refetch in the background.
- Mutations (status change, create, etc.) call `queryClient.invalidateQueries(...)` instead of refetching manually.
- Show the existing "Loading…" text only when there's no cached data yet; otherwise render the list and let the background refetch update it silently.

### 5. Keep the loading line subtle
- Replace `<PageFallback>` for the (now-rare) cold suspense with a small top progress bar / "Loading…" in the corner instead of a full-screen takeover, so even the first chunk load isn't jarring.

## Out of scope

- No DB schema changes, no edge function changes.
- No visual redesign of the admin pages themselves.
- Configurator/public routes keep working exactly as they do now.

## Files touched

- `src/App.tsx` — restructure providers + routes
- `src/components/configurator/layout/AdminRoute.tsx` — non-blocking loading
- `src/components/admin/AdminLayout.tsx` — preload sibling admin chunks on mount
- `src/pages/admin/Dashboard.tsx`, `Leads.tsx`, `Projects.tsx`, `LeadDetail.tsx`, `ProjectDetail.tsx`, `References.tsx` — switch to `useQuery` + `useMutation`/`invalidateQueries`

## Expected result

- First admin visit: one short "Loading…" while auth + first chunk + first query resolve.
- Every subsequent tab click: instant render from cache; data refreshes silently in the background.
