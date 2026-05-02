import { useState } from 'react';
import { Rnd } from 'react-rnd';
import { FloatingImage as FloatingImageType } from '@/lib/types';
import { X, GripHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  image: FloatingImageType;
  onChange: (id: string, updates: Partial<FloatingImageType>) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  onFocus: () => void;
}

export function FloatingImage({ image, onChange, onDelete, isActive, onFocus }: Props) {
  const [aspectLocked, setAspectLocked] = useState(true);

  return (
    <Rnd
      size={{ width: image.width, height: image.height }}
      position={{ x: image.x, y: image.y }}
      onDragStop={(_e, d) => onChange(image.id, { x: d.x, y: d.y })}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        onChange(image.id, {
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          ...pos,
        });
      }}
      lockAspectRatio={aspectLocked}
      bounds="parent"
      dragHandleClassName="img-drag-handle"
      className={`absolute z-20 group select-none`}
      onClick={onFocus}
    >
      <div
        className={`w-full h-full relative overflow-hidden rounded-sm ${
          isActive ? 'ring-2 ring-primary ring-offset-1' : ''
        }`}
        style={{ cursor: 'default' }}
      >
        <img
          src={image.src}
          alt={image.alt || ''}
          className="w-full h-full object-contain block pointer-events-none"
          draggable={false}
        />

        {/* Controls — visible on hover or when active */}
        <div
          className={`absolute inset-x-0 top-0 h-6 flex items-center justify-between px-1 transition-opacity
            ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            bg-black/30 backdrop-blur-[2px]`}
        >
          <div
            className="img-drag-handle flex items-center gap-1 flex-1 cursor-move h-full"
            onPointerDown={e => e.stopPropagation()}
          >
            <GripHorizontal size={12} className="text-white/80" />
          </div>

          <button
            className="w-5 h-5 flex items-center justify-center rounded text-white/80 hover:text-white hover:bg-white/20 transition-colors"
            onClick={e => { e.stopPropagation(); setAspectLocked(l => !l); }}
            title={aspectLocked ? 'En-boy oranı kilitli' : 'Serbest boyutlandır'}
          >
            <RotateCcw size={10} className={aspectLocked ? 'text-white' : 'text-white/40'} />
          </button>

          <button
            className="w-5 h-5 flex items-center justify-center rounded text-white/80 hover:text-white hover:bg-red-500/60 transition-colors ml-0.5"
            onClick={e => { e.stopPropagation(); onDelete(image.id); }}
            title="Resmi sil"
          >
            <X size={11} />
          </button>
        </div>

        {/* Resize hint corners */}
        {isActive && (
          <>
            <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" />
          </>
        )}
      </div>
    </Rnd>
  );
}
