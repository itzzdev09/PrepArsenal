# PrepArsenal

PrepArsenal is an exam-preparation workspace for Indian competitive exams. It brings PYQ practice, adaptive tests, mock tests, study planning, trend analysis, notes, formula revision, NCERT sprints, GK revision, and an AI tutor into one application.

## Highlights

- Practice arena with standard and adaptive IRT test modes.
- Mock tests for SSC CGL, ACIO-II, RRB NTPC, RBI Grade B, NABARD Grade A, SEBI Grade A, LIC AAO, UPSC APFC, and IRDAI Assistant.
- Trend Explorer for prediction scores, frequency, and difficulty signals.
- Study Planner, Smart Notes, Formula Vault, NCERT Sprint, GK Booster, Analytics, and Profile management.
- AI Tutor with prompt categories, citations, response caching, and a dedicated scrollable conversation view.
- Supabase for authentication and user state, with Turso/libSQL support for read-heavy question data.

## Interface System

The app uses a cohesive sketchbook-inspired learning interface:

- Paper-toned surfaces, hand-drawn borders, hard-offset depth, and responsive 3D press states.
- A shared application navbar and fixed, independently scrollable sidebar.
- Uploaded exam logo assets replace decorative exam emojis wherever a logo is available.
- Lucide icons replace generic UI emojis across the application.
- Lenis provides a restrained smooth-scroll glide, and Framer Motion provides page-entry transitions without breaking fixed layout elements.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and supply your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

`GEMINI_API_KEY` and `GROQ_API_KEY` are optional unless the AI Tutor is being used.

3. In Supabase SQL Editor, run `supabase/schema.sql`. Run the feature scripts in `supabase/` when enabling NCERT/GK and admin features.

4. In Supabase Authentication URL Configuration, add:

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
```

## Main Directories

- `app/` - Next.js routes and application views.
- `components/` - shared UI, smooth scroll, transitions, and domain components.
- `lib/` - application data, database access, and exam configuration.
- `supabase/` - schema and optional Supabase feature migrations.
- `public/` - exam logo and static assets.
- `docker/`, `helm/`, and `k8s/` - deployment and infrastructure resources.
