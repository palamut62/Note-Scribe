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

export interface HeaderFooter {
  left: string;
  center: string;
  right: string;
  visible: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  textboxes: TextBox[];
  images: FloatingImage[];
  header: HeaderFooter;
  footer: HeaderFooter;
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
}
