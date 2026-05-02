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

export interface Note {
  id: string;
  title: string;
  content: string;
  textboxes: TextBox[];
  images: FloatingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  provider: 'openrouter' | 'nvidia';
  apiKey: string;
  selectedModel: string;
  backgroundPattern: 'none' | 'lines' | 'grid';
}
