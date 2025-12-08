'use client';

import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { AdjustmentSettings } from '@/lib/dither/types';
import { getDefaultAdjustmentSettings } from '@/lib/dither/adjustments';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';

interface AdjustmentsSectionProps {
  settings: AdjustmentSettings;
  onSettingsChange: (settings: Partial<AdjustmentSettings>) => void;
  hasImage: boolean;
}

export function AdjustmentsSection({
  settings,
  onSettingsChange,
  hasImage,
}: AdjustmentsSectionProps) {
  const handleResetAll = () => {
    const defaults = getDefaultAdjustmentSettings();
    onSettingsChange(defaults);
  };

  const hasChanges = Object.keys(settings).some((key) => {
    const defaults = getDefaultAdjustmentSettings();
    return settings[key as keyof AdjustmentSettings] !== defaults[key as keyof AdjustmentSettings];
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold">Image Adjustments</h3>
          {hasChanges && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAll}
              disabled={!hasImage}
              className="h-7 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset All
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Adjust image before dithering
        </p>
      </div>

      {/* Brightness */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Brightness</Label>
          <span className="text-xs text-muted-foreground">{settings.brightness}</span>
        </div>
        <Slider
          value={[settings.brightness]}
          onValueChange={([value]) => onSettingsChange({ brightness: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
      </div>

      {/* Contrast */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Contrast</Label>
          <span className="text-xs text-muted-foreground">{settings.contrast}</span>
        </div>
        <Slider
          value={[settings.contrast]}
          onValueChange={([value]) => onSettingsChange({ contrast: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
      </div>

      {/* Saturation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Saturation</Label>
          <span className="text-xs text-muted-foreground">{settings.saturation}</span>
        </div>
        <Slider
          value={[settings.saturation]}
          onValueChange={([value]) => onSettingsChange({ saturation: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Reduce to -100 for grayscale
        </p>
      </div>

      <Separator />

      {/* Gamma */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Gamma</Label>
          <span className="text-xs text-muted-foreground">{settings.gamma.toFixed(2)}</span>
        </div>
        <Slider
          value={[settings.gamma * 100]}
          onValueChange={([value]) => onSettingsChange({ gamma: value / 100 })}
          min={50}
          max={200}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Adjust tonal response (1.0 = neutral)
        </p>
      </div>

      <Separator />

      {/* Blur */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Blur</Label>
          <span className="text-xs text-muted-foreground">{settings.blur}px</span>
        </div>
        <Slider
          value={[settings.blur]}
          onValueChange={([value]) => onSettingsChange({ blur: value })}
          min={0}
          max={20}
          step={1}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Soften edges and reduce noise
        </p>
      </div>

      {/* Sharpen */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Sharpen</Label>
          <span className="text-xs text-muted-foreground">{settings.sharpen}%</span>
        </div>
        <Slider
          value={[settings.sharpen]}
          onValueChange={([value]) => onSettingsChange({ sharpen: value })}
          min={0}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Enhance edges and details
        </p>
      </div>

      {/* Denoise */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Denoise</Label>
          <span className="text-xs text-muted-foreground">{settings.denoise}%</span>
        </div>
        <Slider
          value={[settings.denoise]}
          onValueChange={([value]) => onSettingsChange({ denoise: value })}
          min={0}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Remove noise while preserving edges
        </p>
      </div>

      {/* Tips */}
      <div className="rounded-lg bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Adjustment Tips:</p>
        <ul className="text-muted-foreground space-y-1 list-disc list-inside">
          <li>Apply adjustments before dithering for best results</li>
          <li>Increase contrast for sharper dithering patterns</li>
          <li>Reduce saturation for better grayscale conversion</li>
          <li>Use blur to smooth gradients before dithering</li>
        </ul>
      </div>
    </div>
  );
}
