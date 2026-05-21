-- ============================================================================
-- AI Use-Case Test Submissions
-- Stores quiz answers and generated results from the free /ai-test tool.
--
-- One-use-per-email is enforced by the `ai-test-generate` edge function
-- BEFORE any LLM call (cost protection). The UNIQUE index on lower(email)
-- is the database-level backstop in case the function's check ever races.
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed', 'pending'))
);

-- Case-insensitive unique index — enforces one submission per email
-- (the edge function lowercases incoming emails too).
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_test_submissions_email
  ON ai_test_submissions (lower(email));

-- Used by the daily-cap circuit-breaker in the edge function.
CREATE INDEX IF NOT EXISTS idx_ai_test_submissions_created_at
  ON ai_test_submissions (created_at);

-- ============================================================================
-- Row-Level Security
-- Admin-only reads (this contains email + free-text answers — sensitive).
-- Writes happen from the edge function using the service-role key, which
-- bypasses RLS entirely.
-- ============================================================================

ALTER TABLE ai_test_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_test_submissions_admin_only" ON ai_test_submissions;
CREATE POLICY "ai_test_submissions_admin_only" ON ai_test_submissions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
