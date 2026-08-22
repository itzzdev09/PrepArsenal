'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getQuestions, type Question } from '@/lib/db';
import { exams } from '@/lib/data';

export default function MockTestRunnerPage({ params }: { params: Promise<{ examId: string }> }) {
  const resolvedParams = use(params);
  const examCode = resolvedParams.examId;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [exam, setExam] = useState<any>(null);
  
  // Test State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Results
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(0);

  useEffect(() => {
    const ex = exams.find(e => e.code === examCode);
    if (!ex) {
      router.push('/mock');
      return;
    }
    setExam(ex);
    setTimeLeft(ex.totalTime * 60); // minutes to seconds

    async function loadQuestions() {
      const supabase = createClient();
      // Fetch questions for this exam. Since we might not have 100 in db, get whatever is available up to 100
      const fetched = await getQuestions(supabase, { examCode: ex!.code, limit: ex!.totalQuestions });
      
      // If db is totally empty for this exam, we have a problem
      if (fetched.length === 0) {
        alert('No questions found in database for this exam yet!');
        router.push('/mock');
        return;
      }
      
      setQuestions(fetched);
      setLoading(false);
    }
    loadQuestions();
  }, [examCode, router]);

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

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    try {
      if (isSubmitted) return;
      
      let correct = 0;
      let wrong = 0;
      
      questions.forEach(q => {
        const ans = answers[q.id];
        if (ans !== undefined && ans !== null) {
          if (Number(ans) === Number(q.correctOption)) correct++;
          else wrong++;
        }
      });
      
      const totalAttempted = correct + wrong;
      const negMark = exam?.negativeMarking || 0;
      const finalScore = correct - (wrong * negMark);
      
      setScore(finalScore || 0);
      setAccuracy(totalAttempted > 0 ? (correct / totalAttempted) * 100 : 0);
      setIsSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      alert("Error submitting test: " + err.message);
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
          <h2>Generating Mock Test...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Pulling questions from database...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isLastQ = currentIdx === questions.length - 1;

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
            padding: 3rem;
            max-width: 600px;
            width: 100%;
            text-align: center;
          }
          .r-title {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
          }
          .r-subtitle { color: var(--text-secondary); margin-bottom: 3rem; }
          .r-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
            margin-bottom: 3rem;
          }
          .r-stat {
            background: var(--bg-input);
            padding: 1.5rem;
            border-radius: 1rem;
            border: 1px solid var(--border-subtle);
          }
          .rs-val { font-size: 2rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; margin-bottom: 0.5rem; }
          .rs-label { font-size: 0.85rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 600; }
        `}</style>
        <div className="result-card">
          <div className="r-title">Test Complete</div>
          <div className="r-subtitle">{exam.name} Full Mock</div>
          
          <div className="r-grid">
            <div className="r-stat">
              <div className="rs-val">{score.toFixed(2)}</div>
              <div className="rs-label">Total Score</div>
            </div>
            <div className="r-stat">
              <div className="rs-val">{accuracy.toFixed(1)}%</div>
              <div className="rs-label">Accuracy</div>
            </div>
            <div className="r-stat">
              <div className="rs-val">{Object.keys(answers).length}</div>
              <div className="rs-label">Attempted</div>
            </div>
          </div>
          
          <button type="button" className="btn btn-primary" onClick={() => router.push('/dashboard')} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
          padding: 1rem 2rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .mr-title { font-weight: 700; font-size: 1.2rem; }
        .mr-timer {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.5rem;
          font-weight: 800;
          color: ${timeLeft < 300 ? 'var(--error)' : 'var(--text-primary)'};
          background: var(--bg-input);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-subtle);
        }
        
        .mr-body {
          flex: 1;
          display: flex;
          overflow: hidden;
          position: relative;
        }
        
        .mr-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        .q-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-tertiary);
        }
        .q-meta span { background: var(--bg-input); padding: 0.2rem 0.6rem; border-radius: 1rem; border: 1px solid var(--border-subtle); }
        
        .q-text {
          font-size: 1.25rem;
          line-height: 1.6;
          font-weight: 500;
          margin-bottom: 2rem;
        }
        
        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .opt-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--bg-card);
          border: 2px solid var(--border-subtle);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 150ms;
          text-align: left;
          font-size: 1rem;
          color: var(--text-primary);
        }
        .opt-btn:hover { border-color: var(--border-default); background: var(--bg-input); }
        .opt-btn.selected { border-color: var(--accent-blue); background: rgba(59, 130, 246, 0.08); }
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
        }
        .opt-btn.selected .opt-letter { background: var(--accent-blue); color: white; }
        
        .mr-nav {
          display: flex;
          justify-content: space-between;
          padding-top: 3rem;
          margin-top: 3rem;
          border-top: 1px solid var(--border-subtle);
        }
        
        .mr-sidebar {
          width: 300px;
          background: var(--bg-secondary);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
        }
        .mrs-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          font-weight: 700;
        }
        .mrs-grid {
          padding: 1.5rem;
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
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
        }
        .q-nav-btn:hover { border-color: var(--border-default); color: var(--text-primary); }
        .q-nav-btn.answered { background: var(--success); color: white; border-color: var(--success); }
        .q-nav-btn.active { border-color: white; border-width: 2px; }
        
        .mrs-footer {
          padding: 1.5rem;
          border-top: 1px solid var(--border-subtle);
        }
        
        @media (max-width: 768px) {
          .mr-body { flex-direction: column; }
          .mr-sidebar { width: 100%; border-left: none; border-top: 1px solid var(--border-subtle); height: 250px; flex: none; }
          .mr-main { padding: 1rem; }
          .options-grid { gap: 0.5rem; }
          .opt-btn { padding: 0.75rem; }
        }
      `}</style>

      <header className="mr-header">
        <div className="mr-title">{exam.name} - Mock Test</div>
        <div className="mr-timer">{formatTime(timeLeft)}</div>
      </header>

      <div className="mr-body">
        <div className="mr-main">
          <div className="q-meta">
            <span>Question {currentIdx + 1} of {questions.length}</span>
            <span>{currentQ.subject}</span>
          </div>
          
          <div className="q-text">{currentQ.questionText}</div>
          
          <div className="options-grid">
            {currentQ.options.map((opt: string, idx: number) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  className={`opt-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
          
          <div className="mr-nav">
            <button 
              type="button"
              className="btn"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(p => p - 1)}
            >
              ← Previous
            </button>
            {!isLastQ ? (
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentIdx(p => p + 1)}
              >
                Save & Next →
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={handleSubmit} style={{ background: 'var(--success)' }}>
                Submit Test
              </button>
            )}
          </div>
        </div>
        
        <div className="mr-sidebar">
          <div className="mrs-header">Question Palette</div>
          <div className="mrs-grid">
            {questions.map((q, i) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = i === currentIdx;
              return (
                <button
                  type="button"
                  key={q.id}
                  className={`q-nav-btn ${isAnswered ? 'answered' : ''} ${isActive ? 'active' : ''}`}
                  onClick={() => setCurrentIdx(i)}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mrs-footer">
            <button type="button" className="btn btn-primary" style={{ width: '100%', background: 'var(--error)' }} onClick={handleSubmit}>
              Submit Test Early
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
