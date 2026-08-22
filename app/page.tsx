'use client';

import { useState } from 'react';
import { exams } from '@/lib/data';
import Link from 'next/link';

export default function LandingPage() {
  const [hoveredExam, setHoveredExam] = useState<string | null>(null);

  const features = [
    {
      icon: '🧠',
      title: 'Trend Engine',
      description: 'ML-powered analysis of 10+ years of PYQs. See exactly which topics get asked, how often, and predict what\'s coming next.',
      color: '#3b82f6',
      tag: 'AI-POWERED'
    },
    {
      icon: '⏱️',
      title: 'Practice Arena',
      description: 'Timed question solving with exam-simulation mode. Full PYQ papers, topic-wise drills, and spaced repetition for revision.',
      color: '#10b981',
      tag: 'SMART PRACTICE'
    },
    {
      icon: '📝',
      title: 'Smart Notes',
      description: 'AI-generated topic summaries with embedded quizzes. Every note links to relevant PYQs so you know what gets asked.',
      color: '#f59e0b',
      tag: 'COMING SOON'
    },
    {
      icon: '📅',
      title: 'Study Planner',
      description: 'Multi-exam timeline with intelligent prioritization. Adaptive scheduling that adjusts when life happens.',
      color: '#8b5cf6',
      tag: 'COMING SOON'
    },
    {
      icon: '🤖',
      title: 'AI Doubt Solver',
      description: 'Stuck on a question? Ask the AI tutor for step-by-step explanations, shortcuts, and exam-specific tricks.',
      color: '#06b6d4',
      tag: 'FREE LLM'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Exam readiness scores, topic mastery maps, time management insights, and progress trajectories.',
      color: '#ec4899',
      tag: 'DATA-DRIVEN'
    },
  ];

  const stats = [
    { value: '60+', label: 'PYQ Questions', sub: 'growing daily' },
    { value: '9', label: 'Target Exams', sub: 'SSC to RBI' },
    { value: '50+', label: 'Topics Covered', sub: 'with trend data' },
    { value: '100%', label: 'Free & Open', sub: 'always' },
  ];

  return (
    <div className="landing-page">
      <style jsx>{`
        .landing-page {
          min-height: 100vh;
          position: relative;
        }

        /* Nav */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(6, 10, 20, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }

        .nav-logo {
          font-size: 1.5rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-logo-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          gap: 0.5rem;
        }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 30% 40%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 40%),
                      radial-gradient(circle at 50% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 40%);
          animation: gradient-shift 15s ease-in-out infinite;
          background-size: 100% 100%;
          pointer-events: none;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #3b82f6;
          margin-bottom: 2rem;
          animation: fadeInDown 600ms ease forwards;
          letter-spacing: 0.05em;
        }

        .hero-badge .pulse-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .hero-title {
          font-size: clamp(2.5rem, 6vw, 4.5rem);
          font-weight: 900;
          text-align: center;
          line-height: 1.1;
          max-width: 900px;
          margin-bottom: 1.5rem;
          animation: fadeInUp 600ms ease forwards;
          animation-delay: 100ms;
          opacity: 0;
        }

        .hero-title .gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 40%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: #94a3c0;
          text-align: center;
          max-width: 650px;
          line-height: 1.7;
          margin-bottom: 2.5rem;
          animation: fadeInUp 600ms ease forwards;
          animation-delay: 200ms;
          opacity: 0;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 4rem;
          animation: fadeInUp 600ms ease forwards;
          animation-delay: 300ms;
          opacity: 0;
        }

        .hero-actions .btn-primary {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          border-radius: 1rem;
        }

        .hero-actions .btn-secondary {
          padding: 1rem 2rem;
          font-size: 1rem;
        }

        /* Exam Pills */
        .exam-pills {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          max-width: 800px;
          animation: fadeInUp 600ms ease forwards;
          animation-delay: 400ms;
          opacity: 0;
        }

        .exam-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          background: rgba(15, 22, 41, 0.7);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #94a3c0;
          transition: all 250ms ease;
          cursor: default;
        }

        .exam-pill:hover {
          border-color: var(--pill-color, rgba(59, 130, 246, 0.5));
          color: #f0f4ff;
          background: rgba(59, 130, 246, 0.08);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .exam-pill .pill-icon {
          font-size: 1.1rem;
        }

        /* Stats Section */
        .stats-section {
          padding: 4rem 2rem;
          background: rgba(10, 14, 26, 0.8);
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          border-bottom: 1px solid rgba(59, 130, 246, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .stat-item {
          text-align: center;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #f0f4ff;
          margin-top: 0.25rem;
        }

        .stat-sub {
          font-size: 0.75rem;
          color: #5a6a8a;
          margin-top: 0.25rem;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-tag {
          font-size: 0.8rem;
          font-weight: 700;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          color: #94a3c0;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .feature-card {
          padding: 2rem;
          background: rgba(15, 22, 41, 0.5);
          border: 1px solid rgba(59, 130, 246, 0.1);
          border-radius: 1rem;
          transition: all 300ms ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--feature-color, #3b82f6);
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(59, 130, 246, 0.25);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .feature-card:hover::before {
          opacity: 1;
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-tag {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          background: rgba(59, 130, 246, 0.12);
          border-radius: 4px;
          color: #3b82f6;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
        }

        .feature-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .feature-description {
          font-size: 0.9rem;
          color: #94a3c0;
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 2rem;
          text-align: center;
          position: relative;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-card {
          max-width: 700px;
          margin: 0 auto;
          padding: 4rem 3rem;
          background: rgba(15, 22, 41, 0.6);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 1.5rem;
          position: relative;
        }

        .cta-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .cta-subtitle {
          color: #94a3c0;
          font-size: 1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        /* Footer */
        .landing-footer {
          padding: 2rem;
          text-align: center;
          border-top: 1px solid rgba(59, 130, 246, 0.1);
          color: #5a6a8a;
          font-size: 0.85rem;
        }

        .landing-footer span {
          color: #f43f5e;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }
          .landing-nav {
            padding: 0.75rem 1rem;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span>⚔️</span>
          <span className="nav-logo-text">PrepArsenal</span>
        </div>
        <div className="nav-links">
          <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Dashboard
          </Link>
          <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-badge">
          <span className="pulse-dot"></span>
          BUILT BY AN ASPIRANT, FOR ASPIRANTS
        </div>

        <h1 className="hero-title">
          Stop Guessing.<br />
          Start <span className="gradient">Predicting</span> What{' '}
          <span className="gradient">Gets Asked.</span>
        </h1>

        <p className="hero-subtitle">
          AI-powered exam prep that analyzes 10+ years of PYQs to find patterns,
          predict trends, and create the most efficient study plan for your target exams.
          Practice smarter, not harder.
        </p>

        <div className="hero-actions">
          <Link href="/dashboard" className="btn btn-primary">
            Start Preparing Free →
          </Link>
          <Link href="/trends" className="btn btn-secondary">
            Explore Trends
          </Link>
        </div>

        <div className="exam-pills">
          {exams.map(exam => (
            <div
              key={exam.code}
              className="exam-pill"
              style={{ '--pill-color': exam.color } as React.CSSProperties}
              onMouseEnter={() => setHoveredExam(exam.code)}
              onMouseLeave={() => setHoveredExam(null)}
            >
              <span className="pill-icon">{exam.icon}</span>
              <span>{exam.name}</span>
              {hoveredExam === exam.code && (
                <span style={{ fontSize: '0.7rem', color: '#5a6a8a' }}>
                  {exam.totalQuestions}Q / {exam.totalTime}min
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="section-header">
          <p className="section-tag">⚡ Features</p>
          <h2 className="section-title">Not Just a Question Bank</h2>
          <p className="section-subtitle">
            A planner, helper, finder, and predictor — everything you need
            to crack multiple exams simultaneously.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ '--feature-color': feature.color } as React.CSSProperties}
            >
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-tag" style={{ color: feature.color, background: `${feature.color}20` }}>
                {feature.tag}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Ready to <span className="text-gradient">Crack the Exam?</span>
          </h2>
          <p className="cta-subtitle">
            Join thousands of aspirants who are using data-driven preparation
            to maximize their chances. Completely free, no hidden charges.
          </p>
          <Link href="/dashboard" className="btn btn-primary btn-lg">
            Start Your Prep Journey →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>
          PrepArsenal — Made with <span>❤️</span> for every government exam aspirant.
          <br />
          Open source. Free forever. Your success is our success.
        </p>
      </footer>
    </div>
  );
}
