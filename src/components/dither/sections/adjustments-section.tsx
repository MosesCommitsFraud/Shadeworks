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

      {/* Basic Adjustments */}
      <div>
        <h4 className="text-sm font-medium mb-3">Basic</h4>
      </div>

      {/* Exposure */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Exposure</Label>
          <span className="text-xs text-muted-foreground">{settings.exposure.toFixed(1)} stops</span>
        </div>
        <Slider
          value={[settings.exposure * 50 + 100]}
          onValueChange={([value]) => onSettingsChange({ exposure: (value - 100) / 50 })}
          min={0}
          max={200}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Overall image brightness (-2 to +2 stops)
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

      <Separator />

      {/* Color Adjustments */}
      <div>
        <h4 className="text-sm font-medium mb-3">Color</h4>
      </div>

      {/* Hue */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Hue</Label>
          <span className="text-xs text-muted-foreground">{settings.hue}°</span>
        </div>
        <Slider
          value={[settings.hue]}
          onValueChange={([value]) => onSettingsChange({ hue: value })}
          min={-180}
          max={180}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Shift color spectrum
        </p>
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
          -100 for grayscale
        </p>
      </div>

      {/* Vibrance */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Vibrance</Label>
          <span className="text-xs text-muted-foreground">{settings.vibrance}</span>
        </div>
        <Slider
          value={[settings.vibrance]}
          onValueChange={([value]) => onSettingsChange({ vibrance: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Smart saturation (protects skin tones)
        </p>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Temperature</Label>
          <span className="text-xs text-muted-foreground">{settings.temperature}</span>
        </div>
        <Slider
          value={[settings.temperature]}
          onValueChange={([value]) => onSettingsChange({ temperature: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Cool (blue) ← → Warm (yellow)
        </p>
      </div>

      {/* Tint */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Tint</Label>
          <span className="text-xs text-muted-foreground">{settings.tint}</span>
        </div>
        <Slider
          value={[settings.tint]}
          onValueChange={([value]) => onSettingsChange({ tint: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Green ← → Magenta
        </p>
      </div>

      <Separator />

      {/* Tonal Adjustments */}
      <div>
        <h4 className="text-sm font-medium mb-3">Tonal</h4>
      </div>

      {/* Highlights */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Highlights</Label>
          <span className="text-xs text-muted-foreground">{settings.highlights}</span>
        </div>
        <Slider
          value={[settings.highlights]}
          onValueChange={([value]) => onSettingsChange({ highlights: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Adjust bright areas only
        </p>
      </div>

      {/* Shadows */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Shadows</Label>
          <span className="text-xs text-muted-foreground">{settings.shadows}</span>
        </div>
        <Slider
          value={[settings.shadows]}
          onValueChange={([value]) => onSettingsChange({ shadows: value })}
          min={-100}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Adjust dark areas only
        </p>
      </div>

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
          Tonal response curve (1.0 = neutral)
        </p>
      </div>

      <Separator />

      {/* Filters */}
      <div>
        <h4 className="text-sm font-medium mb-3">Filters</h4>
      </div>

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

      {/* Vignette */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Vignette</Label>
          <span className="text-xs text-muted-foreground">{settings.vignette}%</span>
        </div>
        <Slider
          value={[settings.vignette]}
          onValueChange={([value]) => onSettingsChange({ vignette: value })}
          min={0}
          max={100}
          step={5}
          disabled={!hasImage}
        />
        <p className="text-xs text-muted-foreground">
          Darken edges for focus effect
        </p>
      </div>
    </div>
  );
}
