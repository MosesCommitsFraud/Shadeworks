'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import type { ColorMode, ColorModeSettings } from '@/lib/dither/types';

interface ColorModeSectionProps {
  settings: ColorModeSettings;
  onSettingsChange: (settings: Partial<ColorModeSettings>) => void;
  hasImage: boolean;
}

const COLOR_MODES: Array<{ value: ColorMode; label: string; description: string }> = [
  {
    value: 'rgb',
    label: 'RGB (Full Color)',
    description: 'Full color dithering with all RGB channels',
  },
  {
    value: 'indexed',
    label: 'Indexed Color',
    description: 'Limited palette with color quantization',
  },
  {
    value: 'tonal',
    label: 'Tonal (Grayscale)',
    description: 'Grayscale with customizable shade count',
  },
  {
    value: 'mono',
    label: 'Monochrome',
    description: 'Pure black and white (1-bit)',
  },
];

export function ColorModeSection({
  settings,
  onSettingsChange,
  hasImage,
}: ColorModeSectionProps) {
  const currentMode = COLOR_MODES.find((m) => m.value === settings.mode);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Color Mode</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose how colors are processed
        </p>
      </div>

      {/* Color mode selection */}
      <div className="space-y-2">
        <Label>Mode</Label>
        <Select
          value={settings.mode}
          onValueChange={(value) => onSettingsChange({ mode: value as ColorMode })}
          disabled={!hasImage}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COLOR_MODES.map((mode) => (
              <SelectItem key={mode.value} value={mode.value}>
                {mode.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Mode description */}
      {currentMode && (
        <div className="rounded-lg bg-muted p-3 text-xs">
          <p className="text-muted-foreground">{currentMode.description}</p>
        </div>
      )}

      {/* Tonal mode settings */}
      {settings.mode === 'tonal' && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Shades</Label>
              <span className="text-xs text-muted-foreground">
                {settings.shades ?? 16}
              </span>
            </div>
            <Slider
              value={[settings.shades ?? 16]}
              onValueChange={([value]) => onSettingsChange({ shades: value })}
              min={2}
              max={256}
              step={1}
              disabled={!hasImage}
            />
            <p className="text-xs text-muted-foreground">
              Number of gray shades (2-256)
            </p>
          </div>
        </>
      )}

      {/* Mode-specific tips */}
      <div className="rounded-lg bg-muted p-3 text-xs">
        <p className="font-medium mb-1">Tips:</p>
        <ul className="text-muted-foreground space-y-1 list-disc list-inside">
          {settings.mode === 'rgb' && (
            <>
              <li>Best for full-color images</li>
              <li>Requires color palettes for best results</li>
              <li>Use retro palettes for vintage look</li>
            </>
          )}
          {settings.mode === 'indexed' && (
            <>
              <li>Reduces image to palette colors only</li>
              <li>Great for retro gaming aesthetics</li>
              <li>Try extracting palette from your image</li>
            </>
          )}
          {settings.mode === 'tonal' && (
            <>
              <li>Perfect for grayscale artwork</li>
              <li>Lower shades create posterized look</li>
              <li>16 shades is good for most images</li>
            </>
          )}
          {settings.mode === 'mono' && (
            <>
              <li>Classic newspaper print effect</li>
              <li>Works great with high contrast images</li>
              <li>Adjust contrast before dithering</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
