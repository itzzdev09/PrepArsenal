'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FilePenLine, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { getSmartNotes, updateSmartNotes, type SmartNote } from '@/lib/db';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export default function NotesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');

  const supabase = createClient();
  const router = useRouter();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestNotesRef = useRef<SmartNote[]>([]);

  useEffect(() => {
    latestNotesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    async function loadNotes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      
      const userNotes = await getSmartNotes(supabase, user.id);
      setNotes(userNotes);
      if (userNotes.length > 0) {
        setActiveNoteId(userNotes[0].id);
      }
      setLoading(false);
    }
    loadNotes();
  }, [router, supabase]);

  // Debounced auto-save function (600ms)
  const triggerDebouncedSave = useCallback((updatedNotesList: SmartNote[]) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (!userId) return;
      try {
        await updateSmartNotes(supabase, userId, updatedNotesList);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save notes:', err);
        setSaveStatus('unsaved');
      }
    }, 600);
  }, [supabase, userId]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    if (!userId) return;
    const newNote: SmartNote = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '# 📝 Revision Topic\n\n- Key Point 1\n- Formula: $a^2 + b^2 = c^2$\n\n### 💡 Exam Shortcut:\n> Add shortcuts or tricks here...',
      subject: 'Quantitative Aptitude',
      updatedAt: new Date().toISOString()
    };
    
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    setActiveNoteId(newNote.id);
    triggerDebouncedSave(newNotes);
  };

  const handleUpdateNote = (id: string, updates: Partial<SmartNote>) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    setNotes(updatedNotes);
    triggerDebouncedSave(updatedNotes);
  };

  const deleteNote = (id: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
    triggerDebouncedSave(newNotes);
  };

  const insertFormatting = (prefix: string, suffix = '') => {
    if (!activeNote) return;
    const textarea = document.getElementById('note-content-input') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleUpdateNote(activeNote.id, { content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳ Loading Smart Notes...</div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <style jsx>{`
        .notes-container {
          display: flex;
          height: calc(100vh - 64px);
          background: var(--bg-primary);
        }
        
        .notes-sidebar {
          width: 320px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          height: 100%;
          flex-shrink: 0;
        }

        .sidebar-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-box {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }
        .search-input:focus { border-color: var(--accent-blue); }

        .notes-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .note-item {
          padding: 0.85rem 1rem;
          border-radius: 0.65rem;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 150ms;
          background: var(--bg-card);
        }
        .note-item:hover {
          background: var(--bg-input);
          border-color: var(--border-subtle);
        }
        .note-item.active {
          background: rgba(59,130,246,0.12);
          border-color: var(--accent-blue);
        }

        .note-item-title {
          font-weight: 700;
          font-size: 0.92rem;
          margin-bottom: 0.3rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .note-item-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-tertiary);
        }

        .note-editor-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .editor-topbar {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-secondary);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .title-input {
          flex: 1;
          font-size: 1.3rem;
          font-weight: 800;
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
        }

        .subject-select {
          padding: 0.4rem 0.75rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          color: var(--text-primary);
          font-size: 0.82rem;
          outline: none;
        }

        .toolbar {
          padding: 0.5rem 1.5rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .tool-btn {
          padding: 0.3rem 0.6rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: 0.4rem;
          font-size: 0.78rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 150ms;
        }
        .tool-btn:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .view-toggles {
          display: flex;
          margin-left: auto;
          background: var(--bg-input);
          padding: 0.15rem;
          border-radius: 0.5rem;
          gap: 0.2rem;
        }

        .toggle-btn {
          padding: 0.25rem 0.6rem;
          font-size: 0.72rem;
          font-weight: 700;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: 0.35rem;
          cursor: pointer;
        }
        .toggle-btn.active {
          background: var(--accent-blue);
          color: white;
        }

        .editor-workspace {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .raw-textarea {
          flex: 1;
          height: 100%;
          padding: 1.5rem;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.95rem;
          line-height: 1.7;
          resize: none;
          outline: none;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
        }

        .markdown-preview-pane {
          flex: 1;
          height: 100%;
          padding: 1.5rem 2rem;
          overflow-y: auto;
          background: var(--bg-primary);
          border-left: 1px solid var(--border-subtle);
          line-height: 1.7;
        }

        .save-indicator {
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .status-saved { color: var(--success); }
        .status-saving { color: var(--warning); }
      `}</style>

      {/* Sidebar List */}
      <div className="notes-sidebar">
        <div className="sidebar-header">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '.4rem' }}><FilePenLine size={19} />Smart Notes</h2>
          <button className="btn btn-primary btn-sm" onClick={createNote}>
            + New
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes or formulas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="notes-list">
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No notes found. Click &quot;+ New&quot; to create your first revision note!
            </div>
          ) : (
            filteredNotes.map(note => (
              <div
                key={note.id}
                className={`note-item ${activeNoteId === note.id ? 'active' : ''}`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="note-item-title">{note.title || 'Untitled Note'}</div>
                <div className="note-item-meta">
                  <span>{note.subject}</span>
                  <span>{note.updatedAt ? note.updatedAt.substring(0, 10) : ''}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor Main */}
      <div className="note-editor-area">
        {activeNote ? (
          <>
            <div className="editor-topbar">
              <input
                type="text"
                className="title-input"
                value={activeNote.title}
                onChange={e => handleUpdateNote(activeNote.id, { title: e.target.value })}
                placeholder="Note Title..."
              />

              <select
                className="subject-select"
                value={activeNote.subject}
                onChange={e => handleUpdateNote(activeNote.id, { subject: e.target.value })}
              >
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="Reasoning">Reasoning</option>
                <option value="English">English</option>
                <option value="General Awareness">General Awareness</option>
                <option value="Polity">Polity</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Economics">Economics</option>
                <option value="General Science">General Science</option>
              </select>

              <div className="save-indicator">
                {saveStatus === 'saving' ? (
                  <span className="status-saving">⏳ Saving...</span>
                ) : (
                  <span className="status-saved">✅ Saved</span>
                )}
              </div>

              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}
                onClick={() => deleteNote(activeNote.id)}
                title="Delete note"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Markdown & Math Toolbar */}
            <div className="toolbar">
              <button className="tool-btn" onClick={() => insertFormatting('**', '**')}><strong>B</strong></button>
              <button className="tool-btn" onClick={() => insertFormatting('*', '*')}><em>I</em></button>
              <button className="tool-btn" onClick={() => insertFormatting('### ')}>H3</button>
              <button className="tool-btn" onClick={() => insertFormatting('- ')}>• List</button>
              <button className="tool-btn" onClick={() => insertFormatting('> ')}>Quote</button>
              <button className="tool-btn" onClick={() => insertFormatting('$', '$')} title="Inline Math">$Math$</button>
              <button className="tool-btn" onClick={() => insertFormatting('\n$$\n', '\n$$\n')} title="Math Block">$$\Sigma$$</button>
              <button className="tool-btn" onClick={() => insertFormatting('`', '`')}>Code</button>

              <div className="view-toggles">
                <button
                  className={`toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
                  onClick={() => setViewMode('edit')}
                >
                  Write
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                >
                  Split
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                  onClick={() => setViewMode('preview')}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Workspace */}
            <div className="editor-workspace">
              {(viewMode === 'edit' || viewMode === 'split') && (
                <textarea
                  id="note-content-input"
                  className="raw-textarea"
                  value={activeNote.content}
                  onChange={e => handleUpdateNote(activeNote.id, { content: e.target.value })}
                  placeholder="Write formulas (e.g. $a^2 + b^2 = c^2$), bullet points, or revision tips..."
                />
              )}

              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className="markdown-preview-pane markdown-body">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {activeNote.content || '*Empty note. Start typing to see formatted preview...*'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)' }}>
            Select a note or create a new one to begin.
          </div>
        )}
      </div>
    </div>
  );
}
