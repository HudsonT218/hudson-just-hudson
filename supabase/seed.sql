-- ============================================================================
-- Seed: bootstrap Hudson's admin profile
--
-- HOW TO USE:
-- 1. Sign up via the app's /signup page using Hudson's email
-- 2. Find his user UUID:    SELECT id, email FROM auth.users WHERE email = 'hudsonturansky@gmail.com';
-- 3. Run this to flip the admin bit:
--      UPDATE profiles SET is_admin = true WHERE email = 'hudsonturansky@gmail.com';
--
-- Or, if you know the UUID, just paste it below and run this file directly.
-- ============================================================================

-- Replace this email with the admin email if it differs.
UPDATE profiles SET is_admin = true WHERE email = 'hudsonturansky@gmail.com';
