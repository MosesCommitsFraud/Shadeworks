// Core editor types

export type Tool =
  | 'select'
  | 'brush'
  | 'eraser'
  | 'text'
  | 'crop'
  | 'eyedropper'
  | 'hand'
  | 'zoom'
  | 'rectangle-select'
  | 'ellipse-select'
  | 'lasso-select'
  | 'magic-wand';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface Layer {
  id: string;
  name: string;
  type: 'image' | 'adjustment' | 'text' | 'shape' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number; // 0-100
  blendMode: BlendMode;

  // For image layers
  imageData?: ImageData;
  fabricObjectId?: string; // Reference to Fabric.js object

  // For adjustment layers
  adjustments?: AdjustmentSettings;

  // Mask
  mask?: {
    data: ImageData;
    enabled: boolean;
  };

  // Transform
  transform: {
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    rotation: number; // degrees
  };

  // Metadata
  createdAt: number;
  updatedAt: number;
}

export interface BasicAdjustments {
  exposure: number; // -5 to +5
  contrast: number; // -100 to +100
  highlights: number; // -100 to +100
  shadows: number; // -100 to +100
  whites: number; // -100 to +100
  blacks: number; // -100 to +100
  temperature: number; // 2000 to 50000
  tint: number; // -100 to +100
  clarity: number; // -100 to +100
  vibrance: number; // -100 to +100
  saturation: number; // -100 to +100
}

export interface ToneCurvePoint {
  x: number; // 0-255
  y: number; // 0-255
}

export interface ToneCurveData {
  points: ToneCurvePoint[];
  channel: 'rgb' | 'r' | 'g' | 'b';
}

export interface HSLAdjustments {
  // For each color: red, orange, yellow, green, aqua, blue, purple, magenta
  red: { hue: number; saturation: number; luminance: number };
  orange: { hue: number; saturation: number; luminance: number };
  yellow: { hue: number; saturation: number; luminance: number };
  green: { hue: number; saturation: number; luminance: number };
  aqua: { hue: number; saturation: number; luminance: number };
  blue: { hue: number; saturation: number; luminance: number };
  purple: { hue: number; saturation: number; luminance: number };
  magenta: { hue: number; saturation: number; luminance: number };
}

export interface ColorGradingSettings {
  shadows: { hue: number; saturation: number };
  midtones: { hue: number; saturation: number };
  highlights: { hue: number; saturation: number };
  balance: number; // -100 to +100
  blending: number; // 0 to 100
  globalSaturation: number; // 0 to 100
}

export interface DetailSettings {
  sharpening: {
    amount: number; // 0-150
    radius: number; // 0.5-3.0
    detail: number; // 0-100
    masking: number; // 0-100
  };
  noiseReduction: {
    luminance: number; // 0-100
    detail: number; // 0-100
    contrast: number; // 0-100
    color: number; // 0-100
  };
}

export interface EffectsSettings {
  vignette: {
    amount: number; // -100 to +100
    midpoint: number; // 0-100
    roundness: number; // -100 to +100
    feather: number; // 0-100
    highlights: number; // 0-100
  };
  grain: {
    amount: number; // 0-100
    size: number; // 0-100
    roughness: number; // 0-100
  };
  dehaze: number; // -100 to +100
}

export interface AdjustmentSettings {
  basic: BasicAdjustments;
  toneCurve: ToneCurveData;
  hsl: HSLAdjustments;
  colorGrading: ColorGradingSettings;
  detail: DetailSettings;
  effects: EffectsSettings;
}

export interface ToolSettings {
  brush: {
    size: number;
    hardness: number;
    opacity: number;
    color: string;
  };
  eraser: {
    size: number;
    hardness: number;
  };
  text: {
    fontFamily: string;
    fontSize: number;
    color: string;
    align: 'left' | 'center' | 'right';
  };
}

export interface Selection {
  type: 'rectangle' | 'ellipse' | 'lasso' | 'magic-wand';
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  points?: { x: number; y: number }[];
  mask?: ImageData;
}

export interface HistogramData {
  r: number[]; // 256 values
  g: number[]; // 256 values
  b: number[]; // 256 values
  luminance: number[]; // 256 values
}

export interface EditorState {
  // Canvas
  canvasSize: { width: number; height: number };
  zoom: number;
  pan: { x: number; y: number };

  // Image & Layers
  originalImage: ImageData | null;
  layers: Layer[];
  activeLayerId: string | null;

  // Tools
  activeTool: Tool;
  toolSettings: ToolSettings;

  // Adjustments (Lightroom-style)
  adjustments: AdjustmentSettings;

  // Selection & Masks
  selection: Selection | null;

  // UI State
  panels: {
    layers: boolean;
    adjustments: boolean;
    tools: boolean;
    histogram: boolean;
  };

  // Processing
  isProcessing: boolean;
  processingProgress: number;
}

// Default values
export const DEFAULT_BASIC_ADJUSTMENTS: BasicAdjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 6500,
  tint: 0,
  clarity: 0,
  vibrance: 0,
  saturation: 0,
};

export const DEFAULT_HSL_ADJUSTMENTS: HSLAdjustments = {
  red: { hue: 0, saturation: 0, luminance: 0 },
  orange: { hue: 0, saturation: 0, luminance: 0 },
  yellow: { hue: 0, saturation: 0, luminance: 0 },
  green: { hue: 0, saturation: 0, luminance: 0 },
  aqua: { hue: 0, saturation: 0, luminance: 0 },
  blue: { hue: 0, saturation: 0, luminance: 0 },
  purple: { hue: 0, saturation: 0, luminance: 0 },
  magenta: { hue: 0, saturation: 0, luminance: 0 },
};

export const DEFAULT_COLOR_GRADING: ColorGradingSettings = {
  shadows: { hue: 0, saturation: 0 },
  midtones: { hue: 0, saturation: 0 },
  highlights: { hue: 0, saturation: 0 },
  balance: 0,
  blending: 50,
  globalSaturation: 100,
};

export const DEFAULT_DETAIL_SETTINGS: DetailSettings = {
  sharpening: {
    amount: 0,
    radius: 1.0,
    detail: 50,
    masking: 0,
  },
  noiseReduction: {
    luminance: 0,
    detail: 50,
    contrast: 0,
    color: 0,
  },
};

export const DEFAULT_EFFECTS_SETTINGS: EffectsSettings = {
  vignette: {
    amount: 0,
    midpoint: 50,
    roundness: 0,
    feather: 50,
    highlights: 0,
  },
  grain: {
    amount: 0,
    size: 50,
    roughness: 50,
  },
  dehaze: 0,
};

export const DEFAULT_ADJUSTMENT_SETTINGS: AdjustmentSettings = {
  basic: DEFAULT_BASIC_ADJUSTMENTS,
  toneCurve: {
    points: [
      { x: 0, y: 0 },
      { x: 255, y: 255 },
    ],
    channel: 'rgb',
  },
  hsl: DEFAULT_HSL_ADJUSTMENTS,
  colorGrading: DEFAULT_COLOR_GRADING,
  detail: DEFAULT_DETAIL_SETTINGS,
  effects: DEFAULT_EFFECTS_SETTINGS,
};
