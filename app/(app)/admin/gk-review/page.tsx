'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { getUserProfile, getPendingGkItems, approveGkItem, rejectGkItem, type GkDailyItem } from '@/lib/db';

export default function GkReviewPage() {
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<GkDailyItem[]>([]);
  type GkEdit = { summary: string; question_text: string; explanation: string; options: string[]; correct_option: number };
  const [edits, setEdits] = useState<Record<string, GkEdit>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAuthChecking(false); return; }
      setUserId(user.id);

      const profile = await getUserProfile(supabase, user.id);
      if (!profile || profile.role !== 'admin') { setAuthChecking(false); return; }

      setIsAdmin(true);
      setAuthChecking(false);

      const pending = await getPendingGkItems(supabase);
      setItems(pending);
      setEdits(Object.fromEntries(pending.map(item => [item.id, {
        summary: item.summary,
        question_text: item.question_text,
        explanation: item.explanation,
        options: [...item.options],
        correct_option: item.correct_option,
      }])));
    }
    init();
  }, [supabase]);

  const handleApprove = async (item: GkDailyItem) => {
    if (!userId) return;
    setBusyId(item.id);
    const edit = edits[item.id];
    const ok = await approveGkItem(supabase, item.id, userId, edit);
    if (ok) setItems(prev => prev.filter(i => i.id !== item.id));
    setBusyId(null);
  };

  const handleReject = async (item: GkDailyItem) => {
    if (!userId) return;
    setBusyId(item.id);
    const ok = await rejectGkItem(supabase, item.id, userId);
    if (ok) setItems(prev => prev.filter(i => i.id !== item.id));
    setBusyId(null);
  };

  if (authChecking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-blue)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verifying administrative credentials...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🛡️🚫</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>403 — Administrator Access Required</h1>
        <Link href="/dashboard" style={{ padding: '0.75rem 1.75rem', background: 'var(--accent-blue)', color: 'white', borderRadius: '0.5rem', fontWeight: 700, textDecoration: 'none', fontSize: '0.95rem' }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="gkr-container">
      <style jsx>{`
        .gkr-container { max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem; }
        .gkr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); }
        .gkr-title { font-size: 1.7rem; font-weight: 800; }
        .card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 1.1rem; padding: 1.5rem; margin-bottom: 1.5rem; }
        .meta { display: flex; gap: .6rem; font-size: .78rem; color: var(--text-tertiary); margin-bottom: .6rem; flex-wrap: wrap; }
        .badge { padding: .15rem .55rem; border-radius: 9999px; background: rgba(59,130,246,.12); color: var(--accent-blue); font-weight: 700; }
        .headline { font-size: 1.15rem; font-weight: 750; margin-bottom: .5rem; }
        .field-label { display: block; font-size: .78rem; font-weight: 700; color: var(--text-secondary); margin: .8rem 0 .3rem; }
        textarea, input { width: 100%; padding: .6rem .8rem; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: .5rem; color: var(--text-primary); font-size: .88rem; font-family: inherit; }
        .options-preview { font-size: .85rem; color: var(--text-secondary); margin-top: .4rem; line-height: 1.6; }
        .actions { display: flex; gap: .75rem; margin-top: 1.25rem; }
        .btn { border: 0; border-radius: .55rem; padding: .65rem 1.2rem; font-weight: 700; cursor: pointer; font-size: .88rem; }
        .btn:disabled { opacity: .5; cursor: not-allowed; }
        .btn-approve { background: #22c55e; color: white; }
        .btn-reject { background: rgba(239,68,68,.12); color: var(--error); border: 1px solid rgba(239,68,68,.25); }
        .empty { color: var(--text-secondary); padding: 2rem 0; text-align: center; }
        .source-link { font-size: .8rem; color: var(--accent-blue); }
      `}</style>

      <div className="gkr-header">
        <div>
          <div className="gkr-title">📰 GK Daily — Review Queue</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginTop: '.25rem' }}>{items.length} item(s) awaiting approval</p>
        </div>
        <Link href="/admin" style={{ color: 'var(--accent-blue)', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none' }}>← Back to Admin Portal</Link>
      </div>

      {items.length === 0 && <p className="empty">Nothing pending review right now.</p>}

      {items.map(item => {
        const edit = edits[item.id] ?? { summary: item.summary, question_text: item.question_text, explanation: item.explanation };
        return (
          <div className="card" key={item.id}>
            <div className="meta">
              <span className="badge">{item.category}</span>
              <span>{item.item_date}</span>
              {item.source_url && <a className="source-link" href={item.source_url} target="_blank" rel="noreferrer">Source ↗</a>}
            </div>
            <div className="headline">{item.headline}</div>

            <label className="field-label">Summary</label>
            <textarea rows={3} value={edit.summary} onChange={e => setEdits(prev => ({ ...prev, [item.id]: { ...edit, summary: e.target.value } }))} />

            <label className="field-label">Drafted question</label>
            <textarea rows={2} value={edit.question_text} onChange={e => setEdits(prev => ({ ...prev, [item.id]: { ...edit, question_text: e.target.value } }))} />
            <div className="options-preview">
              {item.options.map((opt, i) => (
                <div key={i}>{String.fromCharCode(65 + i)}. {opt}{i === item.correct_option ? ' ✓' : ''}</div>
              ))}
            </div>

            <label className="field-label">Explanation</label>
            <textarea rows={2} value={edit.explanation} onChange={e => setEdits(prev => ({ ...prev, [item.id]: { ...edit, explanation: e.target.value } }))} />

            <div className="actions">
              <button className="btn btn-approve" onClick={() => handleApprove(item)} disabled={busyId === item.id}>
                {busyId === item.id ? 'Working...' : '✓ Approve & Publish'}
              </button>
              <button className="btn btn-reject" onClick={() => handleReject(item)} disabled={busyId === item.id}>
                ✕ Reject
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
