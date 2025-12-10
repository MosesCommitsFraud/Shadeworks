import type { BasicAdjustments } from './types';

/**
 * Copy ImageData (helper function)
 */
export function copyImageData(imageData: ImageData): ImageData {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}

/**
 * Clamp value between 0 and 255
 */
function clamp(value: number): number {
  return Math.max(0, Math.min(255, value));
}

/**
 * Apply exposure adjustment
 */
function applyExposure(imageData: ImageData, exposure: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  // Convert exposure from -5 to +5 range to multiplier
  const multiplier = Math.pow(2, exposure);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] * multiplier);     // R
    data[i + 1] = clamp(data[i + 1] * multiplier); // G
    data[i + 2] = clamp(data[i + 2] * multiplier); // B
  }

  return result;
}

/**
 * Apply contrast adjustment
 */
function applyContrast(imageData: ImageData, contrast: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  // Convert contrast from -100 to +100 to factor
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(factor * (data[i] - 128) + 128);         // R
    data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128); // G
    data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128); // B
  }

  return result;
}

/**
 * Apply brightness adjustment (using exposure-style calculation)
 */
function applyBrightness(imageData: ImageData, brightness: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp(data[i] + brightness);         // R
    data[i + 1] = clamp(data[i + 1] + brightness); // G
    data[i + 2] = clamp(data[i + 2] + brightness); // B
  }

  return result;
}

/**
 * Apply saturation adjustment
 */
function applySaturation(imageData: ImageData, saturation: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  // Convert saturation from -100 to +100 to factor (0 = grayscale, 1 = normal, 2 = 2x saturation)
  const factor = (saturation + 100) / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate luminance (rec. 709)
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Interpolate between gray and color based on saturation factor
    data[i] = clamp(gray + factor * (r - gray));         // R
    data[i + 1] = clamp(gray + factor * (g - gray));     // G
    data[i + 2] = clamp(gray + factor * (b - gray));     // B
  }

  return result;
}

/**
 * Apply vibrance adjustment (smart saturation that protects skin tones)
 */
function applyVibrance(imageData: ImageData, vibrance: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  const factor = vibrance / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate saturation level
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;

    // Apply vibrance more to less saturated colors
    const boost = factor * (1 - sat);
    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    data[i] = clamp(r + boost * (r - gray));         // R
    data[i + 1] = clamp(g + boost * (g - gray));     // G
    data[i + 2] = clamp(b + boost * (b - gray));     // B
  }

  return result;
}

/**
 * Apply highlights adjustment
 */
function applyHighlights(imageData: ImageData, highlights: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  const factor = highlights / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Only affect bright pixels (luminance > 128)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const weight = Math.max(0, (lum - 128) / 127);

    const adjustment = factor * weight * 50;
    data[i] = clamp(r + adjustment);         // R
    data[i + 1] = clamp(g + adjustment);     // G
    data[i + 2] = clamp(b + adjustment);     // B
  }

  return result;
}

/**
 * Apply shadows adjustment
 */
function applyShadows(imageData: ImageData, shadows: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  const factor = shadows / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Only affect dark pixels (luminance < 128)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const weight = Math.max(0, (128 - lum) / 128);

    const adjustment = factor * weight * 50;
    data[i] = clamp(r + adjustment);         // R
    data[i + 1] = clamp(g + adjustment);     // G
    data[i + 2] = clamp(b + adjustment);     // B
  }

  return result;
}

/**
 * Apply whites adjustment
 */
function applyWhites(imageData: ImageData, whites: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  const factor = whites / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Only affect very bright pixels (luminance > 200)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const weight = Math.max(0, (lum - 200) / 55);

    const adjustment = factor * weight * 50;
    data[i] = clamp(r + adjustment);         // R
    data[i + 1] = clamp(g + adjustment);     // G
    data[i + 2] = clamp(b + adjustment);     // B
  }

  return result;
}

/**
 * Apply blacks adjustment
 */
function applyBlacks(imageData: ImageData, blacks: number): ImageData {
  const result = copyImageData(imageData);
  const data = result.data;

  const factor = blacks / 100;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Only affect very dark pixels (luminance < 55)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const weight = Math.max(0, (55 - lum) / 55);

    const adjustment = factor * weight * 50;
    data[i] = clamp(r + adjustment);         // R
    data[i + 1] = clamp(g + adjustment);     // G
    data[i + 2] = clamp(b + adjustment);     // B
  }

  return result;
}

/**
 * Apply all basic adjustments in sequence
 */
export function applyBasicAdjustments(
  imageData: ImageData,
  adjustments: BasicAdjustments
): ImageData {
  let result = imageData;

  // Apply in order for best results
  if (adjustments.exposure !== 0) {
    result = applyExposure(result, adjustments.exposure);
  }

  if (adjustments.contrast !== 0) {
    result = applyContrast(result, adjustments.contrast);
  }

  if (adjustments.highlights !== 0) {
    result = applyHighlights(result, adjustments.highlights);
  }

  if (adjustments.shadows !== 0) {
    result = applyShadows(result, adjustments.shadows);
  }

  if (adjustments.whites !== 0) {
    result = applyWhites(result, adjustments.whites);
  }

  if (adjustments.blacks !== 0) {
    result = applyBlacks(result, adjustments.blacks);
  }

  if (adjustments.vibrance !== 0) {
    result = applyVibrance(result, adjustments.vibrance);
  }

  if (adjustments.saturation !== 0) {
    result = applySaturation(result, adjustments.saturation);
  }

  return result;
}

/**
 * Debounce helper
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
