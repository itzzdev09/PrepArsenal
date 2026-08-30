'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import Image from 'next/image';
import { BrainCircuit, ChartNoAxesCombined, ChevronDown, ChevronRight, Layers, Target, TrendingUp } from 'lucide-react';
import { exams } from '@/lib/data';
import { getTrends, getTopics, getUserProfile, averagePerYear, trendYears, type TrendAnalytics } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import { getExamLogo } from '@/lib/exam-logos';
import { computeEnsembleBatch, type EnrichedTrend, type SignalBreakdown } from '@/lib/adaptive/trend-engine';

// ── Inline Sparkline SVG ─────────────────────────────────────────────
function Sparkline({ data, width = 100, height = 28, color = '#3b82f6' }: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length < 2) return <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>—</span>;

  const max = Math.max(1, ...data);
  const min = Math.min(0, ...data);
  const range = max - min || 1;
  const pad = 2;
  const usableW = width - pad * 2;
  const usableH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * usableW;
    const y = pad + usableH - ((v - min) / range) * usableH;
    return `${x},${y}`;
  });

  const fillPoints = [
    `${pad},${pad + usableH}`,
    ...points,
    `${pad + usableW},${pad + usableH}`,
  ];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`spark-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={fillPoints.join(' ')}
        fill={`url(#spark-grad-${color.replace('#', '')})`}
      />
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Latest point dot */}
      {data.length > 0 && (() => {
        const lastX = pad + ((data.length - 1) / (data.length - 1)) * usableW;
        const lastY = pad + usableH - ((data[data.length - 1] - min) / range) * usableH;
        return <circle cx={lastX} cy={lastY} r="3" fill={color} />;
      })()}
    </svg>
  );
}

// ── Signal Breakdown Bar ─────────────────────────────────────────────
function SignalBar({ signals }: { signals: SignalBreakdown[] }) {
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 0' }}>
      {signals.map((s, i) => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem' }}>
          <span style={{ width: '120px', color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>{s.name}</span>
          <div style={{ flex: 1, height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(2, s.score)}%`,
                height: '100%',
                background: colors[i % colors.length],
                borderRadius: '4px',
                transition: 'width 0.6s ease',
              }}
            />
          </div>
          <span style={{
            width: '42px',
            textAlign: 'right',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: colors[i % colors.length],
          }}>
            {s.score.toFixed(0)}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', width: '20px', textAlign: 'right' }}>
            ×{(s.weight * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Tier Badge ─────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    'Very High': { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    'High': { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' },
    'Moderate': { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
    'Low': { bg: 'rgba(244,63,94,0.12)', color: '#f43f5e' },
    'Very Low': { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  };
  const s = styles[tier] || styles['Moderate'];
  return (
    <span style={{
      fontSize: '0.68rem',
      fontWeight: 700,
      padding: '0.15rem 0.5rem',
      borderRadius: '0.35rem',
      background: s.bg,
      color: s.color,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {tier}
    </span>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function TrendsPage() {
  const [selectedExam, setSelectedExam] = useState('SSC_CGL');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [sortBy, setSortBy] = useState<'prediction' | 'frequency' | 'name'>('prediction');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const [dbTrends, setDbTrends] = useState<TrendAnalytics[]>([]);
  const [allExamTrends, setAllExamTrends] = useState<TrendAnalytics[]>([]);
  const [dbTopics, setDbTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const supabase = createClient();

  // Admin gate — the signal-level analytics cards are admin-only
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const profile = await getUserProfile(supabase, user.id);
        if (!cancelled) setIsAdmin(profile?.role === 'admin');
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [trends, allTrends, topics] = await Promise.all([
        getTrends(supabase, [selectedExam]),
        getTrends(supabase), // all exams for cross-exam spillover
        getTopics(supabase),
      ]);
      setDbTrends(trends);
      setAllExamTrends(allTrends);
      setDbTopics(topics);
      setLoading(false);
    }
    loadData();
  }, [selectedExam, supabase]);

  // Compute ensemble predictions
  const enrichedTrends: EnrichedTrend[] = useMemo(() => {
    return computeEnsembleBatch(dbTrends, allExamTrends);
  }, [dbTrends, allExamTrends]);

  const examTrends = useMemo(() => {
    let trends = [...enrichedTrends];
    if (selectedSubject) {
      trends = trends.filter(t => {
        const topic = dbTopics.find(top => top.id === t.topic_id);
        return topic?.subject === selectedSubject;
      });
    }
    // Sort
    if (sortBy === 'prediction') {
      trends.sort((a, b) => b.ensemble.score - a.ensemble.score);
    } else if (sortBy === 'frequency') {
      trends.sort((a, b) => averagePerYear(b) - averagePerYear(a));
    } else {
      trends.sort((a, b) => {
        const ta = dbTopics.find(top => top.id === a.topic_id)?.name || '';
        const tb = dbTopics.find(top => top.id === b.topic_id)?.name || '';
        return ta.localeCompare(tb);
      });
    }
    return trends;
  }, [enrichedTrends, selectedSubject, sortBy, dbTopics]);

  const exam = exams.find(e => e.code === selectedExam);
  const subjects = [...new Set(examTrends.map(t => dbTopics.find(top => top.id === t.topic_id)?.subject).filter(Boolean))];

  // Top predictions (by ensemble score)
  const topPredictions = [...examTrends].sort((a, b) => b.ensemble.score - a.ensemble.score).slice(0, 5);

  // Signal heatmap — top 8 topics × 5 signals
  const heatmapData = [...examTrends]
    .sort((a, b) => b.ensemble.score - a.ensemble.score)
    .slice(0, 8)
    .map(t => ({
      topic_id: t.topic_id,
      name: dbTopics.find(top => top.id === t.topic_id)?.name || t.topic_id,
      signals: t.ensemble.signals,
      score: t.ensemble.score,
      expectedQuestions: t.ensemble.expectedQuestions,
    }));

  // Plain-language conclusion drawn from the heatmap
  const heatmapInsight = useMemo(() => {
    if (heatmapData.length === 0) return '';
    const labels = heatmapData[0].signals.map(s => s.name);
    const avg = labels.map((_, i) =>
      heatmapData.reduce((s, r) => s + (r.signals[i]?.score || 0), 0) / heatmapData.length
    );
    const topSig = labels[avg.indexOf(Math.max(...avg))];
    const rising = heatmapData.filter(
      r => (r.signals[1]?.score || 0) >= 60 && (r.signals[2]?.score || 0) >= 60
    );
    const risingTxt = rising.length
      ? `${rising.length} topic${rising.length > 1 ? 's' : ''} pair a rising trajectory with a recent burst (${rising.slice(0, 3).map(r => r.name).join(', ')}) — treat these as the highest-urgency revision targets.`
      : 'No topic currently shows both a rising trajectory and a recent burst, so no single topic is spiking right now.';
    return `${topSig} is the dominant driver across the top ${heatmapData.length} topics. ${risingTxt}`;
  }, [heatmapData]);

  // Years actually present in this exam's data
  const years = trendYears(examTrends);

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
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
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
        .exam-logo { width: 18px; height: 18px; border-radius: 50%; object-fit: cover; border: 1px solid currentColor; }
        .exam-logo-fallback { width: 14px; height: 14px; border: 2px solid currentColor; border-radius: 50%; }

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

        /* Heatmap */
        .heatmap-grid {
          display: grid;
          grid-template-columns: 140px repeat(5, 1fr) 60px;
          gap: 2px;
          font-size: 0.72rem;
        }
        .heatmap-header {
          font-weight: 700;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.35rem 0.25rem;
          text-align: center;
          font-size: 0.62rem;
        }
        .heatmap-label {
          padding: 0.35rem 0.25rem;
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .heatmap-cell {
          border-radius: 4px;
          padding: 0.35rem 0.25rem;
          text-align: center;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          transition: transform 150ms;
        }
        .heatmap-cell:hover { transform: scale(1.1); }
        .heatmap-score {
          padding: 0.35rem 0.25rem;
          text-align: center;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
        }

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
        .trend-row-clickable { cursor: pointer; }
        .trend-row-clickable:hover td { background: rgba(59,130,246,0.05); }

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

        .avg-freq {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 600;
        }

        .expand-row td {
          padding: 0 1rem 1rem;
          background: rgba(59,130,246,0.02);
        }
        .expand-content {
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1rem 1.25rem;
          background: var(--bg-card);
        }
        .expand-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .expand-summary {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          margin-top: 0.5rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .insights-row { grid-template-columns: 1fr; }
          .trend-table { font-size: 0.8rem; }
          .trends-body { padding: 1rem; }
          .heatmap-grid { font-size: 0.6rem; }
        }
      `}</style>

      <div className="trends-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}><BrainCircuit size={25} />Trend Explorer</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Projected question counts and appearance odds for the next exam cycle — a 5-signal statistical blend per topic.
        </p>
        <div className="exam-selector">
          {exams.map(e => (
            <button
              key={e.code}
              className={`exam-btn ${selectedExam === e.code ? 'active' : ''}`}
              onClick={() => { setSelectedExam(e.code); setSelectedSubject(''); setExpandedTopic(null); }}
            >
              {getExamLogo(e.code) ? (
                <Image className="exam-logo" src={getExamLogo(e.code)!} alt="" width={18} height={18} />
              ) : (
                <span className="exam-logo-fallback" aria-hidden="true" />
              )}
              {e.name}
            </button>
          ))}
        </div>
      </div>

      <div className="trends-body">
        {/* Insights Cards — admin only */}
        {isAdmin && (
        <div className="insights-row">
          <div className="insight-card">
            <div className="insight-title">
              <Target size={18} />Top Predicted Topics — Next Exam
            </div>
            <div className="insight-list">
              {topPredictions.map(t => {
                const topic = dbTopics.find(top => top.id === t.topic_id);
                const e = t.ensemble;
                return (
                  <div
                    key={t.topic_id}
                    className="insight-item"
                    style={{ cursor: 'pointer', gap: '0.75rem' }}
                    onClick={() => { setSortBy('prediction'); setExpandedTopic(t.topic_id); }}
                    title="Open this topic's signal breakdown below"
                  >
                    <span style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
                      <span className="insight-item-name" style={{ fontWeight: 600 }}>{topic?.name || t.topic_id}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                        {e.appearanceProbability}% chance to appear · priority {e.score.toFixed(0)}/100
                      </span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      <TierBadge tier={e.tier} />
                      <span className="insight-item-val" style={{ color: 'var(--accent-blue)', whiteSpace: 'nowrap' }}>
                        ≈{e.expectedQuestions.toFixed(1)} Q
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.85rem', lineHeight: 1.55 }}>
              <strong>≈ Q</strong> = projected question count in the next exam cycle (recent-weighted level + trajectory).
              <strong> Priority</strong> blends all 5 signals; <strong>chance to appear</strong> comes from year-over-year consistency and recent activity.
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-title">
              <Layers size={18} />Signal Heatmap — Top {heatmapData.length} Topics
            </div>
            {heatmapData.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                No trend data available for this exam
              </div>
            ) : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <div className="heatmap-grid">
                    <div className="heatmap-header" style={{ textAlign: 'left' }}>Topic</div>
                    {[
                      { k: 'Recent', t: 'Recent-weighted average (EMA) — favours the latest years' },
                      { k: 'Trend', t: 'Trajectory — is the count rising or falling over time' },
                      { k: 'Burst', t: 'Spike in the last 1–2 years vs the prior baseline' },
                      { k: 'Steady', t: 'Share of years the topic appeared at least once' },
                      { k: 'Sibling', t: 'How the same topic is trending in related exams' },
                    ].map(h => (
                      <div key={h.k} className="heatmap-header" title={h.t}>{h.k}</div>
                    ))}
                    <div className="heatmap-header" title="Blended priority index 0–100">Prio</div>

                    {heatmapData.map(row => {
                      const active = expandedTopic === row.topic_id;
                      return (
                        <Fragment key={row.topic_id}>
                          <div
                            className="heatmap-label"
                            title={`${row.name} — open breakdown below`}
                            style={{ cursor: 'pointer', color: active ? 'var(--accent-blue)' : undefined, fontWeight: active ? 700 : 600 }}
                            onClick={() => { setSortBy('prediction'); setExpandedTopic(active ? null : row.topic_id); }}
                          >
                            {row.name}
                          </div>
                          {row.signals.map((s, i) => {
                            const t = Math.max(0, Math.min(1, s.score / 100));
                            return (
                              <div
                                key={i}
                                className="heatmap-cell"
                                style={{
                                  background: `rgba(59,130,246,${(0.06 + t * 0.8).toFixed(3)})`,
                                  color: t > 0.5 ? '#fff' : 'var(--text-secondary)',
                                  cursor: 'pointer',
                                }}
                                title={`${row.name} — ${s.name}: ${s.score.toFixed(0)}/100\n${s.description}`}
                                onClick={() => { setSortBy('prediction'); setExpandedTopic(active ? null : row.topic_id); }}
                              >
                                {s.score.toFixed(0)}
                              </div>
                            );
                          })}
                          <div
                            className="heatmap-score"
                            style={{ color: row.score >= 65 ? 'var(--success)' : row.score >= 45 ? 'var(--warning)' : 'var(--error)' }}
                            title={`≈${row.expectedQuestions.toFixed(1)} questions projected next exam`}
                          >
                            {row.score.toFixed(0)}
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0 0.5rem', fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
                  <span>weak</span>
                  <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'linear-gradient(90deg, rgba(59,130,246,0.06), rgba(59,130,246,0.86))' }} />
                  <span>strong</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  {heatmapInsight}
                </div>
              </>
            )}
          </div>
        </div>
        )}

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
            <div className="empty-icon"><ChartNoAxesCombined size={36} /></div>
            <h3>No trend data for this selection</h3>
            <p>Try selecting a different exam to view topic trends.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="trend-table">
              <thead>
                <tr>
                  <th style={{ width: '28px' }}></th>
                  <th>Topic</th>
                  <th title="Blended priority index 0–100 across all 5 signals">Priority</th>
                  <th title="Projected question count and probability of appearing next exam">Next Exam</th>
                  <th>Confidence</th>
                  <th>
                    {years.length > 0
                      ? `Trend (${years[0]}–${years[years.length - 1]})`
                      : 'Trend'}
                  </th>
                  <th>Avg / Year</th>
                </tr>
              </thead>
              <tbody>
                {examTrends.map(t => {
                  const topic = dbTopics.find(top => top.id === t.topic_id);
                  const isExpanded = expandedTopic === t.topic_id;
                  const sparkData = years.map(y => t.yearly_frequencies?.[String(y)] ?? 0);
                  const sparkColor = t.ensemble.score >= 65 ? '#10b981' : t.ensemble.score >= 45 ? '#f59e0b' : '#f43f5e';

                  return (
                    <>
                      <tr
                        key={t.topic_id}
                        className="trend-row-clickable"
                        onClick={() => setExpandedTopic(isExpanded ? null : t.topic_id)}
                      >
                        <td style={{ paddingRight: 0 }}>
                          {isExpanded
                            ? <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                            : <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                          }
                        </td>
                        <td>
                          <div className="topic-name">{topic?.name || t.topic_id}</div>
                          <div className="topic-subject">{topic?.subject}</div>
                        </td>
                        <td>
                          <span className={`pred-score ${t.ensemble.score >= 65 ? 'pred-high' : t.ensemble.score >= 45 ? 'pred-med' : 'pred-low'}`}>
                            {t.ensemble.score.toFixed(1)}
                          </span>
                        </td>
                        <td>
                          <span className="avg-freq" style={{ color: 'var(--accent-blue)' }}>≈{t.ensemble.expectedQuestions.toFixed(1)}q</span>
                          <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                            {t.ensemble.appearanceProbability}% to appear
                          </span>
                        </td>
                        <td>
                          <TierBadge tier={t.ensemble.tier} />
                        </td>
                        <td>
                          <Sparkline data={sparkData} color={sparkColor} width={110} height={28} />
                        </td>
                        <td>
                          <span className="avg-freq">{averagePerYear(t).toFixed(1)}</span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${t.topic_id}-expand`} className="expand-row">
                          <td colSpan={7}>
                            <div className="expand-content">
                              <div className="expand-title">
                                <Layers size={14} />
                                Signal Decomposition — {topic?.name || t.topic_id}
                              </div>
                              <SignalBar signals={t.ensemble.signals} />
                              <div className="expand-summary">{t.ensemble.summary}</div>
                              {/* Yearly breakdown */}
                              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {years.map(y => {
                                  const freq = t.yearly_frequencies?.[String(y)] ?? 0;
                                  return (
                                    <div key={y} style={{
                                      padding: '0.25rem 0.5rem',
                                      borderRadius: '0.35rem',
                                      background: freq > 0 ? 'rgba(59,130,246,0.1)' : 'var(--bg-input)',
                                      fontSize: '0.72rem',
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontWeight: 600,
                                      color: freq > 0 ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                                    }}>
                                      {y}: {freq}q
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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
