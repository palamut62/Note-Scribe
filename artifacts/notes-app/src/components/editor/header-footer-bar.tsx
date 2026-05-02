import { useState, useRef, useEffect } from 'react';
import { HFZone, HeaderFooter } from '@/lib/types';
import { Image as ImageIcon, Type, Hash, Calendar, FileText, X, Upload, ChevronUp, ChevronDown } from 'lucide-react';

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
  { label: '{sayfa}', title: 'Sayfa numarası', icon: Hash },
  { label: '{tarih}', title: 'Bugünün tarihi', icon: Calendar },
  { label: '{başlık}', title: 'Not başlığı', icon: FileText },
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

function normalizeZone(z: unknown): HFZone {
  if (!z) return { text: '' };
  if (typeof z === 'string') return { text: z };
  return z as HFZone;
}

function ZoneContent({ zone, noteTitle, pageNumber }: { zone: HFZone; noteTitle: string; pageNumber: number }) {
  const imgH = zone.imageHeight ?? 28;
  const hasImage = !!zone.image;
  const hasText = !!zone.text?.trim();

  if (!hasImage && !hasText) return null;

  return (
    <div className="hf-zone-content">
      {hasImage && (
        <img
          src={zone.image}
          alt="logo"
          className="hf-logo-img"
          style={{ height: imgH }}
          draggable={false}
        />
      )}
      {hasText && (
        <span className="hf-text">
          {resolveTokens(zone.text, noteTitle, pageNumber)}
        </span>
      )}
    </div>
  );
}

interface ZoneEditorProps {
  zone: 'left' | 'center' | 'right';
  data: HFZone;
  type: 'header' | 'footer';
  onClose: () => void;
  onChange: (updates: Partial<HFZone>) => void;
}

function ZoneEditor({ zone, data, type, onClose, onChange }: ZoneEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const zoneLabel = zone === 'left' ? 'Sol' : zone === 'center' ? 'Orta' : 'Sağ';
  const typeLabel = type === 'header' ? 'Üst Bilgi' : 'Alt Bilgi';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.closest('.hf-bar')?.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ image: reader.result, imageHeight: data.imageHeight ?? 28 });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const insertToken = (token: string) => {
    onChange({ text: (data.text || '') + token });
  };

  return (
    <div
      ref={panelRef}
      className={`hf-editor-panel hf-panel-pos-${type}`}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <div className="hf-editor-titlebar">
        <span className="hf-editor-title">
          <Type size={11} />
          {typeLabel} — {zoneLabel} Bölge
        </span>
        <button className="hf-editor-close" onClick={onClose} title="Kapat">
          <X size={12} />
        </button>
      </div>  {/* hf-editor-titlebar */}

      <div className="hf-editor-body">
        {/* Text input */}
        <div className="hf-editor-section">
          <label className="hf-editor-label">Metin</label>
          <input
            autoFocus
            className="hf-input"
            value={data.text || ''}
            onChange={e => onChange({ text: e.target.value })}
            placeholder="Metin girin veya token ekleyin…"
          />
          <div className="hf-token-row">
            {TOKENS.map(t => (
              <button
                key={t.label}
                className="hf-token-chip"
                title={t.title}
                onMouseDown={e => { e.preventDefault(); insertToken(t.label); }}
              >
                <t.icon size={9} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Image / Logo */}
        <div className="hf-editor-section">
          <label className="hf-editor-label">Logo / Resim</label>
          {data.image ? (
            <div className="hf-logo-preview-row">
              <img
                src={data.image}
                alt="logo"
                className="hf-logo-preview"
                style={{ height: data.imageHeight ?? 28 }}
              />
              <div className="hf-logo-size-controls">
                <span className="hf-editor-label" style={{ marginBottom: 0 }}>Yükseklik: {data.imageHeight ?? 28}px</span>
                <div className="hf-size-btns">
                  <button
                    className="hf-size-btn"
                    onMouseDown={e => { e.preventDefault(); onChange({ imageHeight: Math.min(80, (data.imageHeight ?? 28) + 4) }); }}
                    title="Büyüt"
                  ><ChevronUp size={10} /></button>
                  <button
                    className="hf-size-btn"
                    onMouseDown={e => { e.preventDefault(); onChange({ imageHeight: Math.max(12, (data.imageHeight ?? 28) - 4) }); }}
                    title="Küçült"
                  ><ChevronDown size={10} /></button>
                </div>
              </div>
              <button
                className="hf-logo-remove-btn"
                onMouseDown={e => { e.preventDefault(); onChange({ image: undefined }); }}
                title="Resmi kaldır"
              ><X size={11} /> Kaldır</button>
            </div>
          ) : (
            <button
              className="hf-upload-btn"
              onMouseDown={e => { e.preventDefault(); imageInputRef.current?.click(); }}
            >
              <Upload size={11} />
              Logo / Resim Yükle
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>
    </div>
  );
}

export function HeaderFooterBar({
  data, type, noteTitle, pageNumber = 1, marginLeft, marginRight, height, onChange,
}: Props) {
  const [activeZone, setActiveZone] = useState<'left' | 'center' | 'right' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  if (!data.visible) return null;

  const left = normalizeZone(data.left);
  const center = normalizeZone(data.center);
  const right = normalizeZone(data.right);

  const zoneData = { left, center, right };

  const handleZoneChange = (zone: 'left' | 'center' | 'right', updates: Partial<HFZone>) => {
    onChange({ [zone]: { ...zoneData[zone], ...updates } } as Partial<HeaderFooter>);
  };

  const zoneHasContent = (z: HFZone) => !!(z.text?.trim() || z.image);

  return (
    <div
      ref={barRef}
      className={`hf-bar hf-bar-${type} ${activeZone ? 'hf-bar-editing' : ''}`}
      style={{ height, paddingLeft: marginLeft, paddingRight: marginRight }}
    >
      {/* Left zone */}
      <div
        className={`hf-zone hf-zone-left ${activeZone === 'left' ? 'hf-zone-active' : ''}`}
        onClick={e => { e.stopPropagation(); setActiveZone(activeZone === 'left' ? null : 'left'); }}
        title="Sol bölgeyi düzenle"
      >
        {zoneHasContent(left)
          ? <ZoneContent zone={left} noteTitle={noteTitle} pageNumber={pageNumber} />
          : <span className="hf-empty-hint">Sol</span>}
      </div>

      {/* Center zone */}
      <div
        className={`hf-zone hf-zone-center ${activeZone === 'center' ? 'hf-zone-active' : ''}`}
        onClick={e => { e.stopPropagation(); setActiveZone(activeZone === 'center' ? null : 'center'); }}
        title="Orta bölgeyi düzenle"
      >
        {zoneHasContent(center)
          ? <ZoneContent zone={center} noteTitle={noteTitle} pageNumber={pageNumber} />
          : <span className="hf-empty-hint">Orta</span>}
      </div>

      {/* Right zone */}
      <div
        className={`hf-zone hf-zone-right ${activeZone === 'right' ? 'hf-zone-active' : ''}`}
        onClick={e => { e.stopPropagation(); setActiveZone(activeZone === 'right' ? null : 'right'); }}
        title="Sağ bölgeyi düzenle"
      >
        {zoneHasContent(right)
          ? <ZoneContent zone={right} noteTitle={noteTitle} pageNumber={pageNumber} />
          : <span className="hf-empty-hint">Sağ</span>}
      </div>

      {/* Zone editor panel */}
      {activeZone && (
        <ZoneEditor
          zone={activeZone}
          data={zoneData[activeZone]}
          type={type}
          onClose={() => setActiveZone(null)}
          onChange={u => handleZoneChange(activeZone, u)}
        />
      )}
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
