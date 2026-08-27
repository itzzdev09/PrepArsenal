-- PrepArsenal — add the missing questions.shift column.
--
-- supabase/schema.sql has always declared `shift TEXT` on public.questions, but
-- databases created before that line was added do not have it, and Supabase
-- rejects writes to it with:
--     PGRST204: Could not find the 'shift' column of 'questions'
--
-- scripts/prepp_pyq_pipeline.py imports shift-wise papers (one row per exam
-- sitting: "1 Dec 2022 Shift 1") and falls back to storing the value only in
-- metadata.shift when this column is absent. Running this makes shift a real,
-- indexable column so a mock test can select one specific sitting cheaply.
--
-- Safe to run more than once.

ALTER TABLE public.questions
    ADD COLUMN IF NOT EXISTS shift TEXT;

-- Backfill from the metadata already written by the importer.
UPDATE public.questions
SET shift = metadata->>'shift'
WHERE shift IS NULL
  AND metadata->>'shift' IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_questions_exam_year_shift
    ON public.questions(exam_code, year, shift);
