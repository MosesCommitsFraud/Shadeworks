import type { Keyframe, AnimatedSettings, EasingFunction } from './types';

/**
 * Easing functions for smooth interpolation
 */
export function applyEasing(progress: number, easing: EasingFunction = 'linear'): number {
  switch (easing) {
    case 'linear':
      return progress;

    case 'ease-in':
      return progress * progress;

    case 'ease-out':
      return progress * (2 - progress);

    case 'ease-in-out':
      return progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    default:
      return progress;
  }
}

/**
 * Add a keyframe to animated settings
 */
export function addKeyframe<T>(
  animation: AnimatedSettings<T>,
  frame: number,
  settings: T,
  easing: EasingFunction = 'linear'
): AnimatedSettings<T> {
  const fps = 30; // Default FPS for time calculation
  const time = frame / fps;

  const newKeyframe: Keyframe<T> = {
    frame,
    time,
    settings: { ...settings },
    easing,
  };

  // Find insertion point to keep keyframes sorted by frame
  const keyframes = [...animation.keyframes];
  const existingIndex = keyframes.findIndex((kf) => kf.frame === frame);

  if (existingIndex >= 0) {
    // Replace existing keyframe
    keyframes[existingIndex] = newKeyframe;
  } else {
    // Insert new keyframe in sorted order
    const insertIndex = keyframes.findIndex((kf) => kf.frame > frame);
    if (insertIndex === -1) {
      keyframes.push(newKeyframe);
    } else {
      keyframes.splice(insertIndex, 0, newKeyframe);
    }
  }

  return {
    ...animation,
    keyframes,
  };
}

/**
 * Remove a keyframe from animated settings
 */
export function removeKeyframe<T>(
  animation: AnimatedSettings<T>,
  frame: number
): AnimatedSettings<T> {
  return {
    ...animation,
    keyframes: animation.keyframes.filter((kf) => kf.frame !== frame),
  };
}

/**
 * Update a keyframe's easing
 */
export function updateKeyframeEasing<T>(
  animation: AnimatedSettings<T>,
  frame: number,
  easing: EasingFunction
): AnimatedSettings<T> {
  return {
    ...animation,
    keyframes: animation.keyframes.map((kf) =>
      kf.frame === frame ? { ...kf, easing } : kf
    ),
  };
}

/**
 * Get keyframes before and after a given frame
 */
function getKeyframeBounds<T>(
  keyframes: Keyframe<T>[],
  frame: number
): { before: Keyframe<T> | null; after: Keyframe<T> | null } {
  if (keyframes.length === 0) {
    return { before: null, after: null };
  }

  let before: Keyframe<T> | null = null;
  let after: Keyframe<T> | null = null;

  for (const keyframe of keyframes) {
    if (keyframe.frame <= frame) {
      before = keyframe;
    }
    if (keyframe.frame > frame && !after) {
      after = keyframe;
      break;
    }
  }

  return { before, after };
}

/**
 * Interpolate between two numeric values
 */
function interpolateNumber(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

/**
 * Interpolate settings between two keyframes
 */
export function interpolateSettings<T extends Record<string, any>>(
  animation: AnimatedSettings<T>,
  frame: number
): T {
  if (!animation.enabled || animation.keyframes.length === 0) {
    // Return default/empty settings if animation disabled or no keyframes
    return {} as T;
  }

  if (animation.keyframes.length === 1) {
    // Only one keyframe, use its settings
    return { ...animation.keyframes[0].settings };
  }

  // Find surrounding keyframes
  const { before, after } = getKeyframeBounds(animation.keyframes, frame);

  // Before first keyframe - use first keyframe settings
  if (!before && after) {
    return { ...after.settings };
  }

  // After last keyframe - use last keyframe settings
  if (before && !after) {
    return { ...before.settings };
  }

  // Exactly on a keyframe
  if (before && before.frame === frame) {
    return { ...before.settings };
  }

  // Between two keyframes - interpolate
  if (before && after) {
    const frameRange = after.frame - before.frame;
    const frameProgress = (frame - before.frame) / frameRange;

    // Apply easing (use the "before" keyframe's easing)
    const easedProgress = applyEasing(frameProgress, before.easing);

    // Interpolate each property
    const result: any = {};

    for (const key in before.settings) {
      const startValue = before.settings[key];
      const endValue = after.settings[key];

      // Check if values are numbers (interpolatable)
      if (typeof startValue === 'number' && typeof endValue === 'number') {
        result[key] = interpolateNumber(startValue, endValue, easedProgress);
      }
      // For non-numeric values, use step interpolation (use before value)
      else {
        result[key] = startValue;
      }
    }

    return result as T;
  }

  // Fallback - shouldn't reach here
  return {} as T;
}

/**
 * Get all frame numbers that have keyframes
 */
export function getKeyframeFrames<T>(animation: AnimatedSettings<T>): number[] {
  return animation.keyframes.map((kf) => kf.frame);
}

/**
 * Check if a frame has a keyframe
 */
export function hasKeyframeAtFrame<T>(
  animation: AnimatedSettings<T>,
  frame: number
): boolean {
  return animation.keyframes.some((kf) => kf.frame === frame);
}

/**
 * Get keyframe at specific frame
 */
export function getKeyframeAtFrame<T>(
  animation: AnimatedSettings<T>,
  frame: number
): Keyframe<T> | null {
  return animation.keyframes.find((kf) => kf.frame === frame) || null;
}

/**
 * Get next keyframe after a given frame
 */
export function getNextKeyframe<T>(
  animation: AnimatedSettings<T>,
  currentFrame: number
): Keyframe<T> | null {
  const nextKeyframes = animation.keyframes.filter((kf) => kf.frame > currentFrame);
  return nextKeyframes.length > 0 ? nextKeyframes[0] : null;
}

/**
 * Get previous keyframe before a given frame
 */
export function getPreviousKeyframe<T>(
  animation: AnimatedSettings<T>,
  currentFrame: number
): Keyframe<T> | null {
  const prevKeyframes = animation.keyframes.filter((kf) => kf.frame < currentFrame);
  return prevKeyframes.length > 0 ? prevKeyframes[prevKeyframes.length - 1] : null;
}

/**
 * Clear all keyframes
 */
export function clearKeyframes<T>(animation: AnimatedSettings<T>): AnimatedSettings<T> {
  return {
    ...animation,
    keyframes: [],
  };
}

/**
 * Enable or disable animation
 */
export function setAnimationEnabled<T>(
  animation: AnimatedSettings<T>,
  enabled: boolean
): AnimatedSettings<T> {
  return {
    ...animation,
    enabled,
  };
}
