'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getUserProfile, updateUserProfile, type UserProfile } from '@/lib/db';
import { exams } from '@/lib/data';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bio, setBio] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>([]);

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || '');

      const p = await getUserProfile(supabase, user.id);
      if (p) {
        setProfile(p);
        setFullName(p.full_name || '');
        setPhoneNumber(p.phone_number || '');
        setBio(p.bio || '');
        setSelectedExams(p.target_exams || []);
      }
      setLoading(false);
    }
    loadUser();
  }, [router, supabase]);

  const toggleExam = (code: string) => {
    setSelectedExams(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    setSaveSuccessMsg(false);

    const success = await updateUserProfile(supabase, userId, {
      full_name: fullName,
      phone_number: phoneNumber,
      bio,
      target_exams: selectedExams,
    });

    setSaving(false);
    if (success) {
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3500);
    } else {
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);

    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully! ✅' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳ Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <style jsx>{`
        .profile-container {
          max-width: 960px;
          margin: 0 auto;
          padding: 2.5rem 1.5rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 0.35rem;
        }

        .header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 2rem;
        }

        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1.25rem;
          padding: 1.75rem;
          margin-bottom: 1.75rem;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
          color: var(--text-secondary);
        }

        .form-input, .form-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.65rem;
          color: var(--text-primary);
          font-size: 0.92rem;
          outline: none;
          transition: border-color 150ms;
          font-family: inherit;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: var(--accent-blue);
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .exam-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .exam-chip {
          padding: 0.45rem 0.85rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border-subtle);
          background: var(--bg-input);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms;
        }

        .exam-chip:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .exam-chip.selected {
          background: rgba(59, 130, 246, 0.15);
          border-color: var(--accent-blue);
          color: var(--accent-blue);
        }

        /* Stats Sidebar */
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 0;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.88rem;
        }
        .stat-item:last-child { border-bottom: none; }
        .stat-val { font-weight: 700; font-family: 'JetBrains Mono', monospace; }

        .avatar-box {
          text-align: center;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1.5rem;
        }
        .avatar-circle {
          width: 80px;
          height: 80px;
          background: var(--gradient-hero);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          margin: 0 auto 0.75rem;
          color: white;
        }

        .toast-banner {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .toast-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--success);
        }
        .toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--error);
        }

        @media (max-width: 800px) {
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="header">
        <h1>👤 My Account Profile</h1>
        <p>Manage your personal details, target exam preferences, and account security</p>
      </div>

      <div className="profile-grid">
        {/* Left: Edit Details */}
        <div className="main-col">
          {saveSuccessMsg && (
            <div className="toast-banner toast-success">
              ✅ Profile updated successfully!
            </div>
          )}

          <div className="card">
            <div className="card-title">📝 Personal Information</div>
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Dev Verma"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Registered Account)</label>
                <input
                  type="email"
                  className="form-input"
                  value={userEmail}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (For Exam Alerts & Updates)</label>
                <input
                  type="tel"
                  className="form-input"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Aspiration Goal / Bio</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. Cracking SSC CGL 2026 ASO in MEA with 160+ in Tier 1."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Exams</label>
                <div className="exam-chips">
                  {exams.map(ex => {
                    const isSelected = selectedExams.includes(ex.code);
                    return (
                      <button
                        key={ex.code}
                        type="button"
                        className={`exam-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleExam(ex.code)}
                      >
                        <span>{ex.icon}</span> {ex.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Password Security Card */}
          <div className="card">
            <div className="card-title">🔐 Change Password</div>
            {passwordMsg && (
              <div className={`toast-banner toast-${passwordMsg.type}`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={passwordLoading || !newPassword}
                style={{ width: '100%' }}
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: User Stats Sidebar */}
        <div className="side-col">
          <div className="card">
            <div className="avatar-box">
              <div className="avatar-circle">
                {fullName ? fullName.charAt(0).toUpperCase() : '👤'}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{fullName || 'Aspirant'}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{userEmail}</p>
            </div>

            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>🔥 Study Streak</span>
              <span className="stat-val" style={{ color: 'var(--warning)' }}>
                {profile?.streak_count || 0} Days
              </span>
            </div>

            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>⭐ Experience XP</span>
              <span className="stat-val" style={{ color: 'var(--accent-blue)' }}>
                {profile?.xp || 0} XP
              </span>
            </div>

            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>🎖️ Aspirant Level</span>
              <span className="stat-val">
                Level {profile?.current_level || 1}
              </span>
            </div>

            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>⏱️ Total Study Time</span>
              <span className="stat-val">
                {Math.round((profile?.total_study_minutes || 0) / 60)} hrs
              </span>
            </div>

            <div className="stat-item">
              <span style={{ color: 'var(--text-secondary)' }}>📅 Joined PrepArsenal</span>
              <span className="stat-val" style={{ fontSize: '0.78rem' }} suppressHydrationWarning>
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
