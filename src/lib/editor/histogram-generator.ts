import type { HistogramData } from './types';

/**
 * Generate histogram data from ImageData
 * Returns RGB and luminance histograms with 256 bins each
 */
export function generateHistogram(imageData: ImageData): HistogramData {
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);
  const luminance = new Array(256).fill(0);

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const red = data[i];
    const green = data[i + 1];
    const blue = data[i + 2];

    r[red]++;
    g[green]++;
    b[blue]++;

    // Calculate luminance using rec. 709 coefficients
    const lum = Math.round(
      0.2126 * red +
      0.7152 * green +
      0.0722 * blue
    );
    luminance[Math.min(255, Math.max(0, lum))]++;
  }

  return { r, g, b, luminance };
}

/**
 * Detect clipping in highlights and shadows
 */
export function detectClipping(imageData: ImageData): {
  highlightClipping: number; // percentage
  shadowClipping: number; // percentage
} {
  const data = imageData.data;
  let highlightCount = 0;
  let shadowCount = 0;
  const totalPixels = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check for pure white (highlight clipping)
    if (r === 255 && g === 255 && b === 255) {
      highlightCount++;
    }

    // Check for pure black (shadow clipping)
    if (r === 0 && g === 0 && b === 0) {
      shadowCount++;
    }
  }

  return {
    highlightClipping: (highlightCount / totalPixels) * 100,
    shadowClipping: (shadowCount / totalPixels) * 100,
  };
}
