'use client';

import { useState, useEffect } from 'react';
import { exams } from '@/lib/data';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { getExamQuestionCounts } from '@/lib/db';

export default function MockTestConfigPage() {
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>('Any');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();
      const dbCounts = await getExamQuestionCounts(supabase);
      setCounts(dbCounts);
    };
    fetchCounts();
  }, []);

  const handleStart = () => {
    if (selectedExam) {
      let url = `/mock/${selectedExam}`;
      if (selectedTier !== 'Any') {
        url += `?tier=${selectedTier}`;
      }
      router.push(url);
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
        .ec-db-count {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 0.5rem;
          display: inline-block;
        }
        
        .start-action {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }

        .tier-select {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-default);
          background: var(--bg-input);
          color: var(--text-primary);
          font-size: 1rem;
          min-width: 200px;
          outline: none;
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
              <span>-{exam.negativeMark} Negative Marking</span>
              <div className="ec-db-count">
                DB Pool: {counts[exam.code] || 0} real questions
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="start-action">
        {selectedExam && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
              Select Exam Phase:
            </label>
            <select 
              className="tier-select" 
              value={selectedTier} 
              onChange={e => setSelectedTier(e.target.value)}
            >
              <option value="Any">Any Phase</option>
              <option value="Tier 1">Tier 1 / Prelims</option>
              <option value="Tier 2">Tier 2 / Mains</option>
            </select>
          </div>
        )}
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
