// @refresh reset
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Note, Settings } from './types';

interface AppContextType {
  notes: Note[];
  activeNoteId: string | null;
  settings: Settings;
  setActiveNoteId: (id: string | null) => void;
  createNote: (initial?: { title?: string; content?: string; tags?: string[] }) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  reorderNotes: (fromIndex: number, toIndex: number) => void;
}

const defaultSettings: Settings = {
  provider: 'openrouter',
  openrouterApiKey: '',
  openrouterModel: '',
  nvidiaApiKey: '',
  nvidiaModel: '',
  backgroundPattern: 'none',
  theme: 'light',
  marginTop: 80,
  marginBottom: 120,
  marginLeft: 80,
  marginRight: 80,
  autoCorrect: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('notlar-notes');
      if (!saved) return [];
      const parsed: Note[] = JSON.parse(saved);
      return parsed.map(n => ({ tags: [], ...n }));
    } catch {
      return [];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('notes-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem('notlar-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('notes-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme ?? 'light');
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const createNote = useCallback((initial?: { title?: string; content?: string; tags?: string[] }) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: initial?.title || 'Untitled Note',
      content: initial?.content || '',
      textboxes: [],
      images: [],
      tags: initial?.tags ?? [],
      header: { left: { text: '' }, center: { text: '' }, right: { text: '' }, visible: false },
      footer: { left: { text: '' }, center: { text: '{sayfa}' }, right: { text: '' }, visible: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    ));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  }, [activeNoteId]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const reorderNotes = useCallback((fromIndex: number, toIndex: number) => {
    setNotes(prev => {
      const arr = [...prev];
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        notes,
        activeNoteId,
        settings,
        setActiveNoteId,
        createNote,
        updateNote,
        deleteNote,
        updateSettings,
        reorderNotes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
