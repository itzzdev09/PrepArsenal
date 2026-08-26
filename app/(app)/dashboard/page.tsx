'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bot, ChartNoAxesCombined, ClipboardCheck, Clock3, Lightbulb, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { exams, getQuestionsByExam } from '@/lib/data';
import { getExamLogo } from '@/lib/exam-logos';
import {
  getUserProfile,
  createUserProfile,
  updateStreak,
  getOverallAccuracy,
  getTotalQuestionsAttempted,
  getTrends,
  getTopics,
  getStudyPlan,
  updateStudyPlan,
  updateTargetExams,
  type UserProfile,
  type TrendAnalytics,
  type StudyPlanItem,
} from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [userName, setUserName] = useState('');
  
  const [isEditingExams, setIsEditingExams] = useState(false);
  const [editSelectedExams, setEditSelectedExams] = useState<string[]>([]);
  
  // Real DB Data
  const [dbTrends, setDbTrends] = useState<TrendAnalytics[]>([]);
  const [dbTopics, setDbTopics] = useState<any[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlanItem[]>([]);
  
  // Stats
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [prepDay, setPrepDay] = useState(1);
  
  const supabase = createClient();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const existingProfile = await getUserProfile(supabase, user.id);
          
          if (existingProfile) {
            const newStreak = await updateStreak(supabase, user.id);
            existingProfile.streak_count = newStreak;
            setProfile(existingProfile);

            if (existingProfile.created_at) {
              const diffMs = Date.now() - new Date(existingProfile.created_at).getTime();
              setPrepDay(Math.max(1, Math.floor(diffMs / 86400000)));
            }
            
            const [attempted, acc, trends, topics, plan] = await Promise.all([
              getTotalQuestionsAttempted(supabase, user.id),
              getOverallAccuracy(supabase, user.id),
              getTrends(supabase, existingProfile.target_exams),
              getTopics(supabase),
              getStudyPlan(supabase, user.id)
            ]);
            
            setTotalAttempted(attempted);
            setAccuracy(acc);
            setDbTrends(trends);
            setDbTopics(topics);
            setStudyPlan(plan);
          } else {
            setShowOnboarding(true);
          }
        } else {
          // Local demo session fallback
          const localProfile: UserProfile = {
            id: 'local_dev_user',
            full_name: 'Dev Verma',
            target_exams: ['SSC_CGL', 'RBI_GRADEB'],
            exam_dates: { xp: 240, current_level: 2 },
            streak_count: 3,
            last_study_date: '2025-01-01T00:00:00.000Z',
            total_study_minutes: 240,
            created_at: '2025-01-01T00:00:00.000Z',
            xp: 240,
            current_level: 2,
          };
          setProfile(localProfile);
          const [trends, topics] = await Promise.all([
            getTrends(supabase, localProfile.target_exams),
            getTopics(supabase)
          ]);
          setTotalAttempted(18);
          setAccuracy(78.5);
          setDbTrends(trends);
          setDbTopics(topics);
        }
      } catch (err) {
        console.warn('Dashboard load fallback notice:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  const handleOnboarding = async () => {
    if (!userName.trim() || !userId) return;
    setLoading(true);
    
    const examList = selectedExams.length > 0 ? selectedExams : ['SSC_CGL'];
    const newProfile = await createUserProfile(supabase, userId, userName.trim(), examList);
    
    if (newProfile) {
      setProfile(newProfile);
      setShowOnboarding(false);
    }
    setLoading(false);
  };

  const toggleExamSelection = (code: string) => {
    setSelectedExams(prev =>
      prev.includes(code) ? prev.filter(e => e !== code) : [...prev, code]
    );
  };

  const handleEditExams = () => {
    if (profile) {
      setEditSelectedExams(profile.target_exams);
      setIsEditingExams(true);
    }
  };

  const handleSaveExams = async () => {
    if (!userId || editSelectedExams.length === 0) {
      alert('Please select at least one exam.');
      return;
    }
    setLoading(true);
    const success = await updateTargetExams(supabase, userId, editSelectedExams);
    if (success && profile) {
      setProfile({ ...profile, target_exams: editSelectedExams });
      setIsEditingExams(false);
    } else {
      alert('Failed to update exams');
    }
    setLoading(false);
  };

  const handleAddToPlanner = async (trend: TrendAnalytics, topicName: string) => {
    if (!userId) return;
    
    // Check if already in plan
    if (studyPlan.some(item => item.topicId === trend.topic_id)) {
      alert(`${topicName} is already in your study plan!`);
      return;
    }
    
    // Find subject for the topic
    const topicData = dbTopics.find(t => t.id === trend.topic_id);
    
    const newItem: StudyPlanItem = {
      id: crypto.randomUUID(),
      topicId: trend.topic_id,
      topicName: topicName,
      subject: topicData?.subject || 'General',
      status: 'todo',
      addedAt: new Date().toISOString()
    };
    
    const newPlan = [...studyPlan, newItem];
    setStudyPlan(newPlan);
    await updateStudyPlan(supabase, userId, newPlan);
    alert(`Added ${topicName} to Study Planner!`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="spinner"></div>
        <style jsx>{`
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(59, 130, 246, 0.1);
            border-left-color: var(--accent-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <div>
        <style jsx>{`
          .onboarding {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            padding: 2rem;
          }
          .onboarding-card {
            max-width: 600px;
            width: 100%;
            padding: 3rem;
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 1.5rem;
            animation: fadeInUp 400ms ease forwards;
          }
          .onboarding-title {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 0.5rem;
          }
          .onboarding-sub {
            color: var(--text-secondary);
            margin-bottom: 2rem;
          }
          .field-label {
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            display: block;
            color: var(--text-secondary);
          }
          .exam-select-grid {
            display: flex;
            flex-wrap: wrap;
            gap: .85rem .95rem;
            margin-bottom: 2rem;
          }
          .exam-select-item {
            display: inline-flex;
            align-items: center;
            gap: .55rem;
            min-height: 48px;
            padding: .45rem 1rem;
            background: #fffdf5;
            border: 2px solid #172033;
            border-radius: 4px 9px 5px 8px;
            box-shadow: 2px 2px 0 #172033;
            cursor: pointer;
            transition: transform 150ms ease, box-shadow 150ms ease, background 150ms ease;
            text-align: left;
            font-family: var(--font-kalam), "Segoe Print", cursive;
            font-size: 1rem;
            font-weight: 700;
          }
          .exam-select-item:hover {
            background: #fff0a7;
            transform: translateY(-1px) rotate(-.4deg);
          }
          .exam-select-item.selected {
            border-color: #172033;
            background: #d9ecff;
            color: #172033;
            transform: translate(2px, 2px) rotate(-.5deg);
            box-shadow: 0 0 0 #172033;
          }
          .exam-select-icon {
            width: 24px;
            height: 24px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border: 2px solid #172033;
            border-radius: 50%;
            background: #5173a5;
            flex: 0 0 auto;
          }
          .exam-select-icon img { width: 100%; height: 100%; object-fit: cover; background: #fff; }
          .exam-select-icon.no-logo::after { content: ''; width: 8px; height: 8px; border: 2px solid #fff; border-radius: 50%; }
          @media (max-width: 600px) {
            .exam-select-grid { grid-template-columns: repeat(2, 1fr); }
          }
        `}</style>
        <div className="onboarding">
          <div className="onboarding-card">
            <div style={{ marginBottom: '1rem' }}><Target size={38} /></div>
            <h1 className="onboarding-title">Welcome to PrepArsenal</h1>
            <p className="onboarding-sub">Let&apos;s set up your exam preparation profile.</p>

            <label className="field-label">Your Name</label>
            <input
              className="input"
              placeholder="Enter your name"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              style={{ marginBottom: '1.5rem' }}
              onKeyDown={e => e.key === 'Enter' && handleOnboarding()}
            />

            <label className="field-label">Select Target Exams</label>
            <div className="exam-select-grid">
              {exams.map(exam => (
                <div
                  key={exam.code}
                  className={`exam-select-item ${selectedExams.includes(exam.code) ? 'selected' : ''}`}
                  onClick={() => toggleExamSelection(exam.code)}
                >
                  <span className={`exam-select-icon ${getExamLogo(exam.code) ? '' : 'no-logo'}`}>
                    {getExamLogo(exam.code) && <Image src={getExamLogo(exam.code)} alt="" width={24} height={24} />}
                  </span>
                  {exam.name}
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleOnboarding}
              disabled={!userName.trim()}
            >
              Start My Preparation →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const targetExamData = profile.target_exams.map(code => exams.find(e => e.code === code)).filter(Boolean);

  // These records are produced only from verified PYQ sources by the ML engine.
  const seenTopics = new Set<string>();
  const uniqueTopTrends = dbTrends.filter(t => {
    if (seenTopics.has(t.topic_id)) return false;
    seenTopics.add(t.topic_id);
    return true;
  }).slice(0, 6);

  return (
    <div suppressHydrationWarning>
      <style jsx>{`
        .dash-header {
          padding: 2rem 2rem 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
        }
        .dash-greeting {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .dash-greeting .name {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .dash-sub {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.25rem;
        }
        .dash-body {
          padding: 2rem;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-box {
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          transition: all 250ms;
        }
        .stat-box:hover {
          border-color: var(--border-default);
          transform: translateY(-2px);
        }
        .stat-box .s-icon { font-size: 1.5rem; margin-bottom: 0.75rem; }
        .stat-box .s-val { font-size: 1.75rem; font-weight: 800; font-family: 'JetBrains Mono', monospace; }
        .stat-box .s-label { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem; }

        .dash-section { margin-bottom: 2rem; }
        .dash-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .target-exams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }
        .target-exam-card {
          padding: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          cursor: pointer;
          transition: all 250ms;
        }
        .target-exam-card:hover {
          border-color: var(--border-default);
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .tec-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .tec-icon { font-size: 1.75rem; }
        .tec-name { font-weight: 700; font-size: 1rem; }
        .tec-category { font-size: 0.7rem; color: var(--text-tertiary); }
        .tec-stat {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-secondary);
          padding: 0.35rem 0;
          border-top: 1px solid var(--border-subtle);
        }
        .tec-stat span:last-child { font-weight: 600; color: var(--text-primary); font-family: 'JetBrains Mono', monospace; }

        .trend-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .trend-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          font-size: 0.85rem;
          transition: all 200ms;
        }
        .trend-pill:hover {
          border-color: var(--accent-blue);
          transform: translateY(-1px);
        }
        .tp-score {
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
        }
        .tp-score.high { background: rgba(16,185,129,0.15); color: #10b981; }
        .tp-score.med { background: rgba(245,158,11,0.15); color: #f59e0b; }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .quick-action {
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          text-align: center;
          cursor: pointer;
          transition: all 250ms;
          text-decoration: none;
          color: inherit;
        }
        .quick-action:hover {
          border-color: var(--border-strong);
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .qa-icon { font-size: 2rem; margin-bottom: 0.5rem; }
        .qa-title { font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem; }
        .qa-sub { font-size: 0.8rem; color: var(--text-secondary); }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .quick-actions { grid-template-columns: 1fr; }
          .dash-body { padding: 1rem; }
        }
        
        .exam-select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .exam-select-item {
          padding: 0.75rem;
          background: var(--bg-input);
          border: 2px solid var(--border-subtle);
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 200ms;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .exam-select-item:hover {
          border-color: var(--border-default);
        }
        .exam-select-item.selected {
          border-color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
        }
        .exam-select-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.25rem;
        }
      `}</style>

      <div className="dash-header">
        <h1 className="dash-greeting">
          Welcome back, <span className="name">{profile.full_name}</span> 👋
        </h1>
        <p className="dash-sub">
          {profile.target_exams.length} target exam{profile.target_exams.length !== 1 ? 's' : ''} •{' '}
          Day {prepDay} of your prep journey
        </p>
      </div>

      <div className="dash-body">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="s-icon">🔥</div>
            <div className="s-val">{profile.streak_count}</div>
            <div className="s-label">Day Streak</div>
          </div>
          <div className="stat-box">
            <div className="s-icon">✅</div>
            <div className="s-val">{totalAttempted}</div>
            <div className="s-label">Questions Attempted</div>
          </div>
          <div className="stat-box">
            <div className="s-icon"><Target size={24} /></div>
            <div className="s-val">{accuracy}%</div>
            <div className="s-label">Overall Accuracy</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-section">
          <h2 className="dash-section-title"><Lightbulb size={21} />Quick Actions</h2>
          <div className="quick-actions">
            <Link href="/practice" className="quick-action">
              <div className="qa-icon"><Clock3 size={21} /></div>
              <div className="qa-title">Practice Questions</div>
              <div className="qa-sub">Timed solving with PYQs</div>
            </Link>
            <Link href="/trends" className="quick-action">
              <div className="qa-icon"><ChartNoAxesCombined size={21} /></div>
              <div className="qa-title">View Trends</div>
              <div className="qa-sub">See what&apos;s most asked</div>
            </Link>
            <Link href="/tutor" className="quick-action">
              <div className="qa-icon"><Bot size={21} /></div>
              <div className="qa-title">Ask AI Tutor</div>
              <div className="qa-sub">Get doubt explanations</div>
            </Link>
          </div>
        </div>

        {/* Target Exams */}
        <div className="dash-section">
          <div className="dash-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span><Target size={19} />Your Target Exams</span>
            {!isEditingExams && (
              <button 
                className="btn" 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                onClick={handleEditExams}
              >
                Edit
              </button>
            )}
          </div>
          
          {isEditingExams ? (
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-subtle)' }}>
              <div className="exam-select-grid">
                {exams.map(exam => (
                  <div
                    key={exam.code}
                    className={`exam-select-item ${editSelectedExams.includes(exam.code) ? 'selected' : ''}`}
                    onClick={() => {
                      setEditSelectedExams(prev =>
                        prev.includes(exam.code) ? prev.filter(e => e !== exam.code) : [...prev, exam.code]
                      );
                    }}
                  >
                    <span className={`exam-select-icon ${getExamLogo(exam.code) ? '' : 'no-logo'}`}>
                      {getExamLogo(exam.code) && <Image src={getExamLogo(exam.code)} alt="" width={24} height={24} />}
                    </span>
                    {exam.name}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button className="btn" onClick={() => setIsEditingExams(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSaveExams}>Save Changes</button>
              </div>
            </div>
          ) : (
            <div className="target-exams-grid">
              {targetExamData.map(exam => {
                if (!exam) return null;
                const examQuestions = getQuestionsByExam(exam.code);
                return (
                  <Link href={`/practice?exam=${exam.code}`} key={exam.code} className="target-exam-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="tec-header">
                      <span className={`tec-icon exam-select-icon ${getExamLogo(exam.code) ? '' : 'no-logo'}`}>
                        {getExamLogo(exam.code) && <Image src={getExamLogo(exam.code)} alt="" width={24} height={24} />}
                      </span>
                      <div>
                        <div className="tec-name">{exam.name}</div>
                        <div className="tec-category">{exam.category}</div>
                      </div>
                    </div>
                    <div className="tec-stat">
                      <span>Questions Available</span>
                      <span>{examQuestions.length}</span>
                    </div>
                    <div className="tec-stat">
                      <span>Pattern</span>
                      <span>{exam.totalQuestions}Q / {exam.totalTime}m</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Trends */}
        <div className="dash-section">
          <h2 className="dash-section-title"><TrendingUp size={21} />High Priority Topics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '-0.75rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
            Ranked from verified PYQ frequency, recency, and difficulty trends.
          </p>
          <div className="trend-pills">
            {uniqueTopTrends.length > 0 ? (
              uniqueTopTrends.map(trend => {
                const topic = dbTopics.find(t => t.id === trend.topic_id);
                if (!topic) return null;
                const isInPlan = studyPlan.some(p => p.topicId === trend.topic_id);
                return (
                  <div key={`${trend.topic_id}-${trend.exam_code}`} className="trend-pill" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`tp-score ${trend.prediction_score >= 80 ? 'high' : 'med'}`}>
                        {trend.prediction_score.toFixed(1)}%
                      </span>
                      <span>{topic.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        {trend.difficulty_trend === 'harder' ? <TrendingUp size={16} /> : trend.difficulty_trend === 'easier' ? <TrendingDown size={16} /> : <span style={{ fontWeight: 800 }}>-</span>}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleAddToPlanner(trend, topic.name)}
                      disabled={isInPlan}
                      style={{ 
                        background: isInPlan ? 'var(--bg-input)' : 'var(--accent-blue)', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '0.5rem', 
                        cursor: isInPlan ? 'default' : 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      {isInPlan ? 'In Plan' : '+ Planner'}
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No verified PYQ trends are available yet. Import tagged PYQs from at least three exam years, then run the ML engine.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
