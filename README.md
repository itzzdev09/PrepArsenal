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
- [Features](#features)
- [Interface System](#interface-system)
- [Tech Stack](#tech-stack)
- [Local Setup](#local-setup)
- [Verification](#verification)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Security](#security)
- [License](#license)

## Overview

PrepArsenal centralizes everything a candidate needs to prepare for major Indian government and banking competitive exams — question practice, mock tests, analytics, and AI-assisted doubt solving — in one cohesive app, instead of juggling PDFs, spreadsheets, and multiple tools.

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

   `GEMINI_API_KEY` and `GROQ_API_KEY` are optional unless the AI Tutor is being used. `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` are optional and default to an embedded local SQLite database when omitted.

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

## Deployment

Production images build via the included `Dockerfile`, with Helm charts (`helm/`) and Kubernetes manifests (`k8s/`) for cluster deployment. See `DEVOPS.md` and `ARCHITECTURE.md` for details.

## Security

- All secrets are supplied via environment variables (`.env.local`, Kubernetes `Secret` objects, or Helm `--set`/values); no credentials are committed to this repository.
- `.env*` files (except `.env.example`) are gitignored — copy `.env.example` and never commit filled-in values.
- If you discover a security issue, please report it privately rather than opening a public issue.

## License

Private project. All rights reserved unless a `LICENSE` file states otherwise.
