'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Palette } from '@/lib/dither/types';
import { BUILT_IN_PALETTES, getPaletteByType } from '@/lib/dither/palettes';
import { colorToHex } from '@/lib/dither/utils';

interface PaletteSectionProps {
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  hasImage: boolean;
}

export function PaletteSection({
  palette,
  onPaletteChange,
  hasImage,
}: PaletteSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Color Palette</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose a color palette for dithering
        </p>
      </div>

      {/* Palette selection */}
      <div className="space-y-2">
        <Label>Palette</Label>
        <Select
          value={palette.type}
          onValueChange={(value) => {
            const newPalette = getPaletteByType(value as any);
            if (newPalette) {
              onPaletteChange(newPalette);
            }
          }}
          disabled={!hasImage}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* Monochrome */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Monochrome
            </div>
            {BUILT_IN_PALETTES.filter(
              (p) => p.type === 'bw' || p.type === 'warm-bw' || p.type === 'cool-bw'
            ).map((p) => (
              <SelectItem key={p.type} value={p.type}>
                {p.name}
              </SelectItem>
            ))}

            {/* Grayscale */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
              Grayscale
            </div>
            {BUILT_IN_PALETTES.filter((p) =>
              p.type.startsWith('grayscale')
            ).map((p) => (
              <SelectItem key={p.type} value={p.type}>
                {p.name}
              </SelectItem>
            ))}

            {/* Retro */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
              Retro
            </div>
            {BUILT_IN_PALETTES.filter(
              (p) => p.type === 'gameboy' || p.type === 'cga'
            ).map((p) => (
              <SelectItem key={p.type} value={p.type}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Palette preview */}
      <div className="space-y-2">
        <Label>Preview ({palette.colors.length} colors)</Label>
        <div className="grid grid-cols-8 gap-1">
          {palette.colors.map((color, index) => (
            <div
              key={index}
              className="aspect-square rounded border border-border"
              style={{
                backgroundColor: colorToHex(color),
              }}
              title={colorToHex(color)}
            />
          ))}
        </div>
      </div>

      {/* Palette info */}
      {palette.description && (
        <div className="rounded-lg bg-muted p-3 text-xs">
          <p className="font-medium mb-1">About this palette:</p>
          <p className="text-muted-foreground">{palette.description}</p>
        </div>
      )}
    </div>
  );
}
