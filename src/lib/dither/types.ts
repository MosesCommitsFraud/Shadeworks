/**
 * Dithering algorithm types
 */
export type DitheringAlgorithm =
  | 'floyd-steinberg'
  | 'atkinson'
  | 'jarvis-judice-ninke'
  | 'stucki'
  | 'burkes'
  | 'sierra'
  | 'sierra-2row'
  | 'sierra-lite'
  | 'bayer-2x2'
  | 'bayer-4x4'
  | 'bayer-8x8'
  | 'bayer-16x16'
  | 'clustered-dot';

/**
 * Color mode types
 */
export type ColorMode = 'mono' | 'tonal' | 'indexed' | 'rgb';

/**
 * Palette types
 */
export type PaletteType =
  | 'bw'
  | 'warm-bw'
  | 'cool-bw'
  | 'grayscale-2'
  | 'grayscale-4'
  | 'grayscale-8'
  | 'grayscale-16'
  | 'cga'
  | 'ega'
  | 'vga'
  | 'commodore-64'
  | 'apple-ii'
  | 'gameboy'
  | 'nes'
  | 'zx-spectrum'
  | 'web-safe'
  | 'pastel'
  | 'vaporwave'
  | 'synthwave'
  | 'cyberpunk'
  | 'nordic'
  | 'newspaper'
  | 'risograph'
  | 'screen-print'
  | 'custom';

/**
 * Export format types
 */
export type ExportFormat = 'png' | 'jpeg' | 'webp';

/**
 * Resampling algorithm types
 */
export type ResamplingAlgorithm = 'nearest-neighbor' | 'bilinear' | 'bicubic' | 'lanczos';

/**
 * Halftone angle types
 */
export type HalftoneAngle = 0 | 22.5 | 45 | number;

/**
 * DPI presets
 */
export type DPI = 72 | 150 | 300 | number;

/**
 * Color representation
 */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/**
 * Palette definition
 */
export interface Palette {
  name: string;
  type: PaletteType;
  colors: Color[];
  description?: string;
}

/**
 * Dithering settings
 */
export interface DitheringSettings {
  algorithm: DitheringAlgorithm;
  serpentine?: boolean; // For error diffusion algorithms
  errorAttenuation?: number; // 0-1, reduce error spread
  randomNoise?: number; // 0-1, add controlled noise
}

/**
 * Image adjustment settings
 */
export interface AdjustmentSettings {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  blur: number; // 0-20px
  sharpen: number; // 0-100%
  denoise: number; // 0-100%
  gamma: number; // 0.5-2.0
}

/**
 * Color mode settings
 */
export interface ColorModeSettings {
  mode: ColorMode;
  shades?: number; // For 'tonal' mode (2-256)
  quantizationMethod?: 'median-cut' | 'octree' | 'kmeans'; // For 'indexed' mode
}

/**
 * Export settings
 */
export interface ExportSettings {
  format: ExportFormat;
  dpi: DPI;
  quality?: number; // 0-100 for JPEG/WebP
  halftoneAngle?: HalftoneAngle;
  colorSeparation?: boolean;
  includeAlpha?: boolean;
  metadata?: {
    title?: string;
    author?: string;
    description?: string;
  };
}

/**
 * Resampling settings
 */
export interface ResamplingSettings {
  algorithm: ResamplingAlgorithm;
  scale: number; // Percentage (e.g., 200 for 2x)
  width?: number; // Target width in pixels
  height?: number; // Target height in pixels
  maintainAspectRatio: boolean;
  roundedEdges: boolean; // true = smooth edges, false = pixel edges
}

/**
 * Complete dithering editor state
 */
export interface DitherState {
  // Image data
  originalImage: ImageData | null;
  processedImage: ImageData | null;
  currentImage: ImageData | null; // With adjustments applied, before dithering

  // Settings
  adjustments: AdjustmentSettings;
  colorMode: ColorModeSettings;
  palette: Palette;
  dithering: DitheringSettings;
  export: ExportSettings;
  resampling: ResamplingSettings;

  // UI state
  zoom: number; // Percentage
  pan: { x: number; y: number };
  showBeforeAfter: boolean;
  isProcessing: boolean;
  processingProgress: number; // 0-100

  // History
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Zoom level presets
 */
export type ZoomLevel = 25 | 50 | 100 | 200 | 400 | 'fit';

/**
 * Processing message types for Web Worker
 */
export interface ProcessingMessage {
  type: 'process' | 'cancel';
  imageData?: ImageData;
  settings?: {
    adjustments: AdjustmentSettings;
    colorMode: ColorModeSettings;
    palette: Palette;
    dithering: DitheringSettings;
  };
}

/**
 * Processing result from Web Worker
 */
export interface ProcessingResult {
  type: 'complete' | 'progress' | 'error';
  imageData?: ImageData;
  progress?: number; // 0-100
  error?: string;
}

/**
 * Algorithm info for UI
 */
export interface AlgorithmInfo {
  id: DitheringAlgorithm;
  name: string;
  description: string;
  category: 'error-diffusion' | 'ordered' | 'halftone';
  supportsColor: boolean;
  supportsSerpentine?: boolean;
  supportsErrorAttenuation?: boolean;
  supportsRandomNoise?: boolean;
}
