'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NCERT_CLASSWISE_SCOPE, NCERT_QUESTION_TEXTS, NCERT_TRACKS, type NcertChapter } from '@/lib/ncert-booster';
import { getQuestionMatchesByText, type QuestionTextMatch } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
  HelpCircle,
  BookmarkCheck,
  ChevronRight,
  Layers,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberGridBackground, TopographicWavesBackground } from '@/lib/haikei-backgrounds';
import { AnimatedTabs } from '@/components/ui/motion/AnimatedTabs';
import { GlowBadge } from '@/components/ui/motion/GlowBadge';
import { CyberButton } from '@/components/ui/motion/CyberButton';
import { SpotlightCard } from '@/components/ui/motion/SpotlightCard';

export default function NcertSprintPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [trackId, setTrackId] = useState(NCERT_TRACKS[0].id);
  const [chapterId, setChapterId] = useState(NCERT_TRACKS[0].chapters[0].id);
  const [matches, setMatches] = useState<QuestionTextMatch[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const track = NCERT_TRACKS.find(item => item.id === trackId) ?? NCERT_TRACKS[0];
  const chapter: NcertChapter = track.chapters.find(item => item.id === chapterId) ?? track.chapters[0];
  const classScope = NCERT_CLASSWISE_SCOPE.filter(item => item.subject === track.subject);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
    }
    load();
  }, [router, supabase]);

  useEffect(() => {
    getQuestionMatchesByText(supabase, NCERT_QUESTION_TEXTS).then(setMatches);
  }, [supabase]);

  const chooseTrack = (id: string) => {
    const nextTrack = NCERT_TRACKS.find(item => item.id === id) ?? NCERT_TRACKS[0];
    setTrackId(nextTrack.id);
    setChapterId(nextTrack.chapters[0].id);
  };

  const questionMatches = (questionText: string) => matches.filter(match => match.question_text === questionText);

  const subjectTabs = NCERT_TRACKS.map(t => ({
    id: t.id,
    label: t.subject,
    badge: t.chapters.length,
  }));

  return (
    <div className="relative min-h-screen p-6 md:p-10">
      <CyberGridBackground opacity={0.25} />
      <TopographicWavesBackground />

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header telemetry badge & titles */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <GlowBadge variant="cyan" size="sm">
              NCERT SPRINT • STATIC GK CORE
            </GlowBadge>
            <span className="font-mono text-xs text-[#5a6a8a]">
              TRACKS: {NCERT_TRACKS.length} • TOTAL CHAPTERS: {NCERT_TRACKS.reduce((acc, t) => acc + t.chapters.length, 0)}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#f0f4ff]">
            NCERT Sprint System
          </h1>
          <p className="mt-2 max-w-3xl text-sm md:text-base text-[#94a3c0] leading-relaxed">
            Chapter-wise revision designed specifically for Indian competitive exams. Revise exam-grade
            notes, verify concepts with active recall drills, and inspect exact PYQ cross-references.
          </p>

          {/* Subject Tab Bar */}
          <div className="mt-6">
            <AnimatedTabs
              tabs={subjectTabs}
              activeTab={trackId}
              onChange={chooseTrack}
              layoutId="ncert-track-tab"
            />
          </div>
        </div>

        {/* 2-Column High-Tech Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chapter Selector Sidebar */}
          <aside className="lg:col-span-4 rounded-2xl border border-[rgba(59,130,246,0.15)] bg-[#0b1120]/80 p-3 backdrop-blur-xl max-h-[750px] overflow-y-auto">
            <div className="px-3 py-2 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-[#5a6a8a] border-b border-[rgba(59,130,246,0.1)] mb-2 flex justify-between items-center">
              <span>{track.subject} Chapters</span>
              <span className="text-cyan-400">{track.chapters.length} Modules</span>
            </div>

            <div className="space-y-1">
              {track.chapters.map((item) => {
                const isActive = item.id === chapter.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setChapterId(item.id)}
                    className={`w-full group flex items-start gap-3 rounded-xl p-3 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600/15 border border-blue-500/40 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                        : 'border border-transparent hover:bg-white/[0.04] text-[#94a3c0] hover:text-[#f0f4ff]'
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]'
                          : 'bg-white/[0.05] text-[#5a6a8a] group-hover:bg-white/[0.1] group-hover:text-blue-400'
                      }`}
                    >
                      {item.order}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight truncate">{item.title}</div>
                      <div className="text-[0.65rem] text-[#5a6a8a] truncate mt-0.5">{item.book}</div>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-cyan-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Chapter Content & Revision Workspace */}
          <section className="lg:col-span-8 space-y-6">
            {/* Chapter Header Card */}
            <SpotlightCard className="p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    {track.subject} • Chapter {chapter.order}
                  </div>
                  <h2 className="mt-1 text-2xl md:text-3xl font-extrabold tracking-tight text-[#f0f4ff]">
                    {chapter.title}
                  </h2>
                </div>
                <a
                  href={track.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 font-mono text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors"
                >
                  <span>NCERT Catalogue</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="mt-4 rounded-xl border border-[rgba(59,130,246,0.12)] bg-[#070c18]/60 p-3.5 text-xs text-[#94a3c0] space-y-1">
                <div>
                  <strong className="text-[#f0f4ff]">Study Sequence:</strong> {chapter.book}
                </div>
                {chapter.sourceFocus && (
                  <div>
                    <strong className="text-[#f0f4ff]">Source Focus:</strong> {chapter.sourceFocus}
                  </div>
                )}
              </div>

              {/* Comprehensive Notes Bullet List */}
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <BookmarkCheck size={16} />
                  <span>Exam-Grade High-Yield Notes ({chapter.notes.length} points)</span>
                </div>
                <ul className="space-y-3">
                  {chapter.notes.map((note, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-white/[0.02] p-3 text-xs md:text-sm leading-relaxed text-[#c2d0eb]"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-500/15 font-mono text-[0.65rem] font-bold text-cyan-400">
                        {index + 1}
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SpotlightCard>

            {/* Active Recall Concept Drills */}
            {chapter.questions.map((question) => {
              const isRevealed = revealed[question.id];
              const selected = answers[question.id];
              const existing = questionMatches(question.questionText);

              return (
                <SpotlightCard
                  key={question.id}
                  spotlightColor="rgba(6, 182, 212, 0.15)"
                  borderColor="rgba(6, 182, 212, 0.4)"
                  className="p-6 md:p-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[0.68rem] font-bold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                      <HelpCircle size={14} />
                      <span>{question.type === 'line-detail' ? 'Line-Detail Recall' : 'Concept Check'}</span>
                    </span>
                    {existing.length > 0 && (
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono text-[0.65rem] font-bold text-emerald-400">
                        ● PYQ MATCHED
                      </span>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-[#f0f4ff] leading-snug">
                    {question.questionText}
                  </h3>

                  {/* Options List */}
                  <div className="mt-5 space-y-2.5">
                    {question.options.map((option, index) => {
                      const isSelected = selected === index;
                      const isCorrect = isRevealed && index === question.correctOption;
                      const isWrong = isRevealed && isSelected && index !== question.correctOption;

                      return (
                        <button
                          key={option}
                          disabled={isRevealed}
                          onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                          className={`w-full flex items-center gap-3.5 rounded-xl border p-3.5 text-left text-xs md:text-sm font-medium transition-all duration-200 ${
                            isCorrect
                              ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                              : isWrong
                              ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
                              : isSelected
                              ? 'border-blue-500/50 bg-blue-500/15 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                              : 'border-[rgba(59,130,246,0.12)] bg-[#070c18]/60 text-[#94a3c0] hover:border-blue-400/40 hover:text-white'
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                              isCorrect
                                ? 'bg-emerald-500 text-black'
                                : isWrong
                                ? 'bg-rose-500 text-white'
                                : isSelected
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/[0.06] text-[#5a6a8a]'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1">{option}</span>
                          {isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                          {isWrong && <XCircle size={16} className="text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Actions & Explanation */}
                  <div className="mt-6 flex items-center justify-between gap-4 flex-wrap border-t border-[rgba(59,130,246,0.1)] pt-4">
                    <CyberButton
                      variant={isRevealed ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => setRevealed((prev) => ({ ...prev, [question.id]: true }))}
                    >
                      {isRevealed ? 'Answer Verified' : 'Check Answer'}
                    </CyberButton>

                    {existing.length > 0 ? (
                      <div className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                        <Award size={14} />
                        <span>PYQ Match: {existing.map((m) => `${m.exam_code} ${m.year}`).join(', ')}</span>
                      </div>
                    ) : (
                      <div className="font-mono text-[0.7rem] text-[#5a6a8a]">
                        Predicted High-Yield Pattern
                      </div>
                    )}
                  </div>

                  {/* Explanation drawer */}
                  <AnimatePresence>
                    {isRevealed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 rounded-xl border border-blue-500/20 bg-blue-950/20 p-4 font-mono text-xs text-cyan-200 leading-relaxed"
                      >
                        <div className="font-bold text-cyan-400 mb-1">EXPLANATION & ANALYSIS:</div>
                        {question.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </SpotlightCard>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
