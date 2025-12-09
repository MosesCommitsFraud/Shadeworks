import type { Color } from './types';

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Calculate Euclidean distance between two colors
 */
export function colorDistance(c1: Color, c2: Color): number {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Find the closest color in a palette to a given color
 */
export function findClosestColor(color: Color, palette: Color[]): Color {
  let closestColor = palette[0];
  let minDistance = colorDistance(color, closestColor);

  for (let i = 1; i < palette.length; i++) {
    const distance = colorDistance(color, palette[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = palette[i];
    }
  }

  return closestColor;
}

/**
 * Convert RGB to grayscale using luminosity method
 */
export function rgbToGrayscale(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Convert a color to grayscale
 */
export function colorToGrayscale(color: Color): Color {
  const gray = Math.round(rgbToGrayscale(color.r, color.g, color.b));
  return { r: gray, g: gray, b: gray, a: color.a };
}

/**
 * Create a hex string from a color
 */
export function colorToHex(color: Color): string {
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Parse a hex color string to a Color object
 */
export function hexToColor(hex: string): Color {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: 255 };
}

/**
 * Create an ImageData object from a canvas
 */
export function getImageDataFromCanvas(canvas: HTMLCanvasElement): ImageData | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Load an image from a file
 */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Create ImageData from an HTMLImageElement
 */
export function imageToImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}

/**
 * Download ImageData as a file
 */
export function downloadImageData(
  imageData: ImageData,
  filename: string,
  format: 'png' | 'jpeg' | 'webp' = 'png',
  quality: number = 1.0
): void {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    `image/${format}`,
    quality
  );
}

/**
 * Copy ImageData
 */
export function copyImageData(imageData: ImageData): ImageData {
  const copy = new ImageData(imageData.width, imageData.height);
  copy.data.set(imageData.data);
  return copy;
}

/**
 * Blend two ImageData objects with a given weight
 * @param imageData1 First image
 * @param imageData2 Second image
 * @param weight Weight of second image (0-1). 0 = all first image, 1 = all second image
 */
export function blendImageData(
  imageData1: ImageData,
  imageData2: ImageData,
  weight: number
): ImageData {
  if (imageData1.width !== imageData2.width || imageData1.height !== imageData2.height) {
    throw new Error('Images must have the same dimensions for blending');
  }

  const blended = new ImageData(imageData1.width, imageData1.height);
  const w = clamp(weight, 0, 1);
  const w1 = 1 - w;

  for (let i = 0; i < imageData1.data.length; i += 4) {
    blended.data[i] = Math.round(imageData1.data[i] * w1 + imageData2.data[i] * w);
    blended.data[i + 1] = Math.round(imageData1.data[i + 1] * w1 + imageData2.data[i + 1] * w);
    blended.data[i + 2] = Math.round(imageData1.data[i + 2] * w1 + imageData2.data[i + 2] * w);
    blended.data[i + 3] = Math.round(imageData1.data[i + 3] * w1 + imageData2.data[i + 3] * w);
  }

  return blended;
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
