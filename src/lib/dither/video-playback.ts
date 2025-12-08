import type { TimelineState, VideoSettings } from './types';

/**
 * Video playback controller using requestAnimationFrame
 */
export class VideoPlaybackController {
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private onFrameUpdate: ((frame: number, time: number) => void) | null = null;

  constructor(
    private videoSettings: VideoSettings,
    private getTimelineState: () => TimelineState,
    private setTimelineState: (state: Partial<TimelineState>) => void
  ) {}

  /**
   * Start playback
   */
  start(onFrameUpdate?: (frame: number, time: number) => void): void {
    if (this.animationFrameId !== null) return;

    if (onFrameUpdate) {
      this.onFrameUpdate = onFrameUpdate;
    }

    this.lastFrameTime = performance.now();
    this.animate();
  }

  /**
   * Stop playback
   */
  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
    this.lastFrameTime = currentTime;

    const state = this.getTimelineState();

    if (!state.isPlaying) {
      this.stop();
      return;
    }

    // Calculate time elapsed based on playback speed
    const timeElapsed = deltaTime * state.playbackSpeed;
    const newTime = state.currentTime + timeElapsed;

    // Calculate new frame
    const newFrame = Math.floor(newTime * this.videoSettings.fps);

    // Check if we've reached the end
    if (newFrame >= this.videoSettings.totalFrames) {
      // Loop back to start
      this.setTimelineState({
        currentFrame: 0,
        currentTime: 0,
        isPlaying: false, // Stop at end (can be changed to loop)
      });
      this.stop();
      return;
    }

    // Update timeline state
    this.setTimelineState({
      currentFrame: newFrame,
      currentTime: newTime,
    });

    // Call frame update callback
    if (this.onFrameUpdate) {
      this.onFrameUpdate(newFrame, newTime);
    }

    // Continue animation
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Update video settings (e.g., if FPS changes)
   */
  updateVideoSettings(videoSettings: VideoSettings): void {
    this.videoSettings = videoSettings;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
    this.onFrameUpdate = null;
  }
}

/**
 * Create and manage video playback
 */
export function createPlaybackController(
  videoSettings: VideoSettings,
  getTimelineState: () => TimelineState,
  setTimelineState: (state: Partial<TimelineState>) => void
): VideoPlaybackController {
  return new VideoPlaybackController(videoSettings, getTimelineState, setTimelineState);
}

/**
 * Hook-like function to handle playback state changes
 */
export function useVideoPlayback(
  videoSettings: VideoSettings | null,
  timelineState: TimelineState,
  setTimelineState: (state: Partial<TimelineState>) => void,
  onFrameUpdate?: (frame: number, time: number) => void
): VideoPlaybackController | null {
  if (!videoSettings) return null;

  const controller = new VideoPlaybackController(
    videoSettings,
    () => timelineState,
    setTimelineState
  );

  // Start or stop based on playback state
  if (timelineState.isPlaying) {
    controller.start(onFrameUpdate);
  } else {
    controller.stop();
  }

  return controller;
}
