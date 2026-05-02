import { useEffect } from 'react';
import { useApp } from '@/lib/app-state';
import { Sidebar } from '@/components/sidebar';
import { NoteEditor } from '@/components/editor/note-editor';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { downloadFile, extractTextFromHtml, convertHtmlToMarkdown } from '@/lib/export';

export function Home() {
  const { notes, activeNoteId, deleteNote, activeNote } = useAppWithActiveNote();

  // Handle empty note cleanup
  useEffect(() => {
    return () => {
      // When unmounting or switching notes, cleanup empty ones
      const emptyNotes = notes.filter(n => !n.title.trim() && (!n.content || extractTextFromHtml(n.content).trim() === ''));
      emptyNotes.forEach(n => {
        if (n.id !== activeNoteId) {
          deleteNote(n.id);
        }
      });
    };
  }, [activeNoteId, notes, deleteNote]);


  const handleSaveTxt = () => {
    if (!activeNote) return;
    const text = extractTextFromHtml(activeNote.content);
    downloadFile(`${activeNote.title || 'Untitled'}.txt`, text, 'text/plain');
  };

  const handleSaveMd = () => {
    if (!activeNote) return;
    const md = convertHtmlToMarkdown(activeNote.content);
    downloadFile(`${activeNote.title || 'Untitled'}.md`, md, 'text/markdown');
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      <Sidebar />
      
      {activeNote ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <header className="h-14 border-b border-border bg-card/80 backdrop-blur shrink-0 flex items-center justify-between px-4">
            <div className="font-medium text-sm text-muted-foreground truncate max-w-sm">
              {activeNote.title || 'Untitled Note'}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSaveTxt} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <FileText className="h-3.5 w-3.5 mr-1" /> .txt
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSaveMd} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                <Download className="h-3.5 w-3.5 mr-1" /> .md
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <SettingsDialog />
            </div>
          </header>
          
          <NoteEditor note={activeNote} />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <div className="text-center text-muted-foreground/60">
            <p className="font-serif text-lg mb-2">Select a note or create a new one.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function useAppWithActiveNote() {
  const app = useApp();
  const activeNote = app.notes.find(n => n.id === app.activeNoteId) || null;
  return { ...app, activeNote };
}
