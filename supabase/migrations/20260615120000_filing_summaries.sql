-- ============================================================================
-- Filing Summaries
-- Stores AI-generated plain-English briefs from the free Filing Summarizer
-- (/finance-tools/filing-summarizer).
--
-- Unlike ai_test_submissions (one-per-email), this table allows MULTIPLE rows
-- per email — the tool grants 3 free runs. The per-email free-use gate is
-- enforced in the `summarize-filing` edge function BEFORE any SEC fetch or LLM
-- call (cost protection): it counts status='completed' rows for the email and
-- rejects once the count reaches FILING_FREE_USES (default 3). There is
-- intentionally no unique index here.
-- ============================================================================

CREATE TABLE IF NOT EXISTS filing_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  ticker TEXT NOT NULL,
  form TEXT NOT NULL,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed', 'pending'))
);

-- Serves the per-email free-use gate: COUNT(*) WHERE email = $1 AND status =
-- 'completed'. The edge function lowercases emails before both storing and
-- querying, so a plain btree on (email, status) is the right index.
CREATE INDEX IF NOT EXISTS idx_filing_summaries_email_status
  ON filing_summaries (email, status);

-- Serves the global daily-cap circuit breaker: COUNT(*) WHERE status =
-- 'completed' AND created_at >= today.
CREATE INDEX IF NOT EXISTS idx_filing_summaries_status_created
  ON filing_summaries (status, created_at);

-- ============================================================================
-- Row-Level Security
-- Admin-only reads (contains emails — sensitive). Writes happen from the edge
-- function using the service-role key, which bypasses RLS entirely.
-- ============================================================================

ALTER TABLE filing_summaries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "filing_summaries_admin_only" ON filing_summaries;
CREATE POLICY "filing_summaries_admin_only" ON filing_summaries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
