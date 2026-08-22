'use client';

import { useState } from 'react';
import { exams } from '@/lib/data';
import Link from 'next/link';
import {
  Sparkles,
  TrendingUp,
  Timer,
  FileText,
  CalendarDays,
  Bot,
  BarChart3,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CyberGridBackground, TopographicWavesBackground, NeonGlowOrbs } from '@/lib/haikei-backgrounds';
import { SpotlightCard } from '@/components/ui/motion/SpotlightCard';
import { AnimatedNumber } from '@/components/ui/motion/AnimatedNumber';
import { GlowBadge } from '@/components/ui/motion/GlowBadge';
import { CyberButton } from '@/components/ui/motion/CyberButton';
import { TextScramble } from '@/components/ui/motion/TextScramble';

export default function LandingPage() {
  const [hoveredExam, setHoveredExam] = useState<string | null>(null);

  const features = [
    {
      icon: TrendingUp,
      title: 'Trend Prediction Engine',
      description: 'Neural pattern analysis across 10+ years of official PYQs. Pinpoint topic frequencies, cycle shifts, and high-probability question clusters.',
      color: '#3b82f6',
      tag: 'NEURAL ML',
    },
    {
      icon: Timer,
      title: 'Adaptive Practice Arena',
      description: 'Precision timed simulation mode with real exam constraints, spaced repetition intervals, and automatic weak-spot telemetry.',
      color: '#10b981',
      tag: 'ALGORITHMIC DRILL',
    },
    {
      icon: BookOpen,
      title: 'NCERT Sprint System',
      description: 'Comprehensive, exam-grade notes across Polity, History, Geography, Economics, and Science cross-referenced to exact PYQs.',
      color: '#06b6d4',
      tag: 'CURATED KNOWLEDGE',
    },
    {
      icon: Bot,
      title: 'AI Cognitive Tutor',
      description: 'Instant multi-step explanations, alternative shortcuts, and elimination heuristics tailored specifically to Indian government exams.',
      color: '#8b5cf6',
      tag: 'COGNITIVE ASSIST',
    },
    {
      icon: BarChart3,
      title: 'Readiness Telemetry',
      description: 'Live mastery heatmaps, accuracy velocity, time-per-question metrics, and empirical percentile projections.',
      color: '#ec4899',
      tag: 'DATA INTELLIGENCE',
    },
    {
      icon: CalendarDays,
      title: 'Dynamic Study Planner',
      description: 'Intelligent multi-exam milestone scheduler that recalibrates continuously based on your daily practice pace and target dates.',
      color: '#f59e0b',
      tag: 'ADAPTIVE TIMELINE',
    },
  ];

  const stats = [
    { value: 65, label: 'Verified PYQs', sub: 'Indexed & Categorized', suffix: '+' },
    { value: 9, label: 'Major Exam Tracks', sub: 'SSC, RBI, SEBI, RRB, UPSC', suffix: '' },
    { value: 50, label: 'Core GK & Aptitude Topics', sub: 'With Trend Weightage', suffix: '+' },
    { value: 100, label: 'Free & Open Architecture', sub: 'Zero Paywalls', suffix: '%' },
  ];

  return (
    <div className="relative min-h-screen bg-[#060a14] text-[#f0f4ff] selection:bg-blue-500/30">
      {/* Generative Haikei Backgrounds */}
      <CyberGridBackground opacity={0.35} />
      <TopographicWavesBackground />
      <NeonGlowOrbs />

      {/* Cyber Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-[rgba(59,130,246,0.15)] bg-[#060a14]/80 px-6 py-4 backdrop-blur-2xl md:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-[1px] shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#070c18]">
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              PrepArsenal
            </span>
            <span className="hidden rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 font-mono text-[0.65rem] font-bold text-blue-400 sm:inline-block">
              V2.4
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border border-transparent px-4 py-2 text-xs font-semibold text-[#94a3c0] transition-colors hover:border-blue-500/30 hover:bg-white/[0.04] hover:text-white"
          >
            Terminal
          </Link>
          <Link href="/dashboard">
            <CyberButton variant="primary" size="sm">
              <span>Launch Platform</span>
              <ArrowRight size={14} />
            </CyberButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-4 pt-32 pb-16 text-center">
        {/* Manus.im Telemetry Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <GlowBadge variant="cyan" size="md">
            ● AI-POWERED GOVT EXAM INTELLIGENCE MATRIX
          </GlowBadge>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-4xl font-extrabold tracking-tight text-4xl sm:text-6xl md:text-7xl"
        >
          Stop Guessing.{' '}
          <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Predict Exactly
          </span>{' '}
          What Gets Asked.
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base leading-relaxed text-[#94a3c0] sm:text-lg"
        >
          High-performance preparation architecture for Indian competitive exams. Decodes 10+ years
          of previous year papers to surface core pattern vectors, topic frequencies, and adaptive
          study pathways.
        </motion.p>

        {/* Hero Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <CyberButton variant="glow" size="lg" icon={<Zap size={18} />}>
              Start Free Preparation
            </CyberButton>
          </Link>
          <Link href="/ncert-sprint">
            <CyberButton variant="secondary" size="lg" icon={<BookOpen size={18} />}>
              Explore NCERT Sprint
            </CyberButton>
          </Link>
        </motion.div>

        {/* Target Exams Cyber Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-14 flex max-w-3xl flex-wrap justify-center gap-2"
        >
          {exams.map((exam) => (
            <div
              key={exam.code}
              onMouseEnter={() => setHoveredExam(exam.code)}
              onMouseLeave={() => setHoveredExam(null)}
              className="group flex cursor-default items-center gap-2 rounded-full border border-[rgba(59,130,246,0.18)] bg-[rgba(15,22,41,0.6)] px-3.5 py-1.5 backdrop-blur-md transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <span className="text-sm">{exam.icon}</span>
              <span className="text-xs font-semibold text-[#94a3c0] group-hover:text-[#f0f4ff]">
                {exam.name}
              </span>
              {hoveredExam === exam.code && (
                <span className="font-mono text-[0.65rem] font-bold text-cyan-400">
                  {exam.totalQuestions}Q • {exam.totalTime}m
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </section>

      {/* High-Tech Terminal Simulation Box */}
      <section className="relative z-10 px-4 py-8 max-w-5xl mx-auto">
        <div className="overflow-hidden rounded-2xl border border-[rgba(59,130,246,0.25)] bg-[#0b1120]/90 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between border-b border-[rgba(59,130,246,0.15)] bg-[#070c18] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-[#5a6a8a]">
                preparsenall-ai-matrix --live-telemetry
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[0.7rem] text-cyan-400">
              <Activity size={13} className="animate-pulse" />
              <span>COGNITIVE CORE ACTIVE</span>
            </div>
          </div>

          {/* Terminal Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[rgba(59,130,246,0.15)] p-6 gap-6 font-mono text-xs">
            <div>
              <div className="text-[#5a6a8a] uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                <span>Pattern Detection</span>
                <span className="text-emerald-400">99.4%</span>
              </div>
              <div className="space-y-1.5 text-[#94a3c0]">
                <div className="flex justify-between">
                  <span>Indian Polity (Art. 12–35):</span>
                  <span className="text-white font-bold">18.4% wt</span>
                </div>
                <div className="flex justify-between">
                  <span>Modern History (1857-1947):</span>
                  <span className="text-white font-bold">14.2% wt</span>
                </div>
                <div className="flex justify-between">
                  <span>Monetary Policy & RBI:</span>
                  <span className="text-white font-bold">12.8% wt</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[#5a6a8a] uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                <span>Spaced Repetition</span>
                <span className="text-cyan-400">FSRS Engine</span>
              </div>
              <div className="space-y-1.5 text-[#94a3c0]">
                <div className="flex justify-between">
                  <span>Recall Retention:</span>
                  <span className="text-emerald-400 font-bold">92.6%</span>
                </div>
                <div className="flex justify-between">
                  <span>Optimal Interval:</span>
                  <span className="text-white font-bold">3.8 Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Weakness Mitigation:</span>
                  <span className="text-cyan-300 font-bold">Real-time</span>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[#5a6a8a] uppercase tracking-wider mb-2 font-bold flex items-center justify-between">
                <span>Exam Target Sync</span>
                <span className="text-purple-400">Multi-Tier</span>
              </div>
              <div className="space-y-1.5 text-[#94a3c0]">
                <div className="flex justify-between">
                  <span>SSC CGL Tier 1 & 2:</span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                <div className="flex justify-between">
                  <span>RBI Grade B Phase 1:</span>
                  <span className="text-emerald-400 font-bold">READY</span>
                </div>
                <div className="flex justify-between">
                  <span>RRB NTPC & UPSC:</span>
                  <span className="text-emerald-400 font-bold">SYNCED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative z-10 border-y border-[rgba(59,130,246,0.12)] bg-[#070c18]/80 px-6 py-12 backdrop-blur-md">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-mono text-3xl font-extrabold sm:text-4xl bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-xs font-bold uppercase tracking-wider text-[#f0f4ff]">
                {stat.label}
              </div>
              <div className="mt-0.5 text-[0.7rem] text-[#5a6a8a]">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section with Watermelon SpotlightCards */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <div className="mb-3 flex justify-center">
            <GlowBadge variant="purple" size="sm">
              MODULAR ARCHITECTURE
            </GlowBadge>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Engineered for Precision Prep.
          </h2>
          <p className="mt-4 mx-auto max-w-2xl text-sm leading-relaxed text-[#94a3c0] sm:text-base">
            Every feature is purpose-built to eliminate cognitive fatigue and maximize mark-per-minute
            yield across all phases of your competitive exam journey.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <SpotlightCard
                key={i}
                spotlightColor={`${feature.color}25`}
                borderColor={`${feature.color}60`}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: `${feature.color}15`,
                        border: `1px solid ${feature.color}30`,
                        color: feature.color,
                        boxShadow: `0 0 20px ${feature.color}20`,
                      }}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      className="rounded-full px-2.5 py-0.5 font-mono text-[0.62rem] font-bold tracking-wider"
                      style={{
                        backgroundColor: `${feature.color}12`,
                        color: feature.color,
                        border: `1px solid ${feature.color}30`,
                      }}
                    >
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#f0f4ff]">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#94a3c0]">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold" style={{ color: feature.color }}>
                  <span>Deploy Component</span>
                  <ArrowRight size={13} />
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[rgba(59,130,246,0.3)] bg-gradient-to-b from-[#0c1326] to-[#070b14] p-10 text-center shadow-[0_0_80px_rgba(59,130,246,0.15)] md:p-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          
          <div className="mb-4 flex justify-center">
            <GlowBadge variant="emerald" size="sm">
              ZERO RESTRICTIONS • 100% FREE
            </GlowBadge>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            Upgrade Your Preparation Matrix.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#94a3c0] sm:text-base">
            No subscriptions. No locked tiers. Access the full intelligence engine, PYQ trend
            predictions, and NCERT revision notes immediately.
          </p>

          <div className="mt-8 flex justify-center">
            <Link href="/dashboard">
              <CyberButton variant="glow" size="lg" icon={<Zap size={20} />}>
                Launch PrepArsenal Now
              </CyberButton>
            </Link>
          </div>
        </div>
      </section>

      {/* High-Tech Footer */}
      <footer className="relative z-10 border-t border-[rgba(59,130,246,0.12)] bg-[#050810] px-6 py-10 text-center text-xs text-[#5a6a8a]">
        <div className="flex items-center justify-center gap-2 font-mono text-[0.7rem] text-[#94a3c0]">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PREPARSENAL INTELLIGENCE PLATFORM • BUILT BY ASPIRANTS FOR ASPIRANTS</span>
        </div>
        <div className="mt-2 text-[0.65rem] text-[#5a6a8a]">
          Open access knowledge architecture for SSC, Banking, Railways, and UPSC aspirants.
        </div>
      </footer>
    </div>
  );
}
