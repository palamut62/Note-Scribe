import { useRef } from 'react';
import { useApp } from '@/lib/app-state';
import { TabBar } from '@/components/tab-bar';
import { NoteEditor } from '@/components/editor/note-editor';
import { SettingsDialog } from '@/components/settings-dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Printer, FolderOpen } from 'lucide-react';
import { downloadFile, extractTextFromHtml, convertHtmlToMarkdown } from '@/lib/export';

export function Home() {
  const { notes, activeNoteId, createNote, updateNote } = useApp();
  const activeNote = notes.find(n => n.id === activeNoteId) || null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveTxt = () => {
    if (!activeNote) return;
    downloadFile(`${activeNote.title || 'Untitled'}.txt`, extractTextFromHtml(activeNote.content), 'text/plain');
  };

  const handleSaveMd = () => {
    if (!activeNote) return;
    downloadFile(`${activeNote.title || 'Untitled'}.md`, convertHtmlToMarkdown(activeNote.content), 'text/markdown');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const isMarkdown = file.name.endsWith('.md');
      const title = file.name.replace(/\.(txt|md)$/i, '');
      createNote();
      setTimeout(() => {
        const latest = notes[0];
        if (latest) {
          updateNote(latest.id, {
            title,
            content: isMarkdown
              ? `<p>${text.replace(/\n/g, '</p><p>')}</p>`
              : `<p>${text.replace(/\n/g, '</p><p>')}</p>`,
          });
        }
      }, 50);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app-root">
      <div className="app-menubar">
        <span className="app-title">Notlar</span>
        <div className="app-actions">
          <Button
            variant="ghost" size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            data-testid="button-open-file"
            title="Dosya Aç"
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1" />
            Aç
          </Button>
          <input ref={fileInputRef} type="file" accept=".txt,.md" className="hidden" onChange={handleOpenFile} />

          <Button
            variant="ghost" size="sm"
            onClick={handleSaveTxt}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            data-testid="button-save-txt"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />.txt
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={handleSaveMd}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            data-testid="button-save-md"
          >
            <Download className="h-3.5 w-3.5 mr-1" />.md
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={handlePrint}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            data-testid="button-print"
            title="Yazdır / PDF olarak kaydet"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            PDF
          </Button>

          <div className="w-px h-4 bg-border mx-1" />
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
                ? 'Yeni not oluşturmak için + butonuna tıklayın.'
                : 'Bir sekme seçin veya yeni not oluşturun.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
