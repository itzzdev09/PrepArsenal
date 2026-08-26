'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Lenis from 'lenis';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookOpen, Bot, BrainCircuit, CalendarDays, ChevronLeft, ClipboardCheck, FileText, Flame, LayoutDashboard, LogOut, Menu, NotebookPen, ShieldCheck, Sparkles, Target, UserRound, X } from 'lucide-react';
import { signout } from '@/app/login/actions';
import { createClient } from '@/utils/supabase/client';
import { getUserProfile } from '@/lib/db';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }, { label: 'Practice', href: '/practice', icon: ClipboardCheck },
  { label: 'Mock tests', href: '/mock', icon: Target }, { label: 'Study planner', href: '/planner', icon: CalendarDays },
  { label: 'Trend explorer', href: '/trends', icon: BarChart3 }, { label: 'Analytics', href: '/analytics', icon: BrainCircuit },
  { label: 'Notes', href: '/notes', icon: NotebookPen }, { label: 'Formula vault', href: '/vault', icon: BookOpen },
  { label: 'AI tutor', href: '/tutor', icon: Bot }, { label: 'NCERT sprint', href: '/ncert-sprint', icon: FileText },
  { label: 'GK booster', href: '/gk-booster', icon: Sparkles },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Student');
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const sidebarNavRef = useRef<HTMLElement>(null);
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const profile = await getUserProfile(supabase, user.id);
        if (!profile) return;
        setUserName(profile.full_name || 'Student'); setLevel(profile.current_level || 1);
        setStreak(profile.streak_count || 0); setIsAdmin(profile.role === 'admin');
      } catch { /* First-run projects may not yet have a profile. */ }
    }
    loadProfile();
  }, [supabase]);

  useEffect(() => {
    const wrapper = sidebarNavRef.current;
    const content = sidebarContentRef.current;
    if (!wrapper || !content) return;

    const sidebarLenis = new Lenis({
      wrapper,
      content,
      autoRaf: false,
      lerp: 0.11,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      respectReducedMotion: false,
    });
    let animationFrame = 0;
    const raf = (time: number) => {
      sidebarLenis.raf(time);
      animationFrame = requestAnimationFrame(raf);
    };
    animationFrame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrame);
      sidebarLenis.destroy();
    };
  }, []);

  const activeItems = isAdmin ? [...navItems, { label: 'Admin', href: '/admin', icon: ShieldCheck }] : [...navItems, { label: 'Profile', href: '/profile', icon: UserRound }];

  return (
    <div className="sketch-app-shell">
      <style>{`
        .sketch-app-shell{min-height:100vh;background:#f8f2df;color:#172033}.sketch-app-sidebar{position:fixed;inset:0 auto 0 0;z-index:40;width:268px;display:flex;flex-direction:column;background:#fffdf5;border-right:2px solid #172033;box-shadow:5px 0 0 #d9cfb7}.sketch-app-brand{display:flex;align-items:center;gap:.7rem;padding:1.35rem 1.15rem 1.1rem;border-bottom:2px solid #172033;font-family:var(--font-kalam);font-size:1.5rem;font-weight:700;color:#172033;text-decoration:none}.sketch-app-brand svg{color:#d9534f;stroke-width:2.5}.sketch-app-brand small,.app-top-brand small{display:block;margin-top:.08rem;font-family:var(--font-body);font-size:.66rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#5173a5}.sketch-app-profile{margin:1rem;padding:.8rem;display:flex;align-items:center;gap:.65rem;border:2px solid #172033;border-radius:5px 10px 6px 9px;background:#fff0a7;color:#172033;text-decoration:none;box-shadow:3px 3px 0 #172033}.sketch-app-avatar{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border:2px solid #172033;border-radius:50%;background:#9ed5ca;font-family:var(--font-kalam);font-weight:700}.sketch-app-profile-text{min-width:0;flex:1}.sketch-app-profile-name{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:var(--font-kalam);font-size:1rem;font-weight:700}.sketch-app-profile-meta{font-size:.72rem;font-weight:800;color:#536071}.sketch-app-nav{flex:1;overflow-y:auto;padding:.2rem .75rem 1rem}.sketch-app-nav-label{display:block;margin:.8rem .5rem .45rem;color:#7d766a;font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.sketch-app-nav a{position:relative;display:flex;align-items:center;gap:.75rem;min-height:40px;padding:.45rem .65rem;color:#3e4a5a;border:1px solid transparent;border-radius:5px 9px 6px 8px;font-family:var(--font-kalam);font-size:1rem;text-decoration:none;transition:transform 140ms ease,background 140ms ease}.sketch-app-nav a:hover{transform:translateX(2px) rotate(-.3deg);background:#eef5ed;border-color:#172033}.sketch-app-nav a.active{background:#d9ecff;border:2px solid #172033;color:#172033;box-shadow:2px 2px 0 #172033}.sketch-app-nav svg{width:18px;height:18px;stroke-width:2.25}.sketch-app-footer{padding:.9rem;border-top:2px solid #172033}.sketch-app-signout{display:flex;align-items:center;gap:.55rem;width:100%;padding:.45rem .55rem;border:0;background:transparent;color:#9c423c;font-family:var(--font-kalam);font-size:1rem;text-align:left;cursor:pointer}.sketch-app-main{min-height:100vh;margin-left:268px;background:#f8f2df}.sketch-app-topbar{position:sticky;top:0;z-index:25;margin:16px 20px 0;display:flex;align-items:center;justify-content:space-between;min-height:70px;padding:9px 16px;border:3px solid #172033;border-radius:4px 9px 5px 8px;background:#fffdf5;box-shadow:5px 5px 0 #172033}.app-top-brand{display:flex;align-items:center;gap:.7rem;color:#2d6ce2;font-family:var(--font-kalam);font-size:1.55rem;font-weight:700;text-decoration:none}.app-top-brand>span:first-child{width:34px;height:34px;display:grid;place-items:center;border:3px solid #172033;border-radius:50%;background:#fff0a7;color:#2d6ce2}.app-top-brand small{color:#536071}.sketch-app-actions{display:flex;align-items:center;gap:.7rem}.app-top-button{display:inline-flex;align-items:center;gap:.45rem;padding:.6rem .95rem;border:3px solid #172033;border-radius:4px 9px 5px 8px;box-shadow:3px 3px 0 #172033;background:#e8e1d3;color:#172033;font-family:var(--font-kalam);font-size:1.1rem;font-weight:700;text-decoration:none;transition:transform 130ms ease,box-shadow 130ms ease}.app-top-button.tutor{background:#9ed5ca}.app-top-button.primary{background:#ff6964;color:#fff}.app-top-button:hover{transform:translate(2px,2px) rotate(-.4deg);box-shadow:1px 1px 0 #172033}.sketch-app-menu{display:none;width:38px;height:38px;place-items:center;padding:0;border:2px solid #172033;border-radius:6px;background:#fffdf5;color:#172033}.sketch-app-overlay{display:none}@media(max-width:860px){.sketch-app-sidebar{transform:translateX(-110%);transition:transform 180ms ease}.sketch-app-sidebar.open{transform:translateX(0)}.sketch-app-main{margin-left:0}.sketch-app-topbar{margin:10px 12px 0}.sketch-app-menu{display:grid}.sketch-app-overlay{position:fixed;inset:0;z-index:35;display:block;background:rgba(23,32,51,.3);opacity:0;pointer-events:none;transition:opacity 180ms ease}.sketch-app-overlay.open{opacity:1;pointer-events:auto}}@media(max-width:560px){.sketch-app-topbar{min-height:58px;padding:7px 9px}.app-top-brand{font-size:1.2rem}.app-top-brand small{display:none}.app-top-button{padding:.5rem}.app-top-button span{display:none}}
      `}</style>
      <div className={`sketch-app-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sketch-app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link href="/" className="sketch-app-brand" onClick={() => setSidebarOpen(false)}><ChevronLeft aria-hidden="true" /><span>PrepArsenal<small>Study desk</small></span></Link>
        <Link href="/profile" className="sketch-app-profile" onClick={() => setSidebarOpen(false)}><span className="sketch-app-avatar">{userName.charAt(0).toUpperCase()}</span><span className="sketch-app-profile-text"><span className="sketch-app-profile-name">{userName}</span><span className="sketch-app-profile-meta">Level {level} learner</span></span><ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} /></Link>
        <nav className="sketch-app-nav" data-lenis-prevent ref={sidebarNavRef}><div className="sketch-app-nav-content" ref={sidebarContentRef}><span className="sketch-app-nav-label">Your prep kit</span>{activeItems.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={pathname === href ? 'active' : ''} onClick={() => setSidebarOpen(false)}><Icon aria-hidden="true" /><span>{label}</span></Link>)}</div></nav>
        <div className="sketch-app-footer"><form><button className="sketch-app-signout" formAction={signout}><LogOut size={17} />Sign out</button></form></div>
      </aside>
      <div className="sketch-app-main"><header className="sketch-app-topbar"><div className="sketch-app-actions"><button className="sketch-app-menu" type="button" onClick={() => setSidebarOpen(value => !value)} aria-label="Toggle navigation">{sidebarOpen ? <X /> : <Menu />}</button><Link href="/" className="app-top-brand"><span><Target size={21} /></span><span>PrepArsenal<small>Prep / {activeItems.find(item => item.href === pathname)?.label || 'Study desk'}</small></span></Link></div><nav className="sketch-app-actions" aria-label="Quick navigation"><Link href="/trends" className="app-top-button"><BarChart3 size={18} /><span>Trends</span></Link><Link href="/tutor" className="app-top-button tutor"><Bot size={18} /><span>Ask tutor</span></Link><Link href="/practice" className="app-top-button primary"><Sparkles size={18} /><span>Practice now</span></Link></nav></header>{children}</div>
    </div>
  );
}
