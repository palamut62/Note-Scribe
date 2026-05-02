import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Tag } from 'lucide-react';
import { useApp } from '@/lib/app-state';

const TAG_COLORS = [
  '#ef4444','#f97316','#eab308','#22c55e',
  '#06b6d4','#3b82f6','#8b5cf6','#ec4899',
];

export function tagColor(tag: string): string {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) & 0xffff;
  return TAG_COLORS[h % TAG_COLORS.length];
}

interface TagBarProps {
  noteId: string;
  tags: string[];
  filterTag: string | null;
  onFilterTag: (tag: string | null) => void;
  allTags: string[];
}

export function TagBar({ noteId, tags, filterTag, onFilterTag, allTags }: TagBarProps) {
  const { updateNote } = useApp();
  const [adding, setAdding] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus();
  }, [adding]);

  const addTag = () => {
    const t = inputVal.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      updateNote(noteId, { tags: [...tags, t] });
    }
    setInputVal('');
    setAdding(false);
  };

  const removeTag = (tag: string) => {
    updateNote(noteId, { tags: tags.filter(t => t !== tag) });
    if (filterTag === tag) onFilterTag(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addTag();
    if (e.key === 'Escape') { setAdding(false); setInputVal(''); }
  };

  return (
    <div className="tag-bar">
      {/* Note's own tags */}
      <div className="tag-bar-note-tags">
        <Tag size={11} className="tag-bar-icon" />
        {tags.map(tag => (
          <span key={tag} className="tag-pill" style={{ background: tagColor(tag) + '22', color: tagColor(tag), borderColor: tagColor(tag) + '44' }}>
            <span
              className="tag-pill-text"
              onClick={() => onFilterTag(filterTag === tag ? null : tag)}
              title="Filtrelemek için tıkla"
            >{tag}</span>
            <button className="tag-pill-remove" onClick={() => removeTag(tag)} title="Etiketi kaldır">
              <X size={9} />
            </button>
          </span>
        ))}
        {adding ? (
          <input
            ref={inputRef}
            className="tag-input"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
            placeholder="etiket..."
            list="tag-suggestions"
          />
        ) : (
          <button className="tag-add-btn" onClick={() => setAdding(true)} title="Etiket ekle">
            + Etiket
          </button>
        )}
        {adding && allTags.length > 0 && (
          <datalist id="tag-suggestions">
            {allTags.filter(t => !tags.includes(t)).map(t => <option key={t} value={t} />)}
          </datalist>
        )}
      </div>

      {/* Active filter indicator */}
      {filterTag && (
        <span className="tag-filter-indicator">
          <span style={{ color: tagColor(filterTag) }}>#{filterTag}</span> filtresi aktif
          <button className="tag-filter-clear" onClick={() => onFilterTag(null)}>
            <X size={10} /> Temizle
          </button>
        </span>
      )}
    </div>
  );
}
