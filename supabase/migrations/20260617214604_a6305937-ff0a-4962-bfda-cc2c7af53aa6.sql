
CREATE TABLE public.filing_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ticker TEXT NOT NULL,
  form TEXT NOT NULL,
  results JSONB NOT NULL,
  meta JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX filing_summaries_email_idx ON public.filing_summaries(email);
CREATE INDEX filing_summaries_created_at_idx ON public.filing_summaries(created_at);
GRANT ALL ON public.filing_summaries TO service_role;
ALTER TABLE public.filing_summaries ENABLE ROW LEVEL SECURITY;
