import type { VideoSettings } from './types';

/**
 * Maximum number of frames to extract (to prevent memory issues)
 * ~60MB for 640x480 @ 1200 frames
 */
const MAX_FRAMES = 1200;

/**
 * Load video from file
 */
export async function loadVideoFromFile(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('video/')) {
      reject(new Error('File is not a video'));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    const url = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };

    video.src = url;
  });
}

/**
 * Get video metadata
 */
export function getVideoMetadata(video: HTMLVideoElement): VideoSettings {
  const duration = video.duration;
  const fps = 30; // Default FPS, will be refined during extraction
  const totalFrames = Math.floor(duration * fps);

  return {
    fps,
    duration,
    totalFrames: Math.min(totalFrames, MAX_FRAMES),
    width: video.videoWidth,
    height: video.videoHeight,
  };
}

/**
 * Extract frames from video at specified FPS
 */
export async function extractFramesFromVideo(
  video: HTMLVideoElement,
  targetFps: number = 30,
  onProgress?: (current: number, total: number) => void
): Promise<ImageData[]> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const duration = video.duration;
  const frameInterval = 1 / targetFps;
  const totalFrames = Math.min(Math.floor(duration * targetFps), MAX_FRAMES);
  const frames: ImageData[] = [];

  // Seek through video and extract frames
  for (let i = 0; i < totalFrames; i++) {
    const time = i * frameInterval;

    // Don't exceed video duration
    if (time >= duration) break;

    try {
      // Seek to frame
      await seekVideoToTime(video, time);

      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract ImageData
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      frames.push(imageData);

      // Report progress
      if (onProgress) {
        onProgress(i + 1, totalFrames);
      }
    } catch (error) {
      console.error(`Failed to extract frame at ${time}s:`, error);
    }
  }

  return frames;
}

/**
 * Seek video to specific time
 */
function seekVideoToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Seek timeout'));
    }, 5000);

    const onSeeked = () => {
      clearTimeout(timeoutId);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };

    const onError = () => {
      clearTimeout(timeoutId);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(new Error('Seek error'));
    };

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    video.currentTime = time;
  });
}

/**
 * Validate video file
 */
export function isVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  return validTypes.includes(file.type) || file.type.startsWith('video/');
}

/**
 * Get estimated frame count without loading video
 */
export function estimateFrameCount(duration: number, fps: number): number {
  return Math.min(Math.floor(duration * fps), MAX_FRAMES);
}

/**
 * Format time in seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format frame number to time
 */
export function frameToTime(frame: number, fps: number): number {
  return frame / fps;
}

/**
 * Format time to frame number
 */
export function timeToFrame(time: number, fps: number): number {
  return Math.floor(time * fps);
}

/**
 * Check if video is too long
 */
export function isVideoTooLong(duration: number, fps: number): boolean {
  return estimateFrameCount(duration, fps) >= MAX_FRAMES;
}

/**
 * Get suggested FPS for long videos
 */
export function getSuggestedFPS(duration: number, maxFrames: number = MAX_FRAMES): number {
  const maxFPS = maxFrames / duration;

  // Snap to common FPS values
  const commonFPS = [15, 20, 24, 30];

  for (const fps of commonFPS) {
    if (fps <= maxFPS) {
      return fps;
    }
  }

  return Math.max(10, Math.floor(maxFPS));
}

/**
 * Get max allowed duration at given FPS
 */
export function getMaxDuration(fps: number): number {
  return MAX_FRAMES / fps;
}
