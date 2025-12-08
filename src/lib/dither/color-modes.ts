import type { ColorMode, Palette, Color } from './types';
import { rgbToGrayscale, findClosestColor } from './utils';

/**
 * Color mode processing functions
 *
 * Color modes determine how the image is interpreted before dithering:
 * - Mono: Pure black and white (1-bit)
 * - Tonal: Grayscale with N shades (2-256 shades)
 * - Indexed: Limited palette with color quantization
 * - RGB: Full color, per-channel dithering
 */

/**
 * Convert image to monochrome (pure black and white)
 * Uses luminance threshold to determine black or white
 */
export function applyMonoMode(
  imageData: ImageData,
  threshold: number = 128
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;
  const outData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);
    const value = gray >= threshold ? 255 : 0;

    outData[i] = value;
    outData[i + 1] = value;
    outData[i + 2] = value;
    outData[i + 3] = data[i + 3]; // Preserve alpha
  }

  return output;
}

/**
 * Convert image to tonal (grayscale with N shades)
 * Quantizes grayscale values to a specific number of levels
 */
export function applyTonalMode(
  imageData: ImageData,
  shades: number = 16
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;
  const outData = output.data;

  // Clamp shades between 2 and 256
  const levels = Math.max(2, Math.min(256, shades));
  const step = 255 / (levels - 1);

  for (let i = 0; i < data.length; i += 4) {
    const gray = rgbToGrayscale(data[i], data[i + 1], data[i + 2]);

    // Quantize to nearest level
    const level = Math.round(gray / step);
    const value = Math.round(level * step);

    outData[i] = value;
    outData[i + 1] = value;
    outData[i + 2] = value;
    outData[i + 3] = data[i + 3]; // Preserve alpha
  }

  return output;
}

/**
 * Apply indexed color mode
 * Maps each pixel to the closest color in the palette (quantization)
 */
export function applyIndexedMode(
  imageData: ImageData,
  palette: Palette
): ImageData {
  const output = new ImageData(imageData.width, imageData.height);
  const { data } = imageData;
  const outData = output.data;

  for (let i = 0; i < data.length; i += 4) {
    const color: Color = {
      r: data[i],
      g: data[i + 1],
      b: data[i + 2],
      a: data[i + 3],
    };

    const closest = findClosestColor(color, palette.colors);

    outData[i] = closest.r;
    outData[i + 1] = closest.g;
    outData[i + 2] = closest.b;
    outData[i + 3] = data[i + 3]; // Preserve alpha
  }

  return output;
}

/**
 * Apply RGB color mode
 * Keeps full RGB color information
 * (This is essentially a no-op, but included for completeness)
 */
export function applyRGBMode(imageData: ImageData): ImageData {
  // Return a copy of the image data unchanged
  const output = new ImageData(imageData.width, imageData.height);
  output.data.set(imageData.data);
  return output;
}

/**
 * Apply color mode to an image
 * Routes to the appropriate color mode function based on the mode
 */
export function applyColorMode(
  imageData: ImageData,
  mode: ColorMode,
  palette: Palette,
  options: {
    monoThreshold?: number;
    tonalShades?: number;
  } = {}
): ImageData {
  switch (mode) {
    case 'mono':
      return applyMonoMode(imageData, options.monoThreshold);
    case 'tonal':
      return applyTonalMode(imageData, options.tonalShades);
    case 'indexed':
      return applyIndexedMode(imageData, palette);
    case 'rgb':
      return applyRGBMode(imageData);
    default:
      return applyRGBMode(imageData);
  }
}

/**
 * Get recommended palette for a color mode
 * Returns appropriate palette based on the selected color mode
 */
export function getRecommendedPaletteForMode(
  mode: ColorMode,
  currentPalette: Palette
): Palette | null {
  // For mono mode, suggest black and white palette
  if (mode === 'mono') {
    return null; // Mono mode doesn't use palette
  }

  // For tonal mode, suggest grayscale palette
  if (mode === 'tonal') {
    return null; // Tonal mode doesn't use palette
  }

  // For indexed and RGB modes, keep current palette
  return currentPalette;
}

/**
 * Validate color mode settings
 * Ensures settings are valid for the selected mode
 */
export function validateColorModeSettings(
  mode: ColorMode,
  settings: {
    monoThreshold?: number;
    tonalShades?: number;
  }
): boolean {
  if (mode === 'mono') {
    const threshold = settings.monoThreshold ?? 128;
    return threshold >= 0 && threshold <= 255;
  }

  if (mode === 'tonal') {
    const shades = settings.tonalShades ?? 16;
    return shades >= 2 && shades <= 256;
  }

  return true;
}
