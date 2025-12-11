'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as fabric from 'fabric';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, Download, Undo2, Redo2 } from 'lucide-react';
import { EditorCanvas } from './editor-canvas';
import { ToolsPanel } from './tools-panel';
import { LayersPanel } from './layers-panel';
import { PropertiesPanel } from './properties-panel';
import { CanvasHistory } from '@/lib/editor/history';
import {
  getLayersFromCanvas,
  updateLayer,
  deleteLayer,
  duplicateLayer,
  selectLayer,
  generateLayerThumbnail,
} from '@/lib/editor/layers';
import { loadImage, generateLayerId, centerObject } from '@/lib/editor/fabric-helpers';
import type { Tool, Layer, ToolSettings } from '@/lib/editor/types';

const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  strokeColor: '#000000',
  fillColor: 'transparent',
  strokeWidth: 2,
  opacity: 100,
  fontSize: 24,
  fontFamily: 'Arial',
};

export function ImageEditor() {
  const router = useRouter();
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<CanvasHistory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tool, setTool] = useState<Tool>('select');
  const [toolSettings, setToolSettings] = useState<ToolSettings>(DEFAULT_TOOL_SETTINGS);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Update layers from canvas
  const updateLayersFromCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const newLayers = getLayersFromCanvas(canvasRef.current);
    setLayers(newLayers);

    // Generate thumbnails for new layers
    newLayers.forEach((layer) => {
      if (!thumbnails.has(layer.id)) {
        const thumbnail = generateLayerThumbnail(layer.fabricObject, 40, 40);
        setThumbnails((prev) => new Map(prev).set(layer.id, thumbnail));
      }
    });

    // Update undo/redo state
    if (historyRef.current) {
      setCanUndo(historyRef.current.canUndo());
      setCanRedo(historyRef.current.canRedo());
    }
  }, [thumbnails]);

  // Handle canvas ready
  const handleCanvasReady = useCallback(
    (canvas: fabric.Canvas, history: CanvasHistory) => {
      canvasRef.current = canvas;
      historyRef.current = history;
      updateLayersFromCanvas();
    },
    [updateLayersFromCanvas]
  );

  // Handle selection change
  const handleSelectionChange = useCallback((objects: any[]) => {
    const ids = objects
      .map((obj: any) => obj.data?.id || obj.name)
      .filter((id): id is string => !!id);
    setSelectedLayerIds(ids);
  }, []);

  // Handle object modified
  const handleObjectModified = useCallback(() => {
    updateLayersFromCanvas();
  }, [updateLayersFromCanvas]);

  // Handle layer selection
  const handleLayerSelect = useCallback((layerId: string) => {
    if (!canvasRef.current) return;
    selectLayer(canvasRef.current, layerId);
  }, []);

  // Handle layer update
  const handleLayerUpdate = useCallback(
    (layerId: string, updates: Partial<Layer>) => {
      if (!canvasRef.current) return;
      updateLayer(canvasRef.current, layerId, updates);
      updateLayersFromCanvas();
    },
    [updateLayersFromCanvas]
  );

  // Handle layer delete
  const handleLayerDelete = useCallback(
    (layerId: string) => {
      if (!canvasRef.current) return;
      deleteLayer(canvasRef.current, layerId);
      updateLayersFromCanvas();
    },
    [updateLayersFromCanvas]
  );

  // Handle layer duplicate
  const handleLayerDuplicate = useCallback(
    (layerId: string) => {
      if (!canvasRef.current) return;
      duplicateLayer(canvasRef.current, layerId);
      updateLayersFromCanvas();
    },
    [updateLayersFromCanvas]
  );

  // Handle image upload
  const handleImageUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !canvasRef.current) return;

      setIsUploading(true);

      try {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!file.type.startsWith('image/')) continue;

          const img = await loadImage(file);
          const id = generateLayerId();

          // @ts-ignore - Fabric.js v6 type issue
          img.data = { id, name: file.name.replace(/\.[^/.]+$/, '') };

          // Scale image to fit canvas if too large
          const maxDim = 800;
          const scale = Math.min(
            1,
            maxDim / (img.width || 1),
            maxDim / (img.height || 1)
          );
          img.scale(scale);

          centerObject(canvasRef.current, img);
          canvasRef.current.add(img);
        }

        canvasRef.current.requestRenderAll();
        updateLayersFromCanvas();
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    },
    [updateLayersFromCanvas]
  );

  // Handle file input change
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleImageUpload(e.target.files);
      e.target.value = ''; // Reset input
    },
    [handleImageUpload]
  );

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (!historyRef.current) return;
    await historyRef.current.undo();
    updateLayersFromCanvas();
  }, [updateLayersFromCanvas]);

  // Handle redo
  const handleRedo = useCallback(async () => {
    if (!historyRef.current) return;
    await historyRef.current.redo();
    updateLayersFromCanvas();
  }, [updateLayersFromCanvas]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!canvasRef.current) return;

    const dataURL = canvasRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement('a');
    link.download = `shadeworks-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  }, []);

  // Handle add layer (trigger file upload)
  const handleAddLayer = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle tool settings change
  const handleToolSettingsChange = useCallback((updates: Partial<ToolSettings>) => {
    setToolSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      // Undo/Redo
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }

      // Export
      if (isMod && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }

      // Tool shortcuts
      if (!isMod) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setTool('select');
            break;
          case 'b':
            setTool('brush');
            break;
          case 'e':
            setTool('eraser');
            break;
          case 'r':
            setTool('rectangle');
            break;
          case 'o':
            setTool('circle');
            break;
          case 'l':
            setTool('line');
            break;
          case 't':
            setTool('text');
            break;
          case 'h':
            setTool('hand');
            break;
          case 'i':
            setTool('eyedropper');
            break;
        }
      }

      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvasRef.current && selectedLayerIds.length > 0) {
          e.preventDefault();
          selectedLayerIds.forEach((id) => {
            deleteLayer(canvasRef.current!, id);
          });
          updateLayersFromCanvas();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleExport, selectedLayerIds, updateLayersFromCanvas]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            title="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Image Editor</h1>
            <p className="text-xs text-muted-foreground">
              {layers.length === 0
                ? 'Upload an image to get started'
                : `${layers.length} ${layers.length === 1 ? 'layer' : 'layers'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4 mr-2" />
            Redo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            disabled={layers.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tools sidebar */}
        <ToolsPanel tool={tool} onToolChange={setTool} />

        {/* Canvas */}
        <div className="flex-1 relative">
          <EditorCanvas
            tool={tool}
            toolSettings={toolSettings}
            onCanvasReady={handleCanvasReady}
            onSelectionChange={handleSelectionChange}
            onObjectModified={handleObjectModified}
          />
        </div>

        {/* Right panel */}
        <div className="w-80 flex flex-col">
          {/* Properties */}
          <div className="flex-1 border-l border-border">
            <PropertiesPanel
              tool={tool}
              toolSettings={toolSettings}
              selectedLayers={layers.filter((l) => selectedLayerIds.includes(l.id))}
              onToolSettingsChange={handleToolSettingsChange}
            />
          </div>

          {/* Layers */}
          <div className="h-80 border-t border-border">
            <LayersPanel
              layers={layers}
              selectedLayerIds={selectedLayerIds}
              thumbnails={thumbnails}
              onLayerSelect={handleLayerSelect}
              onLayerUpdate={handleLayerUpdate}
              onLayerDelete={handleLayerDelete}
              onLayerDuplicate={handleLayerDuplicate}
              onAddLayer={handleAddLayer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
