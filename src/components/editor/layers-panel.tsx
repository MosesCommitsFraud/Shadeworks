'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Layers } from 'lucide-react';
import { LayerItem } from './components/layer-item';
import type { Layer } from '@/lib/editor/types';

interface LayersPanelProps {
  layers: Layer[];
  selectedLayerIds: string[];
  thumbnails: Map<string, string>;
  onLayerSelect: (layerId: string, multiSelect: boolean) => void;
  onLayerUpdate: (layerId: string, updates: Partial<Layer>) => void;
  onLayerDelete: (layerId: string) => void;
  onLayerDuplicate: (layerId: string) => void;
  onAddLayer: () => void;
}

export function LayersPanel({
  layers,
  selectedLayerIds,
  thumbnails,
  onLayerSelect,
  onLayerUpdate,
  onLayerDelete,
  onLayerDuplicate,
  onAddLayer,
}: LayersPanelProps) {
  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Layers</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onAddLayer}
          title="Add new layer"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Layers list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No layers yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload an image or create shapes
              </p>
            </div>
          ) : (
            // Reverse to show top layer first
            [...layers].reverse().map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                thumbnail={thumbnails.get(layer.id)}
                onSelect={() => onLayerSelect(layer.id, false)}
                onToggleVisibility={() =>
                  onLayerUpdate(layer.id, { visible: !layer.visible })
                }
                onToggleLock={() => onLayerUpdate(layer.id, { locked: !layer.locked })}
                onDelete={() => onLayerDelete(layer.id)}
                onDuplicate={() => onLayerDuplicate(layer.id)}
                onRename={(name) => onLayerUpdate(layer.id, { name })}
                onOpacityChange={(opacity) => onLayerUpdate(layer.id, { opacity })}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
        </p>
      </div>
    </div>
  );
}
