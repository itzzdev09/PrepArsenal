# PrepArsenal — Architecture & Roadmap

## Overview
PrepArsenal is an AI-powered Govt Exam Prep Platform targeting high-stakes Indian competitive exams (SSC CGL, ACIO-II, RRB NTPC, RBI Grade B, NABARD, SEBI, LIC AAO, UPSC APFC). It leverages machine learning to predict exam trends based on historical PYQs (Previous Year Questions) and provides an AI tutor for personalized guidance.

## Current Tech Stack (v1)
- **Frontend & Routing:** Next.js 15 (App Router)
- **Styling:** Vanilla CSS (`index.css`) & CSS Modules, custom dark-mode design system
- **Database (BaaS):** Supabase (PostgreSQL)
  - `profiles`: User progress, streaks, XP.
  - `questions`, `topics`, `exams`: Exam content structure.
  - `user_question_reviews`: Tracks spaced repetition and quiz performance.
  - `trend_analytics`: Stores ML predictions for topics.
  - `ai_conversations`: Chat logs for the tutor.
- **AI / LLM:** Google Gemini API (via `@google/genai`) for the AI Tutor and Exam Assistant.
- **Data Pipeline (Python):** 
  - `dataset_harvester.py`: Scrapes/transforms public datasets (like HuggingFace `cais/mmlu`) into standardized PYQs and pushes them to Supabase.
  - `ml_trend_engine.py`: Uses exponential recency-weighted moving averages (EWMA) to predict topic probabilities based on historical frequency.

## The Future Data Pivot (Turso Strategy)
**The Problem:** Supabase's free tier is generous (500 MB DB storage) and can hold ~250,000 text questions. However, if we scale to millions of questions, add high-dimensional `pgvector` embeddings for semantic search, or store extensive OCR text from NCERTs, we will hit the free tier ceiling.

**The Solution (Turso):** 
In the future, we plan to execute the **Turso Pivot**:
1. **Turso (SQLite at the Edge):** We will migrate all *static, read-heavy* data (`questions`, `exams`, `topics`, `papers`) to Turso. Turso offers a massive **9 GB free tier**.
2. **Supabase:** Will be retained strictly for *dynamic, write-heavy* user state (Authentication, `profiles`, `user_question_reviews`, `ai_conversations`).
3. **Vector DB:** If embeddings are needed, we will offload vectors to Pinecone or Qdrant (which offer generous 100k+ vector free tiers).

## Project Roadmap

### Phase 1: Foundation & UI (Completed)
- Built the UI shell, Navigation Sidebar, Dashboard, Practice Arena, and AI Tutor view.
- Implemented core CSS design system (glassmorphism, neon accents).

### Phase 2: AI Integration (Completed)
- Connected Google Gemini API for the interactive AI Tutor.
- Setup markdown streaming and context-aware system prompts.

### Phase 3: Database & State Migration (Completed)
- Designed full PostgreSQL relational schema (`schema.sql`).
- Transitioned application state from `localStorage` to asynchronous Supabase fetching.
- Added Row Level Security (RLS) policies.

### Phase 4: Data Acquisition & ML Pipeline (Completed)
- Built Python environment (`requirements.txt`).
- Created `dataset_harvester.py` to ingest open-source benchmark questions directly into Supabase.
- Created `ml_trend_engine.py` to compute predictive topic scores and populate the `trend_analytics` table.
- Connected the Practice Arena UI to fetch live Supabase questions instead of mock files.

### Phase 5: Polish & Launch (Next)
- Real Mock Tests (Timed 100-question sessions).
- Display ML trends visually on the Dashboard.
- Advanced Analytics (XP system, accuracy charts).
