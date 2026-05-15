-- ============================================================================
-- Warm Lead Generation — Phase 2 Schema
--
-- Adds an automation layer on top of Lead Management OS:
--   warm_lead_sources      — which platforms to scrape (HN, GitHub Issues, …)
--   warm_lead_settings     — single-row config (mode, target_per_week, threshold)
--   warm_leads             — incoming candidates with score + drafted message
--
-- Promotion path: a "warm_lead" is reviewed in /admin/warm-leads. When approved
-- it gets promoted to a real row in `leads` (status=warm) and the warm_lead is
-- linked back via promoted_lead_id. Rejected ones stay for classifier feedback.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Sources (read-mostly config — pre-seeded with the platforms we support)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warm_lead_sources (
  id           TEXT PRIMARY KEY,           -- 'hackernews' | 'github_issues' | 'bluesky' | 'reddit'
  label        TEXT NOT NULL,
  enabled      BOOLEAN NOT NULL DEFAULT true,
  -- Free-form per-source config (keywords, subreddits, etc.). Edited from admin.
  config       JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_run_at  TIMESTAMPTZ,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default keyword set for every source. Hudson can override per-source in admin.
INSERT INTO warm_lead_sources (id, label, enabled, config) VALUES
  ('hackernews',    'Hacker News',     true,
   jsonb_build_object(
     'keywords', jsonb_build_array(
       'looking for a developer','need a developer','hiring a developer',
       'AI developer','landing page','build a website','Webflow developer',
       'Next.js developer','automation','build me','need help building',
       'looking to hire','seeking freelancer'
     ),
     'min_score', 1
   )),
  ('github_issues', 'GitHub Issues',   true,
   jsonb_build_object(
     'keywords', jsonb_build_array(
       'help wanted','looking for contributor','need consultant',
       'paid help','bounty','need someone to'
     ),
     'languages', jsonb_build_array('TypeScript','JavaScript','Python')
   )),
  ('bluesky',       'Bluesky',         false,
   jsonb_build_object(
     'keywords', jsonb_build_array(
       'looking for a dev','need a developer','need a website','build a landing page'
     )
   )),
  ('reddit',        'Reddit',          false,
   jsonb_build_object(
     'subreddits', jsonb_build_array('forhire','SideProject','Entrepreneur','smallbusiness','SaaS','nocode','webdev'),
     'keywords',   jsonb_build_array('[HIRING]','need help','looking for','build me')
   ))
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Settings — single-row config. Pinned to id='singleton'.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warm_lead_settings (
  id                   TEXT PRIMARY KEY DEFAULT 'singleton'
                       CHECK (id = 'singleton'),
  -- 'capped'    = stop after target_per_week leads have passed the threshold this week
  -- 'always_on' = run every cron tick, threshold floor only
  -- 'paused'    = scraper is off
  mode                 TEXT NOT NULL DEFAULT 'capped'
                       CHECK (mode IN ('capped','always_on','paused')),
  target_per_week      INTEGER NOT NULL DEFAULT 7,
  -- Min classifier score (0–100) for a candidate to surface in the inbox.
  -- Capped mode raises this dynamically; always_on uses it as a floor.
  threshold            INTEGER NOT NULL DEFAULT 60
                       CHECK (threshold BETWEEN 0 AND 100),
  -- Hudson's voice / pitch context for the drafting prompt.
  outreach_voice       TEXT NOT NULL DEFAULT
    'I''m Hudson, an indie developer who builds custom AI-powered web projects (landing pages, agent automations, lightweight SaaS). I work fast, ship Lovable+Claude-Code-grade quality, and prefer one specific question over a generic "let''s hop on a call".',
  -- Counters reset weekly by the edge function.
  week_started_on      DATE NOT NULL DEFAULT current_date,
  this_week_count      INTEGER NOT NULL DEFAULT 0,
  -- Set by edge function to record the last successful scrape across all sources.
  last_run_at          TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the singleton row. Idempotent.
INSERT INTO warm_lead_settings (id) VALUES ('singleton')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Warm Leads — the inbox. One row per discovered candidate.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warm_leads (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  source_id           TEXT NOT NULL REFERENCES warm_lead_sources(id) ON DELETE CASCADE,
  -- Stable per-source identifier so we can de-dup across re-scrapes.
  -- e.g. 'hn:42168930', 'gh:vercel/next.js#54321', 'reddit:abc123'
  external_id         TEXT NOT NULL,

  -- The original signal.
  url                 TEXT NOT NULL,
  author_handle       TEXT,            -- @handle / username
  author_display_name TEXT,
  posted_at           TIMESTAMPTZ,
  raw_title           TEXT,
  raw_excerpt         TEXT NOT NULL,   -- first ~1k chars of the post body

  -- Classifier output.
  score               INTEGER NOT NULL DEFAULT 0
                      CHECK (score BETWEEN 0 AND 100),
  score_reasoning     TEXT,            -- LLM's one-line "why this scored X"
  matched_keywords    TEXT[] NOT NULL DEFAULT '{}',

  -- Drafting output.
  drafted_message     TEXT,            -- the suggested DM/reply
  draft_generated_at  TIMESTAMPTZ,

  -- Workflow.
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','approved','sent','rejected','converted','dismissed')),
  reviewed_at         TIMESTAMPTZ,
  reviewer_notes      TEXT,
  -- When approved & promoted to the real leads table.
  promoted_lead_id    UUID REFERENCES leads(id) ON DELETE SET NULL,

  CONSTRAINT warm_leads_source_external_unique UNIQUE (source_id, external_id)
);

-- ============================================================================
-- Indexes
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_warm_leads_status_created
  ON warm_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warm_leads_score
  ON warm_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_warm_leads_source
  ON warm_leads(source_id, created_at DESC);

-- ============================================================================
-- updated_at triggers (reuses set_updated_at() from migration 001)
-- ============================================================================
DROP TRIGGER IF EXISTS warm_lead_sources_updated_at ON warm_lead_sources;
CREATE TRIGGER warm_lead_sources_updated_at
  BEFORE UPDATE ON warm_lead_sources
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS warm_lead_settings_updated_at ON warm_lead_settings;
CREATE TRIGGER warm_lead_settings_updated_at
  BEFORE UPDATE ON warm_lead_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS warm_leads_updated_at ON warm_leads;
CREATE TRIGGER warm_leads_updated_at
  BEFORE UPDATE ON warm_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Row-Level Security — admin-only (Hudson's personal CRM data, same as leads)
-- ============================================================================
ALTER TABLE warm_lead_sources  ENABLE ROW LEVEL SECURITY;
ALTER TABLE warm_lead_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE warm_leads         ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "warm_lead_sources_admin_only" ON warm_lead_sources;
CREATE POLICY "warm_lead_sources_admin_only" ON warm_lead_sources FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "warm_lead_settings_admin_only" ON warm_lead_settings;
CREATE POLICY "warm_lead_settings_admin_only" ON warm_lead_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "warm_leads_admin_only" ON warm_leads;
CREATE POLICY "warm_leads_admin_only" ON warm_leads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- ============================================================================
-- View: warm_leads_with_source — convenience join for the inbox UI.
-- ============================================================================
DROP VIEW IF EXISTS warm_leads_with_source;
CREATE VIEW warm_leads_with_source AS
SELECT
  wl.*,
  wls.label AS source_label
FROM warm_leads wl
JOIN warm_lead_sources wls ON wls.id = wl.source_id;
