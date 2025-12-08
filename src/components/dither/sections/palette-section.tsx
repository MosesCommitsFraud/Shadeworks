'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Palette as PaletteIcon, Plus, Trash2, Download, Upload } from 'lucide-react';
import type { Palette, Color } from '@/lib/dither/types';
import { BUILT_IN_PALETTES, getPaletteByType } from '@/lib/dither/palettes';
import { colorToHex, hexToColor } from '@/lib/dither/utils';
import {
  extractPaletteMedianCut,
  extractPaletteKMeans,
  extractPaletteOctree,
} from '@/lib/dither/palette-extraction';

interface PaletteSectionProps {
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  hasImage: boolean;
  originalImage: ImageData | null;
}

export function PaletteSection({
  palette,
  onPaletteChange,
  hasImage,
  originalImage,
}: PaletteSectionProps) {
  const [customColors, setCustomColors] = useState<Color[]>(palette.colors);
  const [extractAlgorithm, setExtractAlgorithm] = useState<'median-cut' | 'k-means' | 'octree'>('median-cut');
  const [extractColorCount, setExtractColorCount] = useState(16);

  const handleExtractPalette = () => {
    if (!originalImage) return;

    let extracted: Palette;
    switch (extractAlgorithm) {
      case 'median-cut':
        extracted = extractPaletteMedianCut(originalImage, extractColorCount);
        break;
      case 'k-means':
        extracted = extractPaletteKMeans(originalImage, extractColorCount);
        break;
      case 'octree':
        extracted = extractPaletteOctree(originalImage, extractColorCount);
        break;
    }

    onPaletteChange(extracted);
    setCustomColors(extracted.colors);
  };

  const handleAddColor = () => {
    const newColor: Color = { r: 128, g: 128, b: 128, a: 255 };
    const updatedColors = [...customColors, newColor];
    setCustomColors(updatedColors);
    onPaletteChange({
      name: 'Custom Palette',
      type: 'custom',
      colors: updatedColors,
      description: `Custom palette with ${updatedColors.length} colors`,
    });
  };

  const handleRemoveColor = (index: number) => {
    const updatedColors = customColors.filter((_, i) => i !== index);
    setCustomColors(updatedColors);
    onPaletteChange({
      name: 'Custom Palette',
      type: 'custom',
      colors: updatedColors,
      description: `Custom palette with ${updatedColors.length} colors`,
    });
  };

  const handleColorChange = (index: number, hex: string) => {
    const updatedColors = [...customColors];
    updatedColors[index] = hexToColor(hex);
    setCustomColors(updatedColors);
    onPaletteChange({
      name: 'Custom Palette',
      type: 'custom',
      colors: updatedColors,
      description: `Custom palette with ${updatedColors.length} colors`,
    });
  };

  const handleSavePalette = () => {
    const paletteData = JSON.stringify({ colors: customColors });
    const blob = new Blob([paletteData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-palette.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPalette = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.colors && Array.isArray(data.colors)) {
          setCustomColors(data.colors);
          onPaletteChange({
            name: 'Loaded Palette',
            type: 'custom',
            colors: data.colors,
            description: `Loaded palette with ${data.colors.length} colors`,
          });
        }
      } catch (error) {
        console.error('Failed to load palette:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Color Palette</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose or create a color palette for dithering
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

            <Separator className="my-1" />

            {/* Grayscale */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Grayscale
            </div>
            {BUILT_IN_PALETTES.filter((p) =>
              p.type.startsWith('grayscale')
            ).map((p) => (
              <SelectItem key={p.type} value={p.type}>
                {p.name}
              </SelectItem>
            ))}

            <Separator className="my-1" />

            {/* Retro Gaming */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Retro Gaming
            </div>
            {BUILT_IN_PALETTES.filter(
              (p) => p.type === 'gameboy' || p.type === 'cga' || p.type === 'ega' ||
                     p.type === 'commodore-64' || p.type === 'apple-ii' || p.type === 'nes' ||
                     p.type === 'zx-spectrum'
            ).map((p) => (
              <SelectItem key={p.type} value={p.type}>
                {p.name}
              </SelectItem>
            ))}

            <Separator className="my-1" />

            {/* Modern/Aesthetic */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Modern
            </div>
            {BUILT_IN_PALETTES.filter(
              (p) => p.type === 'pastel' || p.type === 'vaporwave' || p.type === 'synthwave' ||
                     p.type === 'cyberpunk' || p.type === 'nordic'
            ).map((p) => (
              <SelectItem key={p.type} value={p.type}>
                {p.name}
              </SelectItem>
            ))}

            <Separator className="my-1" />

            {/* Art Styles */}
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Art Styles
            </div>
            {BUILT_IN_PALETTES.filter(
              (p) => p.type === 'newspaper' || p.type === 'risograph' || p.type === 'screen-print'
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

      <Separator />

      {/* Advanced palette tools */}
      <Accordion type="single" collapsible className="w-full">
        {/* Extract from image */}
        <AccordionItem value="extract">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <PaletteIcon className="h-4 w-4" />
              Extract from Image
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Algorithm</Label>
                <Select
                  value={extractAlgorithm}
                  onValueChange={(value) => setExtractAlgorithm(value as any)}
                  disabled={!hasImage || !originalImage}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="median-cut">Median Cut (Fast)</SelectItem>
                    <SelectItem value="k-means">K-Means (Balanced)</SelectItem>
                    <SelectItem value="octree">Octree (Accurate)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Number of Colors</Label>
                  <span className="text-xs text-muted-foreground">{extractColorCount}</span>
                </div>
                <Input
                  type="number"
                  min={2}
                  max={256}
                  value={extractColorCount}
                  onChange={(e) => setExtractColorCount(Math.max(2, Math.min(256, parseInt(e.target.value) || 16)))}
                  disabled={!hasImage || !originalImage}
                />
              </div>

              <Button
                onClick={handleExtractPalette}
                disabled={!hasImage || !originalImage}
                className="w-full"
              >
                <PaletteIcon className="h-4 w-4 mr-2" />
                Extract Palette
              </Button>

              <p className="text-xs text-muted-foreground">
                Extract dominant colors from the uploaded image
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Custom palette */}
        <AccordionItem value="custom">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Custom Palette
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Colors ({customColors.length})</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddColor}
                    disabled={customColors.length >= 256}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {customColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={colorToHex(color)}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                        className="h-8 w-12 rounded border border-border cursor-pointer"
                      />
                      <span className="text-xs font-mono flex-1 truncate">
                        {colorToHex(color)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveColor(index)}
                        disabled={customColors.length <= 1}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSavePalette}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => document.getElementById('load-palette')?.click()}
                >
                  <Upload className="h-3 w-3 mr-1" />
                  Load
                </Button>
                <input
                  id="load-palette"
                  type="file"
                  accept=".json"
                  onChange={handleLoadPalette}
                  className="hidden"
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Create custom palettes or load saved ones
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
