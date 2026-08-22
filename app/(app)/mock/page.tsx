'use client';

import { useState } from 'react';
import { exams } from '@/lib/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MockTestConfigPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const router = useRouter();

  const handleStart = () => {
    if (selectedExam) {
      // In a real app we might create a session ID in DB first.
      router.push(`/mock/${selectedExam}`);
    }
  };

  return (
    <div className="mock-config-container">
      <style jsx>{`
        .mock-config-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }
        .header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .header p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }
        
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        
        .exam-card {
          background: var(--bg-card);
          border: 2px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 200ms;
          text-align: center;
        }
        .exam-card:hover {
          border-color: var(--border-default);
          transform: translateY(-4px);
        }
        .exam-card.selected {
          border-color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.05);
        }
        
        .ec-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .ec-name {
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }
        .ec-meta {
          font-size: 0.85rem;
          color: var(--text-tertiary);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .start-action {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border-subtle);
        }
        
        .start-btn {
          font-size: 1.25rem;
          padding: 1rem 3rem;
          border-radius: 2rem;
        }
        .start-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .warning-text {
          margin-top: 1rem;
          font-size: 0.85rem;
          color: var(--warning);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      `}</style>

      <div className="header">
        <h1>🎯 Full-Length Mock Tests</h1>
        <p>Experience the real exam environment. Timed sessions with comprehensive analytics.</p>
      </div>

      <div className="exam-grid">
        {exams.map(exam => (
          <div 
            key={exam.code}
            className={`exam-card ${selectedExam === exam.code ? 'selected' : ''}`}
            onClick={() => setSelectedExam(exam.code)}
          >
            <div className="ec-icon">{exam.icon}</div>
            <div className="ec-name">{exam.name}</div>
            <div className="ec-meta">
              <span>{exam.totalQuestions} Questions</span>
              <span>{exam.totalTime} Minutes</span>
              <span>-{exam.negativeMarking} Negative Marking</span>
            </div>
          </div>
        ))}
      </div>

      <div className="start-action">
        <button 
          className="btn btn-primary start-btn" 
          disabled={!selectedExam}
          onClick={handleStart}
        >
          {selectedExam ? 'Start Mock Test Now' : 'Select an Exam to Begin'}
        </button>
        {selectedExam && (
          <div className="warning-text">
            ⚠️ Do not close the window once the test begins.
          </div>
        )}
      </div>
    </div>
  );
}
