import type {
  VideoSettings,
  AnimatedSettings,
  AdjustmentSettings,
  DitheringSettings,
  ColorModeSettings,
  Palette,
} from './types';
import { interpolateSettings } from './keyframes';
import { applyAllAdjustments, getDefaultAdjustmentSettings } from './adjustments';
import { applyColorMode } from './color-modes';
import { applyDithering } from './algorithms';
import { copyImageData } from './utils';

export interface VideoProcessingOptions {
  frames: ImageData[];
  videoSettings: VideoSettings;
  animatedAdjustments: AnimatedSettings<AdjustmentSettings>;
  animatedDithering: AnimatedSettings<DitheringSettings>;
  animatedColorMode: AnimatedSettings<ColorModeSettings>;
  palette: Palette;
  staticAdjustments?: AdjustmentSettings;
  staticDithering?: DitheringSettings;
  staticColorMode?: ColorModeSettings;
  onProgress?: (frame: number, total: number) => void;
  onCancel?: () => boolean; // Return true to cancel processing
}

/**
 * Process video frames with dithering and animated settings
 */
export async function processVideoFrames(
  options: VideoProcessingOptions
): Promise<ImageData[]> {
  const {
    frames,
    videoSettings,
    animatedAdjustments,
    animatedDithering,
    animatedColorMode,
    palette,
    staticAdjustments,
    staticDithering,
    staticColorMode,
    onProgress,
    onCancel,
  } = options;

  const processedFrames: ImageData[] = [];
  const totalFrames = frames.length;

  // Process each frame
  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    // Check if processing should be cancelled
    if (onCancel && onCancel()) {
      console.log('Video processing cancelled');
      break;
    }

    const frame = frames[frameIndex];

    // Get interpolated or static settings for this frame
    const adjustments = animatedAdjustments.enabled
      ? { ...getDefaultAdjustmentSettings(), ...interpolateSettings(animatedAdjustments, frameIndex) }
      : staticAdjustments || getDefaultAdjustmentSettings();

    const ditheringSettings = animatedDithering.enabled
      ? interpolateSettings(animatedDithering, frameIndex)
      : staticDithering || { algorithm: 'floyd-steinberg' as const, serpentine: true, errorAttenuation: 1.0, randomNoise: 0 };

    const colorModeSettings = animatedColorMode.enabled
      ? interpolateSettings(animatedColorMode, frameIndex)
      : staticColorMode || { mode: 'rgb' as const, shades: 16 };

    try {
      // Apply processing pipeline (same as image mode)
      let processed = copyImageData(frame);

      // 1. Apply adjustments
      processed = applyAllAdjustments(processed, adjustments);

      // 2. Apply color mode
      processed = applyColorMode(
        processed,
        colorModeSettings.mode,
        palette,
        {
          tonalShades: colorModeSettings.shades,
        }
      );

      // 3. Apply dithering
      processed = applyDithering(processed, palette, ditheringSettings);

      processedFrames.push(processed);
    } catch (error) {
      console.error(`Error processing frame ${frameIndex}:`, error);
      // Use original frame on error
      processedFrames.push(copyImageData(frame));
    }

    // Report progress
    if (onProgress) {
      onProgress(frameIndex + 1, totalFrames);
    }

    // Yield to event loop every 10 frames to keep UI responsive
    if (frameIndex % 10 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  return processedFrames;
}

/**
 * Process a single frame with given settings
 */
export function processSingleFrame(
  frame: ImageData,
  adjustments: AdjustmentSettings,
  colorModeSettings: ColorModeSettings,
  ditheringSettings: DitheringSettings,
  palette: Palette
): ImageData {
  let processed = copyImageData(frame);

  // Apply processing pipeline
  processed = applyAllAdjustments(processed, adjustments);
  processed = applyColorMode(
    processed,
    colorModeSettings.mode,
    palette,
    {
      tonalShades: colorModeSettings.shades,
    }
  );
  processed = applyDithering(processed, palette, ditheringSettings);

  return processed;
}

/**
 * Get settings for a specific frame (with interpolation)
 */
export function getFrameSettings(
  frameIndex: number,
  animatedAdjustments: AnimatedSettings<AdjustmentSettings>,
  animatedDithering: AnimatedSettings<DitheringSettings>,
  animatedColorMode: AnimatedSettings<ColorModeSettings>,
  staticAdjustments?: AdjustmentSettings,
  staticDithering?: DitheringSettings,
  staticColorMode?: ColorModeSettings
): {
  adjustments: AdjustmentSettings;
  dithering: DitheringSettings;
  colorMode: ColorModeSettings;
} {
  const adjustments = animatedAdjustments.enabled
    ? { ...getDefaultAdjustmentSettings(), ...interpolateSettings(animatedAdjustments, frameIndex) }
    : staticAdjustments || getDefaultAdjustmentSettings();

  const dithering = animatedDithering.enabled
    ? interpolateSettings(animatedDithering, frameIndex)
    : staticDithering || { algorithm: 'floyd-steinberg' as const, serpentine: true, errorAttenuation: 1.0, randomNoise: 0 };

  const colorMode = animatedColorMode.enabled
    ? interpolateSettings(animatedColorMode, frameIndex)
    : staticColorMode || { mode: 'rgb' as const, shades: 16 };

  return { adjustments, dithering, colorMode };
}

/**
 * Estimate processing time (rough estimate)
 */
export function estimateProcessingTime(
  frameCount: number,
  width: number,
  height: number
): number {
  // Very rough estimate: ~50-100ms per frame for typical resolution
  const pixelCount = width * height;
  const baseTimePerFrame = 50; // ms
  const pixelFactor = pixelCount / (640 * 480); // Normalize to VGA resolution

  const timePerFrame = baseTimePerFrame * pixelFactor;
  const totalTime = timePerFrame * frameCount;

  return totalTime / 1000; // Return in seconds
}
