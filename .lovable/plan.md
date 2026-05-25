## Ops setup for warm-leads-v2

### Status check

Migration **004_warm_leads_v2.sql is NOT applied** in production. Current `warm_lead_settings` still has `mode`, `target_per_week`, `this_week_count`, `week_started_on` and is missing `enabled` / `target_per_run`. `warm_lead_sources` is missing `kind`, and the `linkedin` / removed-sources cleanup hasn't happened.

No PR #26 code will be edited. Auto-regenerated files (`src/integrations/supabase/types.ts`) and config files will not be touched.

### Step 1 — Apply migration 004

Run the exact contents of `supabase/migrations/004_warm_leads_v2.sql` via the migration tool:

- `warm_lead_settings`: add `enabled BOOLEAN DEFAULT false`, add `target_per_run INTEGER DEFAULT 5` (CHECK 1..50); drop `mode`, `target_per_week`, `this_week_count`, `week_started_on`.
- `warm_lead_sources`: add `kind TEXT DEFAULT 'edge_function'` (CHECK in `edge_function`/`local_agent`); delete rows `hackernews`, `github_issues`, `bluesky`; update `reddit` config (new small-biz keywords + subreddits, `enabled=false`); insert `linkedin` row (`kind='local_agent'`, disabled).

Then re-query both tables to confirm all checks pass.

### Step 2 — Generate + store AGENT_API_KEY

- Generate a 32-byte hex string locally (`openssl rand -hex 32`) — high entropy, not memorable.
- Add it as a Supabase Edge Function secret named `AGENT_API_KEY` using the secrets tool.
- Show Hudson the value **once** in chat so he can save it for Hermes. Will not log/echo it again afterward.

### Step 3 — Smoke test endpoints

After secret is set and functions are deployed:

1. `GET /functions/v1/agent-config?source_id=linkedin` with `Authorization: Bearer <AGENT_API_KEY>` — expect 200 + JSON with `automation_enabled`, `source_id`, `source_enabled`, `source_kind`, `keywords`, `target_per_run`, `threshold`, `outreach_voice`.
2. `POST /functions/v1/intake-warm-lead` with the synthetic Brooklyn-bakery payload — expect `{ accepted: false, reason: "automation_off" }` (master toggle is off by default).

Will report: migration status, the generated key (once), and both smoke-test responses. If anything returns 401/404/500 or an unexpected shape, I'll stop and ask before changing anything.

### Not doing

- No edits to PR #26 code, UI, public copy, `src/integrations/*`, `.env`, or `supabase/config.toml`.
- No re-running of the migration without your OK if the first apply errors.
