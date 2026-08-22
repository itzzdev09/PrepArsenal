'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NCERT_CLASSWISE_SCOPE, NCERT_QUESTION_TEXTS, NCERT_TRACKS, type NcertChapter } from '@/lib/ncert-booster';
import { getQuestionMatchesByText, type QuestionTextMatch } from '@/lib/db';
import { createClient } from '@/utils/supabase/client';

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
        .chapters { padding: .7rem; } .chapter { width: 100%; border: 0; background: transparent; color: var(--text-secondary); text-align: left; padding: .85rem; border-radius: .7rem; cursor: pointer; display: flex; gap: .75rem; }
        .chapter:hover { background: var(--bg-input); } .chapter.active { background: rgba(59,130,246,.13); color: var(--text-primary); }
        .chapter-number { color: var(--accent-blue); font-weight: 800; } .chapter-title { font-weight: 650; font-size: .9rem; }
        .content { padding: 1.75rem; } .book { color: var(--text-tertiary); font-size: .9rem; margin-top: -.2rem; } .coverage { margin: 1rem 0 1.4rem; padding: .9rem; background: var(--bg-input); border-radius: .7rem; } .coverage h3 { margin: 0 0 .6rem; font-size: .9rem; } .coverage-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: .55rem; } .coverage-item { font-size: .8rem; color: var(--text-secondary); } .coverage-item strong { color: var(--text-primary); }
        .notes { padding-left: 1.25rem; color: var(--text-secondary); line-height: 1.65; } .source { display: inline-flex; margin: .5rem 0 1.5rem; color: var(--accent-blue); font-size: .88rem; }
        .question { border-top: 1px solid var(--border-subtle); margin-top: 1.25rem; padding-top: 1.25rem; } .question h3 { margin: 0 0 1rem; font-size: 1.05rem; line-height: 1.5; }
        .options { display: grid; gap: .6rem; } .option { text-align: left; border: 1px solid var(--border-subtle); background: var(--bg-input); color: var(--text-primary); padding: .75rem .9rem; border-radius: .6rem; cursor: pointer; }
        .option.selected { border-color: var(--accent-blue); } .option.correct { border-color: #22c55e; background: rgba(34,197,94,.12); } .option.wrong { border-color: #ef4444; background: rgba(239,68,68,.12); }
        .reveal { margin-top: 1rem; border: 0; border-radius: .6rem; padding: .65rem .9rem; cursor: pointer; font-weight: 700; background: var(--text-primary); color: var(--bg-primary); }
        .explanation { color: var(--text-secondary); line-height: 1.55; margin: 1rem 0 0; } .pyq { margin-top: .9rem; font-size: .85rem; color: var(--text-secondary); } .pyq strong { color: var(--text-primary); }
        @media (max-width: 760px) { .ncert-page { padding: 1.25rem; } .layout { grid-template-columns: 1fr; } .chapters { max-height: 270px; overflow: auto; } h1 { font-size: 1.8rem; } }
      `}</style>

      <div className="eyebrow">Ordered revision • original study notes • PYQ cross-reference</div>
      <h1>NCERT Sprint</h1>
      <p className="intro">A chapter-led Static GK revision system. Work through each track in order, revise concise original notes, and test yourself before moving on.</p>
      <div className="notice">This is an original revision layer linked to official NCERT textbooks—not a replacement or line-by-line reproduction. A “PYQ match” appears only when the exact question exists in your question database.</div>
      <div className="tracks">{NCERT_TRACKS.map(item => <button key={item.id} className={`track ${item.id === track.id ? 'active' : ''}`} onClick={() => chooseTrack(item.id)}>{item.subject}</button>)}</div>

      <div className="layout">
        <aside className="chapters" aria-label={`${track.subject} chapters`}>{track.chapters.map(item => <button key={item.id} className={`chapter ${item.id === chapter.id ? 'active' : ''}`} onClick={() => setChapterId(item.id)}><span className="chapter-number">{item.order}</span><span className="chapter-title">{item.title}</span></button>)}</aside>
        <section className="content">
          <div className="eyebrow">{track.subject} · Chapter {chapter.order}</div><h2>{chapter.title}</h2><p className="book">Study sequence: {chapter.book}</p>{chapter.sourceFocus && <p className="book">Official source focus: {chapter.sourceFocus}</p>}
          <a className="source" href={track.sourceUrl} target="_blank" rel="noreferrer">Open the official NCERT textbook catalogue ↗</a>
          {classScope.length > 0 && <div className="coverage"><h3>Class 6–12 authoring sequence</h3><div className="coverage-grid">{classScope.map(item => <div key={item.classLevel} className="coverage-item"><strong>Class {item.classLevel}</strong><br />{item.books.join(' · ')}</div>)}</div></div>}
          <ul className="notes">{chapter.notes.map(note => <li key={note}>{note}</li>)}</ul>
          {chapter.questions.map(question => {
            const isRevealed = revealed[question.id]; const selected = answers[question.id]; const existing = questionMatches(question.questionText);
            return <article className="question" key={question.id}><div className="eyebrow">{question.type === 'line-detail' ? 'Line-detail check' : question.type === 'application' ? 'Concept application' : 'Concept check'}</div><h3>{question.questionText}</h3><div className="options">{question.options.map((option, index) => {
              const classNames = ['option']; if (selected === index) classNames.push('selected'); if (isRevealed && index === question.correctOption) classNames.push('correct'); if (isRevealed && selected === index && index !== question.correctOption) classNames.push('wrong');
              return <button key={option} className={classNames.join(' ')} onClick={() => !isRevealed && setAnswers(previous => ({ ...previous, [question.id]: index }))}>{String.fromCharCode(65 + index)}. {option}</button>;
            })}</div><button className="reveal" onClick={() => setRevealed(previous => ({ ...previous, [question.id]: true }))}>{isRevealed ? 'Answer revealed' : 'Check answer'}</button>{isRevealed && <p className="explanation">{question.explanation}</p>}<div className="pyq">{existing.length > 0 ? <><strong>PYQ match:</strong> {existing.map(match => `${match.exam_code} ${match.year}`).join(', ')}</> : 'No exact PYQ match in the current question database.'}</div></article>;
          })}
        </section>
      </div>
    </div>
  );
}
