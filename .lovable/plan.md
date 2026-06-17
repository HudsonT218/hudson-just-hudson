## Problem

The `/finance-tools/filing-summarizer` page shows "Failed to fetch" because the `summarize-filing` edge function returns 404 — it exists in the repo at `supabase/functions/summarize-filing/index.ts` but has never been deployed to Lovable Cloud. The Lovable AI key (`LOVABLE_API_KEY`) is already provisioned, so no key wiring is needed.

## Fix

1. Deploy `summarize-filing` (and its companion `email-filing-report`, which the same page also invokes) to Lovable Cloud.
2. Test by calling `summarize-filing` with `{ ticker: "AAPL", form: "latest", email: "test@example.com" }` and confirm a 200 with a brief, not a 404.
3. If the test surfaces a missing-table error (e.g. `filing_summaries`), report back before adding migrations — no schema changes are in scope yet.

## Out of scope

- No UI changes to `FilingSummarizerPage.tsx`.
- No prompt/model changes (default `google/gemini-3-flash-preview` stays).
- No new secrets or DB migrations unless the deploy test reveals one is missing.