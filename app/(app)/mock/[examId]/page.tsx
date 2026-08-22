'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getQuestions } from '@/lib/db';
import { exams } from '@/lib/data';
import type { Question } from '@/lib/data';

type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';

export default function MockTestRunnerPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const examCode = resolvedParams.examId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const tierFilter = searchParams.get('tier');
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exam, setExam] = useState<any>(null);
  
  // Test State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('All');
  
  // Results
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [subjectBreakdown, setSubjectBreakdown] = useState<Record<string, { correct: number; wrong: number; unattempted: number }>>({});

  useEffect(() => {
    const ex = exams.find(e => e.code === examCode);
    if (!ex) {
      router.push('/mock');
      return;
    }
    setExam(ex);
    setTimeLeft(ex.totalTime * 60);

    async function loadQuestions() {
      const supabase = createClient();
      
      const filters: any = { examCode: ex!.code, limit: ex!.totalQuestions || 100 };
      if (tierFilter) filters.tier = tierFilter;
      
      const fetched = await getQuestions(supabase, filters);
      
      if (fetched.length === 0) {
        alert('No questions found in database for this exam yet!');
        router.push('/mock');
        return;
      }
      
      setQuestions(fetched as Question[]);
      setVisited({ [fetched[0].id]: true });
      setLoading(false);
    }
    loadQuestions();
  }, [examCode, router, tierFilter]);

  // Timer
  useEffect(() => {
    if (loading || isSubmitted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [loading, isSubmitted, timeLeft]);

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted || !currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optIdx }));
  };

  const handleClearResponse = () => {
    if (isSubmitted || !currentQ) return;
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    if (isSubmitted || !currentQ) return;
    setMarkedForReview(prev => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
  };

  const navigateToQuestion = (idx: number) => {
    if (idx < 0 || idx >= questions.length) return;
    setCurrentIdx(idx);
    const targetQ = questions[idx];
    if (targetQ) {
      setVisited(prev => ({ ...prev, [targetQ.id]: true }));
    }
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      navigateToQuestion(currentIdx + 1);
    }
  };

  const handleMarkAndNext = () => {
    if (!currentQ) return;
    setMarkedForReview(prev => ({ ...prev, [currentQ.id]: true }));
    if (currentIdx < questions.length - 1) {
      navigateToQuestion(currentIdx + 1);
    }
  };

  const getQuestionStatus = (q: Question): QuestionStatus => {
    const isAnswered = answers[q.id] !== undefined;
    const isMarked = markedForReview[q.id] === true;
    const isVis = visited[q.id] === true;

    if (isAnswered && isMarked) return 'answered_and_marked';
    if (isMarked) return 'marked_for_review';
    if (isAnswered) return 'answered';
    if (isVis) return 'not_answered';
    return 'not_visited';
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    
    let correct = 0;
    let wrong = 0;
    const breakdown: Record<string, { correct: number; wrong: number; unattempted: number }> = {};
    
    questions.forEach(q => {
      const subj = q.subject || 'General';
      if (!breakdown[subj]) {
        breakdown[subj] = { correct: 0, wrong: 0, unattempted: 0 };
      }

      const ans = answers[q.id];
      if (ans !== undefined && ans !== null) {
        if (Number(ans) === Number(q.correctOption)) {
          correct++;
          breakdown[subj].correct++;
        } else {
          wrong++;
          breakdown[subj].wrong++;
        }
      } else {
        breakdown[subj].unattempted++;
      }
    });
    
    const totalAttempted = correct + wrong;
    const marksCorrect = exam?.marksPerCorrect || 1;
    const negMark = exam?.negativeMark || 0.25;
    const finalScore = (correct * marksCorrect) - (wrong * negMark);
    
    setScore(Number(finalScore.toFixed(2)));
    setAccuracy(totalAttempted > 0 ? Number(((correct / totalAttempted) * 100).toFixed(1)) : 0);
    setSubjectBreakdown(breakdown);
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const uniqueSubjects = ['All', ...new Set(questions.map(q => q.subject))];

  // Status counts
  const statusCounts = questions.reduce(
    (acc, q) => {
      const st = getQuestionStatus(q);
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    },
    { answered: 0, not_answered: 0, marked_for_review: 0, answered_and_marked: 0, not_visited: 0 } as Record<QuestionStatus, number>
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h2>Preparing Live TCS iON Mock Environment...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Pulling questions from Turso Edge Database...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="result-screen">
        <style jsx>{`
          .result-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-primary);
            padding: 2rem;
          }
          .result-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1.5rem;
            padding: 2.5rem;
            max-width: 780px;
            width: 100%;
            text-align: center;
          }
          .r-title {
            font-size: 2.2rem;
            font-weight: 800;
            margin-bottom: 0.35rem;
          }
          .r-subtitle { color: var(--text-secondary); margin-bottom: 2rem; }
          .r-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
          }
          .r-stat {
            background: var(--bg-input);
            padding: 1.25rem;
            border-radius: 1rem;
            border: 1px solid var(--border-subtle);
          }
          .rs-val { font-size: 1.8rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-bottom: 0.35rem; }
          .rs-label { font-size: 0.75rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; }
          
          .breakdown-table {
            width: 100%;
            border-collapse: collapse;
            margin: 2rem 0;
            font-size: 0.85rem;
            text-align: left;
          }
          .breakdown-table th, .breakdown-table td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border-subtle);
          }
          .breakdown-table th { color: var(--text-secondary); font-weight: 700; background: var(--bg-secondary); }
        `}</style>
        <div className="result-card">
          <div className="r-title">🏁 Mock Test Completed</div>
          <div className="r-subtitle">{exam.name} Full Mock Performance Report</div>
          
          <div className="r-grid">
            <div className="r-stat">
              <div className="rs-val" style={{ color: score >= 0 ? 'var(--success)' : 'var(--error)' }}>
                {score}
              </div>
              <div className="rs-label">Total Score</div>
            </div>
            <div className="r-stat">
              <div className="rs-val" style={{ color: 'var(--accent-blue)' }}>{accuracy}%</div>
              <div className="rs-label">Accuracy</div>
            </div>
            <div className="r-stat">
              <div className="rs-val">{Object.keys(answers).length}</div>
              <div className="rs-label">Attempted</div>
            </div>
            <div className="r-stat">
              <div className="rs-val">{questions.length - Object.keys(answers).length}</div>
              <div className="rs-label">Unattempted</div>
            </div>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 700, textAlign: 'left', marginBottom: '0.5rem' }}>
            📊 Section-wise Breakdown
          </h3>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Correct (+{exam.marksPerCorrect || 1})</th>
                <th>Wrong (-{exam.negativeMark || 0.25})</th>
                <th>Skipped</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(subjectBreakdown).map(([subj, stats]) => (
                <tr key={subj}>
                  <td style={{ fontWeight: 600 }}>{subj}</td>
                  <td style={{ color: 'var(--success)' }}>{stats.correct}</td>
                  <td style={{ color: 'var(--error)' }}>{stats.wrong}</td>
                  <td style={{ color: 'var(--text-tertiary)' }}>{stats.unattempted}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => router.push('/mock')}
            >
              Take Another Mock
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLastQ = currentIdx === questions.length - 1;
  const isSelected = answers[currentQ?.id] !== undefined;

  return (
    <div className="mock-runner">
      <style jsx>{`
        .mock-runner {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: var(--bg-primary);
          overflow: hidden;
        }
        
        .mr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 2rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .mr-title { font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 0.5rem; }
        .mr-timer {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.35rem;
          font-weight: 800;
          color: ${timeLeft < 300 ? 'var(--error)' : '#22c55e'};
          background: var(--bg-input);
          padding: 0.4rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-subtle);
        }

        .section-bar {
          display: flex;
          gap: 0.5rem;
          padding: 0.6rem 2rem;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid var(--border-subtle);
          overflow-x: auto;
        }
        .sec-tab {
          padding: 0.35rem 0.8rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.4rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
        }
        .sec-tab.active {
          background: var(--accent-blue);
          border-color: var(--accent-blue);
          color: white;
        }
        
        .mr-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        
        .mr-main {
          flex: 1;
          padding: 2rem 2.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .q-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          font-size: 0.85rem;
        }

        .q-text {
          font-size: 1.18rem;
          line-height: 1.65;
          font-weight: 500;
          margin-bottom: 2rem;
        }
        
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 2.5rem;
        }
        
        .opt-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.25rem;
          background: var(--bg-card);
          border: 2px solid var(--border-subtle);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 150ms;
          text-align: left;
          font-size: 0.98rem;
          color: var(--text-primary);
        }
        .opt-btn:hover { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.04); }
        .opt-btn.selected { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.1); }
        .opt-letter {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .opt-btn.selected .opt-letter { background: var(--accent-blue); color: white; }
        
        .mr-nav-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        
        /* TCS iON Palette Sidebar */
        .mr-sidebar {
          width: 340px;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .mrs-legend {
          padding: 1rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.5rem;
          font-size: 0.72rem;
        }
        .legend-item { display: flex; align-items: center; gap: 0.4rem; font-weight: 600; }
        .legend-dot { width: 14px; height: 14px; border-radius: 0.25rem; }

        .mrs-grid {
          padding: 1rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
          overflow-y: auto;
          flex: 1;
        }
        .q-nav-btn {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.4rem;
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 120ms;
        }
        .q-nav-btn:hover { transform: scale(1.05); }
        .q-nav-btn.status-answered { background: #22c55e; color: white; border-color: #22c55e; }
        .q-nav-btn.status-not_answered { background: #ef4444; color: white; border-color: #ef4444; }
        .q-nav-btn.status-marked_for_review { background: #8b5cf6; color: white; border-color: #8b5cf6; border-radius: 50%; }
        .q-nav-btn.status-answered_and_marked { background: #8b5cf6; color: white; border: 2px solid #22c55e; border-radius: 50%; }
        .q-nav-btn.status-not_visited { background: var(--bg-input); color: var(--text-tertiary); }
        .q-nav-btn.active { outline: 2px solid white; outline-offset: 1px; }

        .mrs-footer {
          padding: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        
        @media (max-width: 768px) {
          .mr-body { flex-direction: column; }
          .mr-sidebar { width: 100%; border-left: none; border-top: 1px solid var(--border-subtle); height: 260px; }
          .mr-main { padding: 1rem; }
        }
      `}</style>

      <header className="mr-header">
        <div className="mr-title">
          <span>🎯 {exam.name}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            (Full Length Mock Simulator)
          </span>
        </div>
        <div className="mr-timer">⏱ {formatTime(timeLeft)}</div>
      </header>

      {/* Subject Section Tabs */}
      <div className="section-bar">
        {uniqueSubjects.map(subj => (
          <button
            key={subj}
            className={`sec-tab ${selectedSubjectFilter === subj ? 'active' : ''}`}
            onClick={() => setSelectedSubjectFilter(subj)}
          >
            {subj}
          </button>
        ))}
      </div>

      <div className="mr-body">
        <div className="mr-main">
          {currentQ ? (
            <>
              <div className="q-meta">
                <div>
                  <span style={{ fontWeight: 800 }}>Question {currentIdx + 1}</span> of {questions.length} •{' '}
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{currentQ.subject}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>+{exam.marksPerCorrect || 1}</span> /{' '}
                  <span style={{ color: 'var(--error)', fontWeight: 700 }}>-{exam.negativeMark || 0.25}</span>
                </div>
              </div>
              
              <div className="q-text">{currentQ.questionText}</div>
              
              <div className="options-grid">
                {currentQ.options.map((opt: string, idx: number) => {
                  const isOptSelected = answers[currentQ.id] === idx;
                  return (
                    <button
                      key={idx}
                      className={`opt-btn ${isOptSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(idx)}
                    >
                      <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* TCS iON Interactive Actions */}
              <div className="mr-nav-footer">
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#c084fc', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    onClick={handleMarkAndNext}
                  >
                    🟣 Mark for Review & Next
                  </button>
                  {isSelected && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                      onClick={handleClearResponse}
                    >
                      Clear Response
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button 
                    type="button"
                    className="btn btn-sm"
                    disabled={currentIdx === 0}
                    onClick={() => navigateToQuestion(currentIdx - 1)}
                  >
                    ← Previous
                  </button>

                  <button 
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSaveAndNext}
                  >
                    {isLastQ ? 'Save & Review' : 'Save & Next →'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>No questions available.</div>
          )}
        </div>
        
        {/* TCS iON Palette Sidebar */}
        <div className="mr-sidebar">
          <div className="mrs-legend">
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#22c55e' }} />
              <span>Answered ({statusCounts.answered})</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#ef4444' }} />
              <span>Not Answered ({statusCounts.not_answered})</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: '#8b5cf6', borderRadius: '50%' }} />
              <span>Marked for Review ({statusCounts.marked_for_review})</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot" style={{ background: 'var(--bg-input)' }} />
              <span>Not Visited ({statusCounts.not_visited})</span>
            </div>
          </div>

          <div className="mrs-grid">
            {questions.map((q, i) => {
              if (selectedSubjectFilter !== 'All' && q.subject !== selectedSubjectFilter) {
                return null;
              }
              const status = getQuestionStatus(q);
              const isActive = i === currentIdx;
              return (
                <button
                  type="button"
                  key={q.id}
                  className={`q-nav-btn status-${status} ${isActive ? 'active' : ''}`}
                  onClick={() => navigateToQuestion(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mrs-footer">
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', background: 'var(--error)' }}
              onClick={() => {
                if (confirm('Are you sure you want to submit the Mock Test?')) {
                  handleSubmit();
                }
              }}
            >
              Submit Full Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
