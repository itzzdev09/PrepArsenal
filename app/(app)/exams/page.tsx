'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import { exams } from '@/lib/data';
import { getExamLogo } from '@/lib/exam-logos';
import { examDetails } from '@/lib/exam-details';

export default function ExamsCatalogPage() {
  const categories = [...new Set(exams.map(e => e.category))];

  return (
    <div className="exams-catalog">
      <style jsx>{`
        .exams-catalog {
          max-width: 1100px;
          margin: 0 auto;
          padding: 2.5rem 2rem;
        }
        .catalog-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .catalog-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          background: var(--gradient-hero);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .catalog-header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .catalog-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .catalog-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .catalog-stat strong {
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .category-section {
          margin-bottom: 3rem;
        }
        .category-label {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .exam-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 250ms ease;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }
        .exam-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--card-accent);
          opacity: 0;
          transition: opacity 250ms;
        }
        .exam-card:hover {
          border-color: var(--border-default);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }
        .exam-card:hover::before {
          opacity: 1;
        }
        .ec-top {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .ec-logo {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid var(--border-subtle);
          background: #fff;
          flex-shrink: 0;
          display: grid;
          place-items: center;
        }
        .ec-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .ec-logo.no-logo {
          background: var(--accent-blue);
        }
        .ec-logo.no-logo::after {
          content: '';
          width: 16px;
          height: 16px;
          border: 3px solid #fff;
          border-radius: 50%;
        }
        .ec-info {
          flex: 1;
          min-width: 0;
        }
        .ec-name {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .ec-fullname {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ec-category-badge {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          background: rgba(59,130,246,0.12);
          color: var(--accent-blue);
          white-space: nowrap;
        }

        .ec-meta-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .ec-meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .ec-meta-item svg {
          flex-shrink: 0;
        }

        .ec-tagline {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .difficulty-meter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .difficulty-bar-bg {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 2px;
          overflow: hidden;
        }
        .difficulty-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 600ms ease;
        }
        .difficulty-label {
          font-size: 0.72rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .ec-cta {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--accent-blue);
          margin-top: auto;
        }

        @media (max-width: 640px) {
          .exam-grid {
            grid-template-columns: 1fr;
          }
          .catalog-header h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="catalog-header">
        <h1>📚 Exam Encyclopedia</h1>
        <p>
          Comprehensive breakdown of India&apos;s top competitive exams — structure, syllabus, 
          posts, eligibility, and difficulty analysis. Everything you need before you start preparing.
        </p>
        <div className="catalog-stats">
          <div className="catalog-stat">
            <BookOpen size={18} />
            <strong>{exams.length}</strong> Exams
          </div>
          <div className="catalog-stat">
            <Users size={18} />
            <strong>{categories.length}</strong> Categories
          </div>
        </div>
      </div>

      {categories.map(cat => {
        const catExams = exams.filter(e => e.category === cat);
        return (
          <div key={cat} className="category-section">
            <div className="category-label">{cat}</div>
            <div className="exam-grid">
              {catExams.map(exam => {
                const detail = examDetails[exam.code];
                const logo = getExamLogo(exam.code);
                const diffScore = detail?.difficultyScore || 50;
                const diffColor = diffScore >= 80 ? '#ef4444' : diffScore >= 60 ? '#f59e0b' : '#22c55e';

                return (
                  <Link
                    key={exam.code}
                    href={`/exams/${exam.code}`}
                    className="exam-card"
                    style={{ '--card-accent': exam.color } as React.CSSProperties}
                  >
                    <div className="ec-top">
                      <div className={`ec-logo ${logo ? '' : 'no-logo'}`}>
                        {logo && <Image src={logo} alt="" width={52} height={52} />}
                      </div>
                      <div className="ec-info">
                        <div className="ec-name">{exam.name}</div>
                        <div className="ec-fullname">{exam.fullName}</div>
                      </div>
                      <span className="ec-category-badge">{exam.category}</span>
                    </div>

                    {detail && (
                      <div className="ec-tagline">{detail.tagline}</div>
                    )}

                    <div className="ec-meta-row">
                      <div className="ec-meta-item">
                        <BookOpen size={14} />
                        {exam.totalQuestions} Qs
                      </div>
                      <div className="ec-meta-item">
                        <Clock size={14} />
                        {exam.totalTime} min
                      </div>
                      <div className="ec-meta-item">
                        <TrendingUp size={14} />
                        {exam.marksPerCorrect > 0 ? `+${exam.marksPerCorrect}` : ''} / -{exam.negativeMark}
                      </div>
                    </div>

                    {detail && (
                      <div className="difficulty-meter">
                        <div className="difficulty-bar-bg">
                          <div
                            className="difficulty-bar-fill"
                            style={{ width: `${diffScore}%`, background: diffColor }}
                          />
                        </div>
                        <span className="difficulty-label" style={{ color: diffColor }}>
                          {detail.difficultyLevel}
                        </span>
                      </div>
                    )}

                    <div className="ec-cta">
                      View full breakdown →
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
