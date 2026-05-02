import { useRef, useState, useEffect } from 'react';
import { useApp } from '@/lib/app-state';
import { TabBar } from '@/components/tab-bar';
import { NoteEditor } from '@/components/editor/note-editor';
import { SettingsDialog } from '@/components/settings-dialog';
import { PrintPreview } from '@/components/print-preview';
import { TagBar } from '@/components/tag-bar';
import { ClipboardHistoryBtn, useClipboardHistory } from '@/components/clipboard-history';
import { Button } from '@/components/ui/button';
import {
  Download, FileText, Printer, FolderOpen, Eye,
  FileDown, Link, Filter,
} from 'lucide-react';
import { downloadFile, extractTextFromHtml, convertHtmlToMarkdown, exportDocx, noteToShareUrl, parseShareUrl } from '@/lib/export';
import mammoth from 'mammoth';

export function Home() {
  const { notes, activeNoteId, createNote, updateNote, settings } = useApp();
  const activeNote = notes.find(n => n.id === activeNoteId) || null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const clipboardHistory = useClipboardHistory();

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags ?? [])));
  const visibleNotes = filterTag ? notes.filter(n => (n.tags ?? []).includes(filterTag)) : notes;

  useEffect(() => {
    const shared = parseShareUrl();
    if (shared) {
      const confirmed = window.confirm(`"${shared.title || 'Paylaşılan Not'}" notunu içe aktarmak istiyor musunuz?`);
      if (confirmed) {
        createNote({ title: shared.title, content: shared.content, tags: shared.tags });
      }
      window.location.hash = '';
    }
  }, []);

  const handleSaveTxt = () => {
    if (!activeNote) return;
    downloadFile(`${activeNote.title || 'Untitled'}.txt`, extractTextFromHtml(activeNote.content), 'text/plain');
  };

  const handleSaveMd = () => {
    if (!activeNote) return;
    downloadFile(`${activeNote.title || 'Untitled'}.md`, convertHtmlToMarkdown(activeNote.content), 'text/markdown');
  };

  const handleSaveDocx = async () => {
    if (!activeNote) return;
    await exportDocx(activeNote);
  };

  const handleOpenFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.name.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const title = file.name.replace(/\.docx$/i, '');
      createNote({ title, content: result.value });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const raw = reader.result as string;
      const title = file.name.replace(/\.(txt|md)$/i, '');
      const content = raw
        .split('\n')
        .map(line => `<p>${line || '<br>'}</p>`)
        .join('');
      createNote({ title, content });
    };
    reader.readAsText(file);
  };

  const handleShare = async () => {
    if (!activeNote) return;
    const url = noteToShareUrl(activeNote);
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
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
            title="Dosya Aç"
          >
            <FolderOpen className="h-3.5 w-3.5 mr-1" />Aç
          </Button>
          <input ref={fileInputRef} type="file" accept=".txt,.md,.docx" className="hidden" onChange={handleOpenFile} />

          <Button
            variant="ghost" size="sm"
            onClick={handleSaveTxt}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />.txt
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={handleSaveMd}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5 mr-1" />.md
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={handleSaveDocx}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            title="Word belgesi olarak indir"
          >
            <FileDown className="h-3.5 w-3.5 mr-1" />.docx
          </Button>

          <Button
            variant="ghost" size="sm"
            onClick={handleShare}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            title="Not bağlantısını kopyala"
          >
            <Link className="h-3.5 w-3.5 mr-1" />
            {shareCopied ? 'Kopyalandı!' : 'Paylaş'}
          </Button>

          <Button
            variant="ghost" size="sm"
            onClick={() => setShowPrintPreview(true)}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            title="Baskı önizleme"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />Önizle
          </Button>

          <Button
            variant="ghost" size="sm"
            onClick={() => window.print()}
            disabled={!activeNote}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
            title="Yazdır / PDF olarak kaydet"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />PDF
          </Button>

          <ClipboardHistoryBtn history={clipboardHistory} />

          <div className="w-px h-4 bg-border mx-1" />
          <SettingsDialog />
        </div>
      </div>

      <TabBar />

      {/* Tag bar — tag filter + active note tags */}
      {(allTags.length > 0 || activeNote) && (
        <div className="global-tag-bar">
          {allTags.length > 0 && (
            <div className="global-tag-filter">
              <Filter size={11} className="opacity-50" />
              {allTags.map(tag => (
                <button
                  key={tag}
                  className={`gtag-btn ${filterTag === tag ? 'gtag-active' : ''}`}
                  style={filterTag === tag ? { background: tagColor(tag) + '22', color: tagColor(tag), borderColor: tagColor(tag) } : {}}
                  onClick={() => setFilterTag(prev => prev === tag ? null : tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
          {activeNote && (
            <TagBar
              noteId={activeNote.id}
              tags={activeNote.tags ?? []}
              filterTag={filterTag}
              onFilterTag={setFilterTag}
              allTags={allTags}
            />
          )}
        </div>
      )}

      <div className="app-editor-area">
        {activeNote && visibleNotes.some(n => n.id === activeNoteId) ? (
          <NoteEditor note={activeNote} />
        ) : (
          <div className="app-empty-state">
            <p>
              {filterTag
                ? `"#${filterTag}" etiketli not bulunamadı.`
                : notes.length === 0
                  ? 'Yeni not oluşturmak için + butonuna tıklayın.'
                  : 'Bir sekme seçin veya yeni not oluşturun.'}
            </p>
          </div>
        )}
      </div>

      {showPrintPreview && activeNote && (
        <PrintPreview
          note={activeNote}
          settings={settings}
          onClose={() => setShowPrintPreview(false)}
        />
      )}
    </div>
  );
}

function tagColor(tag: string): string {
  const TAG_COLORS = [
    '#ef4444','#f97316','#eab308','#22c55e',
    '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
  ];
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}
