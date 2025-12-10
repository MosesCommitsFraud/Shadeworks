/**
 * Export Manager
 * Handles exporting images in various formats
 */

export type ExportFormat = 'png' | 'jpeg' | 'webp';

export interface ExportOptions {
  format: ExportFormat;
  quality: number; // 0-100 for jpeg/webp
  filename: string;
}

/**
 * Export ImageData as a file download
 */
export async function exportImage(
  imageData: ImageData,
  options: ExportOptions
): Promise<void> {
  // Create canvas from ImageData
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.putImageData(imageData, 0, 0);

  // Convert to blob
  const mimeType = getMimeType(options.format);
  const quality = options.format === 'png' ? undefined : options.quality / 100;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error('Failed to create blob');
  }

  // Trigger download
  downloadBlob(blob, options.filename);
}

/**
 * Export from canvas element
 */
export async function exportCanvas(
  canvas: HTMLCanvasElement,
  options: ExportOptions
): Promise<void> {
  const mimeType = getMimeType(options.format);
  const quality = options.format === 'png' ? undefined : options.quality / 100;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error('Failed to create blob');
  }

  downloadBlob(blob, options.filename);
}

/**
 * Get MIME type for format
 */
function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/png';
  }
}

/**
 * Trigger file download
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get default filename with timestamp
 */
export function getDefaultFilename(format: ExportFormat): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `edited-image-${timestamp}.${format}`;
}
