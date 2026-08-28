'use client';

import type { CSSProperties, ElementType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  LineChart,
  NotebookPen,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { exams } from '@/lib/data';
import { getExamLogo } from '@/lib/exam-logos';

type Feature = {
  icon: ElementType;
  title: string;
  description: string;
  tag: string;
  tone: 'red' | 'blue' | 'yellow';
};

type SketchStyle = CSSProperties & {
  '--pin-color'?: string;
  '--tilt'?: string;
};

const features: Feature[] = [
  {
    icon: BrainCircuit,
    title: 'Trend Engine',
    description: 'Reads PYQ frequency, recency, and difficulty signals so high-value topics stop hiding in plain sight.',
    tag: 'pattern finder',
    tone: 'blue',
  },
  {
    icon: Clock3,
    title: 'Practice Arena',
    description: 'Timed drills, exam-style solving, instant review, and spaced repetition for the questions that need another round.',
    tag: 'daily reps',
    tone: 'yellow',
  },
  {
    icon: Bot,
    title: 'AI Tutor',
    description: 'Ask doubts and get step-by-step explanations with shortcuts, context, and exam-specific reasoning.',
    tag: 'doubt desk',
    tone: 'red',
  },
  {
    icon: NotebookPen,
    title: 'Smart Notes',
    description: 'Turn messy prep into compact revision notes connected to topics, formulas, and relevant PYQs.',
    tag: 'revision stack',
    tone: 'yellow',
  },
  {
    icon: CalendarDays,
    title: 'Study Planner',
    description: 'Plan across multiple exams and keep priorities visible when the syllabus starts feeling too large.',
    tag: 'next task',
    tone: 'blue',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track accuracy, attempts, weak areas, readiness, and progress without pretending vibes are data.',
    tag: 'scoreboard',
    tone: 'red',
  },
];

const stats = [
  { value: '60+', label: 'PYQ Questions', note: 'and growing' },
  { value: '9', label: 'Target Exams', note: 'SSC to RBI' },
  { value: '50+', label: 'Topics Covered', note: 'tagged for trends' },
  { value: '100%', label: 'Free & Open', note: 'built for aspirants' },
];

const steps = [
  'Pick the exams you are targeting.',
  'Practice PYQs and mock tests under time pressure.',
  'Use trends, notes, and the AI tutor to tighten weak zones.',
];

const rotations = ['-1.2deg', '1deg', '-0.6deg', '1.3deg', '-1deg', '0.8deg'];
const wobbly = '255px 18px 225px 22px / 20px 225px 24px 255px';
const wobblySoft = '32px 18px 38px 20px / 20px 34px 18px 36px';

export default function LandingPage() {
  return (
    <main className="sketch-page">
      <style>{`
        .sketch-page {
          min-height: 100vh;
          color: #2d2d2d;
          background-color: #fdfbf7;
          background-image: radial-gradient(#e5e0d8 1px, transparent 1px);
          background-size: 24px 24px;
          font-family: var(--font-patrick-hand, "Segoe Print"), "Comic Sans MS", cursive;
          overflow: hidden;
        }

        .sketch-page :global(a) {
          color: inherit;
        }

        .page-sheet {
          width: min(1120px, calc(100% - 32px));
          margin: 0 auto;
        }

        .nav {
          position: sticky;
          top: 0;
          z-index: 20;
          padding: 18px 0 10px;
          background: linear-gradient(180deg, #fdfbf7 74%, rgba(253, 251, 247, 0));
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 12px 16px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: ${wobbly};
          box-shadow: 4px 4px 0 #2d2d2d;
          transform: rotate(-0.35deg);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-kalam, "Segoe Print"), "Comic Sans MS", cursive;
          font-size: 1.55rem;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
        }

        .brand-mark {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          background: #fff9c4;
          border: 3px solid #2d2d2d;
          border-radius: 47% 53% 43% 57% / 51% 45% 55% 49%;
          box-shadow: 2px 2px 0 #2d2d2d;
        }

        .nav-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .sketch-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 48px;
          padding: 10px 20px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: ${wobbly};
          box-shadow: 4px 4px 0 #2d2d2d;
          color: #2d2d2d;
          font-size: 1.2rem;
          font-weight: 700;
          line-height: 1;
          text-decoration: none;
          transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease, color 120ms ease;
          white-space: nowrap;
        }

        .sketch-button:hover {
          background: #ff4d4d;
          color: #fff;
          box-shadow: 2px 2px 0 #2d2d2d;
          transform: translate(2px, 2px) rotate(-1deg);
        }

        .sketch-button:active {
          box-shadow: 0 0 0 #2d2d2d;
          transform: translate(4px, 4px);
        }

        .sketch-button.secondary {
          background: #e5e0d8;
        }

        .sketch-button.secondary:hover {
          background: #2d5da1;
        }

        .hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
          gap: 44px;
          align-items: center;
          min-height: calc(100vh - 88px);
          padding: 64px 0 76px;
        }

        .hero-copy {
          position: relative;
          z-index: 2;
        }

        .paper-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding: 6px 14px;
          background: #fff9c4;
          border: 2px dashed #2d2d2d;
          border-radius: ${wobblySoft};
          box-shadow: 3px 3px 0 rgba(45, 45, 45, 0.2);
          font-size: 1.05rem;
          font-weight: 700;
          transform: rotate(-1.6deg);
        }

        .hero-title {
          max-width: 680px;
          margin: 0;
          font-family: var(--font-kalam), cursive;
          font-size: clamp(3.4rem, 7vw, 6.4rem);
          font-weight: 700;
          line-height: 0.96;
          letter-spacing: 0;
        }

        .hero-title .red-ink {
          color: #ff4d4d;
          position: relative;
          display: inline-block;
        }

        .hero-title .red-ink::after {
          content: '';
          position: absolute;
          left: -4px;
          right: -8px;
          bottom: 2px;
          height: 10px;
          background: repeating-linear-gradient(90deg, #ff4d4d 0 10px, transparent 10px 15px);
          opacity: 0.22;
          transform: rotate(-1deg);
          z-index: -1;
        }

        .hero-copy-text {
          max-width: 610px;
          margin: 22px 0 28px;
          font-size: clamp(1.25rem, 2.3vw, 1.55rem);
          line-height: 1.35;
        }

        .hero-actions {
          position: relative;
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
          margin-bottom: 34px;
        }

        .scribble-arrow {
          position: absolute;
          left: 316px;
          top: -50px;
          width: 150px;
          height: 74px;
          transform: rotate(-8deg);
          pointer-events: none;
        }

        .exam-strip {
          display: flex;
          flex-wrap: wrap;
          gap: 12px 14px;
          max-width: 760px;
          margin-top: 8px;
        }

        .exam-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 7px 16px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: 4px 9px 5px 8px;
          box-shadow: 3px 3px 0 #2d2d2d;
          font-family: var(--font-kalam, "Segoe Print"), "Comic Sans MS", cursive;
          font-size: 1.18rem;
          font-weight: 700;
          text-decoration: none;
          transform: rotate(var(--tilt));
          transition: transform 120ms ease, background 120ms ease, box-shadow 120ms ease;
        }

        .exam-pill:hover {
          background: #fff9c4;
          box-shadow: 1px 1px 0 #2d2d2d;
          transform: translate(2px, 2px) rotate(0deg);
        }

        .exam-icon {
          display: grid;
          place-items: center;
          width: 22px;
          height: 22px;
          overflow: hidden;
          border-radius: 50%;
          background: var(--pin-color);
          border: 2px solid var(--pin-color);
        }

        .exam-icon img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #fff;
        }

        .exam-icon.fallback::after {
          content: '';
          width: 8px;
          height: 8px;
          border: 2px solid #fff;
          border-radius: 50%;
        }

        .hero-board {
          position: relative;
          min-height: 520px;
        }

        .sketch-card {
          position: relative;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: ${wobblySoft};
          box-shadow: 8px 8px 0 #2d2d2d;
        }

        .hero-note {
          padding: 28px;
          transform: rotate(1.2deg);
        }

        .tape {
          position: absolute;
          top: -16px;
          left: 50%;
          width: 132px;
          height: 30px;
          background: rgba(229, 224, 216, 0.78);
          border: 2px dashed rgba(45, 45, 45, 0.55);
          transform: translateX(-50%) rotate(-3deg);
        }

        .note-kicker {
          color: #2d5da1;
          font-family: var(--font-kalam), cursive;
          font-size: 1.4rem;
          font-weight: 700;
        }

        .board-title {
          margin: 8px 0 18px;
          font-family: var(--font-kalam), cursive;
          font-size: 2.35rem;
          line-height: 1.05;
        }

        .check-list {
          display: grid;
          gap: 14px;
          margin: 0;
          padding: 0;
        }

        .check-list li {
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 10px;
          align-items: start;
          font-size: 1.22rem;
          line-height: 1.2;
        }

        .mini-note {
          position: absolute;
          right: -14px;
          bottom: 48px;
          width: 210px;
          padding: 18px;
          background: #fff9c4;
          border: 3px solid #2d2d2d;
          border-radius: 26px 16px 30px 18px / 16px 28px 18px 30px;
          box-shadow: 5px 5px 0 #2d2d2d;
          transform: rotate(-4deg);
          font-size: 1.15rem;
          line-height: 1.16;
        }

        .mini-note strong {
          display: block;
          font-family: var(--font-kalam), cursive;
          font-size: 1.45rem;
          margin-bottom: 4px;
        }

        .score-card {
          position: absolute;
          left: -12px;
          bottom: 0;
          width: 235px;
          padding: 18px;
          background: #eaf2ff;
          border: 3px solid #2d2d2d;
          border-radius: 20px 34px 18px 26px / 28px 18px 30px 16px;
          box-shadow: 5px 5px 0 #2d2d2d;
          transform: rotate(3deg);
        }

        .score-value {
          font-family: var(--font-kalam), cursive;
          font-size: 2.7rem;
          font-weight: 700;
          color: #2d5da1;
          line-height: 1;
        }

        .stats-section,
        .features-section,
        .steps-section,
        .cta-section {
          padding: 58px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 22px;
        }

        .stat-note {
          min-height: 158px;
          padding: 18px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: ${wobblySoft};
          box-shadow: 5px 5px 0 #2d2d2d;
          text-align: center;
          transform: rotate(var(--tilt));
        }

        .stat-value {
          font-family: var(--font-kalam), cursive;
          font-size: clamp(2.3rem, 5vw, 3.4rem);
          font-weight: 700;
          color: #ff4d4d;
          line-height: 1;
        }

        .stat-label {
          margin-top: 8px;
          font-size: 1.2rem;
          font-weight: 700;
        }

        .stat-sub {
          font-size: 1rem;
          color: rgba(45, 45, 45, 0.72);
        }

        .section-head {
          max-width: 720px;
          margin-bottom: 34px;
        }

        .section-head.center {
          margin-inline: auto;
          text-align: center;
        }

        .section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 4px 12px;
          background: #fff9c4;
          border: 2px dashed #2d2d2d;
          border-radius: ${wobbly};
          font-size: 1rem;
          font-weight: 700;
          transform: rotate(-1.2deg);
        }

        .section-title {
          margin: 0;
          font-family: var(--font-kalam), cursive;
          font-size: clamp(2.5rem, 5vw, 4.2rem);
          line-height: 1;
        }

        .section-copy {
          margin-top: 10px;
          font-size: 1.25rem;
          line-height: 1.28;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          position: relative;
          min-height: 265px;
          padding: 26px 22px 22px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: ${wobblySoft};
          box-shadow: 6px 6px 0 #2d2d2d;
          transform: rotate(var(--tilt));
          transition: transform 120ms ease, box-shadow 120ms ease;
        }

        .feature-card:hover {
          transform: translateY(-4px) rotate(0deg);
          box-shadow: 8px 8px 0 #2d2d2d;
        }

        .feature-card.yellow {
          background: #fff9c4;
        }

        .feature-card.blue {
          background: #eaf2ff;
        }

        .feature-card.red {
          background: #fff0f0;
        }

        .pin {
          position: absolute;
          top: -11px;
          left: 50%;
          width: 22px;
          height: 22px;
          border: 3px solid #2d2d2d;
          border-radius: 50%;
          background: var(--pin-color);
          transform: translateX(-50%);
        }

        .icon-ring {
          display: grid;
          place-items: center;
          width: 56px;
          height: 56px;
          margin-bottom: 16px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: 45% 55% 49% 51% / 56% 43% 57% 44%;
        }

        .feature-tag {
          display: inline-block;
          margin-bottom: 10px;
          padding: 3px 10px;
          background: #fff;
          border: 2px dashed #2d2d2d;
          border-radius: ${wobbly};
          font-size: 0.95rem;
          font-weight: 700;
        }

        .feature-title {
          margin: 0 0 8px;
          font-family: var(--font-kalam), cursive;
          font-size: 1.72rem;
          line-height: 1.05;
        }

        .feature-copy {
          margin: 0;
          font-size: 1.12rem;
          line-height: 1.28;
        }

        .steps-wrap {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .step-card {
          position: relative;
          padding: 24px;
          background: #fff;
          border: 3px solid #2d2d2d;
          border-radius: ${wobblySoft};
          box-shadow: 5px 5px 0 #2d2d2d;
          transform: rotate(var(--tilt));
        }

        .step-number {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          margin-bottom: 14px;
          background: #ff4d4d;
          color: #fff;
          border: 3px solid #2d2d2d;
          border-radius: 50%;
          font-family: var(--font-kalam), cursive;
          font-size: 1.3rem;
          font-weight: 700;
          box-shadow: 2px 2px 0 #2d2d2d;
        }

        .step-card p {
          margin: 0;
          font-size: 1.28rem;
          line-height: 1.22;
        }

        .cta-card {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 24px;
          align-items: center;
          padding: 34px;
          background: #fff9c4;
          border: 4px solid #2d2d2d;
          border-radius: ${wobblySoft};
          box-shadow: 8px 8px 0 #2d2d2d;
          transform: rotate(-0.45deg);
        }

        .cta-card h2 {
          margin: 0;
          font-family: var(--font-kalam), cursive;
          font-size: clamp(2.2rem, 4vw, 3.8rem);
          line-height: 1;
        }

        .cta-card p {
          margin: 10px 0 0;
          max-width: 620px;
          font-size: 1.25rem;
          line-height: 1.25;
        }

        .footer {
          padding: 26px 0 42px;
          text-align: center;
          font-size: 1.08rem;
          color: rgba(45, 45, 45, 0.72);
        }

        @media (max-width: 920px) {
          .hero {
            grid-template-columns: 1fr;
            min-height: auto;
            padding-top: 44px;
          }

          .hero-board {
            min-height: 470px;
          }

          .features-grid,
          .steps-wrap {
            grid-template-columns: 1fr 1fr;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cta-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .page-sheet {
            width: min(100% - 24px, 1120px);
          }

          .nav-inner {
            align-items: flex-start;
            flex-direction: column;
          }

          .nav-actions {
            width: 100%;
          }

          .nav-actions .sketch-button {
            flex: 1;
            padding-inline: 12px;
            font-size: 1.05rem;
          }

          .hero-title {
            font-size: clamp(3rem, 17vw, 4.8rem);
          }

          .hero-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .scribble-arrow {
            display: none;
          }

          .features-grid,
          .steps-wrap,
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .hero-board {
            min-height: auto;
            padding-bottom: 150px;
          }

          .hero-note {
            padding: 24px 20px;
          }

          .mini-note {
            right: 0;
            bottom: 0;
            width: 190px;
          }

          .score-card {
            left: 0;
            bottom: 22px;
            width: 185px;
          }

          .stats-section,
          .features-section,
          .steps-section,
          .cta-section {
            padding: 42px 0;
          }
        }
      `}</style>

      <div className="page-sheet">
        <header className="nav">
          <div className="nav-inner">
            <Link href="/" className="brand" aria-label="PrepArsenal home">
              <span className="brand-mark">
                <Target size={23} strokeWidth={3} />
              </span>
              <span>PrepArsenal</span>
            </Link>

            <nav className="nav-actions" aria-label="Landing navigation">
              <Link href="/trends" className="sketch-button secondary">
                <LineChart size={19} strokeWidth={3} />
                Trends
              </Link>
              <Link href="/dashboard" className="sketch-button">
                Start Free
              </Link>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <div className="paper-tag">
              Built by an aspirant, for aspirants
            </div>

            <h1 className="hero-title">
              Stop guessing.
              <br />
              Start <span className="red-ink">predicting</span> what gets asked.
            </h1>

            <p className="hero-copy-text">
              PrepArsenal turns PYQs, topic trends, timed practice, NCERT revision, and AI doubt-solving into one sketchbook for serious exam prep.
            </p>

            <div className="hero-actions">
              <svg className="scribble-arrow" viewBox="0 0 160 86" fill="none" aria-hidden="true">
                <path d="M6 12C32 5 62 12 78 33C91 50 103 59 133 54" stroke="#2d2d2d" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 9" />
                <path d="M125 40L145 54L126 70" stroke="#2d2d2d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <Link href="/dashboard" className="sketch-button">
                <Trophy size={20} strokeWidth={3} />
                Start Preparing Free
              </Link>
              <Link href="/practice" className="sketch-button secondary">
                <Clock3 size={20} strokeWidth={3} />
                Practice PYQs
              </Link>
            </div>

            <div className="exam-strip" aria-label="Supported exams">
              {exams.map((exam, index) => (
                <Link
                  key={exam.code}
                  href={`/practice?exam=${exam.code}`}
                  className="exam-pill"
                  style={{
                    '--pin-color': exam.color,
                    '--tilt': rotations[index % rotations.length],
                  } as SketchStyle}
                  title={`${exam.fullName}: ${exam.totalQuestions} questions in ${exam.totalTime} minutes`}
                >
                  <span className={`exam-icon ${getExamLogo(exam.code) ? '' : 'fallback'}`}>
                    {getExamLogo(exam.code) && (
                      <Image src={getExamLogo(exam.code)!} alt="" width={22} height={22} />
                    )}
                  </span>
                  <span>{exam.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="hero-board" aria-label="Prep workflow preview">
            <div className="sketch-card hero-note">
              <span className="tape" />
              <div className="note-kicker">Today&apos;s prep board</div>
              <h2 className="board-title">A cleaner way to attack the syllabus</h2>
              <ul className="check-list">
                <li>
                  <CheckCircle2 color="#2d5da1" size={26} strokeWidth={3} />
                  <span>Find high-frequency topics before opening ten tabs.</span>
                </li>
                <li>
                  <CheckCircle2 color="#2d5da1" size={26} strokeWidth={3} />
                  <span>Practice under a clock, then review what actually hurt.</span>
                </li>
                <li>
                  <CheckCircle2 color="#2d5da1" size={26} strokeWidth={3} />
                  <span>Ask the tutor for explanations, shortcuts, and NCERT links.</span>
                </li>
              </ul>
            </div>

            <aside className="mini-note">
              <strong>Next revision:</strong>
              Formula vault, weak topic drill, one GK card.
            </aside>

            <aside className="score-card">
              <div className="score-value">78%</div>
              <div className="stat-label">mock accuracy target</div>
              <div className="stat-sub">track it, fix it, repeat</div>
            </aside>
          </div>
        </section>

        <section className="stats-section" aria-label="PrepArsenal stats">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="stat-note"
                style={{ '--tilt': rotations[index % rotations.length] } as SketchStyle}
              >
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-sub">{stat.note}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="features-section">
          <div className="section-head center">
            <div className="section-label">
              <FileText size={17} strokeWidth={3} />
              Not just a question bank
            </div>
            <h2 className="section-title">Everything on the desk has a job.</h2>
            <p className="section-copy">
              Practice, planning, trends, notes, and AI help sit together so your preparation feels less scattered.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className={`feature-card ${feature.tone}`}
                  style={{
                    '--tilt': rotations[index % rotations.length],
                    '--pin-color': feature.tone === 'red' ? '#ff4d4d' : feature.tone === 'blue' ? '#2d5da1' : '#f7d85b',
                  } as SketchStyle}
                >
                  <span className="pin" />
                  <span className="icon-ring">
                    <Icon size={28} strokeWidth={2.8} />
                  </span>
                  <span className="feature-tag">{feature.tag}</span>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-copy">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="steps-section">
          <div className="section-head">
            <div className="section-label">
              <Target size={17} strokeWidth={3} />
              How it works
            </div>
            <h2 className="section-title">Three marks on the page.</h2>
          </div>

          <div className="steps-wrap">
            {steps.map((step, index) => (
              <article
                key={step}
                className="step-card"
                style={{ '--tilt': rotations[(index + 2) % rotations.length] } as SketchStyle}
              >
                <span className="step-number">{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-card">
            <div>
              <h2>Ready to make your prep visible?</h2>
              <p>
                Open the dashboard, choose your target exams, and let PrepArsenal turn the chaos into a plan you can actually follow.
              </p>
            </div>
            <Link href="/dashboard" className="sketch-button">
              Go to Dashboard
            </Link>
          </div>
        </section>

        <footer className="footer">
          PrepArsenal: PYQs, trends, notes, mocks, NCERT, GK, and AI tutoring on one useful page.
        </footer>
      </div>
    </main>
  );
}
