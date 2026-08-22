'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signout } from '@/app/login/actions';

const navItems = [
  { label: 'Dashboard', icon: '📊', href: '/dashboard' },
  { label: 'Analytics', icon: '📈', href: '/analytics' },
  { label: 'Practice Arena', icon: '⏱️', href: '/practice' },
  { label: 'Mock Tests', icon: '🎯', href: '/mock' },
  { label: 'Smart Planner', icon: '📅', href: '/planner' },
  { label: 'Smart Notes', icon: '📝', href: '/notes' },
  { label: 'Formula Vault', icon: '⚡', href: '/vault' },
  { label: 'Trend Explorer', icon: '🧠', href: '/trends' },
  { label: 'AI Tutor', icon: '🤖', href: '/tutor' },
];

const comingSoonItems: any[] = [];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <style jsx>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 25;
          width: 40px;
          height: 40px;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
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
            background: rgba(0,0,0,0.5);
            z-index: 19;
            opacity: 0;
            pointer-events: none;
            transition: opacity 250ms;
          }
          .sidebar-overlay.visible {
            opacity: 1;
            pointer-events: auto;
          }
        }

        .sidebar-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border-subtle);
        }

        .sidebar-footer-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-tertiary);
          transition: color 150ms;
        }

        .sidebar-footer-link:hover {
          color: var(--text-secondary);
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

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main</span>
          {navItems.map(item => (
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

          {comingSoonItems.length > 0 && (
            <>
              <span className="sidebar-section-label" style={{ marginTop: '0.5rem' }}>Coming Soon</span>
              {comingSoonItems.map(item => (
                <div
                  key={item.label}
                  className="nav-item"
                  style={{ opacity: 0.4, cursor: 'not-allowed' }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="nav-badge" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.65rem' }}>
                    SOON
                  </span>
                </div>
              ))}
            </>
          )}
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

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
