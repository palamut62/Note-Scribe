import type { Language } from './types';

const DICT = {
  tr: {
    'app.title': 'nootle.io',
    // home menu
    'menu.import': 'İçe Aktar',
    'menu.export': 'Dışa Aktar',
    'menu.share.section': 'Paylaş & Yazdır',
    'menu.open.file': 'Dosya Aç',
    'menu.save.txt': 'Düz Metin',
    'menu.save.md': 'Markdown',
    'menu.save.docx': 'Word Belgesi',
    'menu.copy.link': 'Bağlantı kopyala',
    'menu.link.copied': 'Bağlantı kopyalandı!',
    'menu.print.preview': 'Baskı önizleme',
    'menu.print.pdf': 'Yazdır / PDF',
    // legacy (kept for compat)
    'menu.open': 'Aç',
    'menu.share': 'Paylaş',
    'menu.copied': 'Kopyalandı!',
    'menu.preview': 'Önizle',
    'menu.pdf': 'PDF',
    // notes
    'note.empty.new': 'Yeni not oluşturmak için + butonuna tıklayın.',
    'note.select': 'Bir sekme seçin veya yeni not oluşturun.',
    'note.filter.none': '"#{tag}" etiketli not bulunamadı.',
    'note.empty': 'Yeni not oluşturmak için + butonuna tıklayın.',
    // page
    'page.first': 'Sayfa 1',
    'page.num': 'Sayfa {n}',
    // status bar
    'status.words': '{n} kelime',
    'status.chars': '{n} karakter',
    'status.saved': 'Kaydedildi ✓',
    // drawing toolbar
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
    'draw.savepng': 'PNG kaydet',
    'draw.move': 'Taşı',
    // settings
    'settings.title': 'Ayarlar',
    'settings.language': 'Arayüz Dili',
    'settings.tab.ai': 'AI',
    'settings.tab.appearance': 'Görünüm',
    'settings.tab.page': 'Sayfa',
    'settings.ai.desc': 'Her sağlayıcı için API anahtarı girin. Aktif olan AI Düzelt butonunda kullanılır.',
    'settings.api.key': 'API Anahtarı',
    'settings.fetch': 'Getir',
    'settings.active': 'Aktif',
    'settings.models.loaded': '{n} model yüklendi',
    'settings.conn.fail': 'Bağlantı başarısız',
    'settings.theme': 'Tema',
    'settings.margins': 'Kenar Boşlukları',
    'settings.margin.top': 'Üst',
    'settings.margin.bottom': 'Alt',
    'settings.margin.left': 'Sol',
    'settings.margin.right': 'Sağ',
    'settings.margin.narrow': 'Dar',
    'settings.margin.normal': 'Normal',
    'settings.margin.wide': 'Geniş',
    'settings.bg.pattern': 'Sayfa Deseni',
    'settings.bg.none': 'Yok',
    'settings.bg.lines': 'Çizgili',
    'settings.bg.grid': 'Kareli',
  },
  en: {
    'app.title': 'nootle.io',
    // home menu
    'menu.import': 'Import',
    'menu.export': 'Export',
    'menu.share.section': 'Share & Print',
    'menu.open.file': 'Open File',
    'menu.save.txt': 'Plain Text',
    'menu.save.md': 'Markdown',
    'menu.save.docx': 'Word Document',
    'menu.copy.link': 'Copy link',
    'menu.link.copied': 'Link copied!',
    'menu.print.preview': 'Print preview',
    'menu.print.pdf': 'Print / PDF',
    // legacy
    'menu.open': 'Open',
    'menu.share': 'Share',
    'menu.copied': 'Copied!',
    'menu.preview': 'Preview',
    'menu.pdf': 'PDF',
    // notes
    'note.empty.new': 'Click + to create a new note.',
    'note.select': 'Select a tab or create a new note.',
    'note.filter.none': 'No notes tagged "#{tag}".',
    'note.empty': 'Click + to create a new note.',
    // page
    'page.first': 'Page 1',
    'page.num': 'Page {n}',
    // status bar
    'status.words': '{n} words',
    'status.chars': '{n} chars',
    'status.saved': 'Saved ✓',
    // drawing toolbar
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
    'draw.savepng': 'Save PNG',
    'draw.move': 'Move',
    // settings
    'settings.title': 'Settings',
    'settings.language': 'Interface Language',
    'settings.tab.ai': 'AI',
    'settings.tab.appearance': 'Appearance',
    'settings.tab.page': 'Page',
    'settings.ai.desc': 'Enter an API key for each provider. The active one is used for the AI Fix button.',
    'settings.api.key': 'API Key',
    'settings.fetch': 'Fetch',
    'settings.active': 'Active',
    'settings.models.loaded': '{n} models loaded',
    'settings.conn.fail': 'Connection failed',
    'settings.theme': 'Theme',
    'settings.margins': 'Margins',
    'settings.margin.top': 'Top',
    'settings.margin.bottom': 'Bottom',
    'settings.margin.left': 'Left',
    'settings.margin.right': 'Right',
    'settings.margin.narrow': 'Narrow',
    'settings.margin.normal': 'Normal',
    'settings.margin.wide': 'Wide',
    'settings.bg.pattern': 'Page Pattern',
    'settings.bg.none': 'None',
    'settings.bg.lines': 'Lined',
    'settings.bg.grid': 'Grid',
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
