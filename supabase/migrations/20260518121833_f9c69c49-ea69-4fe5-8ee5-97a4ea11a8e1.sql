-- Admin CRM tables
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  how_i_know_them TEXT,
  what_they_might_need TEXT,
  status TEXT NOT NULL DEFAULT 'cold' CHECK (status IN ('cold', 'warm', 'client', 'dead')),
  last_contact_date DATE,
  next_action TEXT,
  next_action_date DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'web' CHECK (project_type IN ('web', 'ai', 'software', 'automation')),
  status TEXT NOT NULL DEFAULT 'discovery' CHECK (status IN ('discovery', 'proposal_sent', 'active', 'delivered', 'invoiced', 'paid', 'cancelled')),
  hourly_rate NUMERIC NOT NULL DEFAULT 75,
  estimated_hours NUMERIC,
  notes TEXT,
  start_date DATE,
  target_date DATE
);

CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT current_date,
  hours NUMERIC NOT NULL,
  description TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON public.leads(next_action_date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON public.time_entries(date);

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_admin_only" ON public.leads;
CREATE POLICY "leads_admin_only" ON public.leads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "projects_admin_only" ON public.projects;
CREATE POLICY "projects_admin_only" ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "time_entries_admin_only" ON public.time_entries;
CREATE POLICY "time_entries_admin_only" ON public.time_entries FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Warm lead automation tables
CREATE TABLE IF NOT EXISTS public.warm_lead_sources (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_run_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.warm_lead_sources (id, label, enabled, config) VALUES
  ('hackernews', 'Hacker News', true, jsonb_build_object(
    'keywords', jsonb_build_array('looking for a developer','need a developer','hiring a developer','AI developer','landing page','build a website','Webflow developer','Next.js developer','automation','build me','need help building','looking to hire','seeking freelancer'),
    'min_score', 1
  )),
  ('github_issues', 'GitHub Issues', true, jsonb_build_object(
    'keywords', jsonb_build_array('help wanted','looking for contributor','need consultant','paid help','bounty','need someone to'),
    'languages', jsonb_build_array('TypeScript','JavaScript','Python')
  )),
  ('bluesky', 'Bluesky', false, jsonb_build_object(
    'keywords', jsonb_build_array('looking for a dev','need a developer','need a website','build a landing page')
  )),
  ('reddit', 'Reddit', false, jsonb_build_object(
    'subreddits', jsonb_build_array('forhire','SideProject','Entrepreneur','smallbusiness','SaaS','nocode','webdev'),
    'keywords', jsonb_build_array('[HIRING]','need help','looking for','build me')
  ))
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.warm_lead_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton' CHECK (id = 'singleton'),
  mode TEXT NOT NULL DEFAULT 'capped' CHECK (mode IN ('capped','always_on','paused')),
  target_per_week INTEGER NOT NULL DEFAULT 7,
  threshold INTEGER NOT NULL DEFAULT 60 CHECK (threshold BETWEEN 0 AND 100),
  outreach_voice TEXT NOT NULL DEFAULT 'I''m Hudson, an indie developer who builds custom AI-powered web projects (landing pages, agent automations, lightweight SaaS). I work fast, ship Lovable+Claude-Code-grade quality, and prefer one specific question over a generic "let''s hop on a call".',
  week_started_on DATE NOT NULL DEFAULT current_date,
  this_week_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.warm_lead_settings (id) VALUES ('singleton')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.warm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_id TEXT NOT NULL REFERENCES public.warm_lead_sources(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  url TEXT NOT NULL,
  author_handle TEXT,
  author_display_name TEXT,
  posted_at TIMESTAMPTZ,
  raw_title TEXT,
  raw_excerpt TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  score_reasoning TEXT,
  matched_keywords TEXT[] NOT NULL DEFAULT '{}',
  drafted_message TEXT,
  draft_generated_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','approved','sent','rejected','converted','dismissed')),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  promoted_lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  CONSTRAINT warm_leads_source_external_unique UNIQUE (source_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_warm_leads_status_created ON public.warm_leads(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_warm_leads_score ON public.warm_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_warm_leads_source ON public.warm_leads(source_id, created_at DESC);

DROP TRIGGER IF EXISTS warm_lead_sources_updated_at ON public.warm_lead_sources;
CREATE TRIGGER warm_lead_sources_updated_at
  BEFORE UPDATE ON public.warm_lead_sources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS warm_lead_settings_updated_at ON public.warm_lead_settings;
CREATE TRIGGER warm_lead_settings_updated_at
  BEFORE UPDATE ON public.warm_lead_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS warm_leads_updated_at ON public.warm_leads;
CREATE TRIGGER warm_leads_updated_at
  BEFORE UPDATE ON public.warm_leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.warm_lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warm_lead_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "warm_lead_sources_admin_only" ON public.warm_lead_sources;
CREATE POLICY "warm_lead_sources_admin_only" ON public.warm_lead_sources FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "warm_lead_settings_admin_only" ON public.warm_lead_settings;
CREATE POLICY "warm_lead_settings_admin_only" ON public.warm_lead_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "warm_leads_admin_only" ON public.warm_leads;
CREATE POLICY "warm_leads_admin_only" ON public.warm_leads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP VIEW IF EXISTS public.warm_leads_with_source;
CREATE VIEW public.warm_leads_with_source
WITH (security_invoker = true) AS
SELECT
  wl.*,
  wls.label AS source_label
FROM public.warm_leads wl
JOIN public.warm_lead_sources wls ON wls.id = wl.source_id;