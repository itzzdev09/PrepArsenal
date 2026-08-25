-- PrepArsenal — Fix admin role privilege-escalation hole
--
-- Problem: `role` was stored inside the user-writable `exam_dates` JSONB column
-- on `profiles`. The RLS policy "Users can manage own profile" allows
-- `FOR ALL USING (auth.uid() = id)` with no column restriction, so any logged-in
-- user could call the Supabase client directly (e.g. from devtools) with
-- `supabase.from('profiles').update({ exam_dates: { role: 'admin' } }).eq('id', user.id)`
-- and grant themselves admin — bypassing the app's UI entirely.
--
-- Fix: move `role` into its own real column, backfill it, strip it out of
-- exam_dates, and revoke UPDATE on that column from the client-facing Postgres
-- roles so it can only be changed via the Supabase Studio table editor or a
-- service-role key (i.e. by you, not by end users).
--
-- Run this once in the Supabase SQL editor for your project.

-- 1. Add a real, constrained role column.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- 2. Backfill from the old JSONB location, then strip it out so no duplicate
--    source of truth remains inside exam_dates.
UPDATE public.profiles
SET role = COALESCE(NULLIF(exam_dates->>'role', ''), 'user')
WHERE exam_dates ? 'role';

UPDATE public.profiles
SET exam_dates = exam_dates - 'role'
WHERE exam_dates ? 'role';

-- 3. Prevent the client-facing Postgres roles from ever updating the role
--    column directly, regardless of what RLS policy is in force. This is
--    enforced independently of (and in addition to) row-level security.
REVOKE UPDATE (role) ON public.profiles FROM authenticated, anon;

-- 4. Let admins manage the question bank (this was previously silently
--    blocked by RLS since no write policy existed — saveAdminQuestion /
--    deleteAdminQuestion in lib/db.ts were failing against Supabase and only
--    writing to Turso). Scoped to users whose own profile role is 'admin'.
DROP POLICY IF EXISTS "Admins can manage questions" ON public.questions;
CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- To promote a user to admin after running this migration, run in the SQL editor:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
-- This is a service-role operation (SQL editor / dashboard), not something the
-- app or an end user can trigger.
