-- ============================================================================
-- Lead Management OS — Phase 1 Schema
-- Tables: leads, projects, time_entries
-- + RLS policies (admin-only — Hudson's personal CRM)
-- + updated_at triggers
-- ============================================================================

-- Leads (people Hudson might work with)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  how_i_know_them TEXT,
  what_they_might_need TEXT,
  status TEXT NOT NULL DEFAULT 'cold'
    CHECK (status IN ('cold', 'warm', 'client', 'dead')),
  last_contact_date DATE,
  next_action TEXT,
  next_action_date DATE,
  notes TEXT
);

-- Projects (work tied to a lead)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT NOT NULL DEFAULT 'web'
    CHECK (project_type IN ('web', 'ai', 'software', 'automation')),
  status TEXT NOT NULL DEFAULT 'discovery'
    CHECK (status IN ('discovery', 'proposal_sent', 'active', 'delivered', 'invoiced', 'paid', 'cancelled')),
  hourly_rate NUMERIC NOT NULL DEFAULT 75,
  estimated_hours NUMERIC,
  notes TEXT,
  start_date DATE,
  target_date DATE
);

-- Time entries (per-project hours log)
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT current_date,
  hours NUMERIC NOT NULL,
  description TEXT NOT NULL
);

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_next_action_date ON leads(next_action_date);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);

-- ============================================================================
-- updated_at triggers (reuses set_updated_at() from migration 001)
-- ============================================================================

DROP TRIGGER IF EXISTS leads_updated_at ON leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- Row-Level Security — admin-only (this is Hudson's personal CRM data)
-- ============================================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_admin_only" ON leads;
CREATE POLICY "leads_admin_only" ON leads FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "projects_admin_only" ON projects;
CREATE POLICY "projects_admin_only" ON projects FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

DROP POLICY IF EXISTS "time_entries_admin_only" ON time_entries;
CREATE POLICY "time_entries_admin_only" ON time_entries FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
