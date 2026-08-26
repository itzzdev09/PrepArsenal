'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Newspaper } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GK_TRACKS } from '@/lib/gk-booster';
import { getApprovedGkItems, recordGkQuizResult, type GkDailyItem } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';
import ChapterTrackViewer from '@/components/booster/ChapterTrackViewer';

type Tab = 'static' | 'daily';

export default function GkBoosterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>('static');

  const [trackId, setTrackId] = useState(GK_TRACKS[0].id);
  const [chapterId, setChapterId] = useState(GK_TRACKS[0].chapters[0].id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [dailyItems, setDailyItems] = useState<GkDailyItem[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const track = GK_TRACKS.find(item => item.id === trackId) ?? GK_TRACKS[0];
  const chapter = track.chapters.find(item => item.id === chapterId) ?? track.chapters[0];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      getApprovedGkItems(supabase).then(setDailyItems);
    }
    load();
  }, [router, supabase]);

  const chooseTrack = (id: string) => {
    const nextTrack = GK_TRACKS.find(item => item.id === id) ?? GK_TRACKS[0];
    setTrackId(nextTrack.id);
    setChapterId(nextTrack.chapters[0].id);
  };

  const itemsByDate = dailyItems.reduce<Record<string, GkDailyItem[]>>((acc, item) => {
    (acc[item.item_date] ||= []).push(item);
    return acc;
  }, {});

  const handleSubmitQuiz = async () => {
    if (!userId) return;
    setQuizSubmitted(true);
    await recordGkQuizResult(supabase, userId);
  };

  const quizScore = dailyItems.length > 0
    ? Math.round((dailyItems.filter(i => quizAnswers[i.id] === i.correct_option).length / dailyItems.length) * 100)
    : 0;

  return (
    <div className="gk-page">
      <style jsx>{`
        .gk-page { max-width: 1300px; margin: 0 auto; padding: 2rem; }
        .eyebrow { color: var(--accent-blue); font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        h1 { margin: .4rem 0 .65rem; font-size: 2.25rem; }
        .intro { color: var(--text-secondary); max-width: 760px; line-height: 1.6; margin-bottom: 1.5rem; }
        .tabs { display: flex; gap: .6rem; margin-bottom: 1.5rem; }
        .tab-btn { display: inline-flex; align-items: center; gap: .4rem; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-secondary); padding: .7rem 1.1rem; border-radius: .7rem; cursor: pointer; font-weight: 700; }
        .tab-btn.active { background: var(--accent-blue); border-color: var(--accent-blue); color: white; }
        .question { border-top: 1px solid var(--border-subtle); margin-top: 1.25rem; padding-top: 1.25rem; } .question h3 { margin: 0 0 1rem; font-size: 1.05rem; line-height: 1.5; }
        .options { display: grid; gap: .6rem; } .option { text-align: left; border: 1px solid var(--border-subtle); background: var(--bg-input); color: var(--text-primary); padding: .75rem .9rem; border-radius: .6rem; cursor: pointer; }
        .option.selected { border-color: var(--accent-blue); } .option.correct { border-color: #22c55e; background: rgba(34,197,94,.12); } .option.wrong { border-color: #ef4444; background: rgba(239,68,68,.12); }
        .reveal { margin-top: 1rem; border: 0; border-radius: .6rem; padding: .65rem .9rem; cursor: pointer; font-weight: 700; background: var(--text-primary); color: var(--bg-primary); }
        .explanation { color: var(--text-secondary); line-height: 1.55; margin: 1rem 0 0; }
        .day-group { margin-bottom: 2rem; }
        .day-label { font-size: .85rem; font-weight: 800; color: var(--accent-blue); margin-bottom: .75rem; }
        .item-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 1rem; padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
        .item-cat { font-size: .72rem; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; }
        .item-headline { font-weight: 750; font-size: 1.05rem; margin: .25rem 0 .5rem; }
        .item-summary { color: var(--text-secondary); font-size: .9rem; line-height: 1.55; margin-bottom: .75rem; }
        .submit-btn { border: 0; border-radius: .6rem; padding: .75rem 1.25rem; cursor: pointer; font-weight: 700; background: var(--accent-blue); color: white; margin-top: 1rem; }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }
        .quiz-score { font-size: 1.1rem; font-weight: 800; margin-top: 1rem; }
        .empty { color: var(--text-secondary); padding: 2rem 0; }
        @media (max-width: 760px) { .gk-page { padding: 1.25rem; } h1 { font-size: 1.8rem; } }
      `}</style>

      <div className="eyebrow">Static facts • daily current affairs • admin-reviewed</div>
      <h1>GK Booster</h1>
      <p className="intro">Evergreen static GK organised like a revision track, plus a daily current-affairs feed drafted automatically and reviewed by an admin before it goes live.</p>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'static' ? 'active' : ''}`} onClick={() => setTab('static')}><BookOpen size={17} />Static GK</button>
        <button className={`tab-btn ${tab === 'daily' ? 'active' : ''}`} onClick={() => setTab('daily')}><Newspaper size={17} />Daily Current Affairs</button>
      </div>

      {tab === 'static' && (
        <ChapterTrackViewer
          tracks={GK_TRACKS}
          trackId={trackId}
          chapterId={chapterId}
          onTrackChange={chooseTrack}
          onChapterChange={setChapterId}
        >
          {chapter.questions.map(question => {
            const isRevealed = revealed[question.id]; const selected = answers[question.id];
            return (
              <article className="question" key={question.id}>
                <h3>Quick check: {question.questionText}</h3>
                <div className="options">
                  {question.options.map((option, index) => {
                    const classNames = ['option'];
                    if (selected === index) classNames.push('selected');
                    if (isRevealed && index === question.correctOption) classNames.push('correct');
                    if (isRevealed && selected === index && index !== question.correctOption) classNames.push('wrong');
                    return <button key={option} className={classNames.join(' ')} onClick={() => !isRevealed && setAnswers(prev => ({ ...prev, [question.id]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>;
                  })}
                </div>
                <button className="reveal" onClick={() => setRevealed(prev => ({ ...prev, [question.id]: true }))}>{isRevealed ? 'Answer revealed' : 'Check answer'}</button>
                {isRevealed && <p className="explanation">{question.explanation}</p>}
              </article>
            );
          })}
        </ChapterTrackViewer>
      )}

      {tab === 'daily' && (
        <div>
          {dailyItems.length === 0 && <p className="empty">No approved GK Daily items yet — check back soon.</p>}

          {Object.entries(itemsByDate).map(([date, dayItems]) => (
            <div className="day-group" key={date}>
              <div className="day-label">{date}</div>
              {dayItems.map(item => {
                const selected = quizAnswers[item.id];
                return (
                  <div className="item-card" key={item.id}>
                    <div className="item-cat">{item.category}</div>
                    <div className="item-headline">{item.headline}</div>
                    <p className="item-summary">{item.summary}</p>
                    <article className="question" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
                      <h3>{item.question_text}</h3>
                      <div className="options">
                        {item.options.map((option, index) => {
                          const classNames = ['option'];
                          if (selected === index) classNames.push('selected');
                          if (quizSubmitted && index === item.correct_option) classNames.push('correct');
                          if (quizSubmitted && selected === index && index !== item.correct_option) classNames.push('wrong');
                          return <button key={option} className={classNames.join(' ')} onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [item.id]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>;
                        })}
                      </div>
                      {quizSubmitted && <p className="explanation">{item.explanation}</p>}
                    </article>
                  </div>
                );
              })}
            </div>
          ))}

          {dailyItems.length > 0 && !quizSubmitted && (
            <button className="submit-btn" onClick={handleSubmitQuiz} disabled={Object.keys(quizAnswers).length < dailyItems.length}>
              Submit GK Daily Quiz
            </button>
          )}
          {quizSubmitted && <p className="quiz-score">You scored {quizScore}% on today's GK Daily quiz.</p>}
        </div>
      )}
    </div>
  );
}
