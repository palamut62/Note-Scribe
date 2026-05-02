import { useState, useRef } from 'react';
import { HeaderFooter } from '@/lib/types';

interface Props {
  data: HeaderFooter;
  type: 'header' | 'footer';
  noteTitle: string;
  pageNumber?: number;
  marginLeft: number;
  marginRight: number;
  height: number;
  onChange: (updates: Partial<HeaderFooter>) => void;
}

const TOKENS = [
  { label: '{sayfa}', title: 'Sayfa numarası' },
  { label: '{tarih}', title: 'Bugünün tarihi' },
  { label: '{başlık}', title: 'Not başlığı' },
];

function resolveTokens(text: string, title: string, page: number): string {
  const today = new Date().toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
  return text
    .replace(/\{sayfa\}/g, String(page))
    .replace(/\{tarih\}/g, today)
    .replace(/\{başlık\}/g, title);
}

export function HeaderFooterBar({
  data, type, noteTitle, pageNumber = 1, marginLeft, marginRight, height, onChange,
}: Props) {
  const [editing, setEditing] = useState<'left' | 'center' | 'right' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data.visible) return null;

  const zones: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setEditing(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`hf-bar hf-bar-${type}`}
      style={{ height, paddingLeft: marginLeft, paddingRight: marginRight }}
      onBlur={handleBlur}
      title={`${type === 'header' ? 'Üst Bilgi' : 'Alt Bilgi'} — düzenlemek için tıkla`}
    >
      {zones.map(zone => (
        <div key={zone} className={`hf-zone hf-zone-${zone}`} onClick={() => setEditing(zone)}>
          {editing === zone ? (
            <input
              autoFocus
              className="hf-input"
              value={data[zone]}
              onChange={e => onChange({ [zone]: e.target.value })}
              onBlur={() => setEditing(null)}
              placeholder={zone === 'left' ? 'Sol metin' : zone === 'center' ? 'Orta metin' : 'Sağ metin'}
            />
          ) : (
            <span className="hf-text">
              {data[zone]
                ? resolveTokens(data[zone], noteTitle, pageNumber)
                : <span className="hf-placeholder">{zone === 'left' ? '←' : zone === 'center' ? '·' : '→'}</span>
              }
            </span>
          )}
        </div>
      ))}
      <div className="hf-tokens">
        {TOKENS.map(t => (
          <button
            key={t.label}
            className="hf-token-btn"
            title={t.title}
            onMouseDown={e => {
              e.preventDefault();
              const zone = editing ?? 'center';
              onChange({ [zone]: (data[zone] || '') + t.label });
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HeaderFooterToggle({
  data,
  type,
  onChange,
}: {
  data: HeaderFooter;
  type: 'header' | 'footer';
  onChange: (updates: Partial<HeaderFooter>) => void;
}) {
  return (
    <button
      className={`hf-toggle-btn ${data.visible ? 'hf-toggle-active' : ''}`}
      onClick={() => onChange({ visible: !data.visible })}
      title={`${type === 'header' ? 'Üst Bilgi' : 'Alt Bilgi'} ${data.visible ? 'gizle' : 'göster'}`}
    >
      {type === 'header' ? 'Üst Bilgi' : 'Alt Bilgi'}
    </button>
  );
}
