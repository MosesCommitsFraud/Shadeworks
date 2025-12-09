'use client';

import type {
  AnimatedSettings,
  AdjustmentSettings,
  DitheringSettings,
  ColorModeSettings,
  TimelineState,
} from '@/lib/dither/types';
import { KeyframeControls } from '../keyframe-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';

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
  if (!hasVideo) {
    return (
      <Card className="p-4 bg-muted/50 border-muted">
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Keyframe animation is only available in video mode. Upload a video to get started.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Keyframe Animation</h3>
        <p className="text-xs text-muted-foreground">
          Add keyframes to animate effects over time. Enable animation for each effect type,
          then add keyframes at different frames to create smooth transitions.
        </p>
      </div>

      <Tabs defaultValue="adjustments" className="w-full min-w-0">
        <TabsList className="grid w-full grid-cols-3 min-w-0">
          <TabsTrigger value="adjustments" className="text-[11px] px-2 min-w-0">
            <span className="truncate">Adjust</span>
            {animatedAdjustments.enabled && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-primary/20 text-primary rounded flex-shrink-0">
                {animatedAdjustments.keyframes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="dithering" className="text-[11px] px-2 min-w-0">
            <span className="truncate">Dither</span>
            {animatedDithering.enabled && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-primary/20 text-primary rounded flex-shrink-0">
                {animatedDithering.keyframes.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="colorMode" className="text-[11px] px-2 min-w-0">
            <span className="truncate">Color</span>
            {animatedColorMode.enabled && (
              <span className="ml-1 px-1 py-0.5 text-[10px] bg-primary/20 text-primary rounded flex-shrink-0">
                {animatedColorMode.keyframes.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="adjustments" className="space-y-4 mt-4">
          <KeyframeControls
            animatedSettings={animatedAdjustments}
            currentSettings={adjustmentSettings}
            currentFrame={timelineState.currentFrame}
            onAnimatedSettingsChange={onAnimatedAdjustmentsChange}
            settingsType="adjustments"
            totalFrames={totalFrames}
            onJumpToFrame={onJumpToFrame}
          />
        </TabsContent>

        <TabsContent value="dithering" className="space-y-4 mt-4">
          <KeyframeControls
            animatedSettings={animatedDithering}
            currentSettings={ditheringSettings}
            currentFrame={timelineState.currentFrame}
            onAnimatedSettingsChange={onAnimatedDitheringChange}
            settingsType="dithering"
            totalFrames={totalFrames}
            onJumpToFrame={onJumpToFrame}
          />
        </TabsContent>

        <TabsContent value="colorMode" className="space-y-4 mt-4">
          <KeyframeControls
            animatedSettings={animatedColorMode}
            currentSettings={colorModeSettings}
            currentFrame={timelineState.currentFrame}
            onAnimatedSettingsChange={onAnimatedColorModeChange}
            settingsType="colorMode"
            totalFrames={totalFrames}
            onJumpToFrame={onJumpToFrame}
          />
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-2">
          <p className="font-medium">Tips:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Adjust settings in the other panels, then add keyframes here</li>
            <li>Click keyframe markers on the timeline to jump to them</li>
            <li>Use easing functions to control transition smoothness</li>
            <li>Enable animation mode to see interpolated values between keyframes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
