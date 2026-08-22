'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getUserAnalytics } from '@/lib/db';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        const result = await getUserAnalytics(supabase, authData.user.id);
        setData(result);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <h2>Loading Analytics...</h2>
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>No analytics data found.</h2>
        <p>Please take some mock tests to generate statistics.</p>
      </div>
    );
  }

  const { profile, reviews } = data;
  const xp = profile.xp || 0;
  const level = profile.current_level || 1;
  const nextLevelXp = level * 100;
  const progressPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  // Process Subject Accuracy
  const subjectStats: Record<string, { total: number; correct: number }> = {};
  const activityStats: Record<string, number> = {};

  reviews.forEach((r: any) => {
    // Subjects
    const sub = r.questions?.subject || 'Unknown';
    if (!subjectStats[sub]) subjectStats[sub] = { total: 0, correct: 0 };
    subjectStats[sub].total += 1;
    if (r.is_correct) subjectStats[sub].correct += 1;

    // Activity
    const dateStr = new Date(r.last_reviewed_at).toISOString().split('T')[0];
    activityStats[dateStr] = (activityStats[dateStr] || 0) + 1;
  });

  const radarData = Object.keys(subjectStats).map(sub => ({
    subject: sub.split(' ')[0], // abbreviate
    accuracy: Math.round((subjectStats[sub].correct / subjectStats[sub].total) * 100),
    fullMark: 100,
  }));

  const lineData = Object.keys(activityStats).sort().map(date => ({
    date: date.slice(5), // MM-DD
    questions: activityStats[date]
  }));

  return (
    <div className="analytics-container">
      <style jsx>{`
        .analytics-container {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header { margin-bottom: 2rem; }
        .header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .header p { color: var(--text-secondary); }
        
        .xp-card {
          background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1));
          border: 1px solid var(--border-default);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .level-badge {
          background: var(--bg-card);
          border: 2px solid var(--accent-blue);
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 20px rgba(59,130,246,0.2);
        }
        .level-badge .lbl { font-size: 0.7rem; color: var(--text-tertiary); text-transform: uppercase; font-weight: 700; }
        .level-badge .val { font-size: 1.8rem; font-weight: 800; color: var(--accent-blue); }
        
        .progress-section {
          flex: 1;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }
        .progress-bar-bg {
          height: 12px;
          background: var(--bg-input);
          border-radius: 6px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-blue), #8b5cf6);
          border-radius: 6px;
          transition: width 1s ease-out;
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .chart-title {
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        
        @media (max-width: 768px) {
          .charts-grid { grid-template-columns: 1fr; }
          .xp-card { flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="header">
        <h1>📊 Performance Analytics</h1>
        <p>Track your accuracy, activity, and XP progression.</p>
      </div>

      <div className="xp-card">
        <div className="level-badge">
          <div className="lbl">Level</div>
          <div className="val">{level}</div>
        </div>
        <div className="progress-section">
          <div className="progress-header">
            <span>Prep Scholar Rank</span>
            <span>{xp} / {nextLevelXp} XP</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            Earn 10 XP for every correct mock test answer!
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Subject Accuracy (Radar)</div>
          {radarData.length > 0 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Accuracy %" dataKey="accuracy" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--text-tertiary)' }}>Not enough data yet.</p>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Activity Timeline</div>
          {lineData.length > 0 ? (
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <YAxis stroke="var(--text-tertiary)" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-default)' }} />
                  <Line type="monotone" dataKey="questions" name="Questions" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={{ color: 'var(--text-tertiary)' }}>Not enough data yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
