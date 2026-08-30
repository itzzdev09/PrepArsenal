'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle2, Clock3, NotebookPen, Trash2, CalendarDays, 
  Sparkles, BrainCircuit, Network, Target, ArrowRight 
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getStudyPlan, updateStudyPlan, type StudyPlanItem } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlannerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      
      const userPlan = await getStudyPlan(supabase, user.id);
      setPlan(userPlan);
      setLoading(false);
    }
    loadPlan();
  }, [router, supabase]);

  const handleGenerateAIPlan = async () => {
    setGeneratingAI(true);
    try {
      const res = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to generate AI study plan');
      }

      const data = await res.json();
      if (data.plan && data.plan.dbItems) {
        setPlan(data.plan.dbItems);
        setAiReport(data);
      }
    } catch (err: any) {
      alert('Error generating AI plan: ' + (err?.message || 'Network error'));
    } finally {
      setGeneratingAI(false);
    }
  };

  const updateItemStatus = async (itemId: string, newStatus: StudyPlanItem['status']) => {
    if (!userId) return;
    
    const newPlan = plan.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    );
    
    setPlan(newPlan); // Optimistic UI update
    await updateStudyPlan(supabase, userId, newPlan);
  };
  
  const deleteItem = async (itemId: string) => {
    if (!userId) return;
    
    const newPlan = plan.filter(item => item.id !== itemId);
    setPlan(newPlan);
    await updateStudyPlan(supabase, userId, newPlan);
  };

  const columns = [
    { id: 'todo' as const, title: 'To Study', icon: NotebookPen },
    { id: 'in-progress' as const, title: 'In Progress', icon: Clock3 },
    { id: 'mastered' as const, title: 'Mastered', icon: CheckCircle2 }
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Study Plan...</h2>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style jsx>{`
        .planner-header {
          padding: 2rem 2rem 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .planner-body {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .ai-banner {
          background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.12) 100%);
          border: 1px solid rgba(139,92,246,0.3);
          border-radius: 1.25rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .ai-banner-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: #c084fc;
          background: rgba(139,92,246,0.15);
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          text-transform: uppercase;
        }
        .ai-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .ai-stat-card {
          background: var(--bg-card);
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-subtle);
        }
        .ai-stat-lbl {
          font-size: 0.7rem;
          text-transform: uppercase;
          color: var(--text-tertiary);
          font-weight: 700;
        }
        .ai-stat-val {
          font-size: 1.15rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          margin-top: 0.2rem;
        }
        .kanban-board {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .kanban-col {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
          min-height: 500px;
        }
        .col-header {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .col-count {
          background: rgba(255,255,255,0.1);
          padding: 0.2rem 0.6rem;
          border-radius: 1rem;
          font-size: 0.85rem;
          font-family: 'JetBrains Mono', monospace;
        }
        .kanban-item {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          padding: 1rem;
          margin-bottom: 1rem;
          transition: all 200ms;
        }
        .kanban-item:hover {
          border-color: var(--border-default);
          transform: translateY(-2px);
        }
        .item-subject {
          font-size: 0.75rem;
          color: var(--accent-blue);
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .item-topic {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          border-top: 1px solid var(--border-subtle);
          padding-top: 0.75rem;
        }
        .action-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: all 150ms;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .action-btn.delete:hover {
          color: var(--error);
          background: rgba(244,63,94,0.1);
        }
        
        .empty-state {
          text-align: center;
          padding: 2rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        
        @media (max-width: 900px) {
          .kanban-board { grid-template-columns: 1fr; }
          .kanban-col { min-height: auto; }
          .ai-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="planner-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <CalendarDays size={25} />Smart Study Planner
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            AI-generated adaptive schedules with Knowledge Graph prerequisite diagnosis.
          </p>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleGenerateAIPlan}
          disabled={generatingAI}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            boxShadow: '0 0 15px rgba(139,92,246,0.3)'
          }}
        >
          <Sparkles size={16} />
          {generatingAI ? 'Diagnosing & Synthesizing Plan...' : '✨ Generate AI Adaptive Plan'}
        </button>
      </div>

      <div className="planner-body">
        {/* AI Diagnostic Summary Card */}
        {aiReport && (
          <div className="ai-banner">
            <div className="ai-banner-header">
              <span className="ai-badge"><BrainCircuit size={13} /> AI Mentor Directive ({aiReport.plan?.generatedBy || 'LLM Engine'})</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Target: {aiReport.plan?.weeklyTargetHours || 7} Hours / Week
              </span>
            </div>
            
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>
              &ldquo;{aiReport.plan?.coachStrategy}&rdquo;
            </p>

            <div className="ai-stats-grid">
              <div className="ai-stat-card">
                <div className="ai-stat-lbl">Primary Focus Gap</div>
                <div className="ai-stat-val" style={{ color: 'var(--warning)', fontSize: '0.95rem' }}>
                  {aiReport.weaknessProfile?.primarySubjectGap}
                </div>
              </div>

              <div className="ai-stat-card">
                <div className="ai-stat-lbl">Critical Weaknesses</div>
                <div className="ai-stat-val" style={{ color: 'var(--error)' }}>
                  {aiReport.weaknessProfile?.criticalWeaknesses?.length || 0} Topics
                </div>
              </div>

              <div className="ai-stat-card">
                <div className="ai-stat-lbl">Graph Prereq Bleed</div>
                <div className="ai-stat-val" style={{ color: '#c084fc' }}>
                  {aiReport.weaknessProfile?.atRiskPropagated?.reduce((acc: number, a: any) => acc + (a.expandedTopics?.length || 0), 0) || 0} Linked
                </div>
              </div>

              <div className="ai-stat-card">
                <div className="ai-stat-lbl">High-Yield Neglected</div>
                <div className="ai-stat-val" style={{ color: 'var(--accent-blue)' }}>
                  {aiReport.weaknessProfile?.neglectedHighYield?.length || 0} Topics
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        <div className="kanban-board">
          {columns.map(col => {
            const colItems = plan.filter(item => item.status === col.id);
            const ColumnIcon = col.icon;
            return (
              <div key={col.id} className="kanban-col">
                <div className="col-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}>
                    <ColumnIcon size={20} />{col.title}
                  </span>
                  <span className="col-count">{colItems.length}</span>
                </div>
                
                {colItems.length === 0 ? (
                  <div className="empty-state">
                    No topics here.<br/>
                    {col.id === 'todo' && (
                      <button 
                        onClick={handleGenerateAIPlan}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-blue)',
                          cursor: 'pointer',
                          marginTop: '0.5rem',
                          fontWeight: 600
                        }}
                      >
                        Auto-fill with AI Plan →
                      </button>
                    )}
                  </div>
                ) : (
                  colItems.map(item => (
                    <div key={item.id} className="kanban-item">
                      <div className="item-subject">{item.subject.toUpperCase()}</div>
                      <div className="item-topic">{item.topicName}</div>
                      
                      <Link 
                        href={`/practice?topic=${item.topicId}`}
                        style={{
                          display: 'block',
                          textAlign: 'center',
                          padding: '0.4rem',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '0.5rem',
                          fontSize: '0.8rem',
                          textDecoration: 'none',
                          color: 'var(--text-primary)',
                          fontWeight: 600
                        }}
                      >
                        Practice Topic PYQs 🚀
                      </Link>

                      <div className="item-actions">
                        <select 
                          value={item.status}
                          onChange={(e) => updateItemStatus(item.id, e.target.value as any)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            outline: 'none'
                          }}
                        >
                          <option value="todo" style={{ background: 'var(--bg-card)' }}>To Study</option>
                          <option value="in-progress" style={{ background: 'var(--bg-card)' }}>In Progress</option>
                          <option value="mastered" style={{ background: 'var(--bg-card)' }}>Mastered</option>
                        </select>
                        <button className="action-btn delete" onClick={() => deleteItem(item.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
