import type { ExportSettings, DPI } from './types';

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
 * Export ImageData based on settings
 */
export function exportImage(
  imageData: ImageData,
  filename: string,
  settings: ExportSettings
): void {
  const { format, dpi, quality = 0.95 } = settings;

  // Ensure filename has correct extension
  const baseFilename = filename.replace(/\.[^/.]+$/, '');
  const fullFilename = `${baseFilename}.${format}`;

  switch (format) {
    case 'png':
      exportAsPNG(imageData, fullFilename, dpi);
      break;
    case 'jpeg':
      exportAsJPEG(imageData, fullFilename, quality, dpi);
      break;
    case 'webp':
      exportAsWebP(imageData, fullFilename, quality, dpi);
      break;
    default:
      exportAsPNG(imageData, fullFilename, dpi);
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
