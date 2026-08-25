'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NCERT_QUESTION_TEXTS, NCERT_TRACKS, type NcertChapter } from '@/lib/ncert-booster';
import {
  getQuestionMatchesByText,
  getNcertProgress,
  markChapterRead,
  recordChapterTestResult,
  getNcertChapterTest,
  type QuestionTextMatch,
  type NcertChapterProgress,
  type NcertGeneratedQuestion,
} from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

export default function NcertSprintPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [trackId, setTrackId] = useState(NCERT_TRACKS[0].id);
  const [chapterId, setChapterId] = useState(NCERT_TRACKS[0].chapters[0].id);
  const [matches, setMatches] = useState<QuestionTextMatch[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, NcertChapterProgress>>({});
  const [marking, setMarking] = useState(false);

  const [testQuestions, setTestQuestions] = useState<NcertGeneratedQuestion[] | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);

  const track = NCERT_TRACKS.find(item => item.id === trackId) ?? NCERT_TRACKS[0];
  const chapter: NcertChapter = track.chapters.find(item => item.id === chapterId) ?? track.chapters[0];
  const chapterProgress = progress[chapter.id];

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      getNcertProgress(supabase, user.id).then(setProgress);
    }
    load();
  }, [router, supabase]);

  useEffect(() => {
    getQuestionMatchesByText(supabase, NCERT_QUESTION_TEXTS).then(setMatches);
  }, [supabase]);

  // Reset the chapter-test panel whenever the chapter changes.
  useEffect(() => {
    setTestQuestions(null);
    setTestError(null);
    setTestAnswers({});
    setTestSubmitted(false);
  }, [chapterId]);

  const chooseTrack = (id: string) => {
    const nextTrack = NCERT_TRACKS.find(item => item.id === id) ?? NCERT_TRACKS[0];
    setTrackId(nextTrack.id);
    setChapterId(nextTrack.chapters[0].id);
  };

  const questionMatches = (questionText: string) => matches.filter(match => match.question_text === questionText);

  const handleMarkRead = async () => {
    if (!userId || marking) return;
    setMarking(true);
    const ok = await markChapterRead(supabase, userId, chapter.id);
    if (ok) {
      setProgress(prev => ({ ...prev, [chapter.id]: prev[chapter.id] ?? { readAt: new Date().toISOString() } }));
    }
    setMarking(false);
  };

  const handleStartTest = async () => {
    setTestLoading(true);
    setTestError(null);
    try {
      let questions = await getNcertChapterTest(supabase, chapter.id);
      if (questions.length === 0) {
        const res = await fetch('/api/ncert/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapterId: chapter.id }),
        });
        if (!res.ok) throw new Error(`Failed to generate test (${res.status})`);
        const data = await res.json();
        questions = data.questions ?? [];
      }
      if (questions.length === 0) throw new Error('No questions were generated.');
      setTestQuestions(questions);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : 'Could not load the chapter test.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleSubmitTest = async () => {
    if (!testQuestions || !userId) return;
    const correctCount = testQuestions.filter(q => testAnswers[q.id] === q.correct_option).length;
    const scorePercent = Math.round((correctCount / testQuestions.length) * 100);
    setTestSubmitted(true);
    const ok = await recordChapterTestResult(supabase, userId, chapter.id, scorePercent);
    if (ok) {
      setProgress(prev => ({
        ...prev,
        [chapter.id]: {
          readAt: prev[chapter.id]?.readAt ?? new Date().toISOString(),
          lastTestScore: scorePercent,
          testedAt: new Date().toISOString(),
        },
      }));
    }
  };

  const testScore = testQuestions
    ? Math.round((testQuestions.filter(q => testAnswers[q.id] === q.correct_option).length / testQuestions.length) * 100)
    : null;

  return (
    <div className="ncert-page">
      <style jsx>{`
        .ncert-page { max-width: 1300px; margin: 0 auto; padding: 2rem; }
        .eyebrow { color: var(--accent-blue); font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        h1 { margin: .4rem 0 .65rem; font-size: 2.25rem; } h2 { margin: .5rem 0; }
        .intro { color: var(--text-secondary); max-width: 760px; line-height: 1.6; }
        .notice { margin: 1.25rem 0 1.75rem; padding: .9rem 1rem; border-left: 3px solid var(--accent-blue); background: rgba(59,130,246,.08); color: var(--text-secondary); border-radius: .4rem; font-size: .9rem; }
        .tracks { display: flex; gap: .65rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .track { border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-secondary); padding: .7rem .9rem; border-radius: .7rem; cursor: pointer; font-weight: 700; }
        .track.active { background: var(--accent-blue); border-color: var(--accent-blue); color: white; }
        .layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; align-items: start; }
        .chapters, .content { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 1rem; }
        .chapters { padding: .7rem; } .chapter { width: 100%; border: 0; background: transparent; color: var(--text-secondary); text-align: left; padding: .85rem; border-radius: .7rem; cursor: pointer; display: flex; gap: .75rem; align-items: center; }
        .chapter:hover { background: var(--bg-input); } .chapter.active { background: rgba(59,130,246,.13); color: var(--text-primary); }
        .chapter-number { color: var(--accent-blue); font-weight: 800; } .chapter-title { font-weight: 650; font-size: .9rem; flex: 1; }
        .chapter-check { color: #22c55e; font-size: .85rem; }
        .content { padding: 1.75rem; } .book { color: var(--text-tertiary); font-size: .9rem; margin-top: -.2rem; }
        .notes { padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.65; } .source { display: inline-flex; margin: .5rem 0 1.5rem; color: var(--accent-blue); font-size: .88rem; }
        .question { border-top: 1px solid var(--border-subtle); margin-top: 1.25rem; padding-top: 1.25rem; } .question h3 { margin: 0 0 1rem; font-size: 1.05rem; line-height: 1.5; }
        .options { display: grid; gap: .6rem; } .option { text-align: left; border: 1px solid var(--border-subtle); background: var(--bg-input); color: var(--text-primary); padding: .75rem .9rem; border-radius: .6rem; cursor: pointer; }
        .option.selected { border-color: var(--accent-blue); } .option.correct { border-color: #22c55e; background: rgba(34,197,94,.12); } .option.wrong { border-color: #ef4444; background: rgba(239,68,68,.12); }
        .reveal { margin-top: 1rem; border: 0; border-radius: .6rem; padding: .65rem .9rem; cursor: pointer; font-weight: 700; background: var(--text-primary); color: var(--bg-primary); }
        .explanation { color: var(--text-secondary); line-height: 1.55; margin: 1rem 0 0; } .pyq { margin-top: .9rem; font-size: .85rem; color: var(--text-secondary); } .pyq strong { color: var(--text-primary); }
        .read-panel { margin-top: 1.75rem; padding-top: 1.5rem; border-top: 2px solid var(--border-subtle); }
        .mark-read-btn { border: 0; border-radius: .6rem; padding: .75rem 1.25rem; cursor: pointer; font-weight: 700; background: var(--accent-blue); color: white; }
        .mark-read-btn:disabled { opacity: .6; cursor: not-allowed; }
        .read-status { color: #22c55e; font-weight: 700; font-size: .9rem; }
        .test-cta { border: 0; border-radius: .6rem; padding: .75rem 1.25rem; cursor: pointer; font-weight: 700; background: #c084fc; color: white; margin-top: .75rem; }
        .test-cta:disabled { opacity: .6; cursor: not-allowed; }
        .test-error { color: var(--error); font-size: .88rem; margin-top: .75rem; }
        .test-score { font-size: 1.1rem; font-weight: 800; margin-top: 1rem; }
        @media (max-width: 760px) { .ncert-page { padding: 1.25rem; } .layout { grid-template-columns: 1fr; } .chapters { max-height: 270px; overflow: auto; } h1 { font-size: 1.8rem; } }
      `}</style>

      <div className="eyebrow">Ordered revision • original study notes • PYQ cross-reference</div>
      <h1>NCERT Sprint</h1>
      <p className="intro">A chapter-led Static GK revision system. Work through each track in order, revise concise original notes, mark the chapter read, and take an AI-generated chapter test.</p>
      <div className="notice">This is an original revision layer linked to official NCERT textbooks—not a replacement or line-by-line reproduction. A “PYQ match” appears only when the exact question exists in your question database.</div>
      <div className="tracks">{NCERT_TRACKS.map(item => <button key={item.id} className={`track ${item.id === track.id ? 'active' : ''}`} onClick={() => chooseTrack(item.id)}>{item.subject}</button>)}</div>

      <div className="layout">
        <aside className="chapters" aria-label={`${track.subject} chapters`}>
          {track.chapters.map(item => (
            <button key={item.id} className={`chapter ${item.id === chapter.id ? 'active' : ''}`} onClick={() => setChapterId(item.id)}>
              <span className="chapter-number">{item.order}</span>
              <span className="chapter-title">{item.title}</span>
              {progress[item.id] && <span className="chapter-check" title="Marked as read">✓</span>}
            </button>
          ))}
        </aside>
        <section className="content">
          <div className="eyebrow">{track.subject} · Chapter {chapter.order}</div><h2>{chapter.title}</h2><p className="book">Study sequence: {chapter.book}</p>
          <a className="source" href={track.sourceUrl} target="_blank" rel="noreferrer">Open the official NCERT textbook catalogue ↗</a>
          <ul className="notes">{chapter.notes.map(note => <li key={note}>{note}</li>)}</ul>
          {chapter.questions.map(question => {
            const isRevealed = revealed[question.id]; const selected = answers[question.id]; const existing = questionMatches(question.questionText);
            return <article className="question" key={question.id}><h3>Quick check: {question.questionText}</h3><div className="options">{question.options.map((option, index) => {
              const classNames = ['option']; if (selected === index) classNames.push('selected'); if (isRevealed && index === question.correctOption) classNames.push('correct'); if (isRevealed && selected === index && index !== question.correctOption) classNames.push('wrong');
              return <button key={option} className={classNames.join(' ')} onClick={() => !isRevealed && setAnswers(previous => ({ ...previous, [question.id]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>;
            })}</div><button className="reveal" onClick={() => setRevealed(previous => ({ ...previous, [question.id]: true }))}>{isRevealed ? 'Answer revealed' : 'Check answer'}</button>{isRevealed && <p className="explanation">{question.explanation}</p>}<div className="pyq">{existing.length > 0 ? <><strong>PYQ match:</strong> {existing.map(match => `${match.exam_code} ${match.year}`).join(', ')}</> : 'No exact PYQ match in the current question database.'}</div></article>;
          })}

          <div className="read-panel">
            {chapterProgress ? (
              <p className="read-status">✓ Marked as read{chapterProgress.testedAt ? ` · Last chapter test: ${chapterProgress.lastTestScore}%` : ''}</p>
            ) : (
              <button className="mark-read-btn" onClick={handleMarkRead} disabled={marking}>
                {marking ? 'Marking...' : '✓ Mark chapter as read'}
              </button>
            )}

            {chapterProgress && !testQuestions && (
              <button className="test-cta" onClick={handleStartTest} disabled={testLoading}>
                {testLoading ? 'Generating chapter test...' : '📝 Take Chapter Test'}
              </button>
            )}
            {testError && <p className="test-error">{testError}</p>}

            {testQuestions && (
              <div>
                {testQuestions.map((q, qi) => {
                  const selected = testAnswers[q.id];
                  return (
                    <article className="question" key={q.id}>
                      <h3>Q{qi + 1}. {q.question_text}</h3>
                      <div className="options">
                        {q.options.map((option, index) => {
                          const classNames = ['option'];
                          if (selected === index) classNames.push('selected');
                          if (testSubmitted && index === q.correct_option) classNames.push('correct');
                          if (testSubmitted && selected === index && index !== q.correct_option) classNames.push('wrong');
                          return (
                            <button key={option} className={classNames.join(' ')} onClick={() => !testSubmitted && setTestAnswers(prev => ({ ...prev, [q.id]: index }))}>
                              {String.fromCharCode(65 + index)}. {option}
                            </button>
                          );
                        })}
                      </div>
                      {testSubmitted && <p className="explanation">{q.explanation}</p>}
                    </article>
                  );
                })}

                {!testSubmitted ? (
                  <button className="mark-read-btn" onClick={handleSubmitTest} disabled={Object.keys(testAnswers).length < testQuestions.length}>
                    Submit Chapter Test
                  </button>
                ) : (
                  <p className="test-score">You scored {testScore}% on this chapter test.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
