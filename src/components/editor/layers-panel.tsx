'use client';

import type { Layer } from '@/lib/editor/types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Copy } from 'lucide-react';
import {
  createLayer,
  duplicateLayer,
  deleteLayer,
  updateLayer,
  moveLayerUp,
  moveLayerDown,
} from '@/lib/editor/layer-manager';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onLayersChange: (layers: Layer[]) => void;
}

export function LayersPanel({
  layers,
  activeLayerId,
  onLayerSelect,
  onLayersChange,
}: LayersPanelProps) {
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

  return (
    <div className="h-48 border-t border-border bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <h2 className="text-sm font-semibold">Layers</h2>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleAddLayer}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Layers list */}
      <div className="overflow-y-auto h-[calc(100%-40px)]">
        {layers.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            No layers
          </div>
        ) : (
          <div className="divide-y divide-border">
            {[...layers].reverse().map((layer) => (
              <div
                key={layer.id}
                className={`px-4 py-2 cursor-pointer hover:bg-accent/50 transition-colors ${
                  activeLayerId === layer.id ? 'bg-accent' : ''
                }`}
                onClick={() => onLayerSelect(layer.id)}
              >
                <div className="flex items-center gap-2">
                  {/* Thumbnail placeholder */}
                  <div className="w-10 h-10 rounded bg-muted border border-border flex items-center justify-center text-xs">
                    {layer.type[0].toUpperCase()}
                  </div>

                  {/* Layer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{layer.name}</p>
                      <div className="flex items-center gap-1">
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

                    {/* Opacity & Blend mode */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Opacity:</span>
                        <Slider
                          value={[layer.opacity]}
                          onValueChange={([value]) =>
                            handleOpacityChange(layer.id, value)
                          }
                          max={100}
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs w-8">{layer.opacity}%</span>
                      </div>
                      <Select
                        value={layer.blendMode}
                        onValueChange={(value) =>
                          handleBlendModeChange(layer.id, value as Layer['blendMode'])
                        }
                      >
                        <SelectTrigger className="h-6 text-xs w-24">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
