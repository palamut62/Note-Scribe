import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-font-size';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Link } from '@tiptap/extension-link';
import { Note, TextBox, FloatingImage, HeaderFooter, HFZone } from '@/lib/types';
import { useApp } from '@/lib/app-state';
import { EditorToolbar } from './toolbar';
import { FloatingTextbox } from '../floating-textbox';
import { FloatingImage as FloatingImageComponent } from '../floating-image';
import { FindReplace } from './find-replace';
import { HeaderFooterBar } from './header-footer-bar';

interface Props {
  note: Note;
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export function NoteEditor({ note }: Props) {
  const { updateNote, settings } = useApp();
  const [activeTextboxId, setActiveTextboxId] = useState<string | null>(null);
  const [activeImageId, setActiveImageId] = useState<string | null>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: note.content,
    editorProps: {
      attributes: { class: 'tiptap focus:outline-none min-h-[500px] pb-32' },
    },
    onUpdate: ({ editor }) => {
      updateNote(note.id, { content: editor.getHTML() });
      const text = editor.getText();
      setWordCount(countWords(text));
      setCharCount(text.length);
    },
  });

  useEffect(() => {
    if (editor) {
      const isSameNote = editor.storage.currentNoteId === note.id;
      if (!isSameNote) {
        editor.commands.setContent(note.content || '');
        editor.storage.currentNoteId = note.id;
        const text = editor.getText();
        setWordCount(countWords(text));
        setCharCount(text.length);
        setTimeout(() => editor.commands.focus(), 10);
      }
    }
  }, [note.id]);

  useEffect(() => {
    if (editor && !editor.storage.currentNoteId) {
      editor.storage.currentNoteId = note.id;
      const text = editor.getText();
      setWordCount(countWords(text));
      setCharCount(text.length);
    }
  }, [editor]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(v => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleAddTextbox = () => {
    const newTb: TextBox = {
      id: crypto.randomUUID(),
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      content: '',
      borderStyle: 'solid',
      borderColor: '#cccccc',
      backgroundColor: '#fffde7',
      textColor: '#222222',
      fontSize: 14,
    };
    updateNote(note.id, { textboxes: [...note.textboxes, newTb] });
    setActiveTextboxId(newTb.id);
  };

  const handleAddImage = useCallback((src: string, alt: string) => {
    const newImg: FloatingImage = {
      id: crypto.randomUUID(),
      x: 80,
      y: 80,
      width: 320,
      height: 240,
      src,
      alt,
    };
    const currentImages = note.images ?? [];
    updateNote(note.id, { images: [...currentImages, newImg] });
    setActiveImageId(newImg.id);
  }, [note.id, note.images, updateNote]);

  const updateTextbox = (tbId: string, updates: Partial<TextBox>) => {
    const newTextboxes = note.textboxes.map(tb =>
      tb.id === tbId ? { ...tb, ...updates } : tb
    );
    updateNote(note.id, { textboxes: newTextboxes });
  };

  const deleteTextbox = (tbId: string) => {
    updateNote(note.id, { textboxes: note.textboxes.filter(tb => tb.id !== tbId) });
  };

  const updateImage = (imgId: string, updates: Partial<FloatingImage>) => {
    const currentImages = note.images ?? [];
    updateNote(note.id, {
      images: currentImages.map(img => img.id === imgId ? { ...img, ...updates } : img),
    });
  };

  const deleteImage = (imgId: string) => {
    const currentImages = note.images ?? [];
    updateNote(note.id, { images: currentImages.filter(img => img.id !== imgId) });
  };

  const bgClass =
    settings.backgroundPattern === 'lines'
      ? 'bg-pattern-lines'
      : settings.backgroundPattern === 'grid'
      ? 'bg-pattern-grid'
      : '';

  const handlePageClick = () => {
    setActiveTextboxId(null);
    setActiveImageId(null);
  };

  function migrateZone(z: unknown): HFZone {
    if (!z) return { text: '' };
    if (typeof z === 'string') return { text: z };
    return z as HFZone;
  }
  function migrateHF(hf: unknown, defaultCenter = ''): HeaderFooter {
    const h = hf as Record<string, unknown> | undefined | null;
    if (!h) return { left: { text: '' }, center: { text: defaultCenter }, right: { text: '' }, visible: false };
    return {
      left: migrateZone(h.left),
      center: migrateZone(h.center),
      right: migrateZone(h.right),
      visible: !!(h.visible),
    };
  }
  const safeHeader: HeaderFooter = migrateHF(note.header);
  const safeFooter: HeaderFooter = migrateHF(note.footer, '{sayfa}');

  return (
    <div className="editor-shell">
      <EditorToolbar
        editor={editor}
        note={note}
        onAddTextbox={handleAddTextbox}
        onAddImage={handleAddImage}
        onToggleFindReplace={() => setShowFindReplace(v => !v)}
      />

      {showFindReplace && (
        <FindReplace editor={editor} onClose={() => setShowFindReplace(false)} />
      )}

      <div className="editor-scroll" onClick={handlePageClick}>
        <div className="editor-page">
          {bgClass && (
            <div
              className={`page-pattern-overlay ${bgClass}`}
              style={{
                top: settings.marginTop ?? 80,
                bottom: settings.marginBottom ?? 120,
                left: settings.marginLeft ?? 80,
                right: settings.marginRight ?? 80,
              }}
            />
          )}
          {note.textboxes.map(tb => (
            <FloatingTextbox
              key={tb.id}
              textbox={tb}
              onChange={updateTextbox}
              onDelete={deleteTextbox}
              isActive={activeTextboxId === tb.id}
              onFocus={() => { setActiveTextboxId(tb.id); setActiveImageId(null); }}
            />
          ))}
          {(note.images ?? []).map(img => (
            <FloatingImageComponent
              key={img.id}
              image={img}
              onChange={updateImage}
              onDelete={deleteImage}
              isActive={activeImageId === img.id}
              onFocus={() => { setActiveImageId(img.id); setActiveTextboxId(null); }}
            />
          ))}
          {/* Header */}
          <HeaderFooterBar
            data={safeHeader}
            type="header"
            noteTitle={note.title}
            pageNumber={1}
            marginLeft={settings.marginLeft ?? 80}
            marginRight={settings.marginRight ?? 80}
            height={settings.marginTop ?? 80}
            onChange={u => updateNote(note.id, { header: { ...safeHeader, ...u } })}
          />

          <div
            className="editor-content-area"
            style={{
              paddingTop: settings.marginTop ?? 80,
              paddingBottom: settings.marginBottom ?? 120,
              paddingLeft: settings.marginLeft ?? 80,
              paddingRight: settings.marginRight ?? 80,
            }}
          >
            <EditorContent editor={editor} />
          </div>

          {/* Footer */}
          <HeaderFooterBar
            data={safeFooter}
            type="footer"
            noteTitle={note.title}
            pageNumber={1}
            marginLeft={settings.marginLeft ?? 80}
            marginRight={settings.marginRight ?? 80}
            height={settings.marginBottom ?? 120}
            onChange={u => updateNote(note.id, { footer: { ...safeFooter, ...u } })}
          />
        </div>
      </div>

      <div className="editor-statusbar">
        <span>{wordCount} kelime</span>
        <span className="mx-2 opacity-40">·</span>
        <span>{charCount} karakter</span>
      </div>
    </div>
  );
}
