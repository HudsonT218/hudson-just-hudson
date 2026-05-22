-- ============================================================================
-- Warm Lead Generation, V2 — Toggle + Per-Run Cap + Local-Agent Source Kind
--
-- Background
-- ──────────
-- Migration 003 modeled warm-lead automation around a weekly cap. The new model
-- is per-run ("find me N leads, then stop") plus a master on/off toggle. A new
-- `kind` column on warm_lead_sources separates cloud-runnable sources (which
-- the scrape-warm-leads edge function handles) from local-agent sources (which
-- a browser-using agent on Hudson's PC handles by pushing into the new
-- intake-warm-lead endpoint).
--
-- Changes
-- ───────
--   warm_lead_settings:
--     + enabled         BOOLEAN     -- master on/off
--     + target_per_run  INTEGER     -- "find me N leads per run"
--     - mode            (dropped — replaced by `enabled` + per-run cap)
--     - target_per_week (dropped — replaced by `target_per_run`)
--     - this_week_count (dropped — weekly counter no longer needed)
--     - week_started_on (dropped — weekly counter no longer needed)
--
--   warm_lead_sources:
--     + kind            TEXT        -- 'edge_function' | 'local_agent'
--     – hackernews row  (deleted — tech-crowd, not Hudson's target market)
--     – github_issues row (deleted — same reason)
--     – bluesky row     (deleted — same reason)
--     ⤺ reddit row      (retargeted keywords + subs for small biz owners)
--     + linkedin row    (new, kind=local_agent, disabled by default)
--
-- The intake-warm-lead edge function (added in this PR) ingests candidates
-- from local agents via a Bearer token in the AGENT_API_KEY env var. No table
-- needed yet; if Hudson productizes this we can add agent_api_keys later.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Settings: master toggle + per-run cap
-- ----------------------------------------------------------------------------
ALTER TABLE warm_lead_settings
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE warm_lead_settings
  ADD COLUMN IF NOT EXISTS target_per_run INTEGER NOT NULL DEFAULT 5
    CHECK (target_per_run BETWEEN 1 AND 50);

-- Drop the weekly machinery. Edge function code that references these is
-- rewritten in the same PR; no downstream readers should still touch them.
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS mode;
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS target_per_week;
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS this_week_count;
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS week_started_on;

-- ----------------------------------------------------------------------------
-- 2. Sources: `kind` column to distinguish cloud vs local-agent execution
-- ----------------------------------------------------------------------------
ALTER TABLE warm_lead_sources
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'edge_function'
    CHECK (kind IN ('edge_function', 'local_agent'));

-- ----------------------------------------------------------------------------
-- 3. Kill tech-crowd sources
-- ----------------------------------------------------------------------------
DELETE FROM warm_lead_sources
WHERE id IN ('hackernews', 'github_issues', 'bluesky');

-- ----------------------------------------------------------------------------
-- 4. Retarget Reddit for small business owners
-- ----------------------------------------------------------------------------
UPDATE warm_lead_sources
SET config = jsonb_build_object(
      'keywords', jsonb_build_array(
        'need a website',
        'looking for a web designer',
        'need help with my website',
        'want to add ai',
        'automate my business',
        'small business website',
        'build me a website',
        'redesign my website',
        'website for my',
        'ai for my business'
      ),
      'subreddits', jsonb_build_array(
        'smallbusiness',
        'Entrepreneur',
        'restaurantowners',
        'Etsy',
        'shopify',
        'Wordpress',
        'EtsySellers',
        'AskEntrepreneurs'
      )
    ),
    enabled = false
WHERE id = 'reddit';

-- ----------------------------------------------------------------------------
-- 5. LinkedIn source (local-agent kind, disabled by default)
-- ----------------------------------------------------------------------------
INSERT INTO warm_lead_sources (id, label, kind, enabled, config) VALUES
  ('linkedin', 'LinkedIn', 'local_agent', false,
   jsonb_build_object(
     'keywords', jsonb_build_array(
       'need a website for my',
       'looking for a web designer',
       'small business owner looking',
       'looking to redesign',
       'ai for my business',
       'automate my business',
       'anyone build websites'
     )
   ))
ON CONFLICT (id) DO UPDATE
  SET kind  = EXCLUDED.kind,
      label = EXCLUDED.label;
