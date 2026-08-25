-- PrepArsenal — NCERT Chapter Tests + GK Daily Booster
-- Run once in the Supabase SQL editor. Depends on supabase/fix_admin_role_security.sql
-- having already been run (needs the `profiles.role` column).

-- ============================================================
-- NCERT chapter tests: AI-generated MCQs cached per chapter,
-- shared across all users (generated once, reused after).
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ncert_chapter_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ncert_chapter_tests_chapter_id_idx ON public.ncert_chapter_tests (chapter_id);

ALTER TABLE public.ncert_chapter_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on ncert_chapter_tests" ON public.ncert_chapter_tests;
CREATE POLICY "Allow public read on ncert_chapter_tests"
  ON public.ncert_chapter_tests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can cache generated chapter tests" ON public.ncert_chapter_tests;
CREATE POLICY "Authenticated users can cache generated chapter tests"
  ON public.ncert_chapter_tests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- GK daily items: auto-drafted by scripts/gk_harvester.py as
-- 'pending_review', published to everyone once an admin
-- approves it via /admin/gk-review.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gk_daily_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category TEXT NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    source_url TEXT,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option INT NOT NULL,
    explanation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS gk_daily_items_date_idx ON public.gk_daily_items (item_date DESC);
CREATE INDEX IF NOT EXISTS gk_daily_items_status_idx ON public.gk_daily_items (status);

ALTER TABLE public.gk_daily_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read approved GK items" ON public.gk_daily_items;
CREATE POLICY "Public can read approved GK items"
  ON public.gk_daily_items FOR SELECT
  USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can manage GK items" ON public.gk_daily_items;
CREATE POLICY "Admins can manage GK items"
  ON public.gk_daily_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- To create the harvester's admin account: sign up normally through the app,
-- then run:
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<harvester-bot-user-uuid>';
-- and put its email/password in GK_HARVESTER_EMAIL / GK_HARVESTER_PASSWORD
-- (k8s secret / .env for scripts only — never in the Next.js app's env).
