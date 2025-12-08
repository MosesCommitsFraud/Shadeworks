import type { ExportSettings, DPI, HalftoneAngle, Color } from './types';
import JSZip from 'jszip';

/**
 * Generate halftone pattern
 * Creates a halftone effect by rotating and applying dot patterns
 */
export function applyHalftone(
  imageData: ImageData,
  angle: HalftoneAngle = 45,
  frequency: number = 10
): ImageData {
  const { width, height, data } = imageData;
  const output = new ImageData(width, height);
  output.data.set(data);

  const angleRad = (angle * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Get grayscale value
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

      // Rotate coordinates
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;

      // Calculate halftone dot size based on brightness
      const cellX = Math.floor(rx / frequency);
      const cellY = Math.floor(ry / frequency);
      const cellCenterX = (cellX + 0.5) * frequency;
      const cellCenterY = (cellY + 0.5) * frequency;

      const dx = rx - cellCenterX;
      const dy = ry - cellCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Dot radius based on gray value (darker = larger dot)
      const maxRadius = frequency / 2;
      const dotRadius = maxRadius * (1 - gray / 255);

      const value = distance < dotRadius ? 0 : 255;

      output.data[idx] = value;
      output.data[idx + 1] = value;
      output.data[idx + 2] = value;
      output.data[idx + 3] = data[idx + 3];
    }
  }

  return output;
}

/**
 * Separate image into color channels
 * Returns individual layers for each color
 */
export function separateColors(
  imageData: ImageData,
  colors: Color[]
): ImageData[] {
  const { width, height, data } = imageData;
  const layers: ImageData[] = [];

  for (const targetColor of colors) {
    const layer = new ImageData(width, height);

    for (let i = 0; i < data.length; i += 4) {
      const pixelColor = {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3],
      };

      // Check if pixel matches this color (with small tolerance)
      const tolerance = 10;
      const matches =
        Math.abs(pixelColor.r - targetColor.r) < tolerance &&
        Math.abs(pixelColor.g - targetColor.g) < tolerance &&
        Math.abs(pixelColor.b - targetColor.b) < tolerance;

      if (matches) {
        // Show this color
        layer.data[i] = targetColor.r;
        layer.data[i + 1] = targetColor.g;
        layer.data[i + 2] = targetColor.b;
        layer.data[i + 3] = 255;
      } else {
        // Transparent
        layer.data[i] = 255;
        layer.data[i + 1] = 255;
        layer.data[i + 2] = 255;
        layer.data[i + 3] = 0;
      }
    }

    layers.push(layer);
  }

  return layers;
}

/**
 * Create CMYK simulation layers
 * Approximates CMYK separation for print
 */
export function separateToCMYK(imageData: ImageData): {
  cyan: ImageData;
  magenta: ImageData;
  yellow: ImageData;
  black: ImageData;
} {
  const { width, height, data } = imageData;

  const cyan = new ImageData(width, height);
  const magenta = new ImageData(width, height);
  const yellow = new ImageData(width, height);
  const black = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const a = data[i + 3];

    // RGB to CMYK conversion
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    // Cyan layer (show cyan on white)
    const cVal = Math.round((1 - c) * 255);
    cyan.data[i] = cVal;
    cyan.data[i + 1] = 255;
    cyan.data[i + 2] = 255;
    cyan.data[i + 3] = a;

    // Magenta layer
    const mVal = Math.round((1 - m) * 255);
    magenta.data[i] = 255;
    magenta.data[i + 1] = mVal;
    magenta.data[i + 2] = 255;
    magenta.data[i + 3] = a;

    // Yellow layer
    const yVal = Math.round((1 - y) * 255);
    yellow.data[i] = 255;
    yellow.data[i + 1] = 255;
    yellow.data[i + 2] = yVal;
    yellow.data[i + 3] = a;

    // Black layer
    const kVal = Math.round((1 - k) * 255);
    black.data[i] = kVal;
    black.data[i + 1] = kVal;
    black.data[i + 2] = kVal;
    black.data[i + 3] = a;
  }

  return { cyan, magenta, yellow, black };
}

/**
 * Scale ImageData to a specific DPI
 */
export function scaleImageDataForDPI(
  imageData: ImageData,
  targetDPI: DPI
): ImageData {
  const scaleFactor = targetDPI / 72; // 72 is base DPI
  if (scaleFactor === 1) return imageData;

  const newWidth = Math.round(imageData.width * scaleFactor);
  const newHeight = Math.round(imageData.height * scaleFactor);

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  // Create scaled canvas
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = newWidth;
  scaledCanvas.height = newHeight;
  const scaledCtx = scaledCanvas.getContext('2d')!;

  // Use nearest-neighbor for pixel-perfect scaling
  scaledCtx.imageSmoothingEnabled = false;
  scaledCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

  return scaledCtx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Convert ImageData to Blob
 */
async function imageDataToBlob(
  imageData: ImageData,
  format: 'png' | 'jpeg' | 'webp',
  quality?: number
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

/**
 * Export ImageData as PNG
 */
export function exportAsPNG(
  imageData: ImageData,
  filename: string,
  dpi: DPI = 72
): void {
  const scaledData = scaleImageDataForDPI(imageData, dpi);

  const canvas = document.createElement('canvas');
  canvas.width = scaledData.width;
  canvas.height = scaledData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(scaledData, 0, 0);

  canvas.toBlob((blob) => {
    if (!blob) return;
    downloadBlob(blob, filename);
  }, 'image/png');
}

/**
 * Export ImageData as JPEG
 */
export function exportAsJPEG(
  imageData: ImageData,
  filename: string,
  quality: number = 0.95,
  dpi: DPI = 72
): void {
  const scaledData = scaleImageDataForDPI(imageData, dpi);

  const canvas = document.createElement('canvas');
  canvas.width = scaledData.width;
  canvas.height = scaledData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(scaledData, 0, 0);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      downloadBlob(blob, filename);
    },
    'image/jpeg',
    quality
  );
}

/**
 * Export ImageData as WebP
 */
export function exportAsWebP(
  imageData: ImageData,
  filename: string,
  quality: number = 0.95,
  dpi: DPI = 72
): void {
  const scaledData = scaleImageDataForDPI(imageData, dpi);

  const canvas = document.createElement('canvas');
  canvas.width = scaledData.width;
  canvas.height = scaledData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(scaledData, 0, 0);

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      downloadBlob(blob, filename);
    },
    'image/webp',
    quality
  );
}

/**
 * Export color-separated layers as ZIP
 * Bundles each color layer into a single ZIP file
 */
export async function exportColorSeparation(
  imageData: ImageData,
  colors: Color[],
  filename: string,
  settings: ExportSettings
): Promise<void> {
  const layers = separateColors(imageData, colors);
  const { format, dpi, quality } = settings;

  // Create ZIP file
  const zip = new JSZip();

  // Add each layer to ZIP
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const scaledLayer = scaleImageDataForDPI(layer, dpi);
    const layerFilename = `layer_${i + 1}.${format}`;

    try {
      const blob = await imageDataToBlob(scaledLayer, format, quality);
      zip.file(layerFilename, blob);
    } catch (error) {
      console.error(`Failed to add layer ${i + 1} to ZIP:`, error);
    }
  }

  // Generate and download ZIP
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFilename = `${filename}_color_separation.zip`;
    downloadBlob(zipBlob, zipFilename);
  } catch (error) {
    console.error('Failed to generate ZIP file:', error);
    throw error;
  }
}

/**
 * Export CMYK separation as ZIP
 * Bundles cyan, magenta, yellow, and black layers into a single ZIP file
 */
export async function exportCMYKSeparation(
  imageData: ImageData,
  filename: string,
  settings: ExportSettings
): Promise<void> {
  const { cyan, magenta, yellow, black } = separateToCMYK(imageData);
  const { format, dpi, quality } = settings;

  const layers = [
    { name: 'cyan', data: cyan },
    { name: 'magenta', data: magenta },
    { name: 'yellow', data: yellow },
    { name: 'black', data: black },
  ];

  // Create ZIP file
  const zip = new JSZip();

  // Add each layer to ZIP
  for (const layer of layers) {
    const scaledLayer = scaleImageDataForDPI(layer.data, dpi);
    const layerFilename = `${layer.name}.${format}`;

    try {
      const blob = await imageDataToBlob(scaledLayer, format, quality);
      zip.file(layerFilename, blob);
    } catch (error) {
      console.error(`Failed to add ${layer.name} layer to ZIP:`, error);
    }
  }

  // Generate and download ZIP
  try {
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipFilename = `${filename}_cmyk_separation.zip`;
    downloadBlob(zipBlob, zipFilename);
  } catch (error) {
    console.error('Failed to generate ZIP file:', error);
    throw error;
  }
}

/**
 * Export ImageData based on settings
 */
export function exportImage(
  imageData: ImageData,
  filename: string,
  settings: ExportSettings
): void {
  const { format, dpi, quality = 0.95, halftoneAngle } = settings;

  // Apply halftone if specified
  let processedImage = imageData;
  if (halftoneAngle !== undefined && halftoneAngle !== null) {
    processedImage = applyHalftone(imageData, halftoneAngle);
  }

  // Ensure filename has correct extension
  const baseFilename = filename.replace(/\.[^/.]+$/, '');
  const fullFilename = `${baseFilename}.${format}`;

  switch (format) {
    case 'png':
      exportAsPNG(processedImage, fullFilename, dpi);
      break;
    case 'jpeg':
      exportAsJPEG(processedImage, fullFilename, quality, dpi);
      break;
    case 'webp':
      exportAsWebP(processedImage, fullFilename, quality, dpi);
      break;
    default:
      exportAsPNG(processedImage, fullFilename, dpi);
  }
}

/**
 * Helper to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get file extension from format
 */
export function getFileExtension(format: 'png' | 'jpeg' | 'webp'): string {
  return format === 'jpeg' ? 'jpg' : format;
}

/**
 * Validate filename
 */
export function validateFilename(filename: string): string {
  // Remove invalid characters
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_');
}
