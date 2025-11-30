export type Tool = 'select' | 'pen' | 'line' | 'rectangle' | 'ellipse' | 'eraser' | 'text' | 'frame' | 'web-embed' | 'laser' | 'lasso';

export interface Point {
  x: number;
  y: number;
}

export interface BoardElement {
  id: string;
  type: 'pen' | 'line' | 'rectangle' | 'ellipse' | 'text' | 'frame' | 'web-embed' | 'laser';
  points: Point[];
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // For text scaling/squishing
  scaleX?: number;
  scaleY?: number;
  // For frame tool
  label?: string;
  // For web embed
  url?: string;
  // For laser pointer
  timestamp?: number;
}

export interface Cursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

export const COLORS = [
  '#ffffff',
  '#f87171',
  '#fb923c',
  '#fbbf24',
  '#a3e635',
  '#4ade80',
  '#34d399',
  '#22d3d8',
  '#38bdf8',
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#c084fc',
  '#e879f9',
  '#f472b6',
];

export const STROKE_WIDTHS = [2, 4, 6, 8, 12];

