-- Policies to let the Python data-harvesting scripts write catalog data
-- (topics/exams/papers/questions/trends) using the anon key.
--
-- SECURITY NOTE: this file previously used `USING (true) WITH CHECK (true)`,
-- which grants write access to EVERYONE — including unauthenticated visitors,
-- since these tables are read with the public anon key. That version was
-- never applied to production; do not reintroduce it. Instead, run
-- scripts/dataset_harvester.py etc. with the Supabase SERVICE ROLE key
-- (bypasses RLS by design, meant for trusted server-side jobs only) rather
-- than granting public write policies. If you need the anon key to write
-- from a script, gate it behind the admin-role check below rather than `true`.
--
-- Run supabase/fix_admin_role_security.sql first — these policies depend on
-- the `profiles.role` column it creates.

-- Enable ALL operations on topics (admin-only)
CREATE POLICY "Allow admin all on topics"
ON public.topics FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enable ALL operations on exams (admin-only)
CREATE POLICY "Allow admin all on exams"
ON public.exams FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enable ALL operations on papers (admin-only)
CREATE POLICY "Allow admin all on papers"
ON public.papers FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- questions already gets an admin-only policy from supabase/fix_admin_role_security.sql

-- Enable ALL operations on trend_analytics (admin-only)
CREATE POLICY "Allow admin all on trends"
ON public.trend_analytics FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
