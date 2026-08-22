'use client';

import { useState } from 'react';
import type { RagSearchResult } from '@/lib/rag/rag-engine';

interface CitationCardProps {
  citations: RagSearchResult[];
}

export default function CitationCard({ citations }: CitationCardProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="rag-citation-box">
      <style jsx>{`
        .rag-citation-box {
          margin-top: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 0.75rem;
          font-size: 0.82rem;
          animation: fadeIn 300ms ease;
        }

        .citation-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-weight: 700;
          color: var(--accent-blue);
          margin-bottom: 0.5rem;
        }

        .citation-title {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .citation-count {
          font-size: 0.7rem;
          background: rgba(59, 130, 246, 0.2);
          color: var(--accent-blue);
          padding: 0.15rem 0.45rem;
          border-radius: 0.25rem;
          font-weight: 800;
        }

        .citation-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .citation-item {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          overflow: hidden;
          transition: border-color 150ms;
        }

        .citation-item:hover {
          border-color: var(--accent-blue);
        }

        .citation-meta-row {
          padding: 0.5rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          user-select: none;
        }

        .citation-source-name {
          font-weight: 600;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .citation-score-badge {
          font-size: 0.68rem;
          padding: 0.1rem 0.35rem;
          border-radius: 0.25rem;
          font-weight: 700;
          font-family: 'JetBrains Mono', monospace;
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .citation-content-body {
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.2);
          border-top: 1px solid var(--border-subtle);
          font-size: 0.78rem;
          line-height: 1.55;
          color: var(--text-secondary);
        }

        .citation-tags {
          margin-top: 0.4rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .citation-tag {
          font-size: 0.65rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.1rem 0.3rem;
          border-radius: 0.2rem;
          color: var(--text-tertiary);
        }

        .pyq-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--warning);
          margin-top: 0.3rem;
        }
      `}</style>

      <div className="citation-header">
        <div className="citation-title">
          <span>📚 Verified Textbook Citations</span>
          <span className="citation-count">{citations.length} Sources Found</span>
        </div>
      </div>

      <div className="citation-list">
        {citations.map((item, idx) => {
          const isExpanded = expandedIdx === idx;
          return (
            <div key={item.chunk.id} className="citation-item">
              <div 
                className="citation-meta-row"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div className="citation-source-name">
                  <span>📖</span>
                  <span>{item.chunk.book} (p.{item.chunk.pageNumber})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="citation-score-badge">
                    {Math.round(item.score * 100)}% match
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="citation-content-body">
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    {item.chunk.title} — {item.chunk.chapter}
                  </div>
                  <div style={{ whiteSpace: 'pre-line' }}>{item.chunk.content}</div>
                  
                  {item.chunk.examMentions?.length > 0 && (
                    <div className="pyq-badge">
                      🎯 PYQ Frequency: {item.chunk.pyqFrequency} ({item.chunk.examMentions.join(', ')})
                    </div>
                  )}

                  <div className="citation-tags">
                    {item.chunk.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="citation-tag">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
