import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Underline as UnderlineIcon, 
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, CheckSquare,
  Wand2, Square
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/lib/app-state';
import { fixText } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  onAddTextbox: () => void;
}

export function EditorToolbar({ editor, onAddTextbox }: ToolbarProps) {
  const { settings } = useApp();
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);

  if (!editor) return null;

  const handleFixText = async () => {
    if (!settings.apiKey || !settings.selectedModel) {
      toast({
        title: "AI Not Configured",
        description: "Please configure your AI provider and model in settings.",
        variant: "destructive"
      });
      return;
    }

    const selection = editor.state.selection;
    const isTextSelected = !selection.empty;
    const textToFix = isTextSelected 
      ? editor.state.doc.textBetween(selection.from, selection.to, ' ') 
      : editor.getText();

    if (!textToFix.trim()) return;

    setIsFixing(true);
    try {
      const fixedText = await fixText(textToFix, settings.provider, settings.apiKey, settings.selectedModel);
      
      if (isTextSelected) {
        editor.commands.insertContentAt({ from: selection.from, to: selection.to }, fixedText);
      } else {
        editor.commands.setContent(fixedText);
      }
      
      toast({
        title: "Text Fixed",
        description: "AI has successfully fixed your text.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to fix text",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 flex-wrap">
      <Select 
        value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
        onValueChange={(val) => editor.chain().focus().setFontFamily(val).run()}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Inter">Sans Serif</SelectItem>
          <SelectItem value="Georgia">Serif</SelectItem>
          <SelectItem value="Menlo">Monospace</SelectItem>
        </SelectContent>
      </Select>

      <Select 
        value={editor.getAttributes('textStyle').fontSize || '16pt'}
        onValueChange={(val) => editor.chain().focus().setFontSize(val).run()}
      >
        <SelectTrigger className="w-[80px] h-8 text-xs">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {['12', '14', '16', '18', '20', '24', '28', '32'].map(size => (
            <SelectItem key={size} value={`${size}pt`}>{size}px</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-4 bg-border mx-1" />

      <div className="flex items-center">
        <input 
          type="color" 
          className="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0" 
          value={editor.getAttributes('textStyle').color || '#2c2a29'}
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Text Color"
        />
      </div>

      <div className="w-px h-4 bg-border mx-1" />

      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('underline') ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className={`h-8 w-8 ${editor.isActive('taskList') ? 'bg-accent' : ''}`} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <CheckSquare className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={onAddTextbox}>
        <Square className="h-3.5 w-3.5" />
        Add Textbox
      </Button>

      <div className="flex-1" />

      <Button 
        variant="secondary" 
        size="sm" 
        className="h-8 text-xs gap-1 bg-primary/10 text-primary hover:bg-primary/20"
        onClick={handleFixText}
        disabled={isFixing}
      >
        <Wand2 className={`h-3.5 w-3.5 ${isFixing ? 'animate-pulse' : ''}`} />
        {isFixing ? 'Fixing...' : 'AI Fix'}
      </Button>
    </div>
  );
}
