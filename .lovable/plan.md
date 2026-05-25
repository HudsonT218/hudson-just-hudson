I found the issue: the owner bypass allows repeated submissions, but the database still has a unique email index. So when `hudsonturansky@gmail.com` submits again, the function generates the report successfully, then fails while saving it with `duplicate key value violates unique constraint "idx_ai_test_submissions_email"`, which becomes the 500 error shown on the page.

Plan:
1. Update `supabase/functions/ai-test-generate/index.ts` so owner/tester emails save repeat submissions with an upsert/update path instead of a plain insert.
2. Keep normal visitors limited to one report per email.
3. Make the save step non-blocking for owner/tester emails so a database duplicate can never prevent the report from showing.
4. Deploy the updated `ai-test-generate` function.
5. Test the deployed function with your Gmail payload and confirm it returns results instead of `store_error`.

Technical notes:
- The failing code is the insert into `ai_test_submissions` around lines 238-248.
- The backend log confirms Postgres error `23505` on `idx_ai_test_submissions_email` for `hudsonturansky@gmail.com`.
- No UI redesign or database migration should be needed for this fix.