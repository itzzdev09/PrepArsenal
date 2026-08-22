'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signout } from '@/app/login/actions';
import { createClient } from '@/utils/supabase/client';
import { getUserProfile, type UserProfile } from '@/lib/db';

const baseNavItems = [
  { label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { label: 'Analytics', icon: '📈', href: '/analytics' },
  { label: 'Practice Arena', icon: '⏱️', href: '/practice' },
  { label: 'Mock Tests', icon: '🎯', href: '/mock' },
  { label: 'Smart Planner', icon: '📅', href: '/planner' },
  { label: 'Smart Notes', icon: '📝', href: '/notes' },
  { label: 'Formula Vault', icon: '⚡', href: '/vault' },
  { label: 'Trend Explorer', icon: '🧠', href: '/trends' },
  { label: 'AI Tutor', icon: '🤖', href: '/tutor' },
  { label: 'NCERT Sprint', icon: '📚', href: '/ncert-sprint' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<'user' | 'admin'>('user');
  const [userName, setUserName] = useState('Dev Verma');
  const [userEmail, setUserEmail] = useState('aspirant@preparsenal.ai');
  const [userLevel, setUserLevel] = useState(2);
  const [userXp, setUserXp] = useState(240);

  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('user_full_name');
      const savedRole = localStorage.getItem('app_user_role') as 'user' | 'admin' | null;
      if (savedName) setUserName(savedName);
      if (savedRole === 'admin' || savedRole === 'user') setUserRole(savedRole);
    }

    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          if (user.email) setUserEmail(user.email);
          const p = await getUserProfile(supabase, user.id);
          if (p) {
            if (p.full_name) setUserName(p.full_name);
            if (p.current_level) setUserLevel(p.current_level);
            if (p.xp) setUserXp(p.xp);
            if (p.role === 'admin' || user.email?.includes('admin')) {
              setUserRole('admin');
              localStorage.setItem('app_user_role', 'admin');
            }
          }
        }
      } catch (err) {
        console.warn('Layout user fetch notice:', err);
      }
    }
    checkUser();
  }, [supabase]);

  const toggleRole = () => {
    const nextRole = userRole === 'admin' ? 'user' : 'admin';
    setUserRole(nextRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_user_role', nextRole);
    }
  };

  // Role-specific navigation items
  const activeNavItems = [
    ...baseNavItems,
    ...(userRole === 'admin' 
      ? [{ label: 'Admin Portal', icon: '⚙️', href: '/admin' }]
      : [{ label: 'My Profile', icon: '👤', href: '/profile' }]
    ),
  ];

  return (
    <div className="app-shell" suppressHydrationWarning>
      <style jsx>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 0.85rem;
          left: 1rem;
          z-index: 35;
          width: 38px;
          height: 38px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 29;
            opacity: 0;
            pointer-events: none;
            transition: opacity 250ms;
          }
          .sidebar-overlay.visible {
            opacity: 1;
            pointer-events: auto;
          }
        }

        .top-global-header {
          height: 60px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .role-switch-badge {
          padding: 0.3rem 0.65rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid var(--border-subtle);
          background: var(--bg-card);
          color: var(--text-secondary);
          transition: all 150ms;
        }
        .role-switch-badge:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .top-profile-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.35rem 0.85rem 0.35rem 0.45rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 9999px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 150ms;
        }
        .top-profile-pill:hover {
          border-color: var(--accent-blue);
          background: rgba(59,130,246,0.08);
          transform: translateY(-1px);
        }

        .pill-avatar {
          width: 30px;
          height: 30px;
          background: var(--gradient-hero);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.82rem;
          color: white;
        }
        .pill-avatar.admin {
          background: linear-gradient(135deg, #ef4444, #8b5cf6);
        }

        .pill-name {
          font-size: 0.85rem;
          font-weight: 700;
        }

        .pill-badge {
          font-size: 0.65rem;
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          padding: 0.1rem 0.4rem;
          border-radius: 0.25rem;
          font-weight: 800;
        }
        .pill-badge.admin {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }

        .quick-nav-btn {
          padding: 0.4rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 150ms;
        }
        .quick-nav-btn:hover {
          border-color: var(--border-default);
          color: var(--text-primary);
        }

        /* Sidebar Profile Card */
        .sidebar-profile-card {
          margin: 0.75rem;
          padding: 0.85rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 150ms;
        }
        .sidebar-profile-card:hover {
          border-color: var(--accent-blue);
          background: rgba(59,130,246,0.06);
        }

        .sp-avatar {
          width: 36px;
          height: 36px;
          background: var(--gradient-hero);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.95rem;
          color: white;
          flex-shrink: 0;
        }
        .sp-avatar.admin {
          background: linear-gradient(135deg, #ef4444, #8b5cf6);
        }

        .sp-info {
          flex: 1;
          overflow: hidden;
        }

        .sp-name {
          font-size: 0.85rem;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sp-sub {
          font-size: 0.7rem;
          color: var(--text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-footer {
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border-subtle);
        }

        .sidebar-footer-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-tertiary);
          transition: color 150ms;
        }
        .sidebar-footer-link:hover { color: var(--error); }

        @media (max-width: 768px) {
          .top-global-header { padding: 0 1rem 0 3.5rem; }
          .pill-name { display: none; }
        }
      `}</style>

      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
            <span>⚔️</span>
            <span>PrepArsenal</span>
          </Link>
        </div>

        {/* Dynamic Sidebar Profile Card matching Role */}
        <Link
          href={userRole === 'admin' ? '/admin' : '/profile'}
          className="sidebar-profile-card"
          onClick={() => setSidebarOpen(false)}
        >
          <div className={`sp-avatar ${userRole === 'admin' ? 'admin' : ''}`}>
            {userRole === 'admin' ? '🛡️' : (userName ? userName.charAt(0).toUpperCase() : '👤')}
          </div>
          <div className="sp-info">
            <div className="sp-name">
              {userRole === 'admin' ? 'Administrator' : userName}
            </div>
            <div className="sp-sub">
              {userRole === 'admin' ? 'System & Question Control' : `Level ${userLevel} • ${userXp} XP 🎖️`}
            </div>
          </div>
          <span style={{ fontSize: '0.75rem', color: userRole === 'admin' ? 'var(--error)' : 'var(--accent-blue)' }}>
            ⚙️
          </span>
        </Link>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Navigation</span>
          {activeNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <form>
            <button
              formAction={signout}
              className="sidebar-footer-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', width: '100%', textAlign: 'left' }}
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content with Top Global Header Bar */}
      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'auto' }}>
        <header className="top-global-header">
          <div className="header-left">
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              ⚔️ PrepArsenal Platform
            </span>
          </div>

          <div className="header-right">
            {/* Role Switcher Button for Instant Testing */}
            <button
              className="role-switch-badge"
              onClick={toggleRole}
              title="Click to switch between Student and Admin views"
            >
              {userRole === 'admin' ? '🛡️ Admin Mode (Click for Student)' : '🎓 Student Mode (Click for Admin)'}
            </button>

            <Link href="/tutor" className="quick-nav-btn" title="AI Tutor">
              <span>🤖</span>
              <span>AI Tutor</span>
            </Link>

            {/* Role-Specific Header Pill */}
            {userRole === 'admin' ? (
              <Link href="/admin" className="top-profile-pill" title="Admin Portal">
                <div className="pill-avatar admin">🛡️</div>
                <span className="pill-name">Admin Portal</span>
                <span className="pill-badge admin">ADMIN</span>
              </Link>
            ) : (
              <Link href="/profile" className="top-profile-pill" title="My Account Profile">
                <div className="pill-avatar">
                  {userName ? userName.charAt(0).toUpperCase() : '👤'}
                </div>
                <span className="pill-name">{userName}</span>
                <span className="pill-badge">Lvl {userLevel}</span>
              </Link>
            )}
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
