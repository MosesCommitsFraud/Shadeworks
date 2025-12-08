'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Palette, DitheringSettings, AdjustmentSettings, ColorModeSettings } from '@/lib/dither/types';
import { getDefaultPalette } from '@/lib/dither/palettes';
import { applyDithering } from '@/lib/dither/algorithms';
import { applyAllAdjustments, getDefaultAdjustmentSettings } from '@/lib/dither/adjustments';
import { applyColorMode } from '@/lib/dither/color-modes';
import { copyImageData, debounce } from '@/lib/dither/utils';
import { CanvasPreview } from './canvas-preview';
import { ControlSidebar } from './control-sidebar';
import type { ExportOptions } from './sections/export-section';
import type { DitherPreset } from '@/lib/dither/presets';
import { getPaletteByType } from '@/lib/dither/palettes';
import {
  useKeyboardShortcuts,
  getDefaultShortcuts,
} from '@/lib/dither/keyboard-shortcuts';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Keyboard } from 'lucide-react';
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
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState<number>(100);
  const [comparisonMode, setComparisonMode] = useState(false);

  // Ref to store zoom/fit handlers from CanvasPreview
  const zoomHandlers = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    zoomFit: () => void;
  }>({
    zoomIn: () => {},
    zoomOut: () => {},
    zoomFit: () => {},
  });

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

  const handleApplyPreset = useCallback((preset: DitherPreset) => {
    // Apply all settings from the preset
    setDitheringSettings(preset.ditheringSettings);
    setAdjustmentSettings(preset.adjustmentSettings);
    setColorModeSettings(preset.colorModeSettings);

    // Apply palette if it exists
    const presetPalette = getPaletteByType(preset.paletteType);
    if (presetPalette) {
      setPalette(presetPalette);
    }
  }, []);

  const handleExport = useCallback(async (options: ExportOptions) => {
    if (!processedImage) return;

    setIsExporting(true);

    try {
      const exportLib = await import('@/lib/dither/export');

      if (options.colorSeparation) {
        // Export color-separated layers
        await exportLib.exportColorSeparation(
          processedImage,
          palette.colors,
          options.filename,
          {
            format: options.format,
            dpi: options.dpi,
            quality: options.quality,
          }
        );
      } else if (options.cmykSeparation) {
        // Export CMYK separation
        await exportLib.exportCMYKSeparation(
          processedImage,
          options.filename,
          {
            format: options.format,
            dpi: options.dpi,
            quality: options.quality,
          }
        );
      } else {
        // Regular export
        exportLib.exportImage(
          processedImage,
          options.filename,
          {
            format: options.format,
            dpi: options.dpi,
            quality: options.quality,
            halftoneAngle: options.halftoneAngle ?? undefined,
          }
        );
      }
    } catch (error) {
      console.error('Error exporting image:', error);
    } finally {
      setIsExporting(false);
    }
  }, [processedImage, palette]);

  // Quick export function for keyboard shortcut
  const quickExport = useCallback(() => {
    if (!processedImage) return;
    handleExport({
      format: 'png',
      dpi: 72,
      quality: 0.95,
      halftoneAngle: null,
      colorSeparation: false,
      cmykSeparation: false,
      filename: 'dithered-image',
    });
  }, [processedImage, handleExport]);

  // Toggle comparison mode
  const toggleComparison = useCallback(() => {
    if (originalImage && processedImage) {
      setComparisonMode((prev) => !prev);
    }
  }, [originalImage, processedImage]);

  // Keyboard shortcuts
  useKeyboardShortcuts(
    getDefaultShortcuts({
      onExport: processedImage ? quickExport : undefined,
      onToggleComparison: originalImage && processedImage ? toggleComparison : undefined,
      onZoomIn: () => zoomHandlers.current.zoomIn(),
      onZoomOut: () => zoomHandlers.current.zoomOut(),
      onZoomFit: () => zoomHandlers.current.zoomFit(),
    }),
    !isProcessing && !isExporting
  );

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
              {processedImage
                ? `${processedImage.width}×${processedImage.height}px • ${palette.name} palette`
                : 'Upload an image to get started'}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ControlSidebar
          originalImage={originalImage}
          processedImage={processedImage}
          onImageUpload={handleImageUpload}
          palette={palette}
          onPaletteChange={handlePaletteChange}
          ditheringSettings={ditheringSettings}
          onDitheringSettingsChange={handleDitheringSettingsChange}
          adjustmentSettings={adjustmentSettings}
          onAdjustmentSettingsChange={handleAdjustmentSettingsChange}
          colorModeSettings={colorModeSettings}
          onColorModeSettingsChange={handleColorModeSettingsChange}
          onExport={handleExport}
          isExporting={isExporting}
          onApplyPreset={handleApplyPreset}
        />

        {/* Canvas */}
        <CanvasPreview
          originalImage={originalImage}
          processedImage={processedImage}
          isProcessing={isProcessing}
          zoom={zoom}
          onZoomChange={setZoom}
          comparisonMode={comparisonMode}
          onComparisonModeChange={setComparisonMode}
          onRegisterZoomHandlers={(handlers) => {
            zoomHandlers.current = handlers;
          }}
        />
      </div>
    </div>
  );
}
