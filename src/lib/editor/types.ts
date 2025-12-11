import type * as fabric from 'fabric';

export type Tool =
  | 'select'
  | 'brush'
  | 'eraser'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'text'
  | 'eyedropper'
  | 'hand';

export type LayerType = 'image' | 'shape' | 'text' | 'group';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  opacity: number;
  locked: boolean;
  fabricObject: fabric.Object;
}

export interface EditorState {
  layers: Layer[];
  selectedLayerIds: string[];
  tool: Tool;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
}

export interface ToolSettings {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
}

export interface AdjustmentSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  gamma: number;
}

export interface HistoryState {
  canvasState: string; // JSON serialized canvas
  timestamp: number;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg';
  quality: number;
  scale: number;
  filename: string;
}
