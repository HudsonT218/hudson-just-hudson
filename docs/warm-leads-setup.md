# Warm Lead Generation — Setup & Walkthrough

Built on top of Lead Management OS (Phase 1). Status: **MVP ready for review**, not yet
pushed.

## What it does

An admin-only automation that:

1. **Scrapes** public posts on Hacker News, GitHub Issues, Bluesky, and Reddit
   for keywords like _"looking for a developer", "build me a landing page", "AI
   developer"_.
2. **Scores** each post 0–100 using GPT-4o-mini for how warm/buying-intent it is.
3. **Drafts** a personalized 2–3 sentence reply in your voice.
4. Surfaces qualified candidates in an **inbox at `/admin/warm-leads`** for you to
   review, edit the draft, and approve → save to CRM.
5. Two operating modes:
   - **Capped** (default): stops after `target_per_week` (default 7) leads / week
   - **Always-on**: scrape every tick, no cap
   - **Paused**: scraper is off

## File map (everything I added/changed)

```
supabase/
├── migrations/
│   └── 003_warm_leads_schema.sql          ← NEW · tables, RLS, view, triggers
└── functions/
    └── scrape-warm-leads/
        └── index.ts                       ← NEW · the actual scraper edge function

src/
├── lib/
│   ├── warm-leads-types.ts                ← NEW · domain types
│   └── warm-leads-db.ts                   ← NEW · client-side data layer
├── pages/admin/
│   ├── WarmLeads.tsx                      ← NEW · inbox page (/admin/warm-leads)
│   ├── WarmLeadDetail.tsx                 ← NEW · detail+draft editor
│   ├── _components/
│   │   └── WarmLeadStatusBadge.tsx        ← NEW · score pill + status badge
│   └── Dashboard.tsx                      ← updated · added new-leads widget
├── components/admin/
│   └── AdminLayout.tsx                    ← updated · added "Warm Leads" nav link
└── App.tsx                                ← updated · added routes
```

## Required environment variables (Supabase Edge Function secrets)

Set these in Supabase → Project Settings → Edge Functions → Secrets:

| Variable | Required? | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | **Required for good results** | Classifier + drafter. Without it, the system falls back to a crude keyword-count heuristic and writes no drafts. |
| `OPENAI_MODEL` | optional | Defaults to `gpt-4o-mini`. Use `gpt-4o` for higher quality at ~10× cost. |
| `GITHUB_TOKEN` | optional but recommended | Bumps GitHub Search API limit from 60/hr to 5,000/hr. |
| `SUPABASE_URL` | auto-injected | — |
| `SUPABASE_SERVICE_ROLE_KEY` | auto-injected | — |

Cost estimate with `gpt-4o-mini`: roughly **$0.001–0.003 per lead scored**. At 30
candidates × 4 sources per run × a few runs/day, you're looking at maybe **$1–5 / month**
total — basically negligible.

## Setup steps (do in this order)

### 1. Apply the migration
```bash
# Lovable / Supabase dashboard:
# Run supabase/migrations/003_warm_leads_schema.sql against your project.
# OR if you have the CLI:
supabase db push
```

### 2. Deploy the edge function
```bash
supabase functions deploy scrape-warm-leads
```

### 3. Set the secrets
```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set GITHUB_TOKEN=github_pat_...   # optional
```

### 4. Schedule it (optional — you can also run on demand)

In Supabase SQL Editor:
```sql
-- Every 6 hours
SELECT cron.schedule(
  'scrape-warm-leads',
  '0 */6 * * *',
  $$
    SELECT net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/scrape-warm-leads',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{"trigger":"cron"}'::jsonb
    );
  $$
);
```

You can also skip cron and just hit the **"Run now"** button on `/admin/warm-leads` whenever you feel like it.

### 5. Try it out
1. Sign in as admin → go to `/admin/warm-leads`
2. Click **⚙ Configure**:
   - Pick mode (capped vs always-on)
   - Adjust `target_per_week` and `threshold`
   - Tune the **outreach voice** prompt — this directly shapes how drafts sound
   - Toggle which sources are enabled (HN + GitHub are on by default; Bluesky &
     Reddit are scaffolded but off because they're noisier)
3. Click **Run now** — you should see a status banner with how many leads
   were inserted.
4. Open any lead → review the draft → edit if needed → **Copy draft** → paste
   into the source platform → mark **Sent**, or hit **Approve & save to CRM**
   to convert it into a real `lead` record linked to a Project.

## How the scoring works

The classifier prompt grades each candidate 0–100:

| Range | Meaning | Action |
|---|---|---|
| 0–29 | Noise (tool Q, news, marketing spam) | Discarded |
| 30–59 | Tangentially relevant chatter | Below default threshold |
| 60–79 | Real need, scope a bit fuzzy | Shows up in inbox |
| 80–100 | Hot lead — explicit hiring intent | Top of inbox |

Threshold is configurable. The score pill in the UI is color-coded:
- 🟢 green ≥ 80
- 🟡 amber 60–79
- 🔵 blue 30–59
- ⚪ gray < 30

## What's NOT in the MVP (deliberately)

- **Auto-send** — every reply requires manual approve/copy. Auto-DM-ing strangers
  gets accounts banned and feels gross. Manual triage is a feature.
- **Sales Navigator / LinkedIn scraping** — needs a real auth integration, not
  worth it for the MVP.
- **X/Twitter** — needs paid API ($100/mo basic) or Nitter (ToS hostile). Add
  later if HN/GitHub aren't enough volume.
- **Per-source keyword editing in the UI** — for now, edit
  `warm_lead_sources.config` JSONB directly in Supabase. Hooking this into the
  admin is straightforward but cluttered the MVP scope.
- **Classifier feedback loop** — rejected/dismissed leads don't currently retrain
  the classifier. Add later by feeding them as few-shot negatives.
- **Reply tracking** — when someone DMs back, the lead stays in `sent` until you
  flip it. Eventually we'd want a webhook from the source platform.

## Local dev (when Node is around)

```bash
cd ~/projects/hudson-just-hudson
bun install
bun run dev          # vite dev server
bun run build        # production build
bun run lint
```

## Branch & next steps

Currently on `feature/warm-lead-generation`. Nothing committed yet — review,
then commit & push with something like:

```bash
git add .
git commit -m "feat: warm lead generation MVP — scraper, classifier, inbox UI"
git push -u origin feature/warm-lead-generation
```

Then open a PR against `main` and merge through Lovable so the auto-generated
Supabase types pick up the new tables.
