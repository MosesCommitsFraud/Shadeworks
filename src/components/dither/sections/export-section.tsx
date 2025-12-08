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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { Download, Layers } from 'lucide-react';
import type { ExportFormat, DPI, HalftoneAngle, Palette } from '@/lib/dither/types';

interface ExportSectionProps {
  processedImage: ImageData | null;
  palette: Palette;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  dpi: DPI;
  quality: number;
  halftoneAngle: HalftoneAngle | null;
  colorSeparation: boolean;
  cmykSeparation: boolean;
  filename: string;
}

const DPI_PRESETS: DPI[] = [72, 150, 300];
const HALFTONE_ANGLES: Array<{ value: HalftoneAngle; label: string }> = [
  { value: 0, label: '0° (Horizontal)' },
  { value: 22.5, label: '22.5° (Diagonal)' },
  { value: 45, label: '45° (Diagonal)' },
  { value: 90, label: '90° (Vertical)' },
];

export function ExportSection({
  processedImage,
  palette,
  onExport,
  isExporting,
}: ExportSectionProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [dpi, setDpi] = useState<DPI>(72);
  const [customDPI, setCustomDPI] = useState<number>(72);
  const [useCustomDPI, setUseCustomDPI] = useState(false);
  const [quality, setQuality] = useState(95);
  const [halftoneEnabled, setHalftoneEnabled] = useState(false);
  const [halftoneAngle, setHalftoneAngle] = useState<HalftoneAngle>(45);
  const [colorSeparation, setColorSeparation] = useState(false);
  const [cmykSeparation, setCmykSeparation] = useState(false);
  const [filename, setFilename] = useState('dithered-image');

  const handleExport = () => {
    const effectiveDPI = useCustomDPI ? customDPI : dpi;
    onExport({
      format,
      dpi: effectiveDPI,
      quality: quality / 100,
      halftoneAngle: halftoneEnabled ? halftoneAngle : null,
      colorSeparation,
      cmykSeparation,
      filename,
    });
  };

  const hasImage = !!processedImage;
  const supportsQuality = format === 'jpeg' || format === 'webp';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Export Settings</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Configure export options for print or web
        </p>
      </div>

      {/* Filename */}
      <div className="space-y-2">
        <Label>Filename</Label>
        <Input
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="dithered-image"
          disabled={!hasImage}
        />
      </div>

      {/* Format */}
      <div className="space-y-2">
        <Label>Format</Label>
        <Select
          value={format}
          onValueChange={(value) => setFormat(value as ExportFormat)}
          disabled={!hasImage}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG (Lossless)</SelectItem>
            <SelectItem value="jpeg">JPEG (Compressed)</SelectItem>
            <SelectItem value="webp">WebP (Modern)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality (for JPEG/WebP) */}
      {supportsQuality && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quality</Label>
            <span className="text-xs text-muted-foreground">{quality}%</span>
          </div>
          <Slider
            value={[quality]}
            onValueChange={([value]) => setQuality(value)}
            min={50}
            max={100}
            step={5}
            disabled={!hasImage}
          />
        </div>
      )}

      <Separator />

      {/* DPI Settings */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Print Settings</h4>
          <p className="text-xs text-muted-foreground">
            Configure resolution for printing
          </p>
        </div>

        {/* DPI Presets */}
        <div className="space-y-2">
          <Label>DPI (Resolution)</Label>
          <div className="grid grid-cols-3 gap-2">
            {DPI_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={dpi === preset && !useCustomDPI ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setDpi(preset);
                  setUseCustomDPI(false);
                }}
                disabled={!hasImage}
                className="text-xs"
              >
                {preset} DPI
              </Button>
            ))}
          </div>
        </div>

        {/* Custom DPI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Custom DPI</Label>
            <Toggle
              pressed={useCustomDPI}
              onPressedChange={setUseCustomDPI}
              disabled={!hasImage}
              size="sm"
            >
              {useCustomDPI ? 'On' : 'Off'}
            </Toggle>
          </div>
          {useCustomDPI && (
            <Input
              type="number"
              min={72}
              max={600}
              value={customDPI}
              onChange={(e) => setCustomDPI(Math.max(72, Math.min(600, parseInt(e.target.value) || 72)))}
              disabled={!hasImage}
            />
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          • 72 DPI: Screen display<br />
          • 150 DPI: Draft printing<br />
          • 300 DPI: High-quality printing
        </p>
      </div>

      <Separator />

      {/* Halftone Settings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Halftone Effect</h4>
            <p className="text-xs text-muted-foreground">
              Add newspaper-style halftone dots
            </p>
          </div>
          <Toggle
            pressed={halftoneEnabled}
            onPressedChange={setHalftoneEnabled}
            disabled={!hasImage}
          >
            {halftoneEnabled ? 'On' : 'Off'}
          </Toggle>
        </div>

        {halftoneEnabled && (
          <div className="space-y-2">
            <Label>Halftone Angle</Label>
            <Select
              value={halftoneAngle.toString()}
              onValueChange={(value) => setHalftoneAngle(parseFloat(value) as HalftoneAngle)}
              disabled={!hasImage}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HALFTONE_ANGLES.map((angle) => (
                  <SelectItem key={angle.value} value={angle.value.toString()}>
                    {angle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Separator />

      {/* Color Separation */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Color Separation</h4>
          <p className="text-xs text-muted-foreground">
            Export individual color layers for printing
          </p>
        </div>

        <div className="space-y-3">
          {/* Palette color separation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Separate Palette Colors</Label>
              <p className="text-xs text-muted-foreground">
                Export each palette color as a layer
              </p>
            </div>
            <Toggle
              pressed={colorSeparation}
              onPressedChange={(pressed) => {
                setColorSeparation(pressed);
                if (pressed) setCmykSeparation(false);
              }}
              disabled={!hasImage}
            >
              {colorSeparation ? 'On' : 'Off'}
            </Toggle>
          </div>

          {/* CMYK separation */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>CMYK Separation</Label>
              <p className="text-xs text-muted-foreground">
                Export as C, M, Y, K layers
              </p>
            </div>
            <Toggle
              pressed={cmykSeparation}
              onPressedChange={(pressed) => {
                setCmykSeparation(pressed);
                if (pressed) setColorSeparation(false);
              }}
              disabled={!hasImage}
            >
              {cmykSeparation ? 'On' : 'Off'}
            </Toggle>
          </div>
        </div>

        {(colorSeparation || cmykSeparation) && (
          <div className="rounded-lg bg-muted p-3 text-xs">
            <p className="text-muted-foreground">
              {colorSeparation
                ? `Will export ${palette.colors.length} separate files, one for each palette color.`
                : 'Will export 4 separate files: cyan, magenta, yellow, and black layers.'}
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Export Button */}
      <Button
        onClick={handleExport}
        disabled={!hasImage || isExporting}
        className="w-full"
        size="lg"
      >
        {isExporting ? (
          <>Processing...</>
        ) : (
          <>
            {colorSeparation || cmykSeparation ? (
              <Layers className="h-4 w-4 mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {colorSeparation || cmykSeparation ? 'Export Layers' : 'Export Image'}
          </>
        )}
      </Button>

      {/* Export info */}
      {hasImage && (
        <div className="rounded-lg bg-muted p-3 text-xs">
          <p className="font-medium mb-1">Export Details:</p>
          <ul className="text-muted-foreground space-y-0.5">
            <li>• Format: {format.toUpperCase()}</li>
            <li>• Resolution: {useCustomDPI ? customDPI : dpi} DPI</li>
            {supportsQuality && <li>• Quality: {quality}%</li>}
            {halftoneEnabled && <li>• Halftone: {halftoneAngle}°</li>}
            {(colorSeparation || cmykSeparation) && (
              <li>• Separation: {colorSeparation ? 'Palette' : 'CMYK'}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
