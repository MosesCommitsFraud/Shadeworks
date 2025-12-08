'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Palette, DitheringSettings } from '@/lib/dither/types';
import { UploadSection } from './sections/upload-section';
import { DitheringSection } from './sections/dithering-section';
import { PaletteSection } from './sections/palette-section';

interface ControlSidebarProps {
  originalImage: ImageData | null;
  onImageUpload: (imageData: ImageData) => void;
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  ditheringSettings: DitheringSettings;
  onDitheringSettingsChange: (settings: Partial<DitheringSettings>) => void;
}

export function ControlSidebar({
  originalImage,
  onImageUpload,
  palette,
  onPaletteChange,
  ditheringSettings,
  onDitheringSettingsChange,
}: ControlSidebarProps) {
  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="dither">Dither</TabsTrigger>
              <TabsTrigger value="palette">Palette</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <UploadSection onImageUpload={onImageUpload} />
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
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </aside>
  );
}
