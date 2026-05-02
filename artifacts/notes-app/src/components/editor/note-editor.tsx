import { useEffect, useState, useRef, useCallback } from 'react';
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
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
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
      attributes: {
        class: 'tiptap focus:outline-none min-h-[500px] pb-32',
      },
    },
    onUpdate: ({ editor }) => {
      // Debounce this in a real app, but for simplicity here we save on every keystroke 
      // via local state, or rely on a higher level debouncer. Actually we should just update note content.
      updateNote(note.id, { content: editor.getHTML() });
    },
  });

  // Sync content when switching notes, but avoid resetting while typing
  useEffect(() => {
    if (editor && editor.getHTML() !== note.content) {
      // Only set content if the note actually changed from outside (e.g. note switch)
      // to avoid cursor jumping
      const isSameNote = editor.storage.currentNoteId === note.id;
      if (!isSameNote) {
        editor.commands.setContent(note.content);
        editor.storage.currentNoteId = note.id;
      }
    }
  }, [note.id, note.content, editor]);

  useEffect(() => {
    if (editor) {
      editor.storage.currentNoteId = note.id;
      // focus editor on new note
      if (!note.content) {
        setTimeout(() => editor.commands.focus(), 10);
      }
    }
  }, [editor, note.id]);


  const handleAddTextbox = () => {
    const newTb: TextBox = {
      id: crypto.randomUUID(),
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      content: '',
      borderStyle: 'solid',
      borderColor: '#e5e0d5',
      backgroundColor: '#fffbeb', // soft yellow default
      textColor: '#2c2a29',
      fontSize: 16,
    };
    updateNote(note.id, { textboxes: [...note.textboxes, newTb] });
    setActiveTextboxId(newTb.id);
  };

  const updateTextbox = (tbId: string, updates: Partial<TextBox>) => {
    const newTextboxes = note.textboxes.map(tb => tb.id === tbId ? { ...tb, ...updates } : tb);
    updateNote(note.id, { textboxes: newTextboxes });
  };

  const deleteTextbox = (tbId: string) => {
    updateNote(note.id, { textboxes: note.textboxes.filter(tb => tb.id !== tbId) });
  };

  const getBackgroundClass = () => {
    switch (settings.backgroundPattern) {
      case 'lines': return 'bg-pattern-lines';
      case 'grid': return 'bg-pattern-grid';
      default: return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/30">
      <EditorToolbar editor={editor} onAddTextbox={handleAddTextbox} />
      
      <div 
        className="flex-1 overflow-y-auto px-4 sm:px-12 py-8"
        onClick={() => setActiveTextboxId(null)}
      >
        <div 
          className={`max-w-4xl mx-auto w-full min-h-[1000px] bg-card text-card-foreground shadow-sm rounded-sm relative border border-border/50 ${getBackgroundClass()}`}
        >
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

          <div className="px-12 pt-12 pb-24 outline-none">
            <input 
              type="text"
              value={note.title}
              onChange={(e) => updateNote(note.id, { title: e.target.value })}
              placeholder="Untitled Note"
              className="text-4xl font-serif font-bold w-full bg-transparent outline-none mb-6 placeholder:text-muted-foreground/40 leading-[1.2]"
            />
            
            <div className="pt-[6px]"> {/* Alignment offset for baseline */}
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
