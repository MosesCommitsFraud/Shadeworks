'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TimelineState, VideoSettings } from '@/lib/dither/types';
import { formatTime } from '@/lib/dither/video-utils';

interface TimelineProps {
  videoSettings: VideoSettings;
  timelineState: TimelineState;
  onTimelineStateChange: (state: Partial<TimelineState>) => void;
  keyframeMarkers?: number[]; // Frame numbers where keyframes exist
  onKeyframeClick?: (frame: number) => void; // Callback when clicking on a keyframe marker
  disabled?: boolean;
}

export function Timeline({
  videoSettings,
  timelineState,
  onTimelineStateChange,
  keyframeMarkers = [],
  onKeyframeClick,
  disabled = false,
}: TimelineProps) {
  const scrubberRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Handle play/pause
  const togglePlayback = useCallback(() => {
    onTimelineStateChange({ isPlaying: !timelineState.isPlaying });
  }, [timelineState.isPlaying, onTimelineStateChange]);

  // Handle frame navigation
  const goToFirstFrame = useCallback(() => {
    onTimelineStateChange({
      currentFrame: 0,
      currentTime: 0,
      isPlaying: false,
    });
  }, [onTimelineStateChange]);

  const goToLastFrame = useCallback(() => {
    const lastFrame = videoSettings.totalFrames - 1;
    onTimelineStateChange({
      currentFrame: lastFrame,
      currentTime: lastFrame / videoSettings.fps,
      isPlaying: false,
    });
  }, [videoSettings, onTimelineStateChange]);

  const previousFrame = useCallback(() => {
    const newFrame = Math.max(0, timelineState.currentFrame - 1);
    onTimelineStateChange({
      currentFrame: newFrame,
      currentTime: newFrame / videoSettings.fps,
      isPlaying: false,
    });
  }, [timelineState.currentFrame, videoSettings.fps, onTimelineStateChange]);

  const nextFrame = useCallback(() => {
    const newFrame = Math.min(videoSettings.totalFrames - 1, timelineState.currentFrame + 1);
    onTimelineStateChange({
      currentFrame: newFrame,
      currentTime: newFrame / videoSettings.fps,
      isPlaying: false,
    });
  }, [timelineState.currentFrame, videoSettings, onTimelineStateChange]);

  // Handle playback speed change
  const handleSpeedChange = useCallback(
    (value: string) => {
      const speed = parseFloat(value) as 0.25 | 0.5 | 1 | 2;
      onTimelineStateChange({ playbackSpeed: speed });
    },
    [onTimelineStateChange]
  );

  // Handle scrubber interaction
  const handleScrubberMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault(); // Prevent text selection
    setIsDragging(true);
    updateFrameFromMousePosition(e);
  }, [disabled]);

  const handleScrubberMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || disabled) return;
    updateFrameFromMousePosition(e as any);
  }, [isDragging, disabled]);

  const handleScrubberMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateFrameFromMousePosition = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!scrubberRef.current) return;

      const rect = scrubberRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      const frame = Math.floor(percentage * videoSettings.totalFrames);
      const clampedFrame = Math.max(0, Math.min(videoSettings.totalFrames - 1, frame));

      onTimelineStateChange({
        currentFrame: clampedFrame,
        currentTime: clampedFrame / videoSettings.fps,
        isPlaying: false,
      });
    },
    [videoSettings, onTimelineStateChange]
  );

  // Add/remove mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleScrubberMouseMove);
      window.addEventListener('mouseup', handleScrubberMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleScrubberMouseMove);
        window.removeEventListener('mouseup', handleScrubberMouseUp);
      };
    }
  }, [isDragging, handleScrubberMouseMove, handleScrubberMouseUp]);

  // Calculate progress percentage
  const progressPercentage = videoSettings.totalFrames > 0
    ? (timelineState.currentFrame / (videoSettings.totalFrames - 1)) * 100
    : 0;

  return (
    <div className="border-t border-border bg-card p-4 space-y-3 select-none">
      {/* Playback controls */}
      <div className="flex items-center gap-2">
        {/* Go to first frame */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToFirstFrame}
          disabled={disabled || timelineState.currentFrame === 0}
          title="Go to first frame (Home)"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous frame */}
        <Button
          variant="ghost"
          size="icon"
          onClick={previousFrame}
          disabled={disabled || timelineState.currentFrame === 0}
          title="Previous frame (Left arrow)"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          variant="default"
          size="icon"
          onClick={togglePlayback}
          disabled={disabled}
          title={timelineState.isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {timelineState.isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>

        {/* Next frame */}
        <Button
          variant="ghost"
          size="icon"
          onClick={nextFrame}
          disabled={disabled || timelineState.currentFrame === videoSettings.totalFrames - 1}
          title="Next frame (Right arrow)"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        {/* Go to last frame */}
        <Button
          variant="ghost"
          size="icon"
          onClick={goToLastFrame}
          disabled={disabled || timelineState.currentFrame === videoSettings.totalFrames - 1}
          title="Go to last frame (End)"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>

        {/* Playback speed */}
        <div className="ml-4">
          <Select
            value={timelineState.playbackSpeed.toString()}
            onValueChange={handleSpeedChange}
            disabled={disabled}
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.25">0.25x</SelectItem>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time display */}
        <div className="ml-auto text-sm text-muted-foreground font-mono">
          {formatTime(timelineState.currentTime)} / {formatTime(videoSettings.duration)}
        </div>

        {/* Frame counter */}
        <div className="text-sm text-muted-foreground font-mono">
          Frame: {timelineState.currentFrame + 1} / {videoSettings.totalFrames}
        </div>
      </div>

      {/* Scrubber */}
      <div className="space-y-1">
        <div
          ref={scrubberRef}
          className={`relative h-12 bg-muted rounded-md select-none ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          onMouseDown={handleScrubberMouseDown}
        >
          {/* Keyframe markers */}
          {keyframeMarkers.map((frame) => {
            const percentage = (frame / (videoSettings.totalFrames - 1)) * 100;
            const isCurrentFrame = frame === timelineState.currentFrame;
            return (
              <div
                key={frame}
                className={`absolute top-0 bottom-0 w-1 transition-colors cursor-pointer hover:bg-accent group ${
                  isCurrentFrame ? 'bg-primary' : 'bg-accent/60'
                }`}
                style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
                title={`Keyframe at frame ${frame + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onKeyframeClick) {
                    onKeyframeClick(frame);
                  } else {
                    // Default behavior: jump to keyframe
                    onTimelineStateChange({
                      currentFrame: frame,
                      currentTime: frame / videoSettings.fps,
                      isPlaying: false,
                    });
                  }
                }}
              >
                {/* Keyframe diamond marker at top */}
                <div
                  className={`absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 transition-all ${
                    isCurrentFrame
                      ? 'bg-primary scale-125'
                      : 'bg-accent/80 group-hover:bg-accent group-hover:scale-110'
                  }`}
                />
              </div>
            );
          })}

          {/* Progress bar */}
          <div
            className="absolute top-0 left-0 bottom-0 bg-primary/20 rounded-l-md pointer-events-none"
            style={{ width: `${progressPercentage}%` }}
          />

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-primary rounded-sm pointer-events-none"
            style={{ left: `${progressPercentage}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
          </div>
        </div>

        {/* Timeline labels */}
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>0:00</span>
          <span>{formatTime(videoSettings.duration / 2)}</span>
          <span>{formatTime(videoSettings.duration)}</span>
        </div>
      </div>
    </div>
  );
}
