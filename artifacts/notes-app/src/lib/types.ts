export interface TextBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  borderStyle: 'none' | 'solid' | 'dashed';
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
}

export interface FloatingImage {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  alt: string;
}

export interface HFZone {
  text: string;
  image?: string;
  imageHeight?: number;
  align?: 'left' | 'center' | 'right';
}

export interface HeaderFooter {
  left: HFZone;
  center: HFZone;
  right: HFZone;
  visible: boolean;
}

/* ─── Drawing ─────────────────────────────────────────────────────────────── */
export type DrawTool = 'pen' | 'highlight' | 'line' | 'arrow' | 'rect' | 'ellipse' | 'eraser';

interface DrawBase { id: string; color: string; width: number; opacity?: number; }
export interface PenOp       extends DrawBase { type: 'pen';       pts: number[]; }
export interface HighlightOp extends DrawBase { type: 'highlight'; pts: number[]; }
export interface EraserOp    extends DrawBase { type: 'eraser';    pts: number[]; }
export interface LineOp      extends DrawBase { type: 'line';  x1:number; y1:number; x2:number; y2:number; }
export interface ArrowOp     extends DrawBase { type: 'arrow'; x1:number; y1:number; x2:number; y2:number; }
export interface RectOp      extends DrawBase { type: 'rect';    x:number;  y:number;  w:number;  h:number; fill?: string; }
export interface EllipseOp   extends DrawBase { type: 'ellipse'; cx:number; cy:number; rx:number; ry:number; fill?: string; }
export type DrawOp = PenOp | HighlightOp | EraserOp | LineOp | ArrowOp | RectOp | EllipseOp;

/* ─── Note ────────────────────────────────────────────────────────────────── */
export interface Note {
  id: string;
  title: string;
  content: string;
  textboxes: TextBox[];
  images: FloatingImage[];
  drawOps: DrawOp[];
  header: HeaderFooter;
  footer: HeaderFooter;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type AppTheme =
  | 'light'
  | 'dark'
  | 'sepia'
  | 'apple-yellow'
  | 'dark-blue'
  | 'green-black';

export type Language = 'tr' | 'en';

export interface Settings {
  provider: 'openrouter' | 'nvidia';
  openrouterApiKey: string;
  openrouterModel: string;
  nvidiaApiKey: string;
  nvidiaModel: string;
  backgroundPattern: 'none' | 'lines' | 'grid';
  theme: AppTheme;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  autoCorrect: boolean;
  language: Language;
}
