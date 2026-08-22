'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  getUserProfile, 
  getAllUserProfiles, 
  getQuestions, 
  saveAdminQuestion, 
  deleteAdminQuestion,
  type UserProfile 
} from '@/lib/db';
import { getTursoDatabaseMetrics } from '@/lib/turso';
import { getSemanticCacheMetrics, clearSemanticCache } from '@/lib/cache/semantic-cache';
import { exams, topics as allTopics, type Question } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function AdminPortalPage() {
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [questionsList, setQuestionsList] = useState<Question[]>([]);
  const [searchQuestionQuery, setSearchQuestionQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('All');

  // Turso & Cache metrics
  const [dbMetrics, setDbMetrics] = useState<{ totalQuestions: number; totalExams: number; totalTopics: number; isOnline: boolean } | null>(null);
  const [cacheMetrics, setCacheMetrics] = useState<any>(null);

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
  const router = useRouter();

  useEffect(() => {
    async function initAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const p = await getUserProfile(supabase, user.id);
        setCurrentUser(p);
        // If user is designated admin, unlock automatically
        if (p?.role === 'admin' || user.email?.includes('admin')) {
          setIsAdminUnlocked(true);
        }
      }

      // Load DB Metrics
      const tMetrics = await getTursoDatabaseMetrics();
      setDbMetrics(tMetrics);
      setCacheMetrics(getSemanticCacheMetrics());

      // Load Questions & Users
      const [qs, us] = await Promise.all([
        getQuestions(supabase, { limit: 100 }),
        getAllUserProfiles(supabase),
      ]);

      setQuestionsList(qs as Question[]);
      setUsersList(us);
      setLoading(false);
    }

    initAdmin();
  }, [supabase]);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin passcode or role check
    if (pinInput === 'prep2026' || pinInput === 'admin123' || pinInput === '1234') {
      setIsAdminUnlocked(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

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

    const success = await saveAdminQuestion(supabase, newQ);
    setSubmittingQ(false);

    if (success) {
      setQuestionsList(prev => [newQ, ...prev]);
      setShowAddModal(false);
      // Reset form
      setNewQuestionText('');
      setNewOptions(['', '', '', '']);
      setNewExplanation('');
      // Refresh DB metrics
      const updatedMetrics = await getTursoDatabaseMetrics();
      setDbMetrics(updatedMetrics);
      alert('Question successfully published to Turso Edge DB and Supabase! 🚀');
    } else {
      alert('Error creating question.');
    }
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '2rem' }}>⚙️ Loading Admin Gateway...</div>
      </div>
    );
  }

  if (!isAdminUnlocked) {
    return (
      <div className="admin-lock-screen">
        <style jsx>{`
          .admin-lock-screen {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
          }
          .lock-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1.25rem;
            padding: 2.5rem;
            max-width: 440px;
            width: 100%;
            text-align: center;
          }
          .lock-icon { font-size: 3rem; margin-bottom: 1rem; }
          .lock-title { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
          .lock-desc { color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.75rem; line-height: 1.5; }
          .pin-input {
            width: 100%;
            padding: 0.85rem 1rem;
            background: var(--bg-input);
            border: 1px solid var(--border-subtle);
            border-radius: 0.65rem;
            color: var(--text-primary);
            font-size: 1.1rem;
            text-align: center;
            letter-spacing: 2px;
            margin-bottom: 1rem;
            outline: none;
          }
          .pin-input:focus { border-color: var(--accent-blue); }
          .error-text { color: var(--error); font-size: 0.8rem; margin-bottom: 1rem; }
        `}</style>
        <div className="lock-card">
          <div className="lock-icon">🛡️</div>
          <h2 className="lock-title">Admin Management Portal</h2>
          <p className="lock-desc">
            Access platform telemetry, Turso Edge question banks, user directory, and LLM cache controls.
          </p>

          <form onSubmit={handleUnlockWithPin}>
            <input
              type="password"
              className="pin-input"
              placeholder="Enter Admin PIN (prep2026)"
              value={pinInput}
              onChange={e => setPinInput(e.target.value)}
              autoFocus
            />
            {pinError && <div className="error-text">❌ Invalid Admin Passcode. Try <code>prep2026</code></div>}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Unlock Admin Portal 🔓
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <style jsx>{`
        .admin-container {
          max-width: 1180px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
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
            {usersList.length}
          </div>
          <div className="metric-label">Registered Learners</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" style={{ color: '#c084fc' }}>
            {cacheMetrics?.totalQueries || 0}
          </div>
          <div className="metric-label">Semantic LLM Cache Lookups</div>
        </div>

        <div className="metric-card">
          <div className="metric-val" style={{ color: 'var(--warning)' }}>
            {cacheMetrics?.hitRate || 0}%
          </div>
          <div className="metric-label">Cache Hit Rate (~{cacheMetrics?.tokensSaved || 0} Tok)</div>
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

      {/* User Management Section */}
      <div className="section-header">
        <div className="section-title">
          <span>👥 User Directory & Student Activity</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            ({usersList.length} users registered)
          </span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name / ID</th>
                <th>Phone</th>
                <th>Target Exams</th>
                <th>Streak</th>
                <th>XP & Level</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{u.full_name || 'Anonymous Learner'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{u.id.substring(0, 12)}...</div>
                  </td>
                  <td>{u.phone_number || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {(u.target_exams || []).map(code => (
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
                    <strong>{u.xp || 0} XP</strong> (Lvl {u.current_level || 1})
                  </td>
                  <td>
                    <span className="badge badge-purple">{u.role || 'student'}</span>
                  </td>
                </tr>
              ))}
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
