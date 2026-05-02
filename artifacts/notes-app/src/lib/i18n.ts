import type { Language } from './types';

const DICT = {
  tr: {
    'app.title': 'Notlar',
    'menu.open': 'Aç',
    'menu.share': 'Paylaş',
    'menu.copied': 'Kopyalandı!',
    'menu.preview': 'Önizle',
    'menu.pdf': 'PDF',
    'status.words': '{n} kelime',
    'status.chars': '{n} karakter',
    'status.saved': 'Kaydedildi ✓',
    'note.empty': 'Yeni not oluşturmak için + butonuna tıklayın.',
    'draw.mode': 'Çizim Modu',
    'draw.tool': 'Araç',
    'draw.color': 'Renk',
    'draw.width': 'Kalınlık',
    'draw.undo': 'Geri al',
    'draw.clear': 'Temizle',
    'draw.exit': 'Çizimi bitir',
    'draw.thin': 'İnce',
    'draw.medium': 'Orta',
    'draw.thick': 'Kalın',
    'draw.pen': 'Kalem',
    'draw.highlight': 'Fosforlu Kalem',
    'draw.line': 'Çizgi',
    'draw.arrow': 'Ok',
    'draw.rect': 'Dikdörtgen',
    'draw.ellipse': 'Elips/Daire',
    'draw.eraser': 'Silgi',
    'settings.title': 'Ayarlar',
    'settings.language': 'Arayüz Dili',
  },
  en: {
    'app.title': 'Notes',
    'menu.open': 'Open',
    'menu.share': 'Share',
    'menu.copied': 'Copied!',
    'menu.preview': 'Preview',
    'menu.pdf': 'PDF',
    'status.words': '{n} words',
    'status.chars': '{n} chars',
    'status.saved': 'Saved ✓',
    'note.empty': 'Click + to create a new note.',
    'draw.mode': 'Drawing Mode',
    'draw.tool': 'Tool',
    'draw.color': 'Color',
    'draw.width': 'Width',
    'draw.undo': 'Undo',
    'draw.clear': 'Clear all',
    'draw.exit': 'Exit drawing',
    'draw.thin': 'Thin',
    'draw.medium': 'Medium',
    'draw.thick': 'Thick',
    'draw.pen': 'Pen',
    'draw.highlight': 'Highlighter',
    'draw.line': 'Line',
    'draw.arrow': 'Arrow',
    'draw.rect': 'Rectangle',
    'draw.ellipse': 'Ellipse/Circle',
    'draw.eraser': 'Eraser',
    'settings.title': 'Settings',
    'settings.language': 'Interface Language',
  },
} as const;

export type DictKey = keyof typeof DICT.tr;

export function tr(lang: Language, key: DictKey, vars?: Record<string, string | number>): string {
  let str = (DICT[lang] as Record<string, string>)[key]
    ?? (DICT.tr as Record<string, string>)[key]
    ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

export function makeT(lang: Language) {
  return (key: DictKey, vars?: Record<string, string | number>) => tr(lang, key, vars);
}
