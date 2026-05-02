import { useApp } from '@/lib/app-state';
import { TabBar } from '@/components/tab-bar';
import { NoteEditor } from '@/components/editor/note-editor';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { downloadFile, extractTextFromHtml, convertHtmlToMarkdown } from '@/lib/export';

export function Home() {
  const { notes, activeNoteId } = useApp();
  const activeNote = notes.find(n => n.id === activeNoteId) || null;

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
    <div className="app-root">
      <div className="app-menubar">
        <span className="app-title">Notlar</span>
        <div className="app-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveTxt}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            data-testid="button-save-txt"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            .txt
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveMd}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            data-testid="button-save-md"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            .md
          </Button>
          <div className="w-px h-4 bg-border" />
          <SettingsDialog />
        </div>
      </div>

      <TabBar />

      <div className="app-editor-area">
        {activeNote ? (
          <NoteEditor note={activeNote} />
        ) : (
          <div className="app-empty-state">
            <p>
              {notes.length === 0
                ? 'New note oluşturmak için + butonuna tıklayın.'
                : 'Bir sekme seçin veya yeni not oluşturun.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
