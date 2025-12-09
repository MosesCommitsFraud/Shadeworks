'use client';

import { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Info, Plus, Trash2, KeySquare } from 'lucide-react';
import type {
  AnimatedSettings,
  AdjustmentSettings,
  DitheringSettings,
  ColorModeSettings,
  TimelineState,
  EasingFunction,
  TransitionMode,
} from '@/lib/dither/types';
import {
  addKeyframe,
  removeKeyframe,
  hasKeyframeAtFrame,
  getKeyframeAtFrame,
  updateKeyframeEasing,
  updateKeyframeTransitionMode,
} from '@/lib/dither/keyframes';

interface KeyframeSectionProps {
  // Animated settings
  animatedAdjustments: AnimatedSettings<AdjustmentSettings>;
  animatedDithering: AnimatedSettings<DitheringSettings>;
  animatedColorMode: AnimatedSettings<ColorModeSettings>;

  // Current settings (for creating keyframes)
  adjustmentSettings: AdjustmentSettings;
  ditheringSettings: DitheringSettings;
  colorModeSettings: ColorModeSettings;

  // Timeline state
  timelineState: TimelineState;
  totalFrames: number;

  // Callbacks
  onAnimatedAdjustmentsChange: (settings: AnimatedSettings<AdjustmentSettings>) => void;
  onAnimatedDitheringChange: (settings: AnimatedSettings<DitheringSettings>) => void;
  onAnimatedColorModeChange: (settings: AnimatedSettings<ColorModeSettings>) => void;
  onJumpToFrame?: (frame: number) => void;

  // Conditionals
  hasVideo: boolean;
}

export function KeyframeSection({
  animatedAdjustments,
  animatedDithering,
  animatedColorMode,
  adjustmentSettings,
  ditheringSettings,
  colorModeSettings,
  timelineState,
  totalFrames,
  onAnimatedAdjustmentsChange,
  onAnimatedDitheringChange,
  onAnimatedColorModeChange,
  onJumpToFrame,
  hasVideo,
}: KeyframeSectionProps) {
  const currentFrame = timelineState.currentFrame;

  // Check if current frame has any keyframes
  const hasAdjustmentKeyframe = hasKeyframeAtFrame(animatedAdjustments, currentFrame);
  const hasDitheringKeyframe = hasKeyframeAtFrame(animatedDithering, currentFrame);
  const hasColorModeKeyframe = hasKeyframeAtFrame(animatedColorMode, currentFrame);
  const hasAnyKeyframe = hasAdjustmentKeyframe || hasDitheringKeyframe || hasColorModeKeyframe;

  // Get all keyframes at current frame
  const adjustmentKeyframe = getKeyframeAtFrame(animatedAdjustments, currentFrame);
  const ditheringKeyframe = getKeyframeAtFrame(animatedDithering, currentFrame);
  const colorModeKeyframe = getKeyframeAtFrame(animatedColorMode, currentFrame);

  // Get all unique keyframe frames
  const allKeyframeFrames = useMemo(() => {
    const frames = new Set<number>();
    animatedAdjustments.keyframes.forEach(kf => frames.add(kf.frame));
    animatedDithering.keyframes.forEach(kf => frames.add(kf.frame));
    animatedColorMode.keyframes.forEach(kf => frames.add(kf.frame));
    return Array.from(frames).sort((a, b) => a - b);
  }, [animatedAdjustments.keyframes, animatedDithering.keyframes, animatedColorMode.keyframes]);

  // Total keyframe count
  const totalKeyframes = allKeyframeFrames.length;

  // Add or update keyframe with all current settings
  const handleAddOrUpdateKeyframe = useCallback(() => {
    // Always update all three types at once
    const updatedAdjustments = hasAdjustmentKeyframe
      ? {
          ...animatedAdjustments,
          keyframes: animatedAdjustments.keyframes.map(kf =>
            kf.frame === currentFrame ? { ...kf, settings: adjustmentSettings } : kf
          ),
        }
      : addKeyframe(
          { ...animatedAdjustments, enabled: true },
          currentFrame,
          adjustmentSettings,
          'linear'
        );

    const updatedDithering = hasDitheringKeyframe
      ? {
          ...animatedDithering,
          keyframes: animatedDithering.keyframes.map(kf =>
            kf.frame === currentFrame ? { ...kf, settings: ditheringSettings } : kf
          ),
        }
      : addKeyframe(
          { ...animatedDithering, enabled: true },
          currentFrame,
          ditheringSettings,
          'linear'
        );

    const updatedColorMode = hasColorModeKeyframe
      ? {
          ...animatedColorMode,
          keyframes: animatedColorMode.keyframes.map(kf =>
            kf.frame === currentFrame ? { ...kf, settings: colorModeSettings } : kf
          ),
        }
      : addKeyframe(
          { ...animatedColorMode, enabled: true },
          currentFrame,
          colorModeSettings,
          'linear'
        );

    onAnimatedAdjustmentsChange(updatedAdjustments);
    onAnimatedDitheringChange(updatedDithering);
    onAnimatedColorModeChange(updatedColorMode);
  }, [
    currentFrame,
    hasAdjustmentKeyframe,
    hasDitheringKeyframe,
    hasColorModeKeyframe,
    adjustmentSettings,
    ditheringSettings,
    colorModeSettings,
    animatedAdjustments,
    animatedDithering,
    animatedColorMode,
    onAnimatedAdjustmentsChange,
    onAnimatedDitheringChange,
    onAnimatedColorModeChange,
  ]);

  // Remove keyframe at current frame
  const handleRemoveKeyframe = useCallback(() => {
    if (hasAdjustmentKeyframe) {
      const updated = removeKeyframe(animatedAdjustments, currentFrame);
      // Disable if no more keyframes
      if (updated.keyframes.length === 0) {
        updated.enabled = false;
      }
      onAnimatedAdjustmentsChange(updated);
    }
    if (hasDitheringKeyframe) {
      const updated = removeKeyframe(animatedDithering, currentFrame);
      if (updated.keyframes.length === 0) {
        updated.enabled = false;
      }
      onAnimatedDitheringChange(updated);
    }
    if (hasColorModeKeyframe) {
      const updated = removeKeyframe(animatedColorMode, currentFrame);
      if (updated.keyframes.length === 0) {
        updated.enabled = false;
      }
      onAnimatedColorModeChange(updated);
    }
  }, [
    currentFrame,
    hasAdjustmentKeyframe,
    hasDitheringKeyframe,
    hasColorModeKeyframe,
    animatedAdjustments,
    animatedDithering,
    animatedColorMode,
    onAnimatedAdjustmentsChange,
    onAnimatedDitheringChange,
    onAnimatedColorModeChange,
  ]);

  // Update easing for adjustments
  const handleAdjustmentEasingChange = useCallback((easing: EasingFunction) => {
    const updated = updateKeyframeEasing(animatedAdjustments, currentFrame, easing);
    onAnimatedAdjustmentsChange(updated);
  }, [animatedAdjustments, currentFrame, onAnimatedAdjustmentsChange]);

  // Update easing for dithering
  const handleDitheringEasingChange = useCallback((easing: EasingFunction) => {
    const updated = updateKeyframeEasing(animatedDithering, currentFrame, easing);
    onAnimatedDitheringChange(updated);
  }, [animatedDithering, currentFrame, onAnimatedDitheringChange]);

  // Update easing for color mode
  const handleColorModeEasingChange = useCallback((easing: EasingFunction) => {
    const updated = updateKeyframeEasing(animatedColorMode, currentFrame, easing);
    onAnimatedColorModeChange(updated);
  }, [animatedColorMode, currentFrame, onAnimatedColorModeChange]);

  // Update transition mode for dithering
  const handleDitheringTransitionModeChange = useCallback((mode: TransitionMode) => {
    const updated = updateKeyframeTransitionMode(animatedDithering, currentFrame, mode);
    onAnimatedDitheringChange(updated);
  }, [animatedDithering, currentFrame, onAnimatedDitheringChange]);

  if (!hasVideo) {
    return (
      <Card className="p-4 bg-muted/50 border-muted">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Keyframe animation is only available in video mode. Upload a video to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Keyframe Animation</h3>
        <p className="text-xs text-muted-foreground">
          Add keyframes to capture settings at specific frames. Press{' '}
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded">
            {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+K
          </kbd>{' '}
          to add/update a keyframe.
        </p>
      </div>

      {/* Current frame status */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Frame {currentFrame + 1} / {totalFrames}
          </div>
          {totalKeyframes > 0 && (
            <div className="text-xs text-muted-foreground">
              {totalKeyframes} keyframe{totalKeyframes !== 1 ? 's' : ''} total
            </div>
          )}
        </div>

        {/* Add/Update or Remove keyframe */}
        {hasAnyKeyframe ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <KeySquare className="h-3 w-3" />
              <span>Keyframe at this frame</span>
            </div>

            {/* Show what's keyframed */}
            <div className="space-y-2 text-xs">
              {hasAdjustmentKeyframe && (
                <div className="px-2 py-1.5 bg-muted/50 rounded space-y-1.5">
                  <div className="font-medium">Adjustments</div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground flex-shrink-0">Easing:</Label>
                    <Select
                      value={adjustmentKeyframe?.easing || 'linear'}
                      onValueChange={(value) => handleAdjustmentEasingChange(value as EasingFunction)}
                    >
                      <SelectTrigger className="h-6 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {hasDitheringKeyframe && (
                <div className="px-2 py-1.5 bg-muted/50 rounded space-y-1.5">
                  <div className="font-medium">Dithering</div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground flex-shrink-0">Easing:</Label>
                    <Select
                      value={ditheringKeyframe?.easing || 'linear'}
                      onValueChange={(value) => handleDitheringEasingChange(value as EasingFunction)}
                    >
                      <SelectTrigger className="h-6 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground flex-shrink-0">Mode:</Label>
                    <Select
                      value={ditheringKeyframe?.transitionMode || 'blend'}
                      onValueChange={(value) => handleDitheringTransitionModeChange(value as TransitionMode)}
                    >
                      <SelectTrigger className="h-6 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blend">Blend</SelectItem>
                        <SelectItem value="step">Step</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {hasColorModeKeyframe && (
                <div className="px-2 py-1.5 bg-muted/50 rounded space-y-1.5">
                  <div className="font-medium">Color Mode</div>
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground flex-shrink-0">Easing:</Label>
                    <Select
                      value={colorModeKeyframe?.easing || 'linear'}
                      onValueChange={(value) => handleColorModeEasingChange(value as EasingFunction)}
                    >
                      <SelectTrigger className="h-6 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* Update/Remove buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddOrUpdateKeyframe}
                className="flex-1 h-8 text-xs"
              >
                <KeySquare className="h-3 w-3 mr-1" />
                Update
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemoveKeyframe}
                className="h-8 px-3"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            size="sm"
            variant="default"
            onClick={handleAddOrUpdateKeyframe}
            className="w-full h-8 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Keyframe
          </Button>
        )}
      </Card>

      {/* Keyframe list */}
      {totalKeyframes > 0 && (
        <Card className="p-3">
          <div className="text-xs font-medium mb-2">All Keyframes</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {allKeyframeFrames.map((frame) => {
              const isCurrentFrame = frame === currentFrame;
              const hasAdj = animatedAdjustments.keyframes.some(kf => kf.frame === frame);
              const hasDith = animatedDithering.keyframes.some(kf => kf.frame === frame);
              const hasColor = animatedColorMode.keyframes.some(kf => kf.frame === frame);

              return (
                <button
                  key={frame}
                  onClick={() => onJumpToFrame?.(frame)}
                  className={`w-full px-2 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                    isCurrentFrame
                      ? 'bg-primary/20 text-primary font-medium'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span>Frame {frame + 1}</span>
                  <div className="flex gap-1 text-[10px] opacity-70">
                    {hasAdj && <span className="px-1 bg-background/50 rounded">A</span>}
                    {hasDith && <span className="px-1 bg-background/50 rounded">D</span>}
                    {hasColor && <span className="px-1 bg-background/50 rounded">C</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
