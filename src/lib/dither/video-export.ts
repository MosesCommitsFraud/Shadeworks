import type { VideoSettings, GIFExportOptions } from './types';

/**
 * Export processed frames as MP4/WebM video using MediaRecorder API
 */
export async function exportVideoMP4(
  frames: ImageData[],
  fps: number,
  filename: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  if (frames.length === 0) {
    throw new Error('No frames to export');
  }

  const canvas = document.createElement('canvas');
  canvas.width = frames[0].width;
  canvas.height = frames[0].height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Try to get a stream from the canvas
  const stream = canvas.captureStream(fps);

  // Check for supported MIME types (prefer MP4, fallback to WebM)
  const mimeTypes = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];

  let selectedMimeType = '';
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      selectedMimeType = mimeType;
      break;
    }
  }

  if (!selectedMimeType) {
    throw new Error('No supported video codec found');
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: selectedMimeType,
    videoBitsPerSecond: 5000000, // 5 Mbps for good quality
  });

  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const recordingComplete = new Promise<Blob>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: selectedMimeType });
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => {
      reject(new Error('MediaRecorder error: ' + e));
    };
  });

  // Start recording
  mediaRecorder.start();

  // Draw frames at the specified FPS
  const frameDuration = 1000 / fps;
  let currentFrame = 0;

  const drawNextFrame = () => {
    if (currentFrame >= frames.length) {
      // Stop recording after last frame
      setTimeout(() => {
        mediaRecorder.stop();
      }, frameDuration);
      return;
    }

    // Draw current frame
    ctx.putImageData(frames[currentFrame], 0, 0);

    // Report progress
    if (onProgress) {
      onProgress((currentFrame + 1) / frames.length);
    }

    currentFrame++;

    // Schedule next frame
    setTimeout(drawNextFrame, frameDuration);
  };

  // Start drawing frames
  drawNextFrame();

  // Wait for recording to complete
  const videoBlob = await recordingComplete;

  // Determine file extension based on MIME type
  const extension = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
  const finalFilename = filename.endsWith(`.${extension}`)
    ? filename
    : `${filename}.${extension}`;

  // Download the video
  downloadBlob(videoBlob, finalFilename);
}

/**
 * Export processed frames as GIF
 * Note: Requires gifenc library to be installed
 */
export async function exportVideoAsGIF(
  frames: ImageData[],
  fps: number,
  filename: string,
  options: GIFExportOptions = {},
  onProgress?: (progress: number) => void
): Promise<void> {
  if (frames.length === 0) {
    throw new Error('No frames to export');
  }

  try {
    // Dynamic import of gifenc
    const { GIFEncoder, quantize, applyPalette } = await import('gifenc');

    const {
      quality = 10,
      loop = 0, // 0 = infinite loop
      maxFrames,
      downsample = 1,
    } = options;

    // Limit frames if specified
    const framesToExport = maxFrames
      ? frames.slice(0, maxFrames)
      : frames;

    // Get dimensions (potentially downsampled)
    const width = Math.floor(frames[0].width / downsample);
    const height = Math.floor(frames[0].height / downsample);

    // Create GIF encoder
    const gif = GIFEncoder();

    // Set to loop
    gif.writeHeader();
    gif.setRepeat(loop);

    const delay = Math.floor(1000 / fps); // Frame delay in ms

    // Process each frame
    for (let i = 0; i < framesToExport.length; i++) {
      const frame = framesToExport[i];

      // Downsample if needed
      let frameData: Uint8ClampedArray;
      if (downsample > 1) {
        frameData = downsampleFrame(frame, downsample);
      } else {
        frameData = frame.data;
      }

      // Convert to format expected by gifenc (RGBA array)
      const rgba = new Uint8Array(frameData.buffer);

      // Quantize colors (reduce to 256 colors for GIF)
      const palette = quantize(rgba, 256);
      const index = applyPalette(rgba, palette);

      // Write frame
      gif.writeFrame(index, width, height, {
        palette,
        delay,
      });

      // Report progress
      if (onProgress) {
        onProgress((i + 1) / framesToExport.length);
      }
    }

    gif.finish();

    // Get the GIF as a Uint8Array
    const gifData = gif.bytes();

    // Create blob and download
    const blob = new Blob([gifData], { type: 'image/gif' });
    const finalFilename = filename.endsWith('.gif') ? filename : `${filename}.gif`;
    downloadBlob(blob, finalFilename);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        'GIF export requires the gifenc library. Please install it: npm install gifenc'
      );
    }
    throw error;
  }
}

/**
 * Downsample frame by a factor
 */
function downsampleFrame(frame: ImageData, factor: number): Uint8ClampedArray {
  const newWidth = Math.floor(frame.width / factor);
  const newHeight = Math.floor(frame.height / factor);
  const newData = new Uint8ClampedArray(newWidth * newHeight * 4);

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = Math.floor(x * factor);
      const srcY = Math.floor(y * factor);
      const srcIdx = (srcY * frame.width + srcX) * 4;
      const dstIdx = (y * newWidth + x) * 4;

      newData[dstIdx] = frame.data[srcIdx];
      newData[dstIdx + 1] = frame.data[srcIdx + 1];
      newData[dstIdx + 2] = frame.data[srcIdx + 2];
      newData[dstIdx + 3] = frame.data[srcIdx + 3];
    }
  }

  return newData;
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
 * Estimate GIF file size (rough approximation)
 */
export function estimateGIFSize(
  frames: ImageData[],
  downsample: number = 1
): number {
  if (frames.length === 0) return 0;

  const width = Math.floor(frames[0].width / downsample);
  const height = Math.floor(frames[0].height / downsample);

  // Very rough estimate: ~10-20 KB per frame for typical dithered content
  const bytesPerFrame = width * height * 0.05; // Assuming good compression
  return bytesPerFrame * frames.length;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if browser supports video export
 */
export function supportsVideoExport(): {
  mp4: boolean;
  webm: boolean;
  gif: boolean;
} {
  const supportsMediaRecorder = typeof MediaRecorder !== 'undefined';

  return {
    mp4: supportsMediaRecorder && MediaRecorder.isTypeSupported('video/mp4'),
    webm:
      supportsMediaRecorder &&
      (MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ||
        MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ||
        MediaRecorder.isTypeSupported('video/webm')),
    gif: true, // GIF export is always available (if library is installed)
  };
}
