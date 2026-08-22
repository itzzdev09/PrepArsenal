-- =========================================================
-- PrepArsenal: Supabase PostgreSQL Schema with pgvector
-- Target Exams: SSC CGL, ACIO-II, RRB NTPC, RBI Grade B,
-- NABARD Grade A, SEBI Grade A, LIC AAO, UPSC APFC, IRDAI
-- =========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT NOT NULL,
    category TEXT NOT NULL, -- SSC, Banking, Railway, UPSC, Insurance, etc.
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_questions INT NOT NULL DEFAULT 100,
    total_time_mins INT NOT NULL DEFAULT 60,
    negative_marking NUMERIC(4, 2) NOT NULL DEFAULT 0.25,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TOPIC TAXONOMY TABLE
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    parent_topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    depth INT NOT NULL DEFAULT 0,
    importance_weight NUMERIC(3, 2) DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_topics_subject ON public.topics(subject);

-- 3. PAPERS (Historical exam papers / shifts)
CREATE TABLE IF NOT EXISTS public.papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    year INT NOT NULL,
    shift TEXT,
    tier TEXT DEFAULT 'Tier 1',
    paper_title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_papers_exam_year ON public.papers(exam_id, year);

-- 4. QUESTIONS TABLE (with vector embeddings for semantic search & clustering)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES public.papers(id) ON DELETE SET NULL,
    exam_code TEXT NOT NULL,
    year INT NOT NULL,
    subject TEXT NOT NULL,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    subtopic TEXT,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of string options ["A", "B", "C", "D"]
    correct_option INT NOT NULL, -- 0-indexed: 0=A, 1=B, etc.
    explanation TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    embedding vector(1536), -- Vector representation for semantic deduplication & RAG
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_exam_subject ON public.questions(exam_code, subject);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_year ON public.questions(year);

-- 5. ML TREND ANALYSIS TABLE (Aggregated frequency & predictive analytics)
CREATE TABLE IF NOT EXISTS public.trend_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_code TEXT NOT NULL,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE,
    yearly_frequencies JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. {"2019": 3, "2020": 4, "2021": 5, ...}
    prediction_score NUMERIC(5, 2) NOT NULL DEFAULT 50.00, -- 0-100% confidence
    difficulty_trend TEXT CHECK (difficulty_trend IN ('easier', 'stable', 'harder')) DEFAULT 'stable',
    avg_questions_per_year NUMERIC(4, 2) NOT NULL DEFAULT 0.0,
    recency_weight_score NUMERIC(5, 2) NOT NULL DEFAULT 50.0,
    last_computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(exam_code, topic_id)
);

CREATE INDEX IF NOT EXISTS idx_trends_exam_score ON public.trend_analytics(exam_code, prediction_score DESC);

-- 6. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    target_exams TEXT[] DEFAULT ARRAY['SSC_CGL']::TEXT[],
    exam_dates JSONB DEFAULT '{}'::jsonb,
    streak_count INT DEFAULT 0,
    last_study_date DATE,
    total_study_minutes INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. USER PROGRESS & FSRS SPACED REPETITION STATE
CREATE TABLE IF NOT EXISTS public.user_question_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INT NOT NULL,
    fsrs_state JSONB NOT NULL, -- Card state: stability, difficulty, reps, interval
    next_review_due TIMESTAMPTZ NOT NULL,
    review_count INT NOT NULL DEFAULT 1,
    last_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reviews_due ON public.user_question_reviews(user_id, next_review_due);

-- 8. STUDY PLANNER TASKS
CREATE TABLE IF NOT EXISTS public.study_plan_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_code TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    task_date DATE NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    task_type TEXT CHECK (task_type IN ('practice', 'revision', 'notes', 'mock')) DEFAULT 'practice',
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_study_tasks_user_date ON public.study_plan_tasks(user_id, task_date);

-- 9. AI CHAT CONVERSATIONS & QUESTION ASSIST
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    provider_used TEXT DEFAULT 'gemini',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Public Read for Catalog Data
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on exams" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Allow public read on topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow public read on papers" ON public.papers FOR SELECT USING (true);
CREATE POLICY "Allow public read on questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Allow public read on trends" ON public.trend_analytics FOR SELECT USING (true);

-- User-scoped policies
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own reviews" ON public.user_question_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study tasks" ON public.study_plan_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own ai chats" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);
