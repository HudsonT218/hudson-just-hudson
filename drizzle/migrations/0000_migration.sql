DROP POLICY IF EXISTS site_settings_public_read ON public.site_settings;
CREATE POLICY site_settings_public_read ON public.site_settings FOR SELECT TO anon, authenticated USING (id = 'singleton');

DROP POLICY IF EXISTS traffic_events_public_insert ON public.traffic_events;
CREATE POLICY traffic_events_public_insert ON public.traffic_events FOR INSERT TO anon, authenticated
WITH CHECK (
  (referrer IS NULL OR length(referrer) <= 2048)
  AND (landing_path IS NULL OR (length(landing_path) <= 512 AND landing_path LIKE '/%'))
  AND (utm_source IS NULL OR length(utm_source) <= 200)
  AND (utm_medium IS NULL OR length(utm_medium) <= 200)
  AND (utm_campaign IS NULL OR length(utm_campaign) <= 200)
  AND (device_type IS NULL OR device_type IN ('mobile','tablet','desktop'))
  AND created_at >= now() - interval '5 minutes' AND created_at <= now() + interval '5 minutes'
);