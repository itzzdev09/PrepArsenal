-- PrepArsenal — widen trend_analytics numeric columns.
--
-- avg_questions_per_year was NUMERIC(4, 2), which caps at 99.99. That was fine
-- when the question pool held a few hundred rows, but a broad topic in a
-- well-covered exam now genuinely averages well past that (IRDA/fe_banking
-- currently averages 142 questions per year), so the ML trend engine failed
-- with "numeric field overflow" (SQLSTATE 22003) on upsert.
--
-- recency_weight_score is an EWMA over the same counts and has the same range,
-- so it is widened to match.
--
-- Run this in the Supabase SQL Editor, then re-run scripts/ml_trend_engine.py.

ALTER TABLE public.trend_analytics
    ALTER COLUMN avg_questions_per_year TYPE NUMERIC(8, 2);

ALTER TABLE public.trend_analytics
    ALTER COLUMN recency_weight_score TYPE NUMERIC(8, 2);
