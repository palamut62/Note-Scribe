import { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Minus, Square, Circle, ArrowRight, Eraser, Highlighter, Undo2, Trash2, X, GripVertical, ImageDown } from 'lucide-react';
import type { DrawTool } from '@/lib/types';

interface Props {
  tool: DrawTool;
  color: string;
  strokeWidth: number;
  language?: string;
  onToolChange: (t: DrawTool) => void;
  onColorChange: (c: string) => void;
  onWidthChange: (w: number) => void;
  onUndo: () => void;
  onClear: () => void;
  onExit: () => void;
  onSavePng: () => void;
}

const DRAW_COLORS = [
  '#e11d48', '#f97316', '#eab308', '#16a34a',
  '#2563eb', '#7c3aed', '#000000', '#6b7280',
  '#ffffff', '#f9a8d4', '#bbf7d0', '#bfdbfe',
];

const TOOLS: { id: DrawTool; icon: React.ReactNode; label: string }[] = [
  { id: 'pen',       icon: <Pencil      size={13} />, label: 'Pen'        },
  { id: 'highlight', icon: <Highlighter size={13} />, label: 'Highlighter'},
  { id: 'line',      icon: <Minus       size={13} />, label: 'Line'       },
  { id: 'arrow',     icon: <ArrowRight  size={13} />, label: 'Arrow'      },
  { id: 'rect',      icon: <Square      size={13} />, label: 'Rectangle'  },
  { id: 'ellipse',   icon: <Circle      size={13} />, label: 'Ellipse'    },
  { id: 'eraser',    icon: <Eraser      size={13} />, label: 'Eraser'     },
];

const WIDTHS: { value: number; label: string }[] = [
  { value: 1.5, label: 'Thin'   },
  { value: 3,   label: 'Medium' },
  { value: 6,   label: 'Thick'  },
];

export function DrawingToolbar({
  tool, color, strokeWidth,
  onToolChange, onColorChange, onWidthChange,
  onUndo, onClear, onExit, onSavePng,
}: Props) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = panelRef.current;
    const w = panel?.offsetWidth ?? 172;
    const h = panel?.offsetHeight ?? 420;
    setPos({
      x: window.innerWidth - w - 18,
      y: Math.max(20, (window.innerHeight - h) / 2),
    });
  }, []);

  const onDragMove = useCallback((e: PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({ x: dragState.current.origX + dx, y: dragState.current.origY + dy });
  }, []);

  const onDragEnd = useCallback(() => {
    dragState.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragEnd);
  }, [onDragMove]);

  const onDragStart = useCallback((e: React.PointerEvent) => {
    if (!pos) return;
    e.preventDefault();
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragEnd);
  }, [pos, onDragMove, onDragEnd]);

  const style: React.CSSProperties = pos
    ? { position: 'fixed', left: pos.x, top: pos.y, right: 'auto', transform: 'none' }
    : {};

  return (
    <div className="drawing-toolbar" ref={panelRef} style={style}>
      <div className="drawing-tb-header" onPointerDown={onDragStart} style={{ cursor: 'grab' }}>
        <GripVertical size={11} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        <span className="drawing-tb-title">✏️ Drawing Mode</span>
        <button
          className="drawing-tb-exit"
          onPointerDown={e => e.stopPropagation()}
          onClick={onExit}
          title="Exit drawing"
        >
          <X size={12} />
        </button>
      </div>

      <div className="drawing-tb-section">
        <div className="drawing-tb-label">Tool</div>
        <div className="drawing-tools-grid">
          {TOOLS.map(item => (
            <button
              key={item.id}
              className={`drawing-tool-btn${tool === item.id ? ' drawing-tool-active' : ''}`}
              onClick={() => onToolChange(item.id)}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="drawing-tb-section">
        <div className="drawing-tb-label">Color</div>
        <div className="drawing-colors-grid">
          {DRAW_COLORS.map(c => (
            <button
              key={c}
              className={`drawing-color-btn${color === c ? ' drawing-color-active' : ''}`}
              style={{ background: c, border: c === '#ffffff' ? '1px solid #ccc' : undefined }}
              onClick={() => onColorChange(c)}
            />
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={e => onColorChange(e.target.value)}
          className="drawing-color-picker"
        />
      </div>

      <div className="drawing-tb-section">
        <div className="drawing-tb-label">Width</div>
        <div className="drawing-widths">
          {WIDTHS.map(w => (
            <button
              key={w.value}
              className={`drawing-width-btn${strokeWidth === w.value ? ' drawing-width-active' : ''}`}
              onClick={() => onWidthChange(w.value)}
              title={w.label}
            >
              <span style={{
                display: 'block',
                height: Math.max(1.5, w.value * 1.2),
                background: color,
                borderRadius: 99,
                width: '100%',
              }} />
            </button>
          ))}
        </div>
      </div>

      <div className="drawing-tb-actions">
        <button className="drawing-action-btn" onClick={onUndo}>
          <Undo2 size={12} />
          Undo
        </button>
        <button className="drawing-action-btn" onClick={onSavePng}>
          <ImageDown size={12} />
          Save PNG
        </button>
        <button className="drawing-action-btn drawing-action-danger" onClick={onClear}>
          <Trash2 size={12} />
          Clear all
        </button>
      </div>
    </div>
  );
}
