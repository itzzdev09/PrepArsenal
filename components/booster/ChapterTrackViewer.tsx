'use client';

import type { ReactNode } from 'react';

export interface ViewerChapter {
  id: string;
  order: number;
  title: string;
  book: string;
  sourceFocus?: string;
  notes: string[];
}

export interface ViewerTrack {
  id: string;
  subject: string;
  chapters: ViewerChapter[];
}

interface ChapterTrackViewerProps {
  tracks: ViewerTrack[];
  trackId: string;
  chapterId: string;
  onTrackChange: (id: string) => void;
  onChapterChange: (id: string) => void;
  sourceUrl?: string;
  isChapterMarked?: (chapterId: string) => boolean;
  /** Rendered after the notes list — e.g. quick-check quiz, "mark as read"/test panel. */
  children?: ReactNode;
}

/**
 * Shared track/chapter/notes viewer used by both NCERT Sprint and the GK
 * Booster's static tab. Quiz rendering and any per-chapter extras (mark as
 * read, chapter tests) are left to the caller via `children`, since that
 * logic is stateful and differs between the two pages.
 */
export default function ChapterTrackViewer({
  tracks,
  trackId,
  chapterId,
  onTrackChange,
  onChapterChange,
  sourceUrl,
  isChapterMarked,
  children,
}: ChapterTrackViewerProps) {
  const track = tracks.find(item => item.id === trackId) ?? tracks[0];
  const chapter = track.chapters.find(item => item.id === chapterId) ?? track.chapters[0];

  return (
    <div className="ctv-root">
      <style jsx>{`
        .ctv-root { width: 100%; }
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
        .eyebrow { color: var(--accent-blue); font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
        h2 { margin: .5rem 0; }
        @media (max-width: 760px) { .layout { grid-template-columns: 1fr; } .chapters { max-height: 270px; overflow: auto; } }
      `}</style>

      <div className="tracks">
        {tracks.map(item => (
          <button key={item.id} className={`track ${item.id === track.id ? 'active' : ''}`} onClick={() => onTrackChange(item.id)}>
            {item.subject}
          </button>
        ))}
      </div>

      <div className="layout">
        <aside className="chapters" aria-label={`${track.subject} chapters`}>
          {track.chapters.map(item => (
            <button key={item.id} className={`chapter ${item.id === chapter.id ? 'active' : ''}`} onClick={() => onChapterChange(item.id)}>
              <span className="chapter-number">{item.order}</span>
              <span className="chapter-title">{item.title}</span>
              {isChapterMarked?.(item.id) && <span className="chapter-check" title="Marked as read">✓</span>}
            </button>
          ))}
        </aside>
        <section className="content">
          <div className="eyebrow">{track.subject} · {chapter.order}</div>
          <h2>{chapter.title}</h2>
          <p className="book">Study sequence: {chapter.book}</p>
          {sourceUrl && (
            <a className="source" href={sourceUrl} target="_blank" rel="noreferrer">Open the official source ↗</a>
          )}
          <ul className="notes">{chapter.notes.map(note => <li key={note}>{note}</li>)}</ul>
          {children}
        </section>
      </div>
    </div>
  );
}
