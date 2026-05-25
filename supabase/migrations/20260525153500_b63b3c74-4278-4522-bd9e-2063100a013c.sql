
ALTER TABLE warm_lead_settings ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE warm_lead_settings ADD COLUMN IF NOT EXISTS target_per_run INTEGER NOT NULL DEFAULT 5 CHECK (target_per_run BETWEEN 1 AND 50);
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS mode;
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS target_per_week;
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS this_week_count;
ALTER TABLE warm_lead_settings DROP COLUMN IF EXISTS week_started_on;

ALTER TABLE warm_lead_sources ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'edge_function' CHECK (kind IN ('edge_function', 'local_agent'));

DELETE FROM warm_lead_sources WHERE id IN ('hackernews', 'github_issues', 'bluesky');

UPDATE warm_lead_sources
SET config = jsonb_build_object(
      'keywords', jsonb_build_array(
        'need a website','looking for a web designer','need help with my website',
        'want to add ai','automate my business','small business website',
        'build me a website','redesign my website','website for my','ai for my business'
      ),
      'subreddits', jsonb_build_array(
        'smallbusiness','Entrepreneur','restaurantowners','Etsy','shopify','Wordpress','EtsySellers','AskEntrepreneurs'
      )
    ),
    enabled = false
WHERE id = 'reddit';

INSERT INTO warm_lead_sources (id, label, kind, enabled, config) VALUES
  ('linkedin', 'LinkedIn', 'local_agent', false,
   jsonb_build_object(
     'keywords', jsonb_build_array(
       'need a website for my','looking for a web designer','small business owner looking',
       'looking to redesign','ai for my business','automate my business','anyone build websites'
     )
   ))
ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, label = EXCLUDED.label;
