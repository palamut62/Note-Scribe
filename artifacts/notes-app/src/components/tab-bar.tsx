import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/app-state';
import { X, Plus } from 'lucide-react';
import { Note } from '@/lib/types';

export function TabBar() {
  const { notes, activeNoteId, setActiveNoteId, createNote, deleteNote, updateNote } = useApp();
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTabId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTabId]);

  const handleDoubleClick = (note: Note) => {
    setEditingTabId(note.id);
    setEditingValue(note.title || 'Untitled');
  };

  const commitRename = () => {
    if (editingTabId) {
      const trimmed = editingValue.trim();
      updateNote(editingTabId, { title: trimmed || 'Untitled' });
      setEditingTabId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') setEditingTabId(null);
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const idx = notes.findIndex(n => n.id === id);
    if (activeNoteId === id) {
      const next = notes[idx + 1] || notes[idx - 1] || null;
      setActiveNoteId(next ? next.id : null);
    }
    deleteNote(id);
  };

  return (
    <div className="tab-bar-wrapper">
      <div className="tab-bar-scroll" ref={scrollRef}>
        {notes.map((note) => {
          const isActive = note.id === activeNoteId;
          const isEditing = editingTabId === note.id;

          return (
            <div
              key={note.id}
              data-testid={`tab-${note.id}`}
              className={`tab-item ${isActive ? 'tab-active' : 'tab-inactive'}`}
              onClick={() => setActiveNoteId(note.id)}
              onDoubleClick={() => handleDoubleClick(note)}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  className="tab-rename-input"
                  value={editingValue}
                  onChange={e => setEditingValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleKeyDown}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span className="tab-title">
                  {note.title || 'Untitled'}
                </span>
              )}
              <button
                className="tab-close"
                onClick={(e) => handleClose(e, note.id)}
                data-testid={`tab-close-${note.id}`}
                title="Close"
              >
                <X size={12} />
              </button>
            </div>
          );
        })}

        <button
          className="tab-new-btn"
          onClick={createNote}
          data-testid="button-new-tab"
          title="New note"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
