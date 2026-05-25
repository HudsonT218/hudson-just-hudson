
CREATE TABLE public.site_settings (
  id text PRIMARY KEY CHECK (id = 'singleton'),
  free_projects_total integer NOT NULL DEFAULT 5,
  free_projects_remaining integer NOT NULL DEFAULT 5,
  campaign_open boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings_public_read"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings_admin_update"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (app_private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (id) VALUES ('singleton');
