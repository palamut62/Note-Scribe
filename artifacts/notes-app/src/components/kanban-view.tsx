import { useState } from 'react';
import { useApp } from '@/lib/app-state';
import { Note, NoteStatus } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';

const COLUMNS: { id: NoteStatus; label: string; color: string; bg: string }[] = [
  { id: 'todo',        label: 'Yapılacak',       color: '#6b7280', bg: 'bg-gray-50 dark:bg-gray-900/30' },
  { id: 'in-progress', label: 'Devam Ediyor',    color: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'done',        label: 'Tamamlandı',      color: '#22c55e', bg: 'bg-green-50 dark:bg-green-900/20' },
  { id: 'archived',   label: 'Arşiv',            color: '#8b5cf6', bg: 'bg-purple-50 dark:bg-purple-900/20' },
];

function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').slice(0, 120);
}

interface NoteCardProps {
  note: Note;
  onOpen: () => void;
}

function NoteCard({ note, onOpen }: NoteCardProps) {
  const { deleteNote, updateNote } = useApp();

  return (
    <div
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all group"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-semibold text-sm truncate flex-1">{note.title}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-foreground transition-opacity shrink-0"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44" onClick={e => e.stopPropagation()}>
            {COLUMNS.filter(c => c.id !== note.status).map(col => (
              <DropdownMenuItem key={col.id} onClick={() => updateNote(note.id, { status: col.id })}>
                <span className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ background: col.color }} />
                {col.label}'a taşı
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteNote(note.id)}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {!note.encrypted && (
        <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {extractText(note.content) || '—'}
        </div>
      )}
      <div className="flex items-center gap-1.5 flex-wrap">
        {(note.tags ?? []).slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
            #{tag}
          </span>
        ))}
        <span className="text-[10px] text-muted-foreground/50 ml-auto">
          {format(new Date(note.updatedAt), 'dd MMM')}
        </span>
      </div>
    </div>
  );
}

export function KanbanView() {
  const { notes, createNote, updateNote, setActiveNoteId } = useApp();
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<NoteStatus | null>(null);

  const handleDragStart = (noteId: string) => setDraggedNoteId(noteId);
  const handleDragEnd = () => { setDraggedNoteId(null); setDragOverCol(null); };
  const handleDragOver = (e: React.DragEvent, colId: NoteStatus) => {
    e.preventDefault();
    setDragOverCol(colId);
  };
  const handleDrop = (colId: NoteStatus) => {
    if (draggedNoteId) {
      updateNote(draggedNoteId, { status: colId });
    }
    setDraggedNoteId(null);
    setDragOverCol(null);
  };

  const handleOpenNote = (noteId: string) => {
    setActiveNoteId(noteId);
  };

  return (
    <div className="flex-1 overflow-x-auto p-4 bg-background">
      <div className="flex gap-4 min-w-max h-full">
        {COLUMNS.map(col => {
          const colNotes = notes.filter(n => (n.status ?? 'todo') === col.id);
          const isOver = dragOverCol === col.id;
          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-xl border transition-colors ${col.bg} ${isOver ? 'border-primary/50' : 'border-border'}`}
              style={{ width: 280, minHeight: 400 }}
              onDragOver={e => handleDragOver(e, col.id)}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: col.color }} />
                  <span className="font-semibold text-sm">{col.label}</span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{colNotes.length}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => createNote({ title: 'Yeni Not' })}
                  title="Not ekle"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 p-3 space-y-2 overflow-y-auto">
                {colNotes.map(note => (
                  <div
                    key={note.id}
                    draggable
                    onDragStart={() => handleDragStart(note.id)}
                    onDragEnd={handleDragEnd}
                    className={draggedNoteId === note.id ? 'opacity-50' : ''}
                  >
                    <NoteCard note={note} onOpen={() => handleOpenNote(note.id)} />
                  </div>
                ))}
                {colNotes.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground/40 py-6">
                    Bu sütun boş
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
