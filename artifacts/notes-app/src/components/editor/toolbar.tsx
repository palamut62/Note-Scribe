import { Editor } from '@tiptap/react';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Wand2, Square, Search, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Code, Heading1, Heading2, Heading3,
  Quote, Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/lib/app-state';
import { fixText } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';

interface ToolbarProps {
  editor: Editor | null;
  onAddTextbox: () => void;
  onToggleFindReplace: () => void;
}

const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca',
  '#e9d5ff', '#fed7aa', '#ffffff', 'transparent',
];

const TEXT_COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#ffffff',
];

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

interface ColorSwatchProps {
  colors: string[];
  onSelect: (color: string) => void;
  label: string;
  currentColor?: string;
  icon: React.ReactNode;
}

function ColorSwatch({ colors, onSelect, label, currentColor, icon }: ColorSwatchProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative" ref={ref}>
      <button
        className="toolbar-color-btn"
        onClick={() => setOpen(o => !o)}
        title={label}
        style={{ '--color-indicator': currentColor || 'transparent' } as React.CSSProperties}
      >
        {icon}
        <span
          className="color-indicator"
          style={{ backgroundColor: currentColor && currentColor !== 'transparent' ? currentColor : undefined }}
        />
      </button>
      {open && (
        <div className="color-swatch-popup" onMouseLeave={() => setOpen(false)}>
          {colors.map(c => (
            <button
              key={c}
              className="color-swatch-item"
              style={{ backgroundColor: c === 'transparent' ? undefined : c }}
              onClick={() => { onSelect(c); setOpen(false); }}
              title={c}
            >
              {c === 'transparent' && <span className="text-[8px] leading-none">off</span>}
            </button>
          ))}
          <input
            type="color"
            className="color-swatch-custom"
            onChange={e => { onSelect(e.target.value); setOpen(false); }}
            title="Özel renk"
          />
        </div>
      )}
    </div>
  );
}

export function EditorToolbar({ editor, onAddTextbox, onToggleFindReplace }: ToolbarProps) {
  const { settings } = useApp();
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleFixText = async () => {
    if (!settings.apiKey || !settings.selectedModel) {
      toast({ title: 'AI Yapılandırılmadı', description: 'Ayarlar\'dan sağlayıcı ve model seçin.', variant: 'destructive' });
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
      toast({ title: 'Düzeltildi', description: 'AI metni başarıyla düzeltti.' });
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message || 'Metin düzeltilemedi', variant: 'destructive' });
    } finally {
      setIsFixing(false);
    }
  };

  const handleInsertLink = () => {
    const url = window.prompt('URL girin:', 'https://');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        editor.chain().focus().setImage({ src: reader.result }).run();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const isActive = (name: string, attrs?: object) => editor.isActive(name, attrs);

  return (
    <div className="toolbar-root">
      {/* Row 1: paragraph style + font */}
      <div className="toolbar-row">
        <Select
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1' :
            editor.isActive('heading', { level: 2 }) ? 'h2' :
            editor.isActive('heading', { level: 3 }) ? 'h3' :
            editor.isActive('codeBlock') ? 'code' :
            editor.isActive('blockquote') ? 'quote' :
            'p'
          }
          onValueChange={val => {
            if (val === 'h1') editor.chain().focus().setHeading({ level: 1 }).run();
            else if (val === 'h2') editor.chain().focus().setHeading({ level: 2 }).run();
            else if (val === 'h3') editor.chain().focus().setHeading({ level: 3 }).run();
            else if (val === 'code') editor.chain().focus().setCodeBlock().run();
            else if (val === 'quote') editor.chain().focus().setBlockquote().run();
            else editor.chain().focus().setParagraph().run();
          }}
        >
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Normal</SelectItem>
            <SelectItem value="h1">Başlık 1</SelectItem>
            <SelectItem value="h2">Başlık 2</SelectItem>
            <SelectItem value="h3">Başlık 3</SelectItem>
            <SelectItem value="code">Kod Bloğu</SelectItem>
            <SelectItem value="quote">Alıntı</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
          onValueChange={val => editor.chain().focus().setFontFamily(val).run()}
        >
          <SelectTrigger className="h-7 w-[110px] text-xs">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Sans Serif</SelectItem>
            <SelectItem value="Georgia">Serif</SelectItem>
            <SelectItem value="Menlo">Monospace</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Arial">Arial</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={editor.getAttributes('textStyle').fontSize || '16pt'}
          onValueChange={val => editor.chain().focus().setFontSize(val).run()}
        >
          <SelectTrigger className="h-7 w-[68px] text-xs">
            <SelectValue placeholder="Boyut" />
          </SelectTrigger>
          <SelectContent>
            {['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48'].map(s => (
              <SelectItem key={s} value={`${s}pt`}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Divider />

        {/* Text color */}
        <ColorSwatch
          colors={TEXT_COLORS}
          onSelect={c => editor.chain().focus().setColor(c).run()}
          label="Yazı rengi"
          currentColor={editor.getAttributes('textStyle').color || '#000000'}
          icon={<span className="text-[11px] font-bold leading-none select-none">A</span>}
        />

        {/* Highlight color */}
        <ColorSwatch
          colors={HIGHLIGHT_COLORS}
          onSelect={c => {
            if (c === 'transparent') editor.chain().focus().unsetHighlight().run();
            else editor.chain().focus().setHighlight({ color: c }).run();
          }}
          label="Vurgu rengi"
          currentColor={editor.getAttributes('highlight').color || '#fef08a'}
          icon={<span className="text-[11px] font-bold leading-none select-none" style={{ background: 'linear-gradient(to bottom, transparent 50%, #fef08a 50%)' }}>A</span>}
        />

        <Divider />

        {/* Format buttons */}
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('bold') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()} title="Kalın (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('italic') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()} title="İtalik (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('underline') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Altı çizili (Ctrl+U)">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('strike') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleStrike().run()} title="Üstü çizili">
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('code') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleCode().run()} title="Satır içi kod">
          <Code className="h-3.5 w-3.5" />
        </Button>

        <Divider />

        {/* Alignment */}
        <Button variant="ghost" size="icon" className={`tbtn ${isActive({ textAlign: 'left' }) ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Sola hizala">
          <AlignLeft className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive({ textAlign: 'center' }) ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Ortala">
          <AlignCenter className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive({ textAlign: 'right' }) ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Sağa hizala">
          <AlignRight className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive({ textAlign: 'justify' }) ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="İki yana yasla">
          <AlignJustify className="h-3.5 w-3.5" />
        </Button>

        <Divider />

        {/* Lists */}
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('bulletList') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Madde işaretli liste">
          <List className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('orderedList') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numaralı liste">
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className={`tbtn ${isActive('taskList') ? 'tbtn-on' : ''}`} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Todo listesi">
          <CheckSquare className="h-3.5 w-3.5" />
        </Button>

        <Divider />

        {/* Insert */}
        <Button variant="ghost" size="icon" className="tbtn" onClick={handleInsertLink} title="Link ekle">
          <LinkIcon className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="tbtn" onClick={() => imageInputRef.current?.click()} title="Resim ekle">
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <Button variant="ghost" size="icon" className="tbtn" onClick={handleInsertTable} title="Tablo ekle">
          <TableIcon className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="tbtn" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Yatay çizgi">
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="tbtn" onClick={onAddTextbox} title="Metin kutusu ekle">
          <Square className="h-3.5 w-3.5" />
        </Button>

        <Divider />

        <Button variant="ghost" size="icon" className="tbtn" onClick={onToggleFindReplace} title="Bul & Değiştir (Ctrl+F)">
          <Search className="h-3.5 w-3.5" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="sm"
          className={`h-7 text-xs gap-1 px-2 ${isFixing ? 'opacity-70' : 'text-primary hover:bg-primary/10'}`}
          onClick={handleFixText}
          disabled={isFixing}
          title="AI ile düzelt"
        >
          <Wand2 className={`h-3.5 w-3.5 ${isFixing ? 'animate-pulse' : ''}`} />
          {isFixing ? 'Düzeltiliyor...' : 'AI Düzelt'}
        </Button>
      </div>

      {/* Row 2: table controls (shown only when cursor is in a table) */}
      {isActive('table') && (
        <div className="toolbar-row toolbar-row-secondary">
          <span className="text-[11px] text-muted-foreground mr-1">Tablo:</span>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => editor.chain().focus().addColumnBefore().run()}>+ Sütun önce</Button>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => editor.chain().focus().addColumnAfter().run()}>+ Sütun sonra</Button>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => editor.chain().focus().deleteColumn().run()}>- Sütun sil</Button>
          <Divider />
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => editor.chain().focus().addRowBefore().run()}>+ Satır önce</Button>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => editor.chain().focus().addRowAfter().run()}>+ Satır sonra</Button>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2" onClick={() => editor.chain().focus().deleteRow().run()}>- Satır sil</Button>
          <Divider />
          <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2 text-destructive" onClick={() => editor.chain().focus().deleteTable().run()}>Tabloyu sil</Button>
        </div>
      )}
    </div>
  );
}
