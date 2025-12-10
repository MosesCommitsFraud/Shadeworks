'use client';

import type { AdjustmentSettings, Layer } from '@/lib/editor/types';
import type { FilterType } from '@/lib/editor/filters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Copy, RotateCcw } from 'lucide-react';
import {
  createLayer,
  duplicateLayer,
  deleteLayer,
  updateLayer,
} from '@/lib/editor/layer-manager';
import { DEFAULT_BASIC_ADJUSTMENTS } from '@/lib/editor/types';

interface AdjustmentsPanelProps {
  adjustments: AdjustmentSettings;
  onAdjustmentsChange: (adjustments: AdjustmentSettings) => void;
  hasImage: boolean;
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayersChange: (layers: Layer[]) => void;
  onApplyFilter: (filterType: FilterType, intensity?: number) => void;
}

export function AdjustmentsPanel({
  adjustments,
  onAdjustmentsChange,
  hasImage,
  layers,
  activeLayerId,
  onLayerSelect,
  onLayersChange,
  onApplyFilter,
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

  const handleAddLayer = () => {
    const newLayer = createLayer('image', `Layer ${layers.length + 1}`);
    onLayersChange([...layers, newLayer]);
    onLayerSelect(newLayer.id);
  };

  const handleDuplicateLayer = (layer: Layer) => {
    const duplicated = duplicateLayer(layer);
    const index = layers.findIndex((l) => l.id === layer.id);
    const newLayers = [...layers];
    newLayers.splice(index + 1, 0, duplicated);
    onLayersChange(newLayers);
  };

  const handleDeleteLayer = (layerId: string) => {
    onLayersChange(deleteLayer(layers, layerId));
    if (activeLayerId === layerId && layers.length > 1) {
      const index = layers.findIndex((l) => l.id === layerId);
      const nextLayer = layers[Math.max(0, index - 1)];
      if (nextLayer) onLayerSelect(nextLayer.id);
    }
  };

  const handleToggleVisibility = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (layer) {
      onLayersChange(
        updateLayer(layers, layerId, { visible: !layer.visible })
      );
    }
  };

  const handleToggleLock = (layerId: string) => {
    const layer = layers.find((l) => l.id === layerId);
    if (layer) {
      onLayersChange(updateLayer(layers, layerId, { locked: !layer.locked }));
    }
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    onLayersChange(updateLayer(layers, layerId, { opacity }));
  };

  const handleBlendModeChange = (layerId: string, blendMode: Layer['blendMode']) => {
    onLayersChange(updateLayer(layers, layerId, { blendMode }));
  };

  const handleResetAdjustments = () => {
    onAdjustmentsChange({
      ...adjustments,
      basic: DEFAULT_BASIC_ADJUSTMENTS,
    });
  };

  return (
    <div className="w-96 border-l border-border bg-card flex flex-col">
      <ScrollArea className="flex-1">
        <Accordion type="multiple" defaultValue={['layers', 'basic']} className="w-full">
          {/* Layers Section */}
          <AccordionItem value="layers" className="border-b border-border">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h2 className="text-sm font-semibold">Layers</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddLayer();
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {layers.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No layers
                </div>
              ) : (
                <div className="space-y-2">
                  {[...layers].reverse().map((layer) => (
                    <div
                      key={layer.id}
                      className={`rounded-md border p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                        activeLayerId === layer.id ? 'bg-accent border-accent-foreground/20' : 'border-border'
                      }`}
                      onClick={() => onLayerSelect(layer.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded bg-muted border border-border flex items-center justify-center text-xs font-medium flex-shrink-0">
                          {layer.type[0].toUpperCase()}
                        </div>

                        {/* Layer info */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{layer.name}</p>
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVisibility(layer.id);
                                }}
                              >
                                {layer.visible ? (
                                  <Eye className="h-3.5 w-3.5" />
                                ) : (
                                  <EyeOff className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleLock(layer.id);
                                }}
                              >
                                {layer.locked ? (
                                  <Lock className="h-3.5 w-3.5" />
                                ) : (
                                  <Unlock className="h-3.5 w-3.5" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateLayer(layer);
                                }}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteLayer(layer.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>

                          {/* Opacity */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">Opacity</Label>
                              <span className="text-xs text-muted-foreground ml-auto">{layer.opacity}%</span>
                            </div>
                            <Slider
                              value={[layer.opacity]}
                              onValueChange={([value]) =>
                                handleOpacityChange(layer.id, value)
                              }
                              max={100}
                              step={1}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* Blend mode */}
                          <Select
                            value={layer.blendMode}
                            onValueChange={(value) =>
                              handleBlendModeChange(layer.id, value as Layer['blendMode'])
                            }
                          >
                            <SelectTrigger className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="multiply">Multiply</SelectItem>
                              <SelectItem value="screen">Screen</SelectItem>
                              <SelectItem value="overlay">Overlay</SelectItem>
                              <SelectItem value="darken">Darken</SelectItem>
                              <SelectItem value="lighten">Lighten</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Basic Adjustments */}
          <AccordionItem value="basic" className="border-b border-border">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center justify-between w-full pr-4">
                <h2 className="text-sm font-semibold">Basic Adjustments</h2>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetAdjustments();
                  }}
                  disabled={!hasImage}
                  title="Reset to defaults"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {!hasImage ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Load an image to adjust
                </p>
              ) : (
                <div className="space-y-4">
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
                    />
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Tone Curve - Placeholder */}
          <AccordionItem value="tone-curve" className="border-b border-border">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h2 className="text-sm font-semibold">Tone Curve</h2>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                Tone curve coming soon
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* HSL - Placeholder */}
          <AccordionItem value="hsl" className="border-b border-border">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h2 className="text-sm font-semibold">HSL / Color</h2>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <p className="text-sm text-muted-foreground text-center py-4">
                HSL adjustments coming soon
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Filters & Effects */}
          <AccordionItem value="filters">
            <AccordionTrigger className="px-4 hover:no-underline">
              <h2 className="text-sm font-semibold">Filters & Effects</h2>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              {!hasImage ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Load an image to apply filters
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Blur Filters */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Blur</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('blur', 3)}
                      >
                        Blur
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('gaussianBlur', 5)}
                      >
                        Gaussian Blur
                      </Button>
                    </div>
                  </div>

                  {/* Sharpen */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Sharpen</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('sharpen', 0.5)}
                      >
                        Sharpen
                      </Button>
                    </div>
                  </div>

                  {/* Artistic */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Artistic</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('grayscale')}
                      >
                        Grayscale
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('sepia', 100)}
                      >
                        Sepia
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('invert')}
                      >
                        Invert
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('pixelate', 10)}
                      >
                        Pixelate
                      </Button>
                    </div>
                  </div>

                  {/* Stylize */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Stylize</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('emboss')}
                      >
                        Emboss
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onApplyFilter('edgeDetect')}
                      >
                        Edge Detect
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </div>
  );
}
