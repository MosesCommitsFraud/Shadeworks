'use client';

import type { AdjustmentSettings } from '@/lib/editor/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface AdjustmentsPanelProps {
  adjustments: AdjustmentSettings;
  onAdjustmentsChange: (adjustments: AdjustmentSettings) => void;
  hasImage: boolean;
}

export function AdjustmentsPanel({
  adjustments,
  onAdjustmentsChange,
  hasImage,
}: AdjustmentsPanelProps) {
  const handleBasicChange = (key: keyof typeof adjustments.basic, value: number) => {
    onAdjustmentsChange({
      ...adjustments,
      basic: {
        ...adjustments.basic,
        [key]: value,
      },
    });
  };

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold">Adjustments</h2>
      </div>

      <Tabs defaultValue="basic" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="tone-curve">Tone Curve</TabsTrigger>
          <TabsTrigger value="hsl">HSL</TabsTrigger>
          <TabsTrigger value="filters">Filters</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Basic Adjustments */}
          <TabsContent value="basic" className="px-4 py-4 space-y-4 mt-0">
            {!hasImage ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Load an image to adjust
              </p>
            ) : (
              <>
                {/* Exposure */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Exposure</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.exposure.toFixed(2)}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.exposure]}
                    onValueChange={([value]) => handleBasicChange('exposure', value)}
                    min={-5}
                    max={5}
                    step={0.01}
                    disabled={!hasImage}
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Contrast</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.contrast}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.contrast]}
                    onValueChange={([value]) => handleBasicChange('contrast', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>

                {/* Highlights */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Highlights</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.highlights}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.highlights]}
                    onValueChange={([value]) => handleBasicChange('highlights', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>

                {/* Shadows */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Shadows</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.shadows}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.shadows]}
                    onValueChange={([value]) => handleBasicChange('shadows', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>

                {/* Whites */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Whites</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.whites}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.whites]}
                    onValueChange={([value]) => handleBasicChange('whites', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>

                {/* Blacks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Blacks</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.blacks}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.blacks]}
                    onValueChange={([value]) => handleBasicChange('blacks', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>

                {/* Vibrance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Vibrance</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.vibrance}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.vibrance]}
                    onValueChange={([value]) => handleBasicChange('vibrance', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Saturation</Label>
                    <span className="text-xs text-muted-foreground">
                      {adjustments.basic.saturation}
                    </span>
                  </div>
                  <Slider
                    value={[adjustments.basic.saturation]}
                    onValueChange={([value]) => handleBasicChange('saturation', value)}
                    min={-100}
                    max={100}
                    step={1}
                    disabled={!hasImage}
                  />
                </div>
              </>
            )}
          </TabsContent>

          {/* Tone Curve - Placeholder */}
          <TabsContent value="tone-curve" className="px-4 py-4 mt-0">
            <p className="text-sm text-muted-foreground text-center py-8">
              Tone curve coming soon
            </p>
          </TabsContent>

          {/* HSL - Placeholder */}
          <TabsContent value="hsl" className="px-4 py-4 mt-0">
            <p className="text-sm text-muted-foreground text-center py-8">
              HSL adjustments coming soon
            </p>
          </TabsContent>

          {/* Filters - Placeholder */}
          <TabsContent value="filters" className="px-4 py-4 mt-0">
            <p className="text-sm text-muted-foreground text-center py-8">
              Filters coming soon
            </p>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
