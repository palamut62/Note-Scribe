import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/app-state';
import { useT } from '@/lib/use-t';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, Trash2, Search, SortAsc, SortDesc, FolderPlus,
  Folder as FolderIcon, FolderOpen, ChevronRight, ChevronDown,
  MoreHorizontal, Pin, PinOff, Edit2, Check, X, MoveRight,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { SortBy, SortDir } from '@/lib/types';

function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export function Sidebar() {
  const {
    notes, folders, activeNoteId, setActiveNoteId, createNote, deleteNote,
    settings, searchQuery, setSearchQuery, sortBy, setSortBy, sortDir, setSortDir,
    activeFolderId, setActiveFolderId, createFolder, deleteFolder, renameFolder,
    moveNoteToFolder, togglePinNote,
  } = useApp();

  const t = useT();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const newFolderRef = useRef<HTMLInputElement>(null);
  const editFolderRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    if (showNewFolder && newFolderRef.current) newFolderRef.current.focus();
  }, [showNewFolder]);

  useEffect(() => {
    if (editingFolderId && editFolderRef.current) editFolderRef.current.focus();
  }, [editingFolderId]);

  const SORT_OPTIONS: { key: SortBy; label: string }[] = [
    { key: 'updatedAt', label: t('sort.updated') },
    { key: 'createdAt', label: t('sort.created') },
    { key: 'title', label: t('sort.title') },
    { key: 'wordCount', label: t('sort.words') },
  ];

  const filteredNotes = notes.filter(n => {
    if (activeFolderId === 'unfiled') {
      if (n.folderId) return false;
    } else if (activeFolderId) {
      if (n.folderId !== activeFolderId) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = n.title.toLowerCase();
      const content = extractText(n.content).toLowerCase();
      const tags = (n.tags ?? []).join(' ').toLowerCase();
      if (!title.includes(q) && !content.includes(q) && !tags.includes(q)) return false;
    }
    return true;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'updatedAt') cmp = a.updatedAt.localeCompare(b.updatedAt);
    else if (sortBy === 'createdAt') cmp = a.createdAt.localeCompare(b.createdAt);
    else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortBy === 'wordCount') cmp = countWords(extractText(a.content)) - countWords(extractText(b.content));
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const pinnedNotes = sortedNotes.filter(n => n.isPinned);
  const unpinnedNotes = sortedNotes.filter(n => !n.isPinned);
  const displayNotes = [...pinnedNotes, ...unpinnedNotes];

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
    }
    setShowNewFolder(false);
  };

  const handleRenameFolder = (id: string) => {
    if (editingFolderName.trim()) renameFolder(id, editingFolderName.trim());
    setEditingFolderId(null);
    setEditingFolderName('');
  };

  const FOLDER_COLORS = ['#3b82f6','#22c55e','#f97316','#ef4444','#8b5cf6','#ec4899','#eab308','#06b6d4'];

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col h-full h-[100dvh]">
      {/* Header */}
      <div className="p-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-serif font-bold text-lg text-sidebar-foreground">Notlar</h1>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => { setShowSearch(v => !v); if (showSearch) setSearchQuery(''); }}
              title={t('search.placeholder')}
            >
              <Search className="h-3.5 w-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost" size="icon"
                  className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  title="Sırala"
                >
                  {sortDir === 'desc' ? <SortDesc className="h-3.5 w-3.5" /> : <SortAsc className="h-3.5 w-3.5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {SORT_OPTIONS.map(o => (
                  <DropdownMenuItem
                    key={o.key}
                    onClick={() => {
                      if (sortBy === o.key) setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
                      else { setSortBy(o.key); setSortDir('desc'); }
                    }}
                    className="flex items-center justify-between"
                  >
                    <span>{o.label}</span>
                    {sortBy === o.key && (
                      <span className="text-primary text-xs">{sortDir === 'desc' ? '↓' : '↑'}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setShowNewFolder(true)}
              title={t('folder.new')}
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost" size="icon"
              className="h-7 w-7 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => createNote({ folderId: activeFolderId && activeFolderId !== 'unfiled' ? activeFolderId : undefined })}
              title="Yeni Not"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showSearch && (
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-sidebar-foreground/40" />
            <input
              ref={searchRef}
              className="w-full pl-6 pr-2 py-1 text-xs bg-sidebar-accent/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-sidebar-foreground placeholder:text-sidebar-foreground/40"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sidebar-foreground/40 hover:text-sidebar-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        {showNewFolder && (
          <div className="mt-2 flex items-center gap-1">
            <input
              ref={newFolderRef}
              className="flex-1 px-2 py-1 text-xs bg-sidebar-accent/50 border border-border rounded-md outline-none focus:ring-1 focus:ring-primary text-sidebar-foreground placeholder:text-sidebar-foreground/40"
              placeholder={t('folder.name.placeholder')}
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateFolder();
                if (e.key === 'Escape') { setShowNewFolder(false); setNewFolderName(''); }
              }}
            />
            <button onClick={handleCreateFolder} className="text-primary hover:text-primary/70"><Check className="h-3.5 w-3.5" /></button>
            <button onClick={() => { setShowNewFolder(false); setNewFolderName(''); }} className="text-sidebar-foreground/40 hover:text-sidebar-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* All Notes */}
          <button
            onClick={() => setActiveFolderId(null)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors mb-0.5 ${
              activeFolderId === null
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            }`}
          >
            <FolderOpen className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left truncate">{t('folder.all')}</span>
            <span className="text-sidebar-foreground/40 text-[10px]">{notes.length}</span>
          </button>

          {/* Unfiled */}
          {notes.some(n => !n.folderId) && (
            <button
              onClick={() => setActiveFolderId('unfiled')}
              className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-colors mb-0.5 ${
                activeFolderId === 'unfiled'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
            >
              <FolderIcon className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <span className="flex-1 text-left truncate">{t('folder.unfiled')}</span>
              <span className="text-sidebar-foreground/40 text-[10px]">{notes.filter(n => !n.folderId).length}</span>
            </button>
          )}

          {/* Folders */}
          {folders.map(folder => {
            const folderNotes = notes.filter(n => n.folderId === folder.id);
            const isExpanded = expandedFolders.has(folder.id);
            const isActive = activeFolderId === folder.id;
            return (
              <div key={folder.id} className="mb-0.5">
                <div className={`group flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}>
                  <button
                    className="shrink-0"
                    onClick={() => setExpandedFolders(s => { const n = new Set(s); if (n.has(folder.id)) n.delete(folder.id); else n.add(folder.id); return n; })}
                  >
                    {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                  </button>
                  <button className="flex-1 flex items-center gap-1.5 min-w-0 text-left" onClick={() => setActiveFolderId(folder.id)}>
                    <FolderIcon className="h-3.5 w-3.5 shrink-0" style={{ color: folder.color }} />
                    {editingFolderId === folder.id ? (
                      <input
                        ref={editFolderRef}
                        className="flex-1 min-w-0 bg-transparent border-b border-primary outline-none text-xs"
                        value={editingFolderName}
                        onChange={e => setEditingFolderName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameFolder(folder.id);
                          if (e.key === 'Escape') { setEditingFolderId(null); }
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 truncate">{folder.name}</span>
                    )}
                    <span className="text-sidebar-foreground/40 text-[10px] shrink-0">{folderNotes.length}</span>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-sidebar-foreground transition-opacity shrink-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}>
                        <Edit2 className="h-3.5 w-3.5 mr-2" />{t('folder.rename')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => deleteFolder(folder.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-2" />{t('folder.delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}

          {folders.length > 0 && <div className="border-t border-border/50 my-2" />}

          {/* Notes List */}
          {displayNotes.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-sidebar-foreground/40">
              {searchQuery ? t('search.no.results') : t('note.empty')}
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {displayNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => setActiveNoteId(note.id)}
                  className={`group relative flex flex-col gap-1 p-2.5 rounded-md cursor-pointer transition-colors ${
                    activeNoteId === note.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 text-sidebar-foreground'
                  }`}
                >
                  {note.isPinned && (
                    <Pin className="absolute top-2 right-2 h-2.5 w-2.5 text-primary opacity-60" />
                  )}
                  {note.encrypted && (
                    <span className="absolute top-2 right-6 text-[9px] text-amber-500">🔒</span>
                  )}
                  <div className="font-semibold text-xs truncate pr-8">
                    {note.title || 'Untitled Note'}
                  </div>
                  {!note.encrypted && (
                    <div className="text-[10px] opacity-50 truncate">
                      {extractText(note.content).slice(0, 60) || '—'}
                    </div>
                  )}
                  <div className="text-[10px] opacity-50">
                    {format(new Date(note.updatedAt), 'dd MMM yyyy')}
                    {note.tags?.length ? (
                      <span className="ml-1 opacity-70">{note.tags.slice(0, 2).map(t => `#${t}`).join(' ')}</span>
                    ) : null}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute bottom-2 right-1.5 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-sidebar-foreground/40 hover:text-sidebar-foreground rounded-sm hover:bg-sidebar-border"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={e => { e.stopPropagation(); togglePinNote(note.id); }}>
                        {note.isPinned ? <><PinOff className="h-3.5 w-3.5 mr-2" />Sabitlemeyi kaldır</> : <><Pin className="h-3.5 w-3.5 mr-2" />Sabitle</>}
                      </DropdownMenuItem>
                      {folders.length > 0 && (
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <MoveRight className="h-3.5 w-3.5 mr-2" />{t('folder.move')}
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => moveNoteToFolder(note.id, undefined)}>
                              {t('folder.unfiled')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {folders.map(f => (
                              <DropdownMenuItem key={f.id} onClick={() => moveNoteToFolder(note.id, f.id)}>
                                <span className="w-2 h-2 rounded-full mr-2 shrink-0" style={{ background: f.color }} />
                                {f.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
