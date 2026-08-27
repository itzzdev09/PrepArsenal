'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Lightbulb,
  Shield,
  Target,
  TrendingUp,
  Users,
  Zap,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { exams } from '@/lib/data';
import { getExamLogo } from '@/lib/exam-logos';
import { examDetails, getExamDetail } from '@/lib/exam-details';
import type { ExamSyllabusSection } from '@/lib/exam-details';

export default function ExamDetailPage({ params }: { params: Promise<{ examCode: string }> }) {
  const resolvedParams = use(params);
  const examCode = resolvedParams.examCode;
  const router = useRouter();

  const exam = exams.find(e => e.code === examCode);
  const detail = getExamDetail(examCode);
  const logo = getExamLogo(examCode);

  const [expandedSyllabus, setExpandedSyllabus] = useState<Record<number, boolean>>({});

  if (!exam) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Exam not found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            The exam code &quot;{examCode}&quot; doesn&apos;t exist.
          </p>
          <Link href="/exams" className="btn btn-primary">← Back to Exams</Link>
        </div>
      </div>
    );
  }

  const toggleSyllabus = (idx: number) => {
    setExpandedSyllabus(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const diffScore = detail?.difficultyScore || 50;
  const diffColor = diffScore >= 80 ? '#ef4444' : diffScore >= 60 ? '#f59e0b' : '#22c55e';

  return (
    <div className="exam-detail-page">
      <style jsx>{`
        .exam-detail-page {
          max-width: 960px;
          margin: 0 auto;
          padding: 2rem;
        }

        /* Back nav */
        .back-nav {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-tertiary);
          margin-bottom: 2rem;
          cursor: pointer;
          transition: color 150ms;
          text-decoration: none;
        }
        .back-nav:hover { color: var(--accent-blue); }

        /* Hero */
        .hero {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
          margin-bottom: 2rem;
        }
        .hero-logo {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--border-subtle);
          background: #fff;
          flex-shrink: 0;
          display: grid;
          place-items: center;
        }
        .hero-logo img { width: 100%; height: 100%; object-fit: cover; }
        .hero-logo.no-logo { background: var(--accent-blue); }
        .hero-logo.no-logo::after { content: ''; width: 22px; height: 22px; border: 3px solid #fff; border-radius: 50%; }
        .hero-text h1 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }
        .hero-fullname {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 0.6rem;
        }
        .hero-tagline {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .hero-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.75rem;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          background: rgba(59,130,246,0.1);
          color: var(--accent-blue);
        }

        /* Quick Stats */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-align: center;
        }
        .stat-val {
          font-size: 1.3rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 0.3rem;
        }
        .stat-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* Sections */
        .section {
          margin-bottom: 2.5rem;
        }
        .pyq-intel-card {
          background: linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.06) 100%);
          border: 1px solid rgba(59,130,246,0.25);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
        }
        .pyq-intel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .pyq-intel-title {
          font-size: 1.15rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
        }
        .pyq-badge-verified {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: rgba(34,197,94,0.15);
          border: 1px solid rgba(34,197,94,0.3);
          color: #22c55e;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.75rem;
          border-radius: 9999px;
        }
        .pyq-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        .pyq-metric-box {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1rem;
        }
        .pyq-metric-val {
          font-size: 1.4rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          color: var(--accent-blue);
          margin-bottom: 0.25rem;
        }
        .pyq-metric-sub {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          font-weight: 600;
        }
        .pyq-provenance-info {
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
          padding: 0.75rem 1rem;
          background: rgba(0,0,0,0.15);
          border-radius: 0.5rem;
          border-left: 3px solid var(--accent-blue);
        }
        .pyq-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .section-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Exam Structure table */
        .stages-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .stages-table th,
        .stages-table td {
          padding: 0.85rem 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.88rem;
        }
        .stages-table th {
          background: var(--bg-secondary);
          font-weight: 700;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-secondary);
        }
        .stages-table tr:last-child td { border-bottom: none; }
        .stage-name {
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stage-type-badge {
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          background: rgba(139,92,246,0.15);
          color: #a78bfa;
        }
        .stage-sections {
          margin-top: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-tertiary);
          line-height: 1.5;
        }

        /* Syllabus */
        .syllabus-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .syllabus-item {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          overflow: hidden;
          transition: border-color 200ms;
        }
        .syllabus-item:hover {
          border-color: var(--border-default);
        }
        .syllabus-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          cursor: pointer;
          user-select: none;
        }
        .syllabus-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          font-size: 0.95rem;
        }
        .syllabus-weightage {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--accent-blue);
          background: rgba(59,130,246,0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .syllabus-body {
          padding: 0 1.25rem 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .topic-list {
          list-style: none;
          padding: 0;
          margin: 0.75rem 0 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .topic-list li {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          padding-left: 1.25rem;
          position: relative;
        }
        .topic-list li::before {
          content: '▸';
          position: absolute;
          left: 0;
          color: var(--accent-blue);
          font-weight: 700;
        }

        /* Difficulty */
        .difficulty-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .difficulty-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .difficulty-score {
          font-size: 2rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
        }
        .difficulty-bar-large {
          flex: 1;
          height: 8px;
          background: rgba(255,255,255,0.06);
          border-radius: 4px;
          overflow: hidden;
        }
        .difficulty-fill-large {
          height: 100%;
          border-radius: 4px;
          transition: width 800ms ease;
        }
        .difficulty-analysis {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.65;
        }

        /* Posts */
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 0.75rem;
        }
        .post-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
        }
        .post-title {
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 0.35rem;
        }
        .post-meta {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .post-pay {
          color: var(--success);
          font-weight: 700;
        }

        /* Eligibility */
        .eligibility-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }
        .elig-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1.25rem;
        }
        .elig-label {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 0.4rem;
        }
        .elig-value {
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.5;
        }

        /* Key Stats */
        .key-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .key-stat {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1.25rem;
          text-align: center;
        }
        .ks-val {
          font-size: 1.1rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 0.3rem;
          color: var(--accent-blue);
        }
        .ks-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        /* Tips */
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .tip-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        .tip-icon {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.15);
          display: grid;
          place-items: center;
          font-size: 0.7rem;
        }

        /* CTA */
        .cta-section {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          padding: 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          justify-content: center;
        }

        @media (max-width: 640px) {
          .hero { flex-direction: column; align-items: center; text-align: center; }
          .hero-badges { justify-content: center; }
          .exam-detail-page { padding: 1.5rem 1rem; }
          .hero-text h1 { font-size: 1.5rem; }
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .posts-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <Link href="/exams" className="back-nav">
        <ArrowLeft size={16} /> Back to All Exams
      </Link>

      {/* Hero */}
      <div className="hero">
        <div className={`hero-logo ${logo ? '' : 'no-logo'}`}>
          {logo && <Image src={logo} alt="" width={72} height={72} />}
        </div>
        <div className="hero-text">
          <h1>{exam.name}</h1>
          <div className="hero-fullname">{exam.fullName}</div>
          {detail && <div className="hero-tagline">{detail.tagline}</div>}
          <div className="hero-badges">
            <span className="hero-badge">{exam.category}</span>
            {detail && (
              <>
                <span className="hero-badge">
                  <Calendar size={12} /> {detail.frequency}
                </span>
                <span className="hero-badge">
                  <Shield size={12} /> {detail.conductedBy}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-val">{exam.totalQuestions}</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{exam.totalTime} min</div>
          <div className="stat-label">Duration</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--success)' }}>+{exam.marksPerCorrect}</div>
          <div className="stat-label">Per Correct</div>
        </div>
        <div className="stat-card">
          <div className="stat-val" style={{ color: 'var(--error)' }}>-{exam.negativeMark}</div>
          <div className="stat-label">Neg. Marking</div>
        </div>
        <div className="stat-card">
          <div className="stat-val">{exam.subjects.length}</div>
          <div className="stat-label">Subjects</div>
        </div>
      </div>

      {/* PYQ Shift & Question Pool Intelligence */}
      {detail?.pyqMetrics && (
        <div className="pyq-intel-card">
          <div className="pyq-intel-header">
            <div className="pyq-intel-title">
              <Database size={20} color="var(--accent-blue)" />
              Verified Question Bank & Shift Intelligence
            </div>
            <div className="pyq-badge-verified">
              <CheckCircle2 size={14} />
              {detail.pyqMetrics.verifiedPercentage}% Real PYQs • Zero AI Drift
            </div>
          </div>

          <div className="pyq-metrics-grid">
            <div className="pyq-metric-box">
              <div className="pyq-metric-val">{detail.pyqMetrics.totalQuestions.toLocaleString()}</div>
              <div className="pyq-metric-sub">Questions In Vault</div>
            </div>
            <div className="pyq-metric-box">
              <div className="pyq-metric-val" style={{ color: '#8b5cf6' }}>{detail.pyqMetrics.totalShifts}</div>
              <div className="pyq-metric-sub">Shifts / Annual Papers</div>
            </div>
            <div className="pyq-metric-box">
              <div className="pyq-metric-val" style={{ color: '#10b981' }}>{detail.pyqMetrics.coverageYears}</div>
              <div className="pyq-metric-sub">Exam Cycles Covered</div>
            </div>
          </div>

          <div className="pyq-provenance-info">
            <strong>Data Provenance:</strong> {detail.pyqMetrics.provenance}. All question stems, multi-tier options, answer keys, and worked solutions are mapped directly into PrepArsenal’s practice engine.
          </div>

          <div className="pyq-actions">
            <Link href={`/practice?exam=${exam.code}`} className="btn btn-primary btn-sm">
              <Target size={14} style={{ verticalAlign: '-1px', marginRight: '0.35rem' }} />
              Practice {detail.pyqMetrics.totalQuestions.toLocaleString()} {exam.name} Questions
            </Link>
            <Link href={`/mock?exam=${exam.code}`} className="btn btn-secondary btn-sm">
              <Layers size={14} style={{ verticalAlign: '-1px', marginRight: '0.35rem' }} />
              Attempt Shift-wise Mock Test
            </Link>
          </div>
        </div>
      )}

      {/* Exam Structure */}
      {detail && detail.stages.length > 0 && (
        <div className="section">
          <div className="section-title"><Zap size={20} /> Exam Structure</div>
          <table className="stages-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Type</th>
                <th>Marks</th>
                <th>Duration</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {detail.stages.map((stage, i) => (
                <tr key={i}>
                  <td>
                    <div className="stage-name">
                      {stage.name}
                    </div>
                    {stage.sections && (
                      <div className="stage-sections">
                        {stage.sections.map((s, j) => (
                          <div key={j}>{s.name}: {s.questions}Q / {s.marks}M</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td><span className="stage-type-badge">{stage.type}</span></td>
                  <td style={{ fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{stage.totalMarks}</td>
                  <td>{stage.duration} min</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '250px' }}>
                    {stage.description.substring(0, 120)}{stage.description.length > 120 ? '...' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Difficulty Analysis */}
      {detail && (
        <div className="section">
          <div className="section-title"><TrendingUp size={20} /> Difficulty Analysis</div>
          <div className="difficulty-card">
            <div className="difficulty-header">
              <div className="difficulty-score" style={{ color: diffColor }}>{diffScore}/100</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.3rem', color: diffColor }}>
                  {detail.difficultyLevel}
                </div>
                <div className="difficulty-bar-large">
                  <div className="difficulty-fill-large" style={{ width: `${diffScore}%`, background: diffColor }} />
                </div>
              </div>
            </div>
            <div className="difficulty-analysis">{detail.difficultyAnalysis}</div>
          </div>
        </div>
      )}

      {/* Syllabus */}
      {detail && detail.syllabus.length > 0 && (
        <div className="section">
          <div className="section-title"><BookOpen size={20} /> Detailed Syllabus</div>
          <div className="syllabus-list">
            {detail.syllabus.map((section: ExamSyllabusSection, i: number) => (
              <div key={i} className="syllabus-item">
                <div className="syllabus-header" onClick={() => toggleSyllabus(i)}>
                  <div className="syllabus-header-left">
                    {expandedSyllabus[i] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    {section.subject}
                  </div>
                  {section.weightage && (
                    <span className="syllabus-weightage">{section.weightage}</span>
                  )}
                </div>
                {expandedSyllabus[i] && (
                  <div className="syllabus-body">
                    <ul className="topic-list">
                      {section.topics.map((topic: string, j: number) => (
                        <li key={j}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts Available */}
      {detail && detail.posts.length > 0 && (
        <div className="section">
          <div className="section-title"><Briefcase size={20} /> Posts Available</div>
          <div className="posts-grid">
            {detail.posts.map((post, i) => (
              <div key={i} className="post-card">
                <div className="post-title">{post.title}</div>
                <div className="post-meta">
                  <span className="post-pay">{post.payScale}</span>
                  {post.grade && <span>Grade: {post.grade}</span>}
                  {post.department && <span>{post.department}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Eligibility */}
      {detail && (
        <div className="section">
          <div className="section-title"><GraduationCap size={20} /> Eligibility Criteria</div>
          <div className="eligibility-grid">
            <div className="elig-card">
              <div className="elig-label">Education</div>
              <div className="elig-value">{detail.eligibility.education}</div>
            </div>
            <div className="elig-card">
              <div className="elig-label">Age Limit</div>
              <div className="elig-value">{detail.eligibility.ageLimit}</div>
            </div>
            {detail.eligibility.attempts && (
              <div className="elig-card">
                <div className="elig-label">Attempts</div>
                <div className="elig-value">{detail.eligibility.attempts}</div>
              </div>
            )}
            {detail.eligibility.relaxation && (
              <div className="elig-card">
                <div className="elig-label">Age Relaxation</div>
                <div className="elig-value">{detail.eligibility.relaxation}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Stats */}
      {detail && detail.keyStats && (
        <div className="section">
          <div className="section-title"><Users size={20} /> Competition Stats</div>
          <div className="key-stats-grid">
            {detail.keyStats.avgVacancies && (
              <div className="key-stat">
                <div className="ks-val">{detail.keyStats.avgVacancies}</div>
                <div className="ks-label">Avg Vacancies</div>
              </div>
            )}
            {detail.keyStats.avgApplicants && (
              <div className="key-stat">
                <div className="ks-val">{detail.keyStats.avgApplicants}</div>
                <div className="ks-label">Avg Applicants</div>
              </div>
            )}
            {detail.keyStats.selectionRatio && (
              <div className="key-stat">
                <div className="ks-val">{detail.keyStats.selectionRatio}</div>
                <div className="ks-label">Selection Ratio</div>
              </div>
            )}
            {detail.keyStats.lastCutoff && (
              <div className="key-stat">
                <div className="ks-val" style={{ fontSize: '0.85rem' }}>{detail.keyStats.lastCutoff}</div>
                <div className="ks-label">Cutoff (Approx)</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preparation Tips */}
      {detail && detail.tips.length > 0 && (
        <div className="section">
          <div className="section-title"><Lightbulb size={20} /> Preparation Tips</div>
          <div className="tips-list">
            {detail.tips.map((tip, i) => (
              <div key={i} className="tip-item">
                <div className="tip-icon">💡</div>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="section">
        <div className="cta-section">
          <Link href={`/practice`} className="btn btn-primary">
            <Target size={16} style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />
            Practice {exam.name} Questions
          </Link>
          <Link href={`/mock`} className="btn btn-secondary">
            <Clock size={16} style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />
            Take Mock Test
          </Link>
          <Link href={`/trends`} className="btn btn-secondary">
            <TrendingUp size={16} style={{ verticalAlign: '-2px', marginRight: '0.4rem' }} />
            View PYQ Trends
          </Link>
        </div>
      </div>
    </div>
  );
}
