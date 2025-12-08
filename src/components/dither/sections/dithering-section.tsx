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
import { Toggle } from '@/components/ui/toggle';
import type { DitheringSettings, DitheringAlgorithm } from '@/lib/dither/types';
import { Separator } from '@/components/ui/separator';

interface DitheringSectionProps {
  settings: DitheringSettings;
  onSettingsChange: (settings: Partial<DitheringSettings>) => void;
  hasImage: boolean;
}

const ALGORITHMS: Array<{ value: DitheringAlgorithm; label: string; category: string }> = [
  { value: 'floyd-steinberg', label: 'Floyd-Steinberg', category: 'Error Diffusion' },
  { value: 'atkinson', label: 'Atkinson', category: 'Error Diffusion' },
  { value: 'bayer-2x2', label: 'Bayer 2×2', category: 'Ordered' },
  { value: 'bayer-4x4', label: 'Bayer 4×4', category: 'Ordered' },
  { value: 'bayer-8x8', label: 'Bayer 8×8', category: 'Ordered' },
  { value: 'bayer-16x16', label: 'Bayer 16×16', category: 'Ordered' },
];

const ERROR_DIFFUSION_ALGORITHMS: DitheringAlgorithm[] = [
  'floyd-steinberg',
  'atkinson',
  'jarvis-judice-ninke',
  'stucki',
  'burkes',
  'sierra',
  'sierra-2row',
  'sierra-lite',
];

export function DitheringSection({
  settings,
  onSettingsChange,
  hasImage,
}: DitheringSectionProps) {
  const isErrorDiffusion = ERROR_DIFFUSION_ALGORITHMS.includes(settings.algorithm);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Dithering Algorithm</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose how the image will be dithered
        </p>
      </div>

      {/* Algorithm selection */}
      <div className="space-y-2">
        <Label>Algorithm</Label>
        <Select
          value={settings.algorithm}
          onValueChange={(value) =>
            onSettingsChange({ algorithm: value as DitheringAlgorithm })
          }
          disabled={!hasImage}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Error Diffusion
            </div>
            {ALGORITHMS.filter((a) => a.category === 'Error Diffusion').map((algo) => (
              <SelectItem key={algo.value} value={algo.value}>
                {algo.label}
              </SelectItem>
            ))}
            <Separator className="my-1" />
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Ordered Dithering
            </div>
            {ALGORITHMS.filter((a) => a.category === 'Ordered').map((algo) => (
              <SelectItem key={algo.value} value={algo.value}>
                {algo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error diffusion options */}
      {isErrorDiffusion && (
        <>
          <Separator />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Error Diffusion Options</h4>
            </div>

            {/* Serpentine */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Serpentine</Label>
                <p className="text-xs text-muted-foreground">
                  Alternate scan direction
                </p>
              </div>
              <Toggle
                pressed={settings.serpentine ?? true}
                onPressedChange={(pressed) => onSettingsChange({ serpentine: pressed })}
                disabled={!hasImage}
              >
                {settings.serpentine ? 'On' : 'Off'}
              </Toggle>
            </div>

            {/* Error attenuation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Error Attenuation</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round((settings.errorAttenuation ?? 1.0) * 100)}%
                </span>
              </div>
              <Slider
                value={[(settings.errorAttenuation ?? 1.0) * 100]}
                onValueChange={([value]) =>
                  onSettingsChange({ errorAttenuation: value / 100 })
                }
                min={0}
                max={100}
                step={5}
                disabled={!hasImage}
              />
              <p className="text-xs text-muted-foreground">
                Reduce error spread for softer results
              </p>
            </div>

            {/* Random noise */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Random Noise</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round((settings.randomNoise ?? 0) * 100)}%
                </span>
              </div>
              <Slider
                value={[(settings.randomNoise ?? 0) * 100]}
                onValueChange={([value]) =>
                  onSettingsChange({ randomNoise: value / 100 })
                }
                min={0}
                max={100}
                step={5}
                disabled={!hasImage}
              />
              <p className="text-xs text-muted-foreground">
                Add controlled noise to break up patterns
              </p>
            </div>
          </div>
        </>
      )}

      {/* Algorithm info */}
      <div className="rounded-lg bg-muted p-3 text-xs">
        <p className="font-medium mb-1">About this algorithm:</p>
        <p className="text-muted-foreground">
          {settings.algorithm === 'floyd-steinberg' &&
            'Classic error diffusion with excellent quality. Best for most images.'}
          {settings.algorithm === 'atkinson' &&
            'Mac-style algorithm with softer, more artistic results.'}
          {settings.algorithm.startsWith('bayer') &&
            'Ordered dithering creates characteristic patterns. Fast and consistent.'}
        </p>
      </div>
    </div>
  );
}
