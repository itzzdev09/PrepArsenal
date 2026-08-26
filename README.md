# PrepArsenal

**PrepArsenal** is an all-in-one exam-preparation platform for Indian competitive exams — SSC CGL, ACIO-II, RRB NTPC, RBI Grade B, NABARD Grade A, SEBI Grade A, LIC AAO, UPSC APFC, and IRDAI Assistant. It combines Previous Year Question (PYQ) practice, adaptive IRT-based mock tests, trend analysis, study planning, smart notes, formula revision, NCERT sprints, GK revision, and an AI tutor into a single sketchbook-styled learning workspace.

Built with **Next.js**, **Supabase**, and **Turso/libSQL**.

[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/license-Private-lightgrey)](#license)

---

## Table of Contents

- [Overview](#overview)
- [What Makes PrepArsenal Different](#what-makes-preparsenal-different)
- [Features](#features)
- [Architecture](#architecture)
- [The PYQ Data Pipeline](#the-pyq-data-pipeline)
- [Multi-Database Strategy](#multi-database-strategy)
- [AI Tutor: RAG + Semantic Caching](#ai-tutor-rag--semantic-caching)
- [Adaptive Testing (IRT) & Spaced Repetition (FSRS)](#adaptive-testing-irt--spaced-repetition-fsrs)
- [Interface System](#interface-system)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Verification](#verification)
- [Project Structure](#project-structure)
- [Deployment & Scaling](#deployment--scaling)
- [CI/CD](#cicd)
- [Security](#security)
- [Roadmap](#roadmap)
- [License](#license)

## Overview

PrepArsenal centralizes everything a candidate needs to prepare for major Indian government and banking competitive exams — question practice, mock tests, analytics, and AI-assisted doubt solving — in one cohesive app, instead of juggling PDFs, spreadsheets, and multiple tools.

It targets high-stakes exams: **SSC CGL, ACIO-II, RRB NTPC, RBI Grade B, NABARD Grade A, SEBI Grade A, LIC AAO, UPSC APFC, and IRDAI Assistant**, and is built to scale from a single candidate's laptop to a multi-region Kubernetes deployment serving traffic spikes on exam result days.

## What Makes PrepArsenal Different

- **Deterministic PYQ extraction, not LLM guesswork.** The question pipeline parses official PDF papers with regex and rule-based structure detection — no Gemini/Groq calls anywhere in ingestion. The same PDF always produces the same rows, ingestion costs nothing per paper, and no question is ever hallucinated into existence.
- **Two databases doing two different jobs.** Read-heavy exam content (questions, papers, topics) lives in Turso/libSQL at the edge; write-heavy user state (auth, profiles, reviews, chat logs) lives in Supabase/Postgres with Row Level Security. Each store is picked for the access pattern it's actually good at, not for convenience.
- **Real psychometrics, not random quizzes.** Practice sessions use an IRT (Item Response Theory) adaptive engine to select questions matched to estimated ability, and review scheduling runs on FSRS (Free Spaced Repetition Scheduler) — the same algorithm family used by modern spaced-repetition tools like Anki, tuned for 90% target retention.
- **A grounded AI Tutor, not a bare chatbot.** The tutor answers from a retrieval-augmented (RAG) knowledge corpus with citations, and a semantic cache short-circuits repeated/near-duplicate questions before they burn an LLM call.
- **Infrastructure sized for exam-day spikes.** Horizontal Pod Autoscaling, pod anti-affinity, PodDisruptionBudgets, and aggressive fast-scale-up are all configured specifically for the traffic pattern of government exam result days, not generic web traffic.

## Features

- **Practice Arena** — standard and adaptive (IRT) test modes tuned to the learner's ability.
- **Mock Tests** — full-length exams for SSC CGL, ACIO-II, RRB NTPC, RBI Grade B, NABARD Grade A, SEBI Grade A, LIC AAO, UPSC APFC, and IRDAI Assistant.
- **Trend Explorer** — prediction scores, question frequency, and difficulty signals derived from historical PYQs.
- **Study Planner** — structured, goal-driven prep scheduling.
- **Smart Notes** — exam-linked note-taking.
- **Formula Vault** — quick-access formula revision.
- **NCERT Sprint** — fast-track NCERT concept revision.
- **GK Booster** — current-affairs and general-knowledge revision.
- **Analytics & Profile** — performance tracking across attempts and topics.
- **AI Tutor** — prompt categories, citations, response caching, and a dedicated scrollable conversation view (powered by Gemini/Groq).
- **Auth & Data** — Supabase for authentication and user state; Turso/libSQL for read-heavy PYQ data at scale.

## Architecture

```
                         [ Global CDN / Cloudflare ]
                                      │
                                      ▼
                        [ Ingress Controller (Nginx) ]
                       (TLS Termination / Rate Limiting)
                                      │
           ┌──────────────────────────┴──────────────────────────┐
           ▼                                                     ▼
[ Next.js Web Pods (HPA: 2-25) ]                        [ Python ML CronJobs ]
  ├── Standalone Node 20 runtime                          ├── ml_trend_engine.py (Daily)
  ├── Non-root (uid: 1001)                                └── pdf_pyq_pipeline.py (Weekly)
  ├── Readiness / Liveness Probes                                │
  │                                                              │
  ├───────────────► [ Redis In-Cluster Cache ] ◄─────────────────┘
  │                 (Session / AI Tutor / Rate Limits)
  │
  ├───────────────► [ Turso (libSQL) — read-heavy PYQ data ]
  ├───────────────► [ Supabase PostgreSQL — auth & write-heavy user state ]
  └───────────────► [ Google Gemini / Groq LLM APIs ]
```

The web tier is stateless and horizontally scalable; all persistent state lives in the two databases below, and short-lived state (sessions, rate limits, AI Tutor context) lives in Redis. See [ARCHITECTURE.md](ARCHITECTURE.md) and [DEVOPS.md](DEVOPS.md) for the full write-up.

## The PYQ Data Pipeline

`scripts/pdf_pyq_pipeline.py` is the backbone of the content library:

1. Downloads previous-year-question PDF papers for every exam configured in `lib/data.ts`, caching each PDF locally (`scripts/pdf_cache/`) so repeat runs don't re-fetch.
2. Extracts every question, option set, answer key, explanation, subject, and topic using deterministic regex/keyword rules in `scripts/pyq_parser.py` — **no LLM is involved in extraction**, so results are reproducible and free to (re-)run.
3. Drops any question whose answer key can't be located, since an unscored question is dead weight in a practice app.
4. Bulk-writes the parsed rows to Turso (default) or Supabase, and emits `scripts/pyq_import_report.json` summarizing what was imported per exam/paper.

```bash
python scripts/pdf_pyq_pipeline.py                      # all exams, all papers
python scripts/pdf_pyq_pipeline.py --exam SSC_CGL        # just one exam
python scripts/pdf_pyq_pipeline.py --dry-run             # parse + report, no writes
python scripts/pdf_pyq_pipeline.py --target supabase     # write to Supabase instead
```

Alongside it, `scripts/dataset_harvester.py` ingests open-source benchmark question sets, and `scripts/ml_trend_engine.py` runs an exponential recency-weighted moving average (EWMA) over historical PYQ frequency to populate the `trend_analytics` table that powers Trend Explorer. In production, both run as Kubernetes CronJobs (`ml_trend_engine.py` nightly, the harvester/PDF pipeline weekly) so the web pods never pay the cost of data ingestion.

## Multi-Database Strategy

PrepArsenal deliberately splits state across two databases instead of forcing everything into one:

| Store | Used for | Why |
|---|---|---|
| **Supabase (PostgreSQL)** | Auth, `profiles`, `user_question_reviews`, `ai_conversations`, RLS-protected user data | Write-heavy, relational, needs Row Level Security and real-time auth — Postgres is the right tool. |
| **Turso (libSQL, edge SQLite)** | `questions`, `exams`, `topics`, `papers` — the bulk of the content library | Read-heavy, rarely mutated, and needs to scale to millions of rows cheaply; Turso's free tier alone (9 GB) outsizes Supabase's for this workload. Falls back to an embedded local SQLite file when no Turso credentials are configured, so local dev needs zero cloud setup. |
| **Redis (in-cluster)** | Sessions, AI Tutor context, rate limiting, cached PYQ reads | Sub-millisecond ephemeral state that has no business in a durable database. |

This keeps each database doing the one job it's actually good at, rather than one Postgres instance straining under both relational writes and a growing question corpus. See the "Future Data Pivot" section of [ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning behind the split.

## AI Tutor: RAG + Semantic Caching

The AI Tutor (`app/api/tutor/chat/route.ts`, `lib/rag/`, `lib/cache/`) is grounded rather than freeform:

- **Retrieval-augmented generation** — `lib/rag/knowledge-corpus.ts` and `lib/rag/rag-engine.ts` retrieve relevant source material before generating a response, so answers come with citations instead of being pulled purely from model memory.
- **Semantic response cache** — `lib/cache/semantic-cache.ts` recognizes near-duplicate questions and reuses prior responses, cutting both latency and LLM API spend.
- **Dual-provider fallback** — Gemini is the primary model; Groq (fast Llama inference) is the fallback, so the tutor stays available if one provider rate-limits or errors.
- **Streaming UX** — responses stream via SSE with Nginx/Ingress buffering disabled, so tokens render as they're generated instead of waiting for the full response.

## Adaptive Testing (IRT) & Spaced Repetition (FSRS)

- **`lib/adaptive/irt-engine.ts`** implements Item Response Theory scoring: each attempt updates an estimate of the candidate's ability, and the next question is selected to sit near that ability level instead of being served at random — the same statistical approach used by standardized adaptive tests like the GRE.
- **`lib/fsrs.ts`** wires up FSRS (Free Spaced Repetition Scheduler, via `ts-fsrs`) targeting 90% retention, so Smart Notes and question review intervals are scheduled based on individual forgetting curves rather than a fixed "review every N days" rule.

## Interface System

The app uses a cohesive sketchbook-inspired learning interface:

- Paper-toned surfaces, hand-drawn borders, hard-offset depth, and responsive 3D press states.
- A shared application navbar and fixed, independently scrollable sidebar.
- Uploaded exam logo assets replace decorative exam emojis wherever a logo is available.
- Lucide icons replace generic UI emojis across the application.
- Lenis provides a restrained smooth-scroll glide, and Framer Motion provides page-entry transitions without breaking fixed layout elements.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router), TypeScript |
| Auth & user state | Supabase |
| Read-heavy data | Turso (libSQL) |
| AI Tutor | Gemini API (primary), Groq API (fallback) |
| Motion / UX | Framer Motion, Lenis |
| Icons | Lucide |
| Deployment | Docker, Helm, Kubernetes |

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` from `.env.example` and supply your own values — **never commit this file**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
   ```

   `GEMINI_API_KEY` and `GROQ_API_KEY` are optional unless the AI Tutor is being used. Question ingestion, NCERT chapter tests and the GK harvester deliberately use no LLM — see "Question Ingestion" below.

## Question Ingestion

All question data is produced deterministically, without any LLM call:

- `scripts/pyq_parser.py` — regex + keyword parser for PYQ paper PDFs. Extracts question stems, options, answer keys and explanations, and classifies subject/topic/difficulty. Handles the common answer-key layouts (numbered solutions, `S12. Ans. (c)` blocks, and column answer tables).
- `scripts/pdf_pyq_pipeline.py` — downloads the configured papers per exam and writes parsed questions to Turso (`--target turso`, default) or Supabase (`--target supabase`). Questions whose answer key cannot be located are dropped unless `--allow-unanswered` is passed.
- `scripts/import_curated_pyq_samples.py` and `scripts/import_curated_pyq_batch2.py` — hand-authored/transcribed questions, used for exams with no machine-readable paper source.
- `app/api/ncert/generate-questions` — assembles NCERT chapter tests from hand-authored questions, topping up from neighbouring chapters in the same track.
- `scripts/gk_harvester.py` — builds daily current-affairs cards extractively from official RSS feeds for admin review.

Every imported question records `source_url`, `source_label` and `source_type`. Only questions with a confirmed answer key from a non-memory-based source are marked `is_verified_pyq`, and only those feed the ML trend engine. `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` are optional and default to an embedded local SQLite database when omitted.

3. In the Supabase SQL Editor, run `supabase/schema.sql`. Run the feature scripts in `supabase/` when enabling NCERT/GK and admin features.

4. In Supabase → Authentication → URL Configuration, add:

   ```text
   http://localhost:3000/auth/callback
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npx tsc --noEmit
npm run lint
```

## Project Structure

- `app/` — Next.js routes and application views.
- `components/` — shared UI, smooth scroll, transitions, and domain components.
- `lib/` — application data, database access, and exam configuration.
- `supabase/` — schema and optional Supabase feature migrations.
- `public/` — exam logo and static assets.
- `scripts/` — data import/parsing utilities (PYQ pipeline, DB sync).
- `docker/`, `helm/`, and `k8s/` — deployment and infrastructure resources.

## Deployment & Scaling

- **Docker** — a 4-stage multi-stage `Dockerfile` (`base` → `deps` → `builder` → `runner`) produces a ~150 MB Alpine image running Next.js in `output: "standalone"` mode as a non-root user, with a native `/api/health` check. `docker-compose.yml` runs the full stack locally (Next.js, Python worker, Redis, Nginx gateway).
- **Kubernetes** (`k8s/`) — Kustomize base + `staging`/`production` overlays, HorizontalPodAutoscaler (2–25 pods), PodDisruptionBudget, pod anti-affinity across nodes, rolling deploys with zero downtime (`maxSurge: 25%`, `maxUnavailable: 0`), and CronJobs for the ML trend engine and PYQ harvester so batch work never competes with request-serving pods.
- **Helm** (`helm/preparsenal/`) — one-command install/upgrade for staging and production, with secrets templated from Helm values rather than committed to the chart.
- **Scaling strategy** — static assets are cached at the edge (`Cache-Control: public, max-age=31536000, immutable`), AI Tutor SSE streaming disables proxy buffering for real-time token delivery, hot PYQ reads are cached in Redis, and HPA scales web pods to 100% capacity boost within 15 seconds to absorb the traffic spikes that hit on exam result days.

Full deployment commands for Minikube/Kind, AWS EKS, GKE, and DigitalOcean Kubernetes are in [DEVOPS.md](DEVOPS.md).

## CI/CD

| Workflow | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Pull requests & pushes | Lint, TypeScript type-check, Next.js build. |
| `docker-build-push.yml` | Push to `main` or a Git tag | Multi-platform (`amd64`, `arm64`) Docker build via Buildx, pushed to GHCR. |
| `k8s-deploy.yml` | Image build complete | Automated Kustomize/Helm rollout to the target cluster. |

## Security

- All secrets are supplied via environment variables (`.env.local`, Kubernetes `Secret` objects, or Helm `--set`/values); no credentials are committed to this repository.
- `.env*` files (except `.env.example`) are gitignored — copy `.env.example` and never commit filled-in values.
- If you discover a security issue, please report it privately rather than opening a public issue.

## Roadmap

- **Phase 1 — Foundation & UI:** ✅ complete — sketchbook UI shell, navigation, dashboard, Practice Arena, AI Tutor view.
- **Phase 2 — AI Integration:** ✅ complete — Gemini-powered AI Tutor with markdown streaming and context-aware prompts.
- **Phase 3 — Database & State Migration:** ✅ complete — full Postgres schema, async Supabase state, Row Level Security policies.
- **Phase 4 — Data Acquisition & ML Pipeline:** ✅ complete — deterministic PDF pipeline, dataset harvester, EWMA trend engine, live Supabase-backed Practice Arena.
- **Phase 5 — Polish & Launch:** 🚧 in progress — full timed mock tests, dashboard trend visualizations, XP/accuracy analytics.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the detailed roadmap and the Turso data-pivot rationale.

## License

Private project. All rights reserved unless a `LICENSE` file states otherwise.
