-- site_settings: singleton row holding public, manually-edited campaign state.
-- Currently powers the /free-build landing page counter ("X of Y free spots left").
-- Public can read; only admins can write. The CHECK constraint on id pins it to
-- a single row forever (same pattern as warm_lead_settings).

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton' CHECK (id = 'singleton'),
  free_projects_total INTEGER NOT NULL DEFAULT 20,
  free_projects_remaining INTEGER NOT NULL DEFAULT 20,
  campaign_open BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES ('singleton')
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- The landing page is anonymous and must be able to read the counter.
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read" ON public.site_settings
  FOR SELECT
  USING (true);

-- Writes are admin-only — same gate the leads table uses.
DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;
CREATE POLICY "site_settings_admin_write" ON public.site_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
