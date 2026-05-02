import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { FontFamily } from '@tiptap/extension-font-family';
import { FontSize } from '@tiptap/extension-font-size';
import { Note, TextBox } from '@/lib/types';
import { useApp } from '@/lib/app-state';
import { EditorToolbar } from './toolbar';
import { FloatingTextbox } from '../floating-textbox';

interface Props {
  note: Note;
}

export function NoteEditor({ note }: Props) {
  const { updateNote, settings } = useApp();
  const [activeTextboxId, setActiveTextboxId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: note.content,
    editorProps: {
      attributes: { class: 'tiptap focus:outline-none min-h-[500px] pb-32' },
    },
    onUpdate: ({ editor }) => {
      updateNote(note.id, { content: editor.getHTML() });
    },
  });

  useEffect(() => {
    if (editor) {
      const isSameNote = editor.storage.currentNoteId === note.id;
      if (!isSameNote) {
        editor.commands.setContent(note.content || '');
        editor.storage.currentNoteId = note.id;
        setTimeout(() => editor.commands.focus(), 10);
      }
    }
  }, [note.id]);

  useEffect(() => {
    if (editor && !editor.storage.currentNoteId) {
      editor.storage.currentNoteId = note.id;
    }
  }, [editor]);

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

  const updateTextbox = (tbId: string, updates: Partial<TextBox>) => {
    const newTextboxes = note.textboxes.map(tb =>
      tb.id === tbId ? { ...tb, ...updates } : tb
    );
    updateNote(note.id, { textboxes: newTextboxes });
  };

  const deleteTextbox = (tbId: string) => {
    updateNote(note.id, {
      textboxes: note.textboxes.filter(tb => tb.id !== tbId),
    });
  };

  const bgClass =
    settings.backgroundPattern === 'lines'
      ? 'bg-pattern-lines'
      : settings.backgroundPattern === 'grid'
      ? 'bg-pattern-grid'
      : '';

  return (
    <div className="editor-shell">
      <EditorToolbar editor={editor} onAddTextbox={handleAddTextbox} />

      <div
        className="editor-scroll"
        onClick={() => setActiveTextboxId(null)}
      >
        <div className={`editor-page ${bgClass}`}>
          {note.textboxes.map(tb => (
            <FloatingTextbox
              key={tb.id}
              textbox={tb}
              onChange={updateTextbox}
              onDelete={deleteTextbox}
              isActive={activeTextboxId === tb.id}
              onFocus={() => setActiveTextboxId(tb.id)}
            />
          ))}

          <div className="editor-content-area">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
