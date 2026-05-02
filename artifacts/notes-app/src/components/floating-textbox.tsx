import { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { TextBox } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Settings2 } from 'lucide-react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

interface Props {
  textbox: TextBox;
  onChange: (id: string, updates: Partial<TextBox>) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  onFocus: () => void;
}

export function FloatingTextbox({ textbox, onChange, onDelete, isActive, onFocus }: Props) {
  const [localContent, setLocalContent] = useState(textbox.content);

  useEffect(() => {
    setLocalContent(textbox.content);
  }, [textbox.content]);

  const handleBlur = () => {
    if (localContent !== textbox.content) {
      onChange(textbox.id, { content: localContent });
    }
  };

  return (
    <Rnd
      size={{ width: textbox.width, height: textbox.height }}
      position={{ x: textbox.x, y: textbox.y }}
      onDragStop={(e, d) => {
        onChange(textbox.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        onChange(textbox.id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          ...position,
        });
      }}
      bounds="parent"
      className={`absolute z-20 group ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
      onClick={onFocus}
      dragHandleClassName="drag-handle"
    >
      <div 
        className="w-full h-full flex flex-col shadow-md rounded-md overflow-hidden relative"
        style={{
          borderStyle: textbox.borderStyle,
          borderWidth: textbox.borderStyle !== 'none' ? 2 : 0,
          borderColor: textbox.borderColor,
          backgroundColor: textbox.backgroundColor,
        }}
      >
        <div className="h-6 drag-handle bg-black/5 hover:bg-black/10 cursor-move flex items-center justify-end px-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 mr-1 text-black/50 hover:text-black">
                <Settings2 className="h-3 w-3" />
              </Button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Content className="z-50 w-64 bg-popover text-popover-foreground border p-3 rounded-md shadow-md outline-none animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
              <div className="grid gap-3">
                <div className="grid grid-cols-2 items-center gap-2">
                  <span className="text-xs font-medium">Border</span>
                  <Select value={textbox.borderStyle} onValueChange={(v: any) => onChange(textbox.id, { borderStyle: v })}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="solid">Solid</SelectItem>
                      <SelectItem value="dashed">Dashed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 items-center gap-2">
                  <span className="text-xs font-medium">Border Color</span>
                  <input type="color" value={textbox.borderColor} onChange={e => onChange(textbox.id, { borderColor: e.target.value })} className="h-6 w-full cursor-pointer p-0 border-0" disabled={textbox.borderStyle === 'none'}/>
                </div>

                <div className="grid grid-cols-2 items-center gap-2">
                  <span className="text-xs font-medium">Background</span>
                  <input type="color" value={textbox.backgroundColor} onChange={e => onChange(textbox.id, { backgroundColor: e.target.value })} className="h-6 w-full cursor-pointer p-0 border-0"/>
                </div>

                <div className="grid grid-cols-2 items-center gap-2">
                  <span className="text-xs font-medium">Text Color</span>
                  <input type="color" value={textbox.textColor} onChange={e => onChange(textbox.id, { textColor: e.target.value })} className="h-6 w-full cursor-pointer p-0 border-0"/>
                </div>

                <div className="grid grid-cols-2 items-center gap-2">
                  <span className="text-xs font-medium">Font Size</span>
                  <Select value={textbox.fontSize.toString()} onValueChange={v => onChange(textbox.id, { fontSize: parseInt(v, 10) })}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[12,14,16,18,20,24,28,32].map(s => <SelectItem key={s} value={s.toString()}>{s}px</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Root>

          <Button variant="ghost" size="icon" className="h-4 w-4 text-black/50 hover:text-destructive" onClick={() => onDelete(textbox.id)}>
            <X className="h-3 w-3" />
          </Button>
        </div>

        <textarea
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={handleBlur}
          className="flex-1 w-full p-2 resize-none outline-none bg-transparent"
          style={{ 
            color: textbox.textColor,
            fontSize: `${textbox.fontSize}px`
          }}
          placeholder="Type here..."
          onPointerDown={e => e.stopPropagation()}
        />
      </div>
    </Rnd>
  );
}
