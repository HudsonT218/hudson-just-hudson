## Problem

On `/admin/settings`, the inputs and toggle are disabled and nothing can be saved. Root cause: `src/lib/site-settings-db.ts` reads from a `site_settings` table that doesn't exist in the database. The query throws, the `draft` state stays `null`, so every field is rendered with `disabled={!draft}`.

## Fix

Create the missing table via migration and seed the singleton row. No frontend changes needed.

### Migration

- Create `public.site_settings`:
  - `id text primary key check (id = 'singleton')`
  - `free_projects_total int not null default 5`
  - `free_projects_remaining int not null default 5`
  - `campaign_open boolean not null default true`
  - `updated_at timestamptz not null default now()`
- Trigger to bump `updated_at` on update.
- Insert the singleton row (`id = 'singleton'`) with sensible defaults.
- Enable RLS. Policies:
  - `select` allowed to everyone (anon + authenticated) so the public `/free-build` page can read counter state.
  - `update` allowed only to admins via the existing `has_role(auth.uid(), 'admin')` function.
  - No insert/delete policies (singleton is seeded by the migration).

### Verification

After migration, reload `/admin/settings`. Fields populate, Save enables when values change, and updates persist.
