import { useRef, useState, useEffect } from 'react';
import { useApp } from '@/lib/app-state';
import { useT } from '@/lib/use-t';
import { TabBar } from '@/components/tab-bar';
import { NoteEditor } from '@/components/editor/note-editor';
import { SettingsDialog } from '@/components/settings-dialog';
import { PrintPreview } from '@/components/print-preview';
import { TagBar } from '@/components/tag-bar';
import { ClipboardHistoryBtn, useClipboardHistory } from '@/components/clipboard-history';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Download, FileText, Printer, FolderOpen, Eye,
  FileDown, Link, Filter, MoreHorizontal, Check,
} from 'lucide-react';
import { downloadFile, extractTextFromHtml, convertHtmlToMarkdown, exportDocx, noteToShareUrl, parseShareUrl } from '@/lib/export';
import mammoth from 'mammoth';

export function Home() {
  const { notes, activeNoteId, createNote, updateNote, settings } = useApp();
  const t = useT();
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
        <span className="app-title">{t('app.title')}</span>
        <div className="app-actions">
          <input ref={fileInputRef} type="file" accept=".txt,.md,.docx" className="hidden" onChange={handleOpenFile} />

          <ClipboardHistoryBtn history={clipboardHistory} />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                title="Dosya işlemleri"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal pb-1">
                {t('menu.import')}
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <FolderOpen className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {t('menu.open.file')}
                <span className="ml-auto text-[10px] text-muted-foreground">.txt .md .docx</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal pb-1">
                {t('menu.export')}
              </DropdownMenuLabel>

              <DropdownMenuItem onClick={handleSaveTxt} disabled={!activeNote}>
                <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {t('menu.save.txt')}
                <span className="ml-auto text-[10px] text-muted-foreground">.txt</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSaveMd} disabled={!activeNote}>
                <Download className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {t('menu.save.md')}
                <span className="ml-auto text-[10px] text-muted-foreground">.md</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleSaveDocx} disabled={!activeNote}>
                <FileDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {t('menu.save.docx')}
                <span className="ml-auto text-[10px] text-muted-foreground">.docx</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-normal pb-1">
                {t('menu.share.section')}
              </DropdownMenuLabel>

              <DropdownMenuItem onClick={handleShare} disabled={!activeNote}>
                {shareCopied
                  ? <Check className="h-3.5 w-3.5 mr-2 text-green-500" />
                  : <Link className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                }
                {shareCopied ? t('menu.link.copied') : t('menu.copy.link')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setShowPrintPreview(true)} disabled={!activeNote}>
                <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {t('menu.print.preview')}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => window.print()} disabled={!activeNote}>
                <Printer className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {t('menu.print.pdf')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-4 bg-border mx-0.5" />
          <SettingsDialog />
        </div>
      </div>

      <TabBar />

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
                ? t('note.filter.none', { tag: filterTag })
                : notes.length === 0
                  ? t('note.empty.new')
                  : t('note.select')}
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
