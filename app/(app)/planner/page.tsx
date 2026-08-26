'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock3, NotebookPen, Trash2, CalendarDays } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getStudyPlan, updateStudyPlan, type StudyPlanItem } from '@/lib/db';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PlannerPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  
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
        }
        .planner-body {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
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
        }
      `}</style>

      <div className="planner-header">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.5rem' }}><CalendarDays size={25} />Smart Study Planner</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Organize your AI-recommended topics and track your mastery.
        </p>
      </div>

      <div className="planner-body">
        <div className="kanban-board">
          {columns.map(col => {
            const colItems = plan.filter(item => item.status === col.id);
            const ColumnIcon = col.icon;
            return (
              <div key={col.id} className="kanban-col">
                <div className="col-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.45rem' }}><ColumnIcon size={20} />{col.title}</span>
                  <span className="col-count">{colItems.length}</span>
                </div>
                
                {colItems.length === 0 ? (
                  <div className="empty-state">
                    No topics here.<br/>
                    {col.id === 'todo' && <Link href="/dashboard" style={{ color: 'var(--accent-blue)', textDecoration: 'none', marginTop: '0.5rem', display: 'inline-block' }}>Add from Dashboard →</Link>}
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
                          Practice PYQs
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
