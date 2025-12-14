'use client';

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
        <Slider
          label="Exposure"
          showValue
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
        <Slider
          label="Brightness"
          showValue
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
        <Slider
          label="Contrast"
          showValue
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
        <Slider
          label="Hue"
          showValue
          unit="°"
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
        <Slider
          label="Saturation"
          showValue
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
        <Slider
          label="Vibrance"
          showValue
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
        <Slider
          label="Temperature"
          showValue
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
        <Slider
          label="Tint"
          showValue
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
        <Slider
          label="Highlights"
          showValue
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
        <Slider
          label="Shadows"
          showValue
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
        <Slider
          label="Gamma"
          showValue
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
        <Slider
          label="Blur"
          showValue
          unit="px"
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
        <Slider
          label="Sharpen"
          showValue
          unit="%"
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
        <Slider
          label="Denoise"
          showValue
          unit="%"
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
        <Slider
          label="Vignette"
          showValue
          unit="%"
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
