'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Palette, DitheringSettings, AdjustmentSettings, ColorModeSettings } from '@/lib/dither/types';
import { getDefaultPalette } from '@/lib/dither/palettes';
import { applyDithering } from '@/lib/dither/algorithms';
import { applyAllAdjustments, getDefaultAdjustmentSettings } from '@/lib/dither/adjustments';
import { applyColorMode } from '@/lib/dither/color-modes';
import { copyImageData, debounce } from '@/lib/dither/utils';
import { CanvasPreview } from './canvas-preview';
import { ControlSidebar } from './control-sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const INITIAL_DITHERING_SETTINGS: DitheringSettings = {
  algorithm: 'floyd-steinberg',
  serpentine: true,
  errorAttenuation: 1.0,
  randomNoise: 0,
};

const INITIAL_COLOR_MODE_SETTINGS: ColorModeSettings = {
  mode: 'rgb',
  shades: 16,
};

export function DitherEditor() {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
  const [palette, setPalette] = useState<Palette>(getDefaultPalette());
  const [ditheringSettings, setDitheringSettings] = useState<DitheringSettings>(
    INITIAL_DITHERING_SETTINGS
  );
  const [adjustmentSettings, setAdjustmentSettings] = useState<AdjustmentSettings>(
    getDefaultAdjustmentSettings()
  );
  const [colorModeSettings, setColorModeSettings] = useState<ColorModeSettings>(
    INITIAL_COLOR_MODE_SETTINGS
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [zoom, setZoom] = useState<number>(100);

  // Process image with current settings
  const processImage = useCallback(() => {
    if (!originalImage) return;

    setIsProcessing(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        // Apply adjustments first
        let adjusted = applyAllAdjustments(
          copyImageData(originalImage),
          adjustmentSettings
        );

        // Apply color mode
        let colorModeApplied = applyColorMode(
          adjusted,
          colorModeSettings.mode,
          palette,
          {
            tonalShades: colorModeSettings.shades,
          }
        );

        // Then apply dithering
        const dithered = applyDithering(colorModeApplied, palette, ditheringSettings);
        setProcessedImage(dithered);
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  }, [originalImage, palette, ditheringSettings, adjustmentSettings, colorModeSettings]);

  // Debounced version for real-time preview
  const debouncedProcessImage = useCallback(
    debounce(processImage, 300),
    [processImage]
  );

  // Process image when settings change
  useEffect(() => {
    if (originalImage) {
      debouncedProcessImage();
    }
  }, [originalImage, palette, ditheringSettings, adjustmentSettings, colorModeSettings, debouncedProcessImage]);

  const handleImageUpload = useCallback((imageData: ImageData) => {
    setOriginalImage(imageData);
  }, []);

  const handlePaletteChange = useCallback((newPalette: Palette) => {
    setPalette(newPalette);
  }, []);

  const handleDitheringSettingsChange = useCallback((newSettings: Partial<DitheringSettings>) => {
    setDitheringSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleAdjustmentSettingsChange = useCallback((newSettings: Partial<AdjustmentSettings>) => {
    setAdjustmentSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleColorModeSettingsChange = useCallback((newSettings: Partial<ColorModeSettings>) => {
    setColorModeSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const handleExport = useCallback(() => {
    if (!processedImage) return;

    // Import export function dynamically to avoid issues
    import('@/lib/dither/export').then(({ exportImage }) => {
      exportImage(
        processedImage,
        'dithered-image',
        {
          format: 'png',
          dpi: 72,
        }
      );
    });
  }, [processedImage]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Dither Editor</h1>
            <p className="text-xs text-muted-foreground">
              Upload an image to get started
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {processedImage && (
            <Button onClick={handleExport} variant="default">
              Export
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ControlSidebar
          originalImage={originalImage}
          onImageUpload={handleImageUpload}
          palette={palette}
          onPaletteChange={handlePaletteChange}
          ditheringSettings={ditheringSettings}
          onDitheringSettingsChange={handleDitheringSettingsChange}
          adjustmentSettings={adjustmentSettings}
          onAdjustmentSettingsChange={handleAdjustmentSettingsChange}
          colorModeSettings={colorModeSettings}
          onColorModeSettingsChange={handleColorModeSettingsChange}
        />

        {/* Canvas */}
        <CanvasPreview
          originalImage={originalImage}
          processedImage={processedImage}
          isProcessing={isProcessing}
          zoom={zoom}
          onZoomChange={setZoom}
        />
      </div>
    </div>
  );
}
