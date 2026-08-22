'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question } from '@/lib/data';
import { savePracticeSession, updateStreak, getExams, getTopics, getQuestions } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

type Phase = 'select' | 'solving' | 'review';

export default function PracticePage() {
  // Selection state
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questionCount, setQuestionCount] = useState(10);
  
  // Auth state
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  // Quiz state
  const [phase, setPhase] = useState<Phase>('select');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // DB Data
  const [dbExams, setDbExams] = useState<any[]>([]);
  const [dbTopics, setDbTopics] = useState<any[]>([]);
  const [dbQuestions, setDbQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
    
    // Fetch real data from Supabase
    async function fetchPrepData() {
      const [exms, tops, qs] = await Promise.all([
        getExams(supabase),
        getTopics(supabase),
        getQuestions(supabase)
      ]);
      setDbExams(exms);
      setDbTopics(tops);
      setDbQuestions(qs as any[]);
      setIsLoading(false);
    }
    fetchPrepData();
  }, [supabase]);

  // Timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    let filtered = [...dbQuestions];

    if (selectedExams.length > 0) {
      filtered = filtered.filter(q => selectedExams.includes(q.examCode));
    }
    if (selectedSubject) {
      filtered = filtered.filter(q => q.subject === selectedSubject);
    }
    if (selectedTopic) {
      filtered = filtered.filter(q => q.topic === selectedTopic);
    }

    // Shuffle
    filtered.sort(() => Math.random() - 0.5);
    filtered = filtered.slice(0, questionCount);

    if (filtered.length === 0) {
      alert('No questions found for this selection. Try different filters.');
      return;
    }

    setActiveQuestions(filtered);
    setCurrentIdx(0);
    setAnswers({});
    setShowExplanation(false);
    setTimer(0);
    setIsTimerRunning(true);
    setPhase('solving');
  };

  const selectAnswer = (optionIdx: number) => {
    if (showExplanation) return; // Already answered
    const q = activeQuestions[currentIdx];
    setAnswers(prev => ({ ...prev, [q.id]: optionIdx }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const score = activeQuestions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctOption ? 1 : 0);
    }, 0);

    setPhase('review'); // Optimistic UI update

    if (userId) {
      const correctOptions = activeQuestions.reduce((acc, q) => {
        acc[q.id] = q.correctOption;
        return acc;
      }, {} as Record<string, number>);

      await savePracticeSession(supabase, userId, {
        questionIds: activeQuestions.map(q => q.id),
        answers,
        correctOptions,
        timeTaken: timer,
      });

      await updateStreak(supabase, userId);
    }
  };

  const resetQuiz = () => {
    setPhase('select');
    setActiveQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
    setShowExplanation(false);
    setTimer(0);
    setIsTimerRunning(false);
  };

  // Get available subjects/topics based on selection
  const availableSubjects = selectedExams.length > 0
    ? [...new Set(dbQuestions.filter(q => selectedExams.includes(q.examCode)).map(q => q.subject))]
    : [...new Set(dbQuestions.map(q => q.subject))];

  const availableTopics = selectedSubject
    ? [...new Set(dbQuestions
        .filter(q => (selectedExams.length > 0 ? selectedExams.includes(q.examCode) : true) && q.subject === selectedSubject)
        .map(q => q.topic))]
    : [];

  // ===== LOADING PHASE =====
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Real Questions...</h2>
        </div>
      </div>
    );
  }

  // ===== SELECTION PHASE =====
  if (phase === 'select') {
    return (
      <div>
        <style jsx>{`
          .select-header {
            padding: 2rem 2rem 1.5rem;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-subtle);
          }
          .select-body { padding: 2rem; max-width: 800px; }
          .filter-section { margin-bottom: 2rem; }
          .filter-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
            display: block;
          }
          .filter-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
          }
          .filter-chip {
            padding: 0.5rem 1rem;
            background: var(--bg-input);
            border: 2px solid var(--border-subtle);
            border-radius: 0.75rem;
            font-size: 0.85rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 200ms;
            color: var(--text-secondary);
          }
          .filter-chip:hover {
            border-color: var(--border-default);
            color: var(--text-primary);
          }
          .filter-chip.active {
            border-color: var(--accent-blue);
            background: rgba(59,130,246,0.1);
            color: var(--accent-blue);
          }
          .count-selector {
            display: flex;
            gap: 0.5rem;
            align-items: center;
          }
          .count-btn {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-input);
            border: 1px solid var(--border-subtle);
            border-radius: 0.5rem;
            font-size: 1.1rem;
            color: var(--text-primary);
            cursor: pointer;
            transition: all 150ms;
          }
          .count-btn:hover { border-color: var(--accent-blue); }
          .count-display {
            font-size: 1.5rem;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            min-width: 50px;
            text-align: center;
          }
          .start-section {
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-subtle);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .summary-text { font-size: 0.85rem; color: var(--text-secondary); }
          .summary-text strong { color: var(--text-primary); }
        `}</style>

        <div className="select-header">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>⏱️ Practice Arena</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Choose your exam, subject, and topic — then solve with a timer.
          </p>
        </div>

        <div className="select-body">
          <div className="filter-section">
            <label className="filter-label">Select Exam (optional — leave empty for mixed)</label>
            <div className="filter-grid">
              {dbExams.map(exam => (
                <button
                  key={exam.code || exam.id}
                  className={`filter-chip ${selectedExams.includes(exam.code) ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedExams(prev => 
                      prev.includes(exam.code) 
                        ? prev.filter(c => c !== exam.code)
                        : [...prev, exam.code]
                    );
                    setSelectedSubject('');
                    setSelectedTopic('');
                  }}
                >
                  {exam.icon || '📝'} {exam.name || exam.code}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Selection */}
          <div className="filter-section">
            <label className="filter-label">Select Subject</label>
            <div className="filter-grid">
              {availableSubjects.map(subject => (
                <button
                  key={subject}
                  className={`filter-chip ${selectedSubject === subject ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedSubject(prev => prev === subject ? '' : subject);
                    setSelectedTopic('');
                  }}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          {availableTopics.length > 0 && (
            <div className="filter-section">
              <label className="filter-label">Select Topic (optional)</label>
              <div className="filter-grid">
                {availableTopics.map(topic => (
                  <button
                    key={topic}
                    className={`filter-chip ${selectedTopic === topic ? 'active' : ''}`}
                    onClick={() => setSelectedTopic(prev => prev === topic ? '' : topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question Count */}
          <div className="filter-section">
            <label className="filter-label">Number of Questions</label>
            <div className="count-selector">
              <button className="count-btn" onClick={() => setQuestionCount(prev => Math.max(5, prev - 5))}>−</button>
              <span className="count-display">{questionCount}</span>
              <button className="count-btn" onClick={() => setQuestionCount(prev => Math.min(50, prev + 5))}>+</button>
            </div>
          </div>

          {/* Start */}
          <div className="start-section">
            <div className="summary-text">
              <strong>{questionCount}</strong> questions
              {selectedExams.length > 0 && (
                <> • <strong>{selectedExams.map(code => dbExams.find(e => e.code === code)?.name || code).join(', ')}</strong></>
              )}
              {selectedSubject && <> • <strong>{selectedSubject}</strong></>}
              {selectedTopic && <> • <strong>{selectedTopic}</strong></>}
            </div>
            <button className="btn btn-primary btn-lg" onClick={startQuiz}>
              Start Practice →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== SOLVING PHASE =====
  if (phase === 'solving') {
    const q = activeQuestions[currentIdx];
    const selectedAnswer = answers[q.id];
    const isAnswered = selectedAnswer !== undefined;
    const isCorrect = selectedAnswer === q.correctOption;
    const progress = ((currentIdx + (isAnswered ? 1 : 0)) / activeQuestions.length) * 100;

    return (
      <div>
        <style jsx>{`
          .quiz-header {
            padding: 1rem 2rem;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-subtle);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .quiz-progress-info {
            display: flex;
            align-items: center;
            gap: 1.5rem;
          }
          .quiz-counter {
            font-weight: 700;
            font-size: 0.9rem;
          }
          .quiz-counter span { color: var(--accent-blue); font-family: 'JetBrains Mono', monospace; }
          .quiz-timer-display {
            font-family: 'JetBrains Mono', monospace;
            font-weight: 700;
            font-size: 1.25rem;
            color: ${timer > 300 ? 'var(--warning)' : 'var(--text-primary)'};
          }
          .quiz-progress-bar {
            height: 3px;
            background: rgba(255,255,255,0.05);
          }
          .quiz-progress-fill {
            height: 100%;
            background: var(--gradient-hero);
            transition: width 300ms ease;
          }
          .quiz-body {
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
          }
          .q-meta {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
          }
          .q-text {
            font-size: 1.15rem;
            font-weight: 500;
            line-height: 1.7;
            margin-bottom: 2rem;
          }
          .options-container {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 2rem;
          }
          .opt {
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem 1.25rem;
            background: var(--bg-input);
            border: 2px solid var(--border-subtle);
            border-radius: 0.75rem;
            cursor: pointer;
            transition: all 200ms;
            font-size: 1rem;
          }
          .opt:hover:not(.answered) {
            border-color: var(--accent-blue);
            background: rgba(59,130,246,0.05);
          }
          .opt.selected { border-color: var(--accent-blue); background: rgba(59,130,246,0.1); }
          .opt.correct { border-color: var(--success); background: rgba(16,185,129,0.1); }
          .opt.wrong { border-color: var(--error); background: rgba(244,63,94,0.1); }
          .opt-letter {
            width: 32px;
            height: 32px;
            border-radius: 0.5rem;
            background: rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
            flex-shrink: 0;
          }
          .opt.correct .opt-letter { background: var(--success); color: white; }
          .opt.wrong .opt-letter { background: var(--error); color: white; }
          .opt.selected:not(.correct):not(.wrong) .opt-letter { background: var(--accent-blue); color: white; }
          .opt-text { padding-top: 0.3rem; flex: 1; }

          .explanation-box {
            padding: 1.5rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin-bottom: 1.5rem;
            animation: fadeInUp 300ms ease forwards;
          }
          .explanation-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
          }
          .explanation-text { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }

          .quiz-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .quit-btn {
            font-size: 0.85rem;
            color: var(--text-tertiary);
            cursor: pointer;
            transition: color 150ms;
          }
          .quit-btn:hover { color: var(--error); }
        `}</style>

        <div className="quiz-header">
          <div className="quiz-progress-info">
            <span className="quiz-counter">
              Question <span>{currentIdx + 1}</span> of <span>{activeQuestions.length}</span>
            </span>
            <div className="badge badge-blue">{q.subject}</div>
            <div className="badge badge-purple">{q.topic}</div>
          </div>
          <div className="quiz-timer-display">
            ⏱ {formatTime(timer)}
          </div>
        </div>

        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="quiz-body">
          <div className="q-meta">
            {q.examCode && <span className="badge badge-blue">{dbExams.find(e => e.code === q.examCode)?.name || q.examCode}</span>}
            <span className="badge badge-amber">{q.year}</span>
            <span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-amber'}`}>
              {q.difficulty}
            </span>
          </div>

          {/* Question */}
          <div className="q-text">{q.questionText}</div>

          {/* Options */}
          <div className="options-container">
            {q.options.map((opt, i) => {
              let cls = 'opt';
              if (showExplanation) {
                cls += ' answered';
                if (i === q.correctOption) cls += ' correct';
                else if (i === selectedAnswer && i !== q.correctOption) cls += ' wrong';
              } else if (selectedAnswer === i) {
                cls += ' selected';
              }
              return (
                <div key={i} className={cls} onClick={() => selectAnswer(i)}>
                  <div className="opt-letter">{String.fromCharCode(65 + i)}</div>
                  <div className="opt-text">{opt}</div>
                  {showExplanation && i === q.correctOption && <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>✅</span>}
                  {showExplanation && i === selectedAnswer && i !== q.correctOption && <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>❌</span>}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="explanation-box">
              <div className="explanation-header" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
              </div>
              <div className="explanation-text">
                💡 {q.explanation}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="quiz-actions">
            <button className="quit-btn" onClick={resetQuiz}>← Quit</button>
            {showExplanation && (
              <button className="btn btn-primary" onClick={nextQuestion}>
                {currentIdx < activeQuestions.length - 1 ? 'Next Question →' : 'Finish & Review →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== REVIEW PHASE =====
  if (phase === 'review') {
    const score = activeQuestions.reduce((acc, q) => acc + (answers[q.id] === q.correctOption ? 1 : 0), 0);
    const accuracy = Math.round((score / activeQuestions.length) * 100);
    const avgTime = Math.round(timer / activeQuestions.length);

    return (
      <div>
        <style jsx>{`
          .review-header {
            padding: 2rem 2rem 1.5rem;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border-subtle);
            text-align: center;
          }
          .review-body { padding: 2rem; max-width: 800px; margin: 0 auto; }
          .score-display {
            font-size: 4rem;
            font-weight: 900;
            font-family: 'JetBrains Mono', monospace;
            margin: 1rem 0;
          }
          .score-display.great { color: var(--success); }
          .score-display.good { color: var(--accent-blue); }
          .score-display.poor { color: var(--error); }
          .review-stats {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin: 1.5rem 0 2rem;
          }
          .review-stat { text-align: center; }
          .review-stat .rs-val {
            font-size: 1.25rem;
            font-weight: 700;
            font-family: 'JetBrains Mono', monospace;
          }
          .review-stat .rs-label { font-size: 0.8rem; color: var(--text-secondary); }
          .review-actions {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 3rem;
          }
          .review-q {
            padding: 1.25rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1rem;
            margin-bottom: 1rem;
          }
          .review-q.correct-q { border-left: 3px solid var(--success); }
          .review-q.wrong-q { border-left: 3px solid var(--error); }
          .rq-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .rq-text { font-size: 0.9rem; margin-bottom: 0.5rem; }
          .rq-answer {
            font-size: 0.8rem;
            color: var(--text-secondary);
          }
          .rq-answer strong { color: var(--success); }
          .rq-answer .wrong-ans { color: var(--error); text-decoration: line-through; margin-right: 0.5rem; }
        `}</style>

        <div className="review-header">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Practice Complete!</h1>
          <div className={`score-display ${accuracy >= 80 ? 'great' : accuracy >= 50 ? 'good' : 'poor'}`}>
            {accuracy}%
          </div>
          <div className="review-stats">
            <div className="review-stat">
              <div className="rs-val" style={{ color: 'var(--success)' }}>{score}</div>
              <div className="rs-label">Correct</div>
            </div>
            <div className="review-stat">
              <div className="rs-val" style={{ color: 'var(--error)' }}>{activeQuestions.length - score}</div>
              <div className="rs-label">Wrong</div>
            </div>
            <div className="review-stat">
              <div className="rs-val">{formatTime(timer)}</div>
              <div className="rs-label">Total Time</div>
            </div>
            <div className="review-stat">
              <div className="rs-val">{avgTime}s</div>
              <div className="rs-label">Avg / Question</div>
            </div>
          </div>
          <div className="review-actions">
            <button className="btn btn-primary" onClick={startQuiz}>Try Again</button>
            <button className="btn btn-secondary" onClick={resetQuiz}>New Practice</button>
          </div>
        </div>

        <div className="review-body">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Question Review</h2>
          {activeQuestions.map((q, i) => {
            const userAns = answers[q.id];
            const correct = userAns === q.correctOption;
            return (
              <div key={q.id} className={`review-q ${correct ? 'correct-q' : 'wrong-q'}`}>
                <div className="rq-header">
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)' }}>
                    Q{i + 1} • {q.topic}
                  </span>
                  <span>{correct ? '✅' : '❌'}</span>
                </div>
                <div className="rq-text">{q.questionText}</div>
                <div className="rq-answer">
                  {!correct && userAns !== undefined && (
                    <span className="wrong-ans">Your: {String.fromCharCode(65 + userAns)}) {q.options[userAns]}</span>
                  )}
                  <strong>✓ {String.fromCharCode(65 + q.correctOption)}) {q.options[q.correctOption]}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
