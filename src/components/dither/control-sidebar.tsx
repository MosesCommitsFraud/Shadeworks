'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Palette, DitheringSettings, AdjustmentSettings, ColorModeSettings } from '@/lib/dither/types';
import { UploadSection } from './sections/upload-section';
import { DitheringSection } from './sections/dithering-section';
import { PaletteSection } from './sections/palette-section';
import { AdjustmentsSection } from './sections/adjustments-section';
import { ColorModeSection } from './sections/color-mode-section';

interface ControlSidebarProps {
  originalImage: ImageData | null;
  onImageUpload: (imageData: ImageData) => void;
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  ditheringSettings: DitheringSettings;
  onDitheringSettingsChange: (settings: Partial<DitheringSettings>) => void;
  adjustmentSettings: AdjustmentSettings;
  onAdjustmentSettingsChange: (settings: Partial<AdjustmentSettings>) => void;
  colorModeSettings: ColorModeSettings;
  onColorModeSettingsChange: (settings: Partial<ColorModeSettings>) => void;
}

export function ControlSidebar({
  originalImage,
  onImageUpload,
  palette,
  onPaletteChange,
  ditheringSettings,
  onDitheringSettingsChange,
  adjustmentSettings,
  onAdjustmentSettingsChange,
  colorModeSettings,
  onColorModeSettingsChange,
}: ControlSidebarProps) {
  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-5 text-xs">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="adjust">Adjust</TabsTrigger>
              <TabsTrigger value="mode">Mode</TabsTrigger>
              <TabsTrigger value="dither">Dither</TabsTrigger>
              <TabsTrigger value="palette">Palette</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <UploadSection onImageUpload={onImageUpload} />
            </TabsContent>

            <TabsContent value="adjust" className="mt-4">
              <AdjustmentsSection
                settings={adjustmentSettings}
                onSettingsChange={onAdjustmentSettingsChange}
                hasImage={!!originalImage}
              />
            </TabsContent>

            <TabsContent value="mode" className="mt-4">
              <ColorModeSection
                settings={colorModeSettings}
                onSettingsChange={onColorModeSettingsChange}
                hasImage={!!originalImage}
              />
            </TabsContent>

            <TabsContent value="dither" className="mt-4">
              <DitheringSection
                settings={ditheringSettings}
                onSettingsChange={onDitheringSettingsChange}
                hasImage={!!originalImage}
              />
            </TabsContent>

            <TabsContent value="palette" className="mt-4">
              <PaletteSection
                palette={palette}
                onPaletteChange={onPaletteChange}
                hasImage={!!originalImage}
                originalImage={originalImage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </aside>
  );
}
