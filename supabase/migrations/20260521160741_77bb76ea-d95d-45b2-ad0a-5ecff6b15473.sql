
-- 004: AI test submissions
CREATE TABLE IF NOT EXISTS public.ai_test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  email TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed'
    CHECK (status IN ('completed', 'failed', 'pending'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_test_submissions_email
  ON public.ai_test_submissions (lower(email));

CREATE INDEX IF NOT EXISTS idx_ai_test_submissions_created_at
  ON public.ai_test_submissions (created_at);

ALTER TABLE public.ai_test_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_test_submissions_admin_only" ON public.ai_test_submissions;
CREATE POLICY "ai_test_submissions_admin_only" ON public.ai_test_submissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 005: tracking
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads (source);

CREATE TABLE IF NOT EXISTS public.traffic_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  landing_path TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_type TEXT CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown'))
);

CREATE INDEX IF NOT EXISTS idx_traffic_events_created_at ON public.traffic_events (created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_events_referrer ON public.traffic_events (referrer);

ALTER TABLE public.traffic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "traffic_events_public_insert" ON public.traffic_events;
CREATE POLICY "traffic_events_public_insert" ON public.traffic_events FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "traffic_events_admin_read" ON public.traffic_events;
CREATE POLICY "traffic_events_admin_read" ON public.traffic_events FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
