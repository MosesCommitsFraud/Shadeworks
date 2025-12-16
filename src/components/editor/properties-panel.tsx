'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Palette, Type as TypeIcon } from 'lucide-react';
import type { Tool, ToolSettings, Layer } from '@/lib/editor/types';

interface PropertiesPanelProps {
  tool: Tool;
  toolSettings: ToolSettings;
  selectedLayers: Layer[];
  onToolSettingsChange: (updates: Partial<ToolSettings>) => void;
}

export function PropertiesPanel({
  tool,
  toolSettings,
  selectedLayers,
  onToolSettingsChange,
}: PropertiesPanelProps) {
  const hasSelection = selectedLayers.length > 0;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">Properties</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Tool settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                Tool Settings
              </h3>
            </div>

            {/* Stroke color */}
            {(tool === 'brush' || tool === 'rectangle' || tool === 'circle' || tool === 'line') && (
              <div className="space-y-2">
                <Label className="text-xs">Stroke Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={toolSettings.strokeColor}
                    onChange={(e) =>
                      onToolSettingsChange({ strokeColor: e.target.value })
                    }
                    className="w-16 h-8 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={toolSettings.strokeColor}
                    onChange={(e) =>
                      onToolSettingsChange({ strokeColor: e.target.value })
                    }
                    className="flex-1 h-8 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Fill color */}
            {(tool === 'rectangle' || tool === 'circle') && (
              <div className="space-y-2">
                <Label className="text-xs">Fill Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={toolSettings.fillColor === 'transparent' ? '#ffffff' : toolSettings.fillColor}
                    onChange={(e) =>
                      onToolSettingsChange({ fillColor: e.target.value })
                    }
                    className="w-16 h-8 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={toolSettings.fillColor}
                    onChange={(e) =>
                      onToolSettingsChange({ fillColor: e.target.value })
                    }
                    className="flex-1 h-8 text-xs font-mono"
                    placeholder="transparent"
                  />
                </div>
              </div>
            )}

            {/* Stroke width */}
            {(tool === 'brush' || tool === 'eraser' || tool === 'rectangle' || tool === 'circle' || tool === 'line') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">
                    {tool === 'eraser' ? 'Eraser Size' : 'Stroke Width'}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {toolSettings.strokeWidth}px
                  </span>
                </div>
                <Slider
                  value={[toolSettings.strokeWidth]}
                  onValueChange={([value]) =>
                    onToolSettingsChange({ strokeWidth: value })
                  }
                  min={1}
                  max={100}
                  step={1}
                />
              </div>
            )}

            {/* Text settings */}
            {tool === 'text' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs">Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[toolSettings.fontSize || 24]}
                      onValueChange={([value]) =>
                        onToolSettingsChange({ fontSize: value })
                      }
                      min={8}
                      max={120}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-12 text-right">
                      {toolSettings.fontSize}px
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Font Family</Label>
                  <Select
                    value={toolSettings.fontFamily}
                    onValueChange={(value) =>
                      onToolSettingsChange({ fontFamily: value })
                    }
                  >
                    <SelectTrigger className="w-full h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                      <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={toolSettings.strokeColor}
                      onChange={(e) =>
                        onToolSettingsChange({ strokeColor: e.target.value })
                      }
                      className="w-16 h-8 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={toolSettings.strokeColor}
                      onChange={(e) =>
                        onToolSettingsChange({ strokeColor: e.target.value })
                      }
                      className="flex-1 h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Selection info */}
          {hasSelection && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                    Selection
                  </h3>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {selectedLayers.length} {selectedLayers.length === 1 ? 'layer' : 'layers'} selected
                  </p>
                  {selectedLayers.length === 1 && (
                    <div className="text-xs">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{selectedLayers[0].type}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Opacity:</span>
                        <span>{Math.round(selectedLayers[0].opacity)}%</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Visible:</span>
                        <span>{selectedLayers[0].visible ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Locked:</span>
                        <span>{selectedLayers[0].locked ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Help text */}
          {!hasSelection && tool === 'select' && (
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Select a layer to view its properties</p>
              <p className="pt-2">Or choose a tool to start drawing</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
