import type { AdjustmentSettings } from './types';
import { clamp, copyImageData } from './utils';

/**
 * Apply brightness adjustment (-100 to 100)
 */
export function adjustBrightness(imageData: ImageData, brightness: number): ImageData {
  const output = copyImageData(imageData);
  const factor = brightness * 2.55; // Convert -100..100 to -255..255

  for (let i = 0; i < output.data.length; i += 4) {
    output.data[i] = clamp(output.data[i] + factor, 0, 255);
    output.data[i + 1] = clamp(output.data[i + 1] + factor, 0, 255);
    output.data[i + 2] = clamp(output.data[i + 2] + factor, 0, 255);
  }

  return output;
}

/**
 * Apply contrast adjustment (-100 to 100)
 */
export function adjustContrast(imageData: ImageData, contrast: number): ImageData {
  const output = copyImageData(imageData);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

  for (let i = 0; i < output.data.length; i += 4) {
    output.data[i] = clamp(factor * (output.data[i] - 128) + 128, 0, 255);
    output.data[i + 1] = clamp(factor * (output.data[i + 1] - 128) + 128, 0, 255);
    output.data[i + 2] = clamp(factor * (output.data[i + 2] - 128) + 128, 0, 255);
  }

  return output;
}

/**
 * Apply saturation adjustment (-100 to 100)
 */
export function adjustSaturation(imageData: ImageData, saturation: number): ImageData {
  const output = copyImageData(imageData);
  const factor = (saturation + 100) / 100;

  for (let i = 0; i < output.data.length; i += 4) {
    const r = output.data[i];
    const g = output.data[i + 1];
    const b = output.data[i + 2];

    // Calculate luminosity
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // Interpolate between grayscale and color based on saturation
    output.data[i] = clamp(gray + factor * (r - gray), 0, 255);
    output.data[i + 1] = clamp(gray + factor * (g - gray), 0, 255);
    output.data[i + 2] = clamp(gray + factor * (b - gray), 0, 255);
  }

  return output;
}

/**
 * Apply gamma correction (0.5 to 2.0)
 */
export function adjustGamma(imageData: ImageData, gamma: number): ImageData {
  const output = copyImageData(imageData);
  const invGamma = 1 / gamma;

  // Build lookup table for performance
  const lut = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.pow(i / 255, invGamma) * 255;
  }

  for (let i = 0; i < output.data.length; i += 4) {
    output.data[i] = lut[output.data[i]];
    output.data[i + 1] = lut[output.data[i + 1]];
    output.data[i + 2] = lut[output.data[i + 2]];
  }

  return output;
}

/**
 * Apply Gaussian blur (0 to 20px radius)
 */
export function applyBlur(imageData: ImageData, radius: number): ImageData {
  if (radius <= 0) return copyImageData(imageData);

  const { width, height } = imageData;
  let output = copyImageData(imageData);

  // Simple box blur (approximate Gaussian)
  const boxSize = Math.ceil(radius);

  // Horizontal pass
  const temp = copyImageData(output);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = -boxSize; i <= boxSize; i++) {
        const xi = x + i;
        if (xi >= 0 && xi < width) {
          const idx = (y * width + xi) * 4;
          r += temp.data[idx];
          g += temp.data[idx + 1];
          b += temp.data[idx + 2];
          count++;
        }
      }

      const idx = (y * width + x) * 4;
      output.data[idx] = r / count;
      output.data[idx + 1] = g / count;
      output.data[idx + 2] = b / count;
    }
  }

  // Vertical pass
  const temp2 = copyImageData(output);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;

      for (let i = -boxSize; i <= boxSize; i++) {
        const yi = y + i;
        if (yi >= 0 && yi < height) {
          const idx = (yi * width + x) * 4;
          r += temp2.data[idx];
          g += temp2.data[idx + 1];
          b += temp2.data[idx + 2];
          count++;
        }
      }

      const idx = (y * width + x) * 4;
      output.data[idx] = r / count;
      output.data[idx + 1] = g / count;
      output.data[idx + 2] = b / count;
    }
  }

  return output;
}

/**
 * Apply sharpening (0 to 100%)
 */
export function applySharpen(imageData: ImageData, amount: number): ImageData {
  if (amount <= 0) return copyImageData(imageData);

  const { width, height } = imageData;
  const output = copyImageData(imageData);
  const factor = amount / 100;

  // Sharpening kernel (unsharp mask)
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const weight = kernel[ky + 1][kx + 1];
          r += imageData.data[idx] * weight;
          g += imageData.data[idx + 1] * weight;
          b += imageData.data[idx + 2] * weight;
        }
      }

      const idx = (y * width + x) * 4;
      const origR = imageData.data[idx];
      const origG = imageData.data[idx + 1];
      const origB = imageData.data[idx + 2];

      output.data[idx] = clamp(origR + (r - origR) * factor, 0, 255);
      output.data[idx + 1] = clamp(origG + (g - origG) * factor, 0, 255);
      output.data[idx + 2] = clamp(origB + (b - origB) * factor, 0, 255);
    }
  }

  return output;
}

/**
 * Apply denoising (0 to 100%)
 */
export function applyDenoise(imageData: ImageData, strength: number): ImageData {
  if (strength <= 0) return copyImageData(imageData);

  const { width, height } = imageData;
  const output = copyImageData(imageData);
  const windowSize = Math.ceil(strength / 20); // 1-5 pixel window
  const threshold = strength * 2.55; // Convert to 0-255 range

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const centerR = imageData.data[idx];
      const centerG = imageData.data[idx + 1];
      const centerB = imageData.data[idx + 2];

      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      // Simple median-like filter
      for (let dy = -windowSize; dy <= windowSize; dy++) {
        for (let dx = -windowSize; dx <= windowSize; dx++) {
          const ny = y + dy;
          const nx = x + dx;

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const nidx = (ny * width + nx) * 4;
            const nr = imageData.data[nidx];
            const ng = imageData.data[nidx + 1];
            const nb = imageData.data[nidx + 2];

            // Only include similar pixels
            const diff = Math.abs(nr - centerR) + Math.abs(ng - centerG) + Math.abs(nb - centerB);
            if (diff < threshold) {
              sumR += nr;
              sumG += ng;
              sumB += nb;
              count++;
            }
          }
        }
      }

      if (count > 0) {
        output.data[idx] = sumR / count;
        output.data[idx + 1] = sumG / count;
        output.data[idx + 2] = sumB / count;
      }
    }
  }

  return output;
}

/**
 * Apply all adjustments to an image
 */
export function applyAllAdjustments(
  imageData: ImageData,
  settings: AdjustmentSettings
): ImageData {
  let output = copyImageData(imageData);

  // Apply adjustments in order
  if (settings.brightness !== 0) {
    output = adjustBrightness(output, settings.brightness);
  }

  if (settings.contrast !== 0) {
    output = adjustContrast(output, settings.contrast);
  }

  if (settings.saturation !== 0) {
    output = adjustSaturation(output, settings.saturation);
  }

  if (settings.gamma !== 1.0) {
    output = adjustGamma(output, settings.gamma);
  }

  if (settings.blur > 0) {
    output = applyBlur(output, settings.blur);
  }

  if (settings.sharpen > 0) {
    output = applySharpen(output, settings.sharpen);
  }

  if (settings.denoise > 0) {
    output = applyDenoise(output, settings.denoise);
  }

  return output;
}

/**
 * Create default adjustment settings
 */
export function getDefaultAdjustmentSettings(): AdjustmentSettings {
  return {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
    sharpen: 0,
    denoise: 0,
    gamma: 1.0,
  };
}
