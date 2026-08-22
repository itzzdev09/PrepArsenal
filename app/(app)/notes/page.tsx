'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { getSmartNotes, updateSmartNotes, type SmartNote } from '@/lib/db';
import { useRouter } from 'next/navigation';

export default function NotesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const router = useRouter();

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

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = async () => {
    if (!userId) return;
    const newNote: SmartNote = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      subject: 'General',
      updatedAt: new Date().toISOString()
    };
    
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    setActiveNoteId(newNote.id);
    await updateSmartNotes(supabase, userId, newNotes);
  };

  const saveNote = async (id: string, updates: Partial<SmartNote>) => {
    if (!userId) return;
    const newNotes = notes.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    setNotes(newNotes);
    await updateSmartNotes(supabase, userId, newNotes);
  };

  const deleteNote = async (id: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (activeNoteId === id) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
    await updateSmartNotes(supabase, userId, newNotes);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
      </div>
    );
  }

  return (
    <div className="notes-container">
      <style jsx>{`
        .notes-container {
          display: flex;
          height: calc(100vh - 80px); /* rough header offset */
        }
        
        .notes-sidebar {
          width: 300px;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .note-list {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }
        .note-item {
          padding: 1rem;
          border-radius: 0.75rem;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background 150ms;
          border: 1px solid transparent;
        }
        .note-item:hover {
          background: rgba(255,255,255,0.02);
        }
        .note-item.active {
          background: rgba(59,130,246,0.1);
          border-color: var(--border-subtle);
        }
        .note-item-title {
          font-weight: 600;
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .note-item-meta {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          display: flex;
          justify-content: space-between;
        }
        
        .notes-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--bg-card);
        }
        
        .empty-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
        }
        
        .editor-header {
          padding: 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }
        .editor-title-input {
          width: 100%;
          background: transparent;
          border: none;
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
          outline: none;
          margin-bottom: 0.5rem;
        }
        .editor-meta {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .subject-select {
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          outline: none;
        }
        
        .editor-body {
          flex: 1;
          padding: 2rem;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 1.1rem;
          line-height: 1.6;
          resize: none;
          outline: none;
        }
        
        @media (max-width: 768px) {
          .notes-container { flex-direction: column; }
          .notes-sidebar { width: 100%; height: 250px; border-right: none; border-bottom: 1px solid var(--border-subtle); }
        }
      `}</style>

      {/* Sidebar */}
      <div className="notes-sidebar">
        <div className="sidebar-header">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📝 Notes</h2>
          <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={createNote}>
            + New
          </button>
        </div>
        <div className="note-list">
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', marginTop: '2rem', fontSize: '0.9rem' }}>
              No notes yet. Create one!
            </div>
          ) : (
            notes.map(note => (
              <div 
                key={note.id} 
                className={`note-item ${activeNoteId === note.id ? 'active' : ''}`}
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="note-item-title">{note.title || 'Untitled'}</div>
                <div className="note-item-meta">
                  <span>{note.subject}</span>
                  <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="notes-main">
        {!activeNote ? (
          <div className="empty-main">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
            <h3>Select or create a note to begin</h3>
          </div>
        ) : (
          <>
            <div className="editor-header">
              <input 
                className="editor-title-input"
                value={activeNote.title}
                onChange={e => saveNote(activeNote.id, { title: e.target.value })}
                placeholder="Note Title..."
              />
              <div className="editor-meta">
                <select 
                  className="subject-select"
                  value={activeNote.subject}
                  onChange={e => saveNote(activeNote.id, { subject: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="Reasoning">Reasoning</option>
                  <option value="English">English</option>
                  <option value="General Awareness">General Awareness</option>
                </select>
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Delete Note
                </button>
              </div>
            </div>
            
            <textarea
              className="editor-body"
              value={activeNote.content}
              onChange={e => saveNote(activeNote.id, { content: e.target.value })}
              placeholder="Start typing your smart notes here... (Markdown is supported in spirit)"
            />
          </>
        )}
      </div>
    </div>
  );
}
