import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { X, Tag, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/app-state';
import { suggestTags } from '@/lib/ai';
import { useToast } from '@/hooks/use-toast';

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

function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function TagBar({ noteId, tags, filterTag, onFilterTag, allTags }: TagBarProps) {
  const { updateNote, notes, settings } = useApp();
  const { toast } = useToast();
  const [adding, setAdding] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
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

  const handleSuggestTags = async () => {
    const apiKey = settings.provider === 'openrouter' ? settings.openrouterApiKey : settings.nvidiaApiKey;
    const model  = settings.provider === 'openrouter' ? settings.openrouterModel  : settings.nvidiaModel;
    if (!apiKey || !model) {
      toast({ title: 'AI Yapılandırılmamış', description: 'Ayarlardan API anahtarı ve model seçin.', variant: 'destructive' });
      return;
    }
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const text = extractText(note.content);
    if (!text.trim()) return;

    setIsSuggesting(true);
    try {
      const suggested = await suggestTags(text, settings.provider, apiKey, model, settings.language ?? 'tr');
      const newTags = suggested.filter(s => !tags.includes(s));
      setSuggestions(newTags);
    } catch (err: any) {
      toast({ title: 'Hata', description: err.message, variant: 'destructive' });
    } finally {
      setIsSuggesting(false);
    }
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      updateNote(noteId, { tags: [...tags, tag] });
    }
    setSuggestions(prev => prev.filter(s => s !== tag));
  };

  return (
    <div className="tag-bar">
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

        {suggestions.map(tag => (
          <button
            key={`sug-${tag}`}
            className="tag-suggestion-pill"
            onClick={() => addSuggestedTag(tag)}
            title="Eklemek için tıkla"
          >
            + {tag}
          </button>
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

        <button
          className={`tag-ai-btn ${isSuggesting ? 'tag-ai-btn-loading' : ''}`}
          onClick={handleSuggestTags}
          disabled={isSuggesting}
          title="AI ile etiket öner"
        >
          <Sparkles size={10} className={isSuggesting ? 'animate-pulse' : ''} />
        </button>

        {adding && allTags.length > 0 && (
          <datalist id="tag-suggestions">
            {allTags.filter(t => !tags.includes(t)).map(t => <option key={t} value={t} />)}
          </datalist>
        )}
      </div>

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
