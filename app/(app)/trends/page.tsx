'use client';

import { useState, useEffect, useMemo } from 'react';
import { exams } from '@/lib/data';
import { getTrends, getTopics, type TrendAnalytics } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

export default function TrendsPage() {
  const [selectedExam, setSelectedExam] = useState('SSC_CGL');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState<'prediction' | 'frequency' | 'name'>('prediction');
  
  const [dbTrends, setDbTrends] = useState<TrendAnalytics[]>([]);
  const [dbTopics, setDbTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [trends, topics] = await Promise.all([
        getTrends(supabase, [selectedExam]),
        getTopics(supabase)
      ]);
      setDbTrends(trends);
      setDbTopics(topics);
      setLoading(false);
    }
    loadData();
  }, [selectedExam, supabase]);

  const examTrends = useMemo(() => {
    let trends = [...dbTrends];
    if (selectedSubject) {
      trends = trends.filter(t => {
        const topic = dbTopics.find(top => top.id === t.topic_id);
        return topic?.subject === selectedSubject;
      });
    }
    // Sort
    if (sortBy === 'prediction') {
      trends.sort((a, b) => b.prediction_score - a.prediction_score);
    } else if (sortBy === 'frequency') {
      trends.sort((a, b) => b.frequency_score - a.frequency_score);
    } else {
      trends.sort((a, b) => {
        const ta = dbTopics.find(top => top.id === a.topic_id)?.name || '';
        const tb = dbTopics.find(top => top.id === b.topic_id)?.name || '';
        return ta.localeCompare(tb);
      });
    }
    return trends;
  }, [dbTrends, selectedSubject, sortBy, dbTopics]);

  const exam = exams.find(e => e.code === selectedExam);
  const subjects = [...new Set(examTrends.map(t => dbTopics.find(top => top.id === t.topic_id)?.subject).filter(Boolean))];

  // Compute top predictions
  const topPredictions = [...examTrends].sort((a, b) => b.prediction_score - a.prediction_score).slice(0, 5);
  const gettingHarder = examTrends.filter(t => t.difficulty_trend === 'harder');

  const getHeatLevel = (score: number): string => {
    if (score >= 95) return 'heat-5';
    if (score >= 85) return 'heat-4';
    if (score >= 75) return 'heat-3';
    if (score >= 60) return 'heat-2';
    if (score >= 40) return 'heat-1';
    return 'heat-0';
  };

  const years = [2019, 2020, 2021, 2022, 2023];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    );
  }

  return (
    <div>
      <style jsx>{`
        .trends-header {
          padding: 2rem 2rem 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .trends-body { padding: 2rem; }

        .exam-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .exam-btn {
          padding: 0.5rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 200ms;
        }
        .exam-btn:hover { border-color: var(--border-default); color: var(--text-primary); }
        .exam-btn.active { border-color: var(--accent-blue); color: var(--accent-blue); background: rgba(59,130,246,0.08); }

        .insights-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .insight-card {
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
        }
        .insight-title {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .insight-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .insight-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          padding: 0.4rem 0;
        }
        .insight-item-name { color: var(--text-secondary); }
        .insight-item-val {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .subject-filters { display: flex; gap: 0.35rem; flex-wrap: wrap; }
        .subj-btn {
          padding: 0.35rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms;
        }
        .subj-btn:hover { border-color: var(--border-default); }
        .subj-btn.active { border-color: var(--accent-blue); color: var(--accent-blue); background: rgba(59,130,246,0.08); }

        .sort-btns { display: flex; gap: 0.35rem; }

        /* Trend Table */
        .trend-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .trend-table th {
          padding: 0.75rem 1rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-tertiary);
          text-align: left;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          position: sticky;
          top: 0;
          z-index: 2;
        }
        .trend-table td {
          padding: 0.75rem 1rem;
          font-size: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }
        .trend-table tr:hover td {
          background: rgba(59,130,246,0.03);
        }

        .topic-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .topic-subject {
          font-size: 0.7rem;
          color: var(--text-tertiary);
        }

        .pred-score {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.2rem 0.5rem;
          border-radius: 0.35rem;
        }
        .pred-high { background: rgba(16,185,129,0.12); color: var(--success); }
        .pred-med { background: rgba(245,158,11,0.12); color: var(--warning); }
        .pred-low { background: rgba(244,63,94,0.12); color: var(--error); }

        .freq-bar-container { display: flex; gap: 3px; align-items: flex-end; height: 28px; }
        .freq-bar {
          width: 20px;
          border-radius: 2px 2px 0 0;
          transition: all 200ms;
          position: relative;
        }
        .freq-bar:hover { opacity: 0.8; }

        .difficulty-trend {
          font-size: 0.8rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .avg-freq {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .insights-row { grid-template-columns: 1fr; }
          .trend-table { font-size: 0.8rem; }
          .trends-body { padding: 1rem; }
        }
      `}</style>

      <div className="trends-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>🧠 Trend Explorer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Analyze topic frequency, difficulty trends, and prediction scores across exams.
        </p>
        <div className="exam-selector">
          {exams.map(e => (
            <button
              key={e.code}
              className={`exam-btn ${selectedExam === e.code ? 'active' : ''}`}
              onClick={() => { setSelectedExam(e.code); setSelectedSubject(''); }}
            >
              {e.icon} {e.name}
            </button>
          ))}
        </div>
      </div>

      <div className="trends-body">
        {/* Insights Cards */}
        <div className="insights-row">
          <div className="insight-card">
            <div className="insight-title">🎯 Top Predicted Topics</div>
            <div className="insight-list">
              {topPredictions.map(t => {
                const topic = dbTopics.find(top => top.id === t.topic_id);
                return (
                  <div key={t.topic_id} className="insight-item">
                    <span className="insight-item-name">{topic?.name || t.topic_id}</span>
                    <span className="insight-item-val" style={{ color: 'var(--success)' }}>{Number(t.prediction_score).toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="insight-card">
            <div className="insight-title">📈 Getting Harder</div>
            <div className="insight-list">
              {gettingHarder.length === 0 ? (
                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No difficulty increase detected</div>
              ) : (
                gettingHarder.slice(0, 5).map(t => {
                  const topic = dbTopics.find(top => top.id === t.topic_id);
                  return (
                    <div key={t.topic_id} className="insight-item">
                      <span className="insight-item-name">{topic?.name || t.topic_id}</span>
                      <span className="insight-item-val" style={{ color: 'var(--error)' }}>↗ Harder</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls-bar">
          <div className="subject-filters">
            <button
              className={`subj-btn ${!selectedSubject ? 'active' : ''}`}
              onClick={() => setSelectedSubject('')}
            >
              All
            </button>
            {subjects.map(s => (
              <button
                key={s}
                className={`subj-btn ${selectedSubject === s ? 'active' : ''}`}
                onClick={() => setSelectedSubject(prev => prev === s ? '' : s!)}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="sort-btns">
            <button className={`subj-btn ${sortBy === 'prediction' ? 'active' : ''}`} onClick={() => setSortBy('prediction')}>By Prediction</button>
            <button className={`subj-btn ${sortBy === 'frequency' ? 'active' : ''}`} onClick={() => setSortBy('frequency')}>By Frequency</button>
            <button className={`subj-btn ${sortBy === 'name' ? 'active' : ''}`} onClick={() => setSortBy('name')}>A-Z</button>
          </div>
        </div>

        {/* Trend Table */}
        {examTrends.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No trend data for this selection</h3>
            <p>Try selecting a different exam to view topic trends.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="trend-table">
              <thead>
                <tr>
                  <th>Topic</th>
                  <th>Prediction</th>
                  <th>Yearly Frequency (2019–2023)</th>
                  <th>Avg / Year</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {examTrends.map(t => {
                  const topic = dbTopics.find(top => top.id === t.topic_id);
                  // Mock max frequency for bars since we don't store yearly breakdown yet
                  const maxFreq = 10;
                  return (
                    <tr key={t.topic_id}>
                      <td>
                        <div className="topic-name">{topic?.name || t.topic_id}</div>
                        <div className="topic-subject">{topic?.subject}</div>
                      </td>
                      <td>
                        <span className={`pred-score ${t.prediction_score >= 90 ? 'pred-high' : t.prediction_score >= 70 ? 'pred-med' : 'pred-low'}`}>
                          {Number(t.prediction_score).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <div className="freq-bar-container">
                          {years.map(year => {
                            // Mocking frequency bars for now
                            const freq = Math.floor(Math.random() * maxFreq);
                            const height = maxFreq > 0 ? (freq / maxFreq) * 24 + 4 : 4;
                            return (
                              <div
                                key={year}
                                className="freq-bar"
                                style={{
                                  height: `${height}px`,
                                  background: freq > 0 ? `rgba(59, 130, 246, ${0.3 + (freq / maxFreq) * 0.7})` : 'rgba(255,255,255,0.05)',
                                }}
                                title={`${year}: ${freq} questions`}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span className="avg-freq">{Number(t.frequency_score).toFixed(1)}</span>
                      </td>
                      <td>
                        <span className="difficulty-trend">
                          {t.difficulty_trend === 'harder' && <><span style={{ color: 'var(--error)' }}>📈</span> Harder</>}
                          {t.difficulty_trend === 'easier' && <><span style={{ color: 'var(--success)' }}>📉</span> Easier</>}
                          {t.difficulty_trend === 'stable' && <><span style={{ color: 'var(--text-tertiary)' }}>➡️</span> Stable</>}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
