'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signout } from '@/app/login/actions';
import {
  LayoutDashboard,
  BarChart3,
  Timer,
  Target,
  CalendarDays,
  FileText,
  Zap,
  TrendingUp,
  Bot,
  BookOpen,
  LogOut,
  Sparkles,
  ShieldCheck,
  Activity,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: '#3b82f6' },
  { label: 'Analytics', icon: BarChart3, href: '/analytics', color: '#8b5cf6' },
  { label: 'Practice Arena', icon: Timer, href: '/practice', color: '#10b981' },
  { label: 'Mock Tests', icon: Target, href: '/mock', color: '#f59e0b' },
  { label: 'Smart Planner', icon: CalendarDays, href: '/planner', color: '#ec4899' },
  { label: 'Smart Notes', icon: FileText, href: '/notes', color: '#06b6d4' },
  { label: 'Formula Vault', icon: Zap, href: '/vault', color: '#eab308' },
  { label: 'Trend Explorer', icon: TrendingUp, href: '/trends', color: '#a855f7' },
  { label: 'AI Tutor', icon: Bot, href: '/tutor', color: '#3b82f6', badge: 'AI' },
  { label: 'NCERT Sprint', icon: BookOpen, href: '/ncert-sprint', color: '#14b8a6', badge: 'NEW' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell relative min-h-screen bg-[#060a14] text-[#f0f4ff]">
      <style jsx>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 40;
          width: 42px;
          height: 42px;
          background: rgba(15, 22, 41, 0.85);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 0.6rem;
          align-items: center;
          justify-content: center;
          color: #f0f4ff;
          cursor: pointer;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
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
            background: rgba(6, 10, 20, 0.75);
            backdrop-filter: blur(8px);
            z-index: 30;
            opacity: 0;
            pointer-events: none;
            transition: opacity 250ms ease;
          }
          .sidebar-overlay.visible {
            opacity: 1;
            pointer-events: auto;
          }
        }
      `}</style>

      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Cybernetic High-Tech Sidebar */}
      <aside
        className={`sidebar fixed top-0 bottom-0 left-0 z-30 flex w-[260px] flex-col border-r border-[rgba(59,130,246,0.12)] bg-[#070c18]/95 backdrop-blur-2xl transition-transform duration-300 ${
          sidebarOpen ? 'open translate-x-0' : 'max-md:-translate-x-full'
        }`}
        style={{
          boxShadow: '4px 0 30px rgba(0,0,0,0.6)',
        }}
      >
        {/* Subtle dot matrix overlay in sidebar header */}
        <div className="relative border-b border-[rgba(59,130,246,0.12)] p-5">
          <Link
            href="/"
            className="group flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-transform duration-300 group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#070c18]">
                <Sparkles className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-lg text-transparent">
                  PrepArsenal
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[0.65rem] font-semibold text-blue-400/80">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>AI ENGINE V2.4</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 font-mono text-[0.68rem] font-bold uppercase tracking-widest text-[#5a6a8a]">
            Core Modules
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600/15 text-white shadow-[inset_0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/30'
                      : 'text-[#94a3c0] hover:bg-white/[0.04] hover:text-[#f0f4ff] border border-transparent'
                  }`}
                >
                  {/* Active Neon Bar */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_12px_#38bdf8]"
                      aria-hidden="true"
                    />
                  )}

                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-500/20 text-cyan-300 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                          : 'bg-white/[0.03] text-[#5a6a8a] group-hover:bg-white/[0.08] group-hover:text-blue-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[0.62rem] font-extrabold tracking-wider ${
                        item.badge === 'AI'
                          ? 'bg-blue-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Manus.im Telemetry Status Box */}
        <div className="border-t border-[rgba(59,130,246,0.1)] p-3.5">
          <div className="mb-3 rounded-xl border border-blue-500/15 bg-blue-950/20 p-3 backdrop-blur-md">
            <div className="flex items-center justify-between text-[0.7rem] font-mono text-blue-400">
              <span className="flex items-center gap-1.5">
                <Radio size={12} className="text-emerald-400 animate-pulse" />
                <span>TELEMETRY</span>
              </span>
              <span className="text-emerald-400 font-bold">OPTIMAL</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.65rem] font-mono text-[#5a6a8a]">
              <span>LATENCY: 18ms</span>
              <span>SYNC: 100%</span>
            </div>
          </div>

          {/* Sign Out Action */}
          <form>
            <button
              formAction={signout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#5a6a8a] transition-colors duration-200 hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut size={15} />
              <span>Disconnect Session</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content flex-1 md:ml-[260px] min-h-screen">
        {children}
      </main>
    </div>
  );
}

