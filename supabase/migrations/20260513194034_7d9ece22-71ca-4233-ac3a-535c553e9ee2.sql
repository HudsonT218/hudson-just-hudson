CREATE TABLE public.reference_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  invited_email text NOT NULL,
  invited_name  text,
  token         text NOT NULL UNIQUE,
  expires_at    timestamptz NOT NULL,
  submitted_at  timestamptz,
  status        text NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','submitted','expired','revoked')),
  notes         text
);
CREATE INDEX reference_requests_token_idx ON public.reference_requests(token);
CREATE INDEX reference_requests_status_idx ON public.reference_requests(status);

CREATE OR REPLACE FUNCTION public.normalize_reference_request_email()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.invited_email = lower(trim(NEW.invited_email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER reference_requests_normalize_email
BEFORE INSERT OR UPDATE ON public.reference_requests
FOR EACH ROW EXECUTE FUNCTION public.normalize_reference_request_email();

CREATE TABLE public."references" (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id    uuid NOT NULL REFERENCES public.reference_requests(id) ON DELETE CASCADE,
  created_at    timestamptz NOT NULL DEFAULT now(),
  name          text NOT NULL,
  role_title    text NOT NULL,
  email         text NOT NULL,
  headline      text NOT NULL CHECK (length(headline) <= 140),
  linkedin_url  text,
  status        text NOT NULL DEFAULT 'pending_review'
                CHECK (status IN ('pending_review','approved','rejected','hidden')),
  approved_at   timestamptz,
  display_order integer NOT NULL DEFAULT 0
);
CREATE INDEX references_status_idx ON public."references"(status);
CREATE INDEX references_display_order_idx ON public."references"(display_order);
CREATE UNIQUE INDEX references_one_per_request ON public."references"(request_id);

ALTER TABLE public.reference_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."references" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin all on reference_requests" ON public.reference_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "public read approved references" ON public."references"
  FOR SELECT TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "admin all on references" ON public."references"
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE VIEW public.approved_references_public AS
SELECT id, name, role_title, headline, linkedin_url, display_order, created_at
FROM public."references"
WHERE status = 'approved'
ORDER BY display_order ASC, created_at DESC;

GRANT SELECT ON public.approved_references_public TO anon, authenticated;