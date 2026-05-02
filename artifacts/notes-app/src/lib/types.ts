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

export interface Note {
  id: string;
  title: string;
  content: string;
  textboxes: TextBox[];
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  provider: 'openrouter' | 'nvidia';
  apiKey: string;
  selectedModel: string;
  backgroundPattern: 'none' | 'lines' | 'grid';
}
