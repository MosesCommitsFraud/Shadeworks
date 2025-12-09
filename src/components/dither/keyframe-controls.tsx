'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  KeySquare,
  Plus,
  Trash2,
  SkipForward,
  SkipBack,
} from 'lucide-react';
import type {
  AnimatedSettings,
  AdjustmentSettings,
  DitheringSettings,
  ColorModeSettings,
  EasingFunction,
  TransitionMode,
} from '@/lib/dither/types';
import {
  addKeyframe,
  removeKeyframe,
  getNextKeyframe,
  getPreviousKeyframe,
  hasKeyframeAtFrame,
  getKeyframeAtFrame,
  updateKeyframeEasing,
  updateKeyframeTransitionMode,
} from '@/lib/dither/keyframes';

interface KeyframeControlsProps<T> {
  animatedSettings: AnimatedSettings<T>;
  currentSettings: T;
  currentFrame: number;
  onAnimatedSettingsChange: (settings: AnimatedSettings<T>) => void;
  settingsType: 'adjustments' | 'dithering' | 'colorMode';
  totalFrames: number;
  onJumpToFrame?: (frame: number) => void;
}

export function KeyframeControls<T extends AdjustmentSettings | DitheringSettings | ColorModeSettings>({
  animatedSettings,
  currentSettings,
  currentFrame,
  onAnimatedSettingsChange,
  settingsType,
  totalFrames,
  onJumpToFrame,
}: KeyframeControlsProps<T>) {
  const hasKeyframe = hasKeyframeAtFrame(animatedSettings, currentFrame);
  const currentKeyframe = getKeyframeAtFrame(animatedSettings, currentFrame);
  const nextKeyframe = getNextKeyframe(animatedSettings, currentFrame);
  const prevKeyframe = getPreviousKeyframe(animatedSettings, currentFrame);

  // Toggle animation enabled/disabled
  const handleToggleAnimation = useCallback((enabled: boolean) => {
    onAnimatedSettingsChange({
      ...animatedSettings,
      enabled,
    });
  }, [animatedSettings, onAnimatedSettingsChange]);

  // Add keyframe at current frame with current settings
  const handleAddKeyframe = useCallback(() => {
    const updated = addKeyframe(
      animatedSettings,
      currentFrame,
      currentSettings,
      'linear'
    );
    onAnimatedSettingsChange(updated);
  }, [animatedSettings, currentFrame, currentSettings, onAnimatedSettingsChange]);

  // Remove keyframe at current frame
  const handleRemoveKeyframe = useCallback(() => {
    const updated = removeKeyframe(animatedSettings, currentFrame);
    onAnimatedSettingsChange(updated);
  }, [animatedSettings, currentFrame, onAnimatedSettingsChange]);

  // Update keyframe at current frame with current settings
  const handleUpdateKeyframe = useCallback(() => {
    // Remove and re-add to update
    const removed = removeKeyframe(animatedSettings, currentFrame);
    const updated = addKeyframe(
      removed,
      currentFrame,
      currentSettings,
      currentKeyframe?.easing || 'linear'
    );
    onAnimatedSettingsChange(updated);
  }, [animatedSettings, currentFrame, currentSettings, currentKeyframe, onAnimatedSettingsChange]);

  // Change easing function for current keyframe
  const handleEasingChange = useCallback((easing: EasingFunction) => {
    const updated = updateKeyframeEasing(animatedSettings, currentFrame, easing);
    onAnimatedSettingsChange(updated);
  }, [animatedSettings, currentFrame, onAnimatedSettingsChange]);

  // Change transition mode for current keyframe
  const handleTransitionModeChange = useCallback((mode: TransitionMode) => {
    const updated = updateKeyframeTransitionMode(animatedSettings, currentFrame, mode);
    onAnimatedSettingsChange(updated);
  }, [animatedSettings, currentFrame, onAnimatedSettingsChange]);

  // Jump to next/previous keyframe
  const handleJumpToNext = useCallback(() => {
    if (nextKeyframe && onJumpToFrame) {
      onJumpToFrame(nextKeyframe.frame);
    }
  }, [nextKeyframe, onJumpToFrame]);

  const handleJumpToPrevious = useCallback(() => {
    if (prevKeyframe && onJumpToFrame) {
      onJumpToFrame(prevKeyframe.frame);
    }
  }, [prevKeyframe, onJumpToFrame]);

  const getSettingsLabel = () => {
    switch (settingsType) {
      case 'adjustments':
        return 'Adjustments';
      case 'dithering':
        return 'Dithering';
      case 'colorMode':
        return 'Color Mode';
    }
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card/50 min-w-0">
      {/* Header with animation toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <KeySquare className="h-4 w-4 text-primary" />
          <Label className="text-sm font-medium">
            Animate {getSettingsLabel()}
          </Label>
        </div>
        <Button
          size="sm"
          variant={animatedSettings.enabled ? "default" : "outline"}
          onClick={() => handleToggleAnimation(!animatedSettings.enabled)}
          className="h-7 text-xs"
        >
          {animatedSettings.enabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>

      {/* Keyframe controls (only shown when animation is enabled) */}
      {animatedSettings.enabled && (
        <div className="space-y-3">
          {/* Keyframe info */}
          <div className="text-xs text-muted-foreground">
            {animatedSettings.keyframes.length === 0 ? (
              <span>No keyframes set. Add a keyframe to start animating.</span>
            ) : (
              <span>
                {animatedSettings.keyframes.length} keyframe
                {animatedSettings.keyframes.length !== 1 ? 's' : ''} total
              </span>
            )}
          </div>

          {/* Current frame keyframe status */}
          <div className="flex flex-col gap-2">
            {hasKeyframe ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <KeySquare className="h-3 w-3" />
                  <span>Keyframe at frame {currentFrame}</span>
                </div>

                {/* Easing control */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs flex-shrink-0">Easing:</Label>
                    <Select
                      value={currentKeyframe?.easing || 'linear'}
                      onValueChange={(value) => handleEasingChange(value as EasingFunction)}
                    >
                      <SelectTrigger className="h-7 text-xs">
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
                  <p className="text-[10px] text-muted-foreground pl-16">
                    Controls transition speed from this keyframe to the next
                  </p>
                </div>

                {/* Transition mode control (for dithering only) */}
                {settingsType === 'dithering' && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs flex-shrink-0">Mode:</Label>
                      <Select
                        value={currentKeyframe?.transitionMode || 'blend'}
                        onValueChange={(value) => handleTransitionModeChange(value as TransitionMode)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blend">Blend</SelectItem>
                          <SelectItem value="step">Step</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-16">
                      Blend: Smooth crossfade between algorithms. Step: Instant switch
                    </p>
                  </div>
                )}

                {/* Update/Remove buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUpdateKeyframe}
                    className="flex-1 h-7 text-xs gap-1"
                  >
                    <KeySquare className="h-3 w-3" />
                    Update Keyframe
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemoveKeyframe}
                    className="h-7 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="default"
                onClick={handleAddKeyframe}
                className="w-full h-7 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Keyframe at Frame {currentFrame}
              </Button>
            )}
          </div>

          {/* Navigation to other keyframes */}
          {animatedSettings.keyframes.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border">
              <p className="text-[10px] text-muted-foreground">Jump to keyframe:</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleJumpToPrevious}
                  disabled={!prevKeyframe}
                  className="flex-1 h-7 text-xs gap-1"
                >
                  <SkipBack className="h-3 w-3" />
                  {prevKeyframe ? `Frame ${prevKeyframe.frame}` : 'No Prev'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleJumpToNext}
                  disabled={!nextKeyframe}
                  className="flex-1 h-7 text-xs gap-1"
                >
                  {nextKeyframe ? `Frame ${nextKeyframe.frame}` : 'No Next'}
                  <SkipForward className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Keyframe list */}
          {animatedSettings.keyframes.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              <Label className="text-xs text-muted-foreground">All Keyframes:</Label>
              <div className="space-y-1">
                {animatedSettings.keyframes.map((kf) => (
                  <div
                    key={kf.frame}
                    className={`flex items-center justify-between px-2 py-1 rounded text-xs ${
                      kf.frame === currentFrame
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <span>Frame {kf.frame}</span>
                    <div className="flex gap-1 text-[10px] opacity-70">
                      <span>{kf.easing || 'linear'}</span>
                      {settingsType === 'dithering' && kf.transitionMode && (
                        <span className="px-1 bg-background/50 rounded">
                          {kf.transitionMode === 'blend' ? '~' : '|'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info message when disabled */}
      {!animatedSettings.enabled && (
        <p className="text-xs text-muted-foreground">
          Enable animation to add keyframes and transition {getSettingsLabel().toLowerCase()} over time.
        </p>
      )}
    </div>
  );
}
