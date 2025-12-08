import type {
  DitheringSettings,
  AdjustmentSettings,
  ColorModeSettings,
  Palette,
  PaletteType,
} from './types';
import { getDefaultAdjustmentSettings } from './adjustments';

/**
 * Complete preset configuration
 */
export interface DitherPreset {
  id: string;
  name: string;
  description: string;
  category: 'retro' | 'print' | 'artistic' | 'custom';
  ditheringSettings: DitheringSettings;
  adjustmentSettings: AdjustmentSettings;
  colorModeSettings: ColorModeSettings;
  paletteType: PaletteType; // Palette type identifier
}

/**
 * Default presets for common use cases
 */
export const DEFAULT_PRESETS: DitherPreset[] = [
  {
    id: 'newspaper',
    name: 'Newspaper',
    description: 'Classic newspaper halftone look with high contrast',
    category: 'print',
    ditheringSettings: {
      algorithm: 'floyd-steinberg',
      serpentine: true,
      errorAttenuation: 0.8,
      randomNoise: 0,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      contrast: 1.3,
      sharpen: 0.5,
    },
    colorModeSettings: {
      mode: 'mono',
      shades: 2,
    },
    paletteType: 'bw',
  },
  {
    id: 'retro-game',
    name: 'Retro Game',
    description: '8-bit gaming aesthetic with limited palette',
    category: 'retro',
    ditheringSettings: {
      algorithm: 'atkinson',
      serpentine: false,
      errorAttenuation: 1.0,
      randomNoise: 0,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      saturation: 1.2,
    },
    colorModeSettings: {
      mode: 'indexed',
      shades: 16,
    },
    paletteType: 'gameboy',
  },
  {
    id: 'c64-style',
    name: 'Commodore 64',
    description: 'Classic C64 color palette and dithering',
    category: 'retro',
    ditheringSettings: {
      algorithm: 'bayer-4x4',
      serpentine: false,
      errorAttenuation: 1.0,
      randomNoise: 0,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      saturation: 1.1,
      contrast: 1.1,
    },
    colorModeSettings: {
      mode: 'indexed',
      shades: 16,
    },
    paletteType: 'commodore-64',
  },
  {
    id: 'print-ready',
    name: 'Print Ready',
    description: 'High-quality dithering optimized for printing',
    category: 'print',
    ditheringSettings: {
      algorithm: 'jarvis-judice-ninke',
      serpentine: true,
      errorAttenuation: 1.0,
      randomNoise: 0,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      sharpen: 0.3,
      contrast: 1.1,
    },
    colorModeSettings: {
      mode: 'rgb',
      shades: 16,
    },
    paletteType: 'web-safe',
  },
  {
    id: 'screen-print',
    name: 'Screen Print',
    description: 'Bold colors and strong contrast for screen printing',
    category: 'artistic',
    ditheringSettings: {
      algorithm: 'stucki',
      serpentine: true,
      errorAttenuation: 0.9,
      randomNoise: 0,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      contrast: 1.4,
      saturation: 1.3,
    },
    colorModeSettings: {
      mode: 'indexed',
      shades: 8,
    },
    paletteType: 'screen-print',
  },
  {
    id: 'risograph',
    name: 'Risograph',
    description: 'Vibrant risograph print aesthetic',
    category: 'artistic',
    ditheringSettings: {
      algorithm: 'floyd-steinberg',
      serpentine: true,
      errorAttenuation: 0.85,
      randomNoise: 5,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      saturation: 1.25,
      contrast: 1.2,
    },
    colorModeSettings: {
      mode: 'indexed',
      shades: 8,
    },
    paletteType: 'risograph',
  },
  {
    id: 'vaporwave',
    name: 'Vaporwave',
    description: 'Retro-futuristic vaporwave aesthetic',
    category: 'artistic',
    ditheringSettings: {
      algorithm: 'bayer-8x8',
      serpentine: false,
      errorAttenuation: 1.0,
      randomNoise: 0,
    },
    adjustmentSettings: {
      ...getDefaultAdjustmentSettings(),
      saturation: 1.4,
    },
    colorModeSettings: {
      mode: 'indexed',
      shades: 16,
    },
    paletteType: 'vaporwave',
  },
  {
    id: 'monochrome-tonal',
    name: 'Monochrome Tonal',
    description: 'Smooth grayscale with subtle gradations',
    category: 'print',
    ditheringSettings: {
      algorithm: 'sierra',
      serpentine: true,
      errorAttenuation: 1.0,
      randomNoise: 0,
    },
    adjustmentSettings: getDefaultAdjustmentSettings(),
    colorModeSettings: {
      mode: 'tonal',
      shades: 16,
    },
    paletteType: 'grayscale-16',
  },
];

/**
 * Storage key for custom presets
 */
const STORAGE_KEY = 'dither-presets';

/**
 * Get all presets (default + custom)
 */
export function getAllPresets(): DitherPreset[] {
  const customPresets = getCustomPresets();
  return [...DEFAULT_PRESETS, ...customPresets];
}

/**
 * Get custom presets from localStorage
 */
export function getCustomPresets(): DitherPreset[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const presets = JSON.parse(stored);
    return Array.isArray(presets) ? presets : [];
  } catch (error) {
    console.error('Error loading custom presets:', error);
    return [];
  }
}

/**
 * Save a custom preset
 */
export function savePreset(preset: DitherPreset): void {
  if (typeof window === 'undefined') return;

  try {
    const customPresets = getCustomPresets();

    // Check if preset with this ID already exists
    const existingIndex = customPresets.findIndex((p) => p.id === preset.id);

    if (existingIndex >= 0) {
      // Update existing preset
      customPresets[existingIndex] = preset;
    } else {
      // Add new preset
      customPresets.push(preset);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
  } catch (error) {
    console.error('Error saving preset:', error);
    throw new Error('Failed to save preset');
  }
}

/**
 * Delete a custom preset
 */
export function deletePreset(presetId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const customPresets = getCustomPresets();
    const filtered = customPresets.filter((p) => p.id !== presetId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting preset:', error);
    throw new Error('Failed to delete preset');
  }
}

/**
 * Export preset as JSON
 */
export function exportPresetAsJSON(preset: DitherPreset): void {
  const json = JSON.stringify(preset, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${preset.id}-preset.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import preset from JSON
 */
export function importPresetFromJSON(jsonString: string): DitherPreset {
  try {
    const preset = JSON.parse(jsonString) as DitherPreset;

    // Validate required fields
    if (
      !preset.id ||
      !preset.name ||
      !preset.ditheringSettings ||
      !preset.adjustmentSettings ||
      !preset.colorModeSettings
    ) {
      throw new Error('Invalid preset format');
    }

    return preset;
  } catch (error) {
    console.error('Error importing preset:', error);
    throw new Error('Failed to import preset. Invalid JSON format.');
  }
}

/**
 * Generate a unique preset ID
 */
export function generatePresetId(baseName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitized = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${sanitized}-${timestamp}-${random}`;
}

/**
 * Create a preset from current settings
 */
export function createPresetFromSettings(
  name: string,
  description: string,
  ditheringSettings: DitheringSettings,
  adjustmentSettings: AdjustmentSettings,
  colorModeSettings: ColorModeSettings,
  paletteType: PaletteType
): DitherPreset {
  return {
    id: generatePresetId(name),
    name,
    description,
    category: 'custom',
    ditheringSettings: { ...ditheringSettings },
    adjustmentSettings: { ...adjustmentSettings },
    colorModeSettings: { ...colorModeSettings },
    paletteType,
  };
}
