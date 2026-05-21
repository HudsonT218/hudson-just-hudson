-- ============================================================================
-- Tracking instrumentation — self-reported attribution + visit log
-- (Prompt 9 from LLM-SEO/measurement-and-tracking-plan.md)
--
-- Lets us answer: where do leads come from (especially AI assistants), and
-- which referrers drive visits to the public site? Most AI referral traffic
-- arrives with NO referrer header (mobile apps strip them), so the only
-- reliable signal is asking the person directly via the source field.
-- ============================================================================

-- 1. `source` column on leads
-- Stores the value picked by the user from the "How did you hear about me?"
-- field on lead-capture surfaces (AI test, future contact forms).
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS source TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);

-- 2. `traffic_events` — lightweight visit log
-- One row per public-page load. Inserted client-side by the visit logger in
-- the SPA. Privacy-respecting: no IP, no user-agent string, just a coarse
-- device-type bucket.
CREATE TABLE IF NOT EXISTS traffic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  landing_path TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_traffic_events_created_at ON traffic_events (created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_events_referrer ON traffic_events (referrer);

-- ============================================================================
-- Row-Level Security
-- - INSERT: anyone (visit log fires from the public SPA via the anon key).
-- - SELECT/UPDATE/DELETE: admin only.
-- ============================================================================

ALTER TABLE traffic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "traffic_events_public_insert" ON traffic_events;
CREATE POLICY "traffic_events_public_insert" ON traffic_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "traffic_events_admin_read" ON traffic_events;
CREATE POLICY "traffic_events_admin_read" ON traffic_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
