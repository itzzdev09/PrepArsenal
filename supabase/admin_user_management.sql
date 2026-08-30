-- PrepArsenal — Admin User Management Expansion
--
-- Adds a `status` column for user suspension, plus an RLS policy
-- allowing admins to read all profiles and a policy for the
-- service-role API to update restricted columns.
--
-- Run this once in the Supabase SQL editor for your project.

-- 1. Add status column for user suspension/banning.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended'));

-- 2. Revoke direct UPDATE on `status` from client-facing roles,
--    just like we did for `role` in fix_admin_role_security.sql.
--    Changes go through the service-role API endpoint only.
REVOKE UPDATE (status) ON public.profiles FROM authenticated, anon;

-- 3. Allow admins to read ALL user profiles (not just their own).
--    The existing policy "Users can manage own profile" only allows
--    `auth.uid() = id`, so admins can't see other users.
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 4. Allow admins to update non-restricted columns on any profile
--    (e.g. streak_count reset).  The `role` and `status` columns
--    are still protected by the column-level REVOKE.
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 5. Allow admins to read user_question_reviews for analytics aggregation.
DROP POLICY IF EXISTS "Admins can read all reviews" ON public.user_question_reviews;
CREATE POLICY "Admins can read all reviews" ON public.user_question_reviews
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
