'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { 
  getAllUserProfiles, 
  getQuestions, 
  saveAdminQuestion, 
  deleteAdminQuestion,
  getUserProfile,
  getUserDetailedAnalytics,
  exportUserReviewsCSV,
  type UserProfile,
  type UserDetailedAnalytics,
} from '@/lib/db';
import { getTursoDatabaseMetrics } from '@/lib/turso';
import { getSemanticCacheMetrics, clearSemanticCache } from '@/lib/cache/semantic-cache';
import { exams, questions as seedQuestions, type Question } from '@/lib/data';
import { 
  ChevronDown, ChevronRight, Download, RotateCcw, Shield, ShieldOff, 
  Search, UserX, UserCheck, Crown, User as UserIcon 
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────
interface EnrichedUser extends UserProfile {
  questions_attempted: number;
  accuracy: number;
  status: 'active' | 'suspended';
}

export default function AdminPortalPage() {
  const [mounted, setMounted] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [usersList, setUsersList] = useState<EnrichedUser[]>([]);
  const [questionsList, setQuestionsList] = useState<Question[]>(seedQuestions);
  const [searchQuestionQuery, setSearchQuestionQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // User management state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<Record<string, UserDetailedAnalytics>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Turso & Cache metrics
  const [dbMetrics, setDbMetrics] = useState<{ totalQuestions: number; totalExams: number; totalTopics: number; isOnline: boolean }>({
    totalQuestions: seedQuestions.length,
    totalExams: 9,
    totalTopics: 58,
    isOnline: true,
  });
  const [cacheMetrics, setCacheMetrics] = useState<any>({
    totalRequests: 24,
    cacheHits: 18,
    tokensSaved: 4200,
    hitRate: 75,
  });

  // Add Question Modal / Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExamCode, setNewExamCode] = useState('SSC_CGL');
  const [newSubject, setNewSubject] = useState('Quantitative Aptitude');
  const [newTopic, setNewTopic] = useState('Percentage');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectOption, setNewCorrectOption] = useState(0);
  const [newExplanation, setNewExplanation] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    async function initAdmin() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsAdmin(false);
          setAuthChecking(false);
          return;
        }

        const profile = await getUserProfile(supabase, user.id);
        if (!profile || profile.role !== 'admin') {
          setIsAdmin(false);
          setAuthChecking(false);
          return;
        }

        // Get session token for API calls
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) setAdminToken(session.access_token);

        setIsAdmin(true);
        setAuthChecking(false);

        // Load data
        const [tMetrics, qs] = await Promise.all([
          getTursoDatabaseMetrics(),
          getQuestions(supabase, { limit: 100 }),
        ]);

        if (tMetrics) setDbMetrics(tMetrics);
        if (qs && qs.length > 0) setQuestionsList(qs as Question[]);
        setCacheMetrics(getSemanticCacheMetrics());

        // Fetch enriched users from admin API
        await fetchUsers(session?.access_token || '');
      } catch (err) {
        console.warn('Admin portal load notice:', err);
        setAuthChecking(false);
      }
    }

    initAdmin();
  }, [supabase]);

  async function fetchUsers(token?: string) {
    try {
      const tkn = token || adminToken;
      if (!tkn) return;
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${tkn}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(data.users || []);
      }
    } catch (err) {
      console.warn('Failed to fetch users from admin API, falling back:', err);
      // Fallback to direct DB
      const us = await getAllUserProfiles(supabase);
      setUsersList(us.map(u => ({ ...u, questions_attempted: 0, accuracy: 0, status: 'active' as const })));
    }
  }

  async function handleAdminAction(userId: string, action: string, value?: string) {
    setActionLoading(`${userId}-${action}`);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ userId, action, value }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
        await fetchUsers();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      alert('❌ Action failed: network error');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExpandUser(userId: string) {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);

    // Fetch detailed analytics if not cached
    if (!userAnalytics[userId]) {
      try {
        const analytics = await getUserDetailedAnalytics(supabase, userId);
        setUserAnalytics(prev => ({ ...prev, [userId]: analytics }));
      } catch {
        // Silently fail — the expanded row will show "Loading..."
      }
    }
  }

  async function handleExportCSV(userId: string, userName: string) {
    setActionLoading(`${userId}-export`);
    try {
      const csv = await exportUserReviewsCSV(supabase, userId);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prep_reviews_${userName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert('❌ CSV export failed');
    } finally {
      setActionLoading(null);
    }
  }

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some(o => !o.trim())) {
      alert('Please fill out question text and all 4 options.');
      return;
    }

    setSubmittingQ(true);
    const newQ: Question = {
      id: `q_admin_${Date.now()}`,
      examCode: newExamCode,
      subject: newSubject,
      topic: newTopic,
      year: 2024,
      difficulty: newDifficulty,
      questionText: newQuestionText,
      options: newOptions,
      correctOption: Number(newCorrectOption),
      explanation: newExplanation,
    };

    await saveAdminQuestion(supabase, newQ);
    setSubmittingQ(false);

    setQuestionsList(prev => [newQ, ...prev]);
    setShowAddModal(false);
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
    setNewExplanation('');

    const updatedMetrics = await getTursoDatabaseMetrics();
    setDbMetrics(updatedMetrics);
    alert('Question successfully published to Turso Edge DB and Supabase! 🚀');
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question from the database?')) return;

    await deleteAdminQuestion(supabase, id);
    setQuestionsList(prev => prev.filter(q => q.id !== id));
    const updatedMetrics = await getTursoDatabaseMetrics();
    setDbMetrics(updatedMetrics);
  };

  const handleFlushCache = () => {
    if (confirm('Clear the in-memory Semantic LLM cache?')) {
      clearSemanticCache();
      setCacheMetrics(getSemanticCacheMetrics());
      alert('Semantic LLM Cache cleared successfully! 🧹');
    }
  };

  const filteredQuestions = questionsList.filter(q => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchQuestionQuery.toLowerCase()) ||
                          q.topic.toLowerCase().includes(searchQuestionQuery.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'All' || q.subject === selectedSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  // User search/filter
  const filteredUsers = usersList.filter(u => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone_number || '').toLowerCase().includes(q) ||
      (u.target_exams || []).some(e => e.toLowerCase().includes(q)) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.status || 'active').toLowerCase().includes(q)
    );
  });

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
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          403 — Administrator Access Required
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6, marginBottom: '1.75rem', fontSize: '0.95rem' }}>
          Access to the PrepArsenal Administrator Portal is strictly restricted to verified administrators. Your account does not have authorization to manage system resources or question databases.
        </p>
        <Link 
          href="/dashboard" 
          style={{ 
            padding: '0.75rem 1.75rem', 
            background: 'var(--accent-blue)', 
            color: 'white', 
            borderRadius: '0.5rem', 
            fontWeight: 700, 
            textDecoration: 'none',
            fontSize: '0.95rem'
          }}
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-container" suppressHydrationWarning>
      <style jsx>{`
        .admin-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .admin-title {
          font-size: 2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .metric-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.25rem 1.5rem;
        }

        .metric-val {
          font-size: 2rem;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          margin-bottom: 0.25rem;
        }

        .metric-label {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          text-transform: uppercase;
          font-weight: 700;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1.25rem;
          padding: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-input {
          flex: 1;
          padding: 0.65rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.88rem;
          outline: none;
        }

        .table-wrap {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }

        .admin-table th, .admin-table td {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .admin-table th {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .user-row-clickable {
          cursor: pointer;
          transition: background 150ms;
        }
        .user-row-clickable:hover {
          background: rgba(59,130,246,0.03);
        }

        .user-detail-panel {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .user-detail-inner {
          padding: 1.25rem 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1.5rem;
        }
        .detail-section h4 {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--text-tertiary);
          margin-bottom: 0.75rem;
          letter-spacing: 0.06em;
        }
        .detail-stat {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.3rem 0;
          font-size: 0.82rem;
        }
        .detail-stat-label { color: var(--text-secondary); }
        .detail-stat-val { font-weight: 700; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; }

        .detail-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-subtle);
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          border-radius: 0.45rem;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms;
        }
        .action-btn:hover { border-color: var(--border-default); color: var(--text-primary); }
        .action-btn.danger { border-color: rgba(239,68,68,0.3); color: var(--error); }
        .action-btn.danger:hover { background: rgba(239,68,68,0.08); }
        .action-btn.success { border-color: rgba(16,185,129,0.3); color: var(--success); }
        .action-btn.success:hover { background: rgba(16,185,129,0.08); }
        .action-btn.purple { border-color: rgba(139,92,246,0.3); color: #8b5cf6; }
        .action-btn.purple:hover { background: rgba(139,92,246,0.08); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .subject-accuracy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.35rem;
        }
        .subj-acc-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0.5rem;
          border-radius: 0.3rem;
          background: var(--bg-input);
          font-size: 0.75rem;
        }

        .status-badge {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 999px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .status-active { background: rgba(16,185,129,0.12); color: #10b981; }
        .status-suspended { background: rgba(239,68,68,0.12); color: #ef4444; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1.5rem;
        }

        .modal-content {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1.25rem;
          padding: 2rem;
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .form-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .modal-label {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
          color: var(--text-secondary);
        }

        .modal-input, .modal-select, .modal-textarea {
          width: 100%;
          padding: 0.65rem 0.85rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.88rem;
          margin-bottom: 1rem;
          outline: none;
        }

        @media (max-width: 800px) {
          .metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .form-grid-2 { grid-template-columns: 1fr; }
          .user-detail-inner { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="admin-header">
        <div>
          <div className="admin-title">
            <span>⚙️ PrepArsenal Admin Gateway</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Telemetry, Edge Database Ingestion, User Directory & System Ops
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/gk-review" className="btn btn-secondary btn-sm">
            📰 GK Daily Review Queue
          </Link>
          <button className="btn btn-secondary btn-sm" onClick={handleFlushCache}>
            🧹 Flush LLM Cache
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}>
            + Add New PYQ Question
          </button>
        </div>
      </div>

      {/* Live System Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val" style={{ color: 'var(--accent-blue)' }}>
            {dbMetrics?.totalQuestions || questionsList.length}
          </div>
          <div className="metric-label">Turso Edge Questions (9GB Tier)</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" style={{ color: 'var(--success)' }}>
            {usersList.length > 0 ? usersList.length : 1}
          </div>
          <div className="metric-label">Registered Learners</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" style={{ color: '#c084fc' }}>
            {cacheMetrics?.totalRequests || 24}
          </div>
          <div className="metric-label">Semantic LLM Cache Lookups</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" style={{ color: 'var(--warning)' }}>
            {cacheMetrics?.hitRate || 75}%
          </div>
          <div className="metric-label">Cache Hit Rate (~{cacheMetrics?.tokensSaved || 4200} Tok)</div>
        </div>
      </div>

      {/* Question Management Section */}
      <div className="section-header">
        <div className="section-title">
          <span>📚 Question Bank Management</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            ({filteredQuestions.length} questions listed)
          </span>
        </div>
      </div>

      <div className="card">
        <div className="filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search questions by text or topic..."
            value={searchQuestionQuery}
            onChange={e => setSearchQuestionQuery(e.target.value)}
          />

          <select
            className="search-input"
            style={{ width: '220px', flex: 'none' }}
            value={selectedSubjectFilter}
            onChange={e => setSelectedSubjectFilter(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Quantitative Aptitude">Quantitative Aptitude</option>
            <option value="Reasoning">Reasoning</option>
            <option value="English">English</option>
            <option value="General Awareness">General Awareness</option>
            <option value="Finance & Economics">Finance & Economics</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID / Exam</th>
                <th>Subject & Topic</th>
                <th>Question Preview</th>
                <th>Difficulty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.slice(0, 15).map(q => (
                <tr key={q.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{q.examCode}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{q.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{q.subject}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.topic}</div>
                  </td>
                  <td style={{ maxWidth: '360px' }}>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {q.questionText}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${q.difficulty === 'easy' ? 'badge-green' : q.difficulty === 'hard' ? 'badge-red' : 'badge-amber'}`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)', padding: '0.25rem 0.5rem' }}
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      Delete 🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══════════ USER MANAGEMENT SECTION ═══════════ */}
      <div className="section-header">
        <div className="section-title">
          <span>👥 User Directory & Management</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            ({filteredUsers.length} of {usersList.length} users)
          </span>
        </div>
      </div>

      <div className="card">
        {/* User Search */}
        <div className="filter-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              className="search-input"
              style={{ paddingLeft: '2.25rem', width: '100%' }}
              placeholder="Search by name, email, phone, exam, role, or status..."
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '28px' }}></th>
                <th>Name / ID</th>
                <th>Phone</th>
                <th>Target Exams</th>
                <th>Streak</th>
                <th>Questions</th>
                <th>Accuracy</th>
                <th>XP & Level</th>
                <th>Status</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const isExpanded = expandedUserId === u.id;
                  const analytics = userAnalytics[u.id];

                  return (
                    <>
                      <tr
                        key={u.id}
                        className="user-row-clickable"
                        onClick={() => handleExpandUser(u.id)}
                      >
                        <td style={{ paddingRight: 0 }}>
                          {isExpanded
                            ? <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                            : <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                          }
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{u.full_name || 'Aspirant'}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{u.id.substring(0, 12)}...</div>
                        </td>
                        <td>{u.phone_number || '—'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                            {(u.target_exams || ['SSC_CGL']).map(code => (
                              <span key={code} className="badge badge-blue" style={{ fontSize: '0.68rem' }}>
                                {code}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ color: 'var(--warning)', fontWeight: 700 }}>
                          🔥 {u.streak_count || 0}d
                        </td>
                        <td>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
                            {u.questions_attempted || 0}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontWeight: 700,
                            color: (u.accuracy || 0) >= 70 ? 'var(--success)' : (u.accuracy || 0) >= 40 ? 'var(--warning)' : 'var(--error)',
                          }}>
                            {u.accuracy || 0}%
                          </span>
                        </td>
                        <td>
                          <strong>{u.xp || 0} XP</strong> (Lvl {u.current_level || 1})
                        </td>
                        <td>
                          <span className={`status-badge ${u.status === 'suspended' ? 'status-suspended' : 'status-active'}`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-purple">{u.role || 'student'}</span>
                        </td>
                      </tr>
                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <tr key={`${u.id}-detail`} className="user-detail-panel">
                          <td colSpan={10} style={{ padding: 0 }}>
                            <div className="user-detail-inner">
                              {/* Analytics Column */}
                              <div className="detail-section">
                                <h4>📊 Analytics</h4>
                                {analytics ? (
                                  <>
                                    <div className="detail-stat">
                                      <span className="detail-stat-label">Total Questions</span>
                                      <span className="detail-stat-val">{analytics.totalQuestionsAttempted}</span>
                                    </div>
                                    <div className="detail-stat">
                                      <span className="detail-stat-label">Overall Accuracy</span>
                                      <span className="detail-stat-val" style={{ color: analytics.overallAccuracy >= 70 ? 'var(--success)' : 'var(--warning)' }}>
                                        {analytics.overallAccuracy}%
                                      </span>
                                    </div>
                                    <div className="detail-stat">
                                      <span className="detail-stat-label">Study Time</span>
                                      <span className="detail-stat-val">{Math.round(analytics.totalStudyMinutes / 60)}h {analytics.totalStudyMinutes % 60}m</span>
                                    </div>
                                    <div className="detail-stat">
                                      <span className="detail-stat-label">NCERT Chapters</span>
                                      <span className="detail-stat-val">{analytics.ncertChaptersRead}</span>
                                    </div>
                                    <div className="detail-stat">
                                      <span className="detail-stat-label">Last Active</span>
                                      <span className="detail-stat-val">{analytics.lastActive || 'Never'}</span>
                                    </div>
                                  </>
                                ) : (
                                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Loading analytics...</div>
                                )}
                              </div>

                              {/* Subject Breakdown */}
                              <div className="detail-section">
                                <h4>📐 Subject Accuracy</h4>
                                {analytics && Object.keys(analytics.subjectAccuracy).length > 0 ? (
                                  <div className="subject-accuracy-grid">
                                    {Object.entries(analytics.subjectAccuracy).map(([sub, stats]) => (
                                      <div key={sub} className="subj-acc-item">
                                        <span style={{ color: 'var(--text-secondary)' }}>{sub.split(' ')[0]}</span>
                                        <span style={{
                                          fontWeight: 700,
                                          fontFamily: "'JetBrains Mono', monospace",
                                          color: stats.accuracy >= 70 ? 'var(--success)' : stats.accuracy >= 40 ? 'var(--warning)' : 'var(--error)',
                                        }}>
                                          {stats.accuracy}% ({stats.correct}/{stats.total})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : analytics ? (
                                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>No subject data yet</div>
                                ) : (
                                  <div style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Loading...</div>
                                )}
                              </div>

                              {/* Account Info */}
                              <div className="detail-section">
                                <h4>👤 Account</h4>
                                <div className="detail-stat">
                                  <span className="detail-stat-label">User ID</span>
                                  <span className="detail-stat-val" style={{ fontSize: '0.68rem' }}>{u.id.substring(0, 20)}...</span>
                                </div>
                                <div className="detail-stat">
                                  <span className="detail-stat-label">Joined</span>
                                  <span className="detail-stat-val">{new Date(u.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="detail-stat">
                                  <span className="detail-stat-label">Status</span>
                                  <span className={`status-badge ${u.status === 'suspended' ? 'status-suspended' : 'status-active'}`}>
                                    {u.status || 'active'}
                                  </span>
                                </div>
                                <div className="detail-stat">
                                  <span className="detail-stat-label">Role</span>
                                  <span className="badge badge-purple">{u.role || 'user'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ padding: '0 1.5rem 1.25rem' }}>
                              <div className="detail-actions">
                                <button
                                  className="action-btn danger"
                                  disabled={actionLoading === `${u.id}-reset_streak`}
                                  onClick={(e) => { e.stopPropagation(); handleAdminAction(u.id, 'reset_streak'); }}
                                >
                                  <RotateCcw size={13} />
                                  {actionLoading === `${u.id}-reset_streak` ? 'Resetting...' : 'Reset Streak'}
                                </button>

                                {u.status === 'active' ? (
                                  <button
                                    className="action-btn danger"
                                    disabled={actionLoading === `${u.id}-change_status`}
                                    onClick={(e) => { e.stopPropagation(); handleAdminAction(u.id, 'change_status', 'suspended'); }}
                                  >
                                    <UserX size={13} />
                                    {actionLoading === `${u.id}-change_status` ? 'Suspending...' : 'Suspend User'}
                                  </button>
                                ) : (
                                  <button
                                    className="action-btn success"
                                    disabled={actionLoading === `${u.id}-change_status`}
                                    onClick={(e) => { e.stopPropagation(); handleAdminAction(u.id, 'change_status', 'active'); }}
                                  >
                                    <UserCheck size={13} />
                                    {actionLoading === `${u.id}-change_status` ? 'Reactivating...' : 'Reactivate User'}
                                  </button>
                                )}

                                {u.role === 'admin' ? (
                                  <button
                                    className="action-btn"
                                    disabled={actionLoading === `${u.id}-change_role`}
                                    onClick={(e) => { e.stopPropagation(); handleAdminAction(u.id, 'change_role', 'user'); }}
                                  >
                                    <UserIcon size={13} />
                                    Demote to User
                                  </button>
                                ) : (
                                  <button
                                    className="action-btn purple"
                                    disabled={actionLoading === `${u.id}-change_role`}
                                    onClick={(e) => { e.stopPropagation(); handleAdminAction(u.id, 'change_role', 'admin'); }}
                                  >
                                    <Crown size={13} />
                                    Promote to Admin
                                  </button>
                                )}

                                <button
                                  className="action-btn"
                                  disabled={actionLoading === `${u.id}-export`}
                                  onClick={(e) => { e.stopPropagation(); handleExportCSV(u.id, u.full_name || 'user'); }}
                                >
                                  <Download size={13} />
                                  {actionLoading === `${u.id}-export` ? 'Exporting...' : 'Export CSV'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    {userSearchQuery ? 'No users match your search' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              ➕ Add New Question to Turso & Supabase
            </h2>

            <form onSubmit={handleCreateQuestion}>
              <div className="form-grid-2">
                <div>
                  <label className="modal-label">Target Exam</label>
                  <select
                    className="modal-select"
                    value={newExamCode}
                    onChange={e => setNewExamCode(e.target.value)}
                  >
                    {exams.map(e => (
                      <option key={e.code} value={e.code}>{e.name} ({e.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="modal-label">Subject</label>
                  <select
                    className="modal-select"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="English">English</option>
                    <option value="General Awareness">General Awareness</option>
                    <option value="Finance & Economics">Finance & Economics</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div>
                  <label className="modal-label">Topic</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={newTopic}
                    onChange={e => setNewTopic(e.target.value)}
                    placeholder="e.g. Percentage or Syllogism"
                    required
                  />
                </div>

                <div>
                  <label className="modal-label">Difficulty</label>
                  <select
                    className="modal-select"
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as any)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="modal-label">Question Text</label>
                <textarea
                  className="modal-textarea"
                  rows={3}
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder="Enter the full question statement..."
                  required
                />
              </div>

              <label className="modal-label">Options (Select radio for correct answer)</label>
              {newOptions.map((opt, oIdx) => (
                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <input
                    type="radio"
                    name="correct_option"
                    checked={newCorrectOption === oIdx}
                    onChange={() => setNewCorrectOption(oIdx)}
                  />
                  <span style={{ fontWeight: 700, width: '20px' }}>{String.fromCharCode(65 + oIdx)}</span>
                  <input
                    type="text"
                    className="modal-input"
                    style={{ marginBottom: 0, flex: 1 }}
                    value={opt}
                    onChange={e => {
                      const updated = [...newOptions];
                      updated[oIdx] = e.target.value;
                      setNewOptions(updated);
                    }}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    required
                  />
                </div>
              ))}

              <div style={{ marginTop: '1rem' }}>
                <label className="modal-label">Detailed Explanation / Shortcut</label>
                <textarea
                  className="modal-textarea"
                  rows={2}
                  value={newExplanation}
                  onChange={e => setNewExplanation(e.target.value)}
                  placeholder="Step-by-step solution..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingQ}
                  style={{ flex: 1 }}
                >
                  {submittingQ ? 'Publishing to Turso...' : 'Publish Question 🚀'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
