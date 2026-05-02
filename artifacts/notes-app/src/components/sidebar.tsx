import { useApp } from '@/lib/app-state';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function Sidebar() {
  const { notes, activeNoteId, setActiveNoteId, createNote, deleteNote } = useApp();

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full h-[100dvh]">
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <h1 className="font-serif font-bold text-xl text-sidebar-foreground">Notlar</h1>
        <Button variant="ghost" size="icon" onClick={createNote} className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {notes.length === 0 ? (
          <div className="p-6 text-center text-sm text-sidebar-foreground/50 font-medium">
            No notes yet
          </div>
        ) : (
          <div className="p-2 flex flex-col gap-1">
            {notes.map(note => (
              <div
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                className={`group relative flex flex-col gap-1 p-3 rounded-md cursor-pointer transition-colors ${
                  activeNoteId === note.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                }`}
              >
                <div className="font-semibold text-sm truncate">
                  {note.title || 'Untitled Note'}
                </div>
                <div className="text-xs opacity-70 flex items-center justify-between">
                  <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 text-sidebar-foreground/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-sm hover:bg-sidebar-border"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
