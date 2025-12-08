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
 * Apply hue shift (-180 to 180 degrees)
 */
export function adjustHue(imageData: ImageData, hue: number): ImageData {
  if (hue === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const hueRadians = (hue * Math.PI) / 180;

  for (let i = 0; i < output.data.length; i += 4) {
    const r = output.data[i] / 255;
    const g = output.data[i + 1] / 255;
    const b = output.data[i + 2] / 255;

    // Convert RGB to HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    // Shift hue
    h = (h + hueRadians / (2 * Math.PI)) % 1;
    if (h < 0) h += 1;

    // Convert HSL back to RGB
    let r2, g2, b2;
    if (s === 0) {
      r2 = g2 = b2 = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r2 = hue2rgb(p, q, h + 1 / 3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1 / 3);
    }

    output.data[i] = clamp(r2 * 255, 0, 255);
    output.data[i + 1] = clamp(g2 * 255, 0, 255);
    output.data[i + 2] = clamp(b2 * 255, 0, 255);
  }

  return output;
}

/**
 * Apply vibrance (-100 to 100) - smart saturation that avoids skin tones
 */
export function adjustVibrance(imageData: ImageData, vibrance: number): ImageData {
  if (vibrance === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const factor = vibrance / 100;

  for (let i = 0; i < output.data.length; i += 4) {
    const r = output.data[i];
    const g = output.data[i + 1];
    const b = output.data[i + 2];

    const max = Math.max(r, g, b);
    const avg = (r + g + b) / 3;
    const amt = ((Math.abs(max - avg) * 2 / 255) * factor) / 2;

    if (r !== max) output.data[i] = clamp(r + (max - r) * amt, 0, 255);
    if (g !== max) output.data[i + 1] = clamp(g + (max - g) * amt, 0, 255);
    if (b !== max) output.data[i + 2] = clamp(b + (max - b) * amt, 0, 255);
  }

  return output;
}

/**
 * Apply exposure (-2 to 2 stops)
 */
export function adjustExposure(imageData: ImageData, exposure: number): ImageData {
  if (exposure === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const factor = Math.pow(2, exposure);

  for (let i = 0; i < output.data.length; i += 4) {
    output.data[i] = clamp(output.data[i] * factor, 0, 255);
    output.data[i + 1] = clamp(output.data[i + 1] * factor, 0, 255);
    output.data[i + 2] = clamp(output.data[i + 2] * factor, 0, 255);
  }

  return output;
}

/**
 * Apply temperature (-100 to 100) - blue to yellow
 */
export function adjustTemperature(imageData: ImageData, temperature: number): ImageData {
  if (temperature === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const factor = temperature / 100;

  for (let i = 0; i < output.data.length; i += 4) {
    // Warm = more red/yellow, less blue
    // Cool = more blue, less red/yellow
    output.data[i] = clamp(output.data[i] + factor * 25, 0, 255); // Red
    output.data[i + 1] = clamp(output.data[i + 1] + factor * 10, 0, 255); // Green
    output.data[i + 2] = clamp(output.data[i + 2] - factor * 25, 0, 255); // Blue
  }

  return output;
}

/**
 * Apply tint (-100 to 100) - green to magenta
 */
export function adjustTint(imageData: ImageData, tint: number): ImageData {
  if (tint === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const factor = tint / 100;

  for (let i = 0; i < output.data.length; i += 4) {
    // Magenta = more red/blue, less green
    // Green = more green, less red/blue
    output.data[i] = clamp(output.data[i] + factor * 20, 0, 255); // Red
    output.data[i + 1] = clamp(output.data[i + 1] - factor * 25, 0, 255); // Green
    output.data[i + 2] = clamp(output.data[i + 2] + factor * 20, 0, 255); // Blue
  }

  return output;
}

/**
 * Apply highlights adjustment (-100 to 100)
 */
export function adjustHighlights(imageData: ImageData, highlights: number): ImageData {
  if (highlights === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const factor = highlights / 100;

  for (let i = 0; i < output.data.length; i += 4) {
    const r = output.data[i];
    const g = output.data[i + 1];
    const b = output.data[i + 2];

    // Calculate luminance
    const lum = (r + g + b) / 3;

    // Only affect bright pixels (highlights)
    if (lum > 128) {
      const weight = (lum - 128) / 127;
      const adjustment = factor * weight * 50;
      output.data[i] = clamp(r - adjustment, 0, 255);
      output.data[i + 1] = clamp(g - adjustment, 0, 255);
      output.data[i + 2] = clamp(b - adjustment, 0, 255);
    }
  }

  return output;
}

/**
 * Apply shadows adjustment (-100 to 100)
 */
export function adjustShadows(imageData: ImageData, shadows: number): ImageData {
  if (shadows === 0) return copyImageData(imageData);

  const output = copyImageData(imageData);
  const factor = shadows / 100;

  for (let i = 0; i < output.data.length; i += 4) {
    const r = output.data[i];
    const g = output.data[i + 1];
    const b = output.data[i + 2];

    // Calculate luminance
    const lum = (r + g + b) / 3;

    // Only affect dark pixels (shadows)
    if (lum < 128) {
      const weight = (128 - lum) / 128;
      const adjustment = factor * weight * 50;
      output.data[i] = clamp(r + adjustment, 0, 255);
      output.data[i + 1] = clamp(g + adjustment, 0, 255);
      output.data[i + 2] = clamp(b + adjustment, 0, 255);
    }
  }

  return output;
}

/**
 * Apply vignette (0 to 100%)
 */
export function applyVignette(imageData: ImageData, strength: number): ImageData {
  if (strength <= 0) return copyImageData(imageData);

  const { width, height } = imageData;
  const output = copyImageData(imageData);
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  const factor = strength / 100;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const vignette = 1 - (dist / maxDist) * factor;

      const idx = (y * width + x) * 4;
      output.data[idx] = clamp(output.data[idx] * vignette, 0, 255);
      output.data[idx + 1] = clamp(output.data[idx + 1] * vignette, 0, 255);
      output.data[idx + 2] = clamp(output.data[idx + 2] * vignette, 0, 255);
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

  // Apply adjustments in order (order matters!)
  // Exposure first (affects overall brightness)
  if (settings.exposure !== 0) {
    output = adjustExposure(output, settings.exposure);
  }

  // Then brightness and contrast
  if (settings.brightness !== 0) {
    output = adjustBrightness(output, settings.brightness);
  }

  if (settings.contrast !== 0) {
    output = adjustContrast(output, settings.contrast);
  }

  // Highlights and shadows
  if (settings.highlights !== 0) {
    output = adjustHighlights(output, settings.highlights);
  }

  if (settings.shadows !== 0) {
    output = adjustShadows(output, settings.shadows);
  }

  // Color adjustments
  if (settings.temperature !== 0) {
    output = adjustTemperature(output, settings.temperature);
  }

  if (settings.tint !== 0) {
    output = adjustTint(output, settings.tint);
  }

  if (settings.hue !== 0) {
    output = adjustHue(output, settings.hue);
  }

  if (settings.saturation !== 0) {
    output = adjustSaturation(output, settings.saturation);
  }

  if (settings.vibrance !== 0) {
    output = adjustVibrance(output, settings.vibrance);
  }

  // Gamma correction
  if (settings.gamma !== 1.0) {
    output = adjustGamma(output, settings.gamma);
  }

  // Noise reduction before sharpening
  if (settings.denoise > 0) {
    output = applyDenoise(output, settings.denoise);
  }

  // Blur (if needed)
  if (settings.blur > 0) {
    output = applyBlur(output, settings.blur);
  }

  // Sharpen last (after all other adjustments)
  if (settings.sharpen > 0) {
    output = applySharpen(output, settings.sharpen);
  }

  // Vignette last (aesthetic effect)
  if (settings.vignette > 0) {
    output = applyVignette(output, settings.vignette);
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
    exposure: 0,
    hue: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    blur: 0,
    sharpen: 0,
    denoise: 0,
    gamma: 1.0,
    vignette: 0,
  };
}
