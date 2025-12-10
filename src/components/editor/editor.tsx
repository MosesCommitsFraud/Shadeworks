'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, FabricImage } from 'fabric';
import type { Tool, Layer, AdjustmentSettings } from '@/lib/editor/types';
import { DEFAULT_ADJUSTMENT_SETTINGS } from '@/lib/editor/types';
import { createLayer } from '@/lib/editor/layer-manager';
import { applyBasicAdjustments, debounce } from '@/lib/editor/adjustment-processor';
import { CanvasArea } from './canvas-area';
import { ToolsPanel } from './tools-panel';
import { AdjustmentsPanel } from './adjustments-panel';
import { Toolbar } from './toolbar';
import { ExportDialog } from './export-dialog';
import { ShortcutsDialog } from './shortcuts-dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { registerShortcuts, type ShortcutAction } from '@/lib/editor/keyboard-shortcuts';

export function Editor() {
  const canvasRef = useRef<Canvas | null>(null);
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [processedImage, setProcessedImage] = useState<ImageData | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [adjustments, setAdjustments] = useState<AdjustmentSettings>(DEFAULT_ADJUSTMENT_SETTINGS);
  const [isProcessing, setIsProcessing] = useState(false);

  // Panel visibility
  const [showAdjustmentsPanel, setShowAdjustmentsPanel] = useState(true);
  const [showToolsPanel, setShowToolsPanel] = useState(true);

  // Dialogs
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);

  // Initialize Fabric.js canvas
  const initializeCanvas = useCallback((element: HTMLCanvasElement) => {
    if (!element || canvasRef.current) return;

    const canvas = new Canvas(element, {
      width: 800,
      height: 600,
      backgroundColor: '#1a1a1a',
      selection: activeTool === 'select',
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [activeTool]);

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to get ImageData
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);

        // Store original image
        setOriginalImage(imageData);

        // Create initial layer
        const layer = createLayer('image', 'Background', imageData);
        setLayers([layer]);
        setActiveLayerId(layer.id);

        // Add to Fabric canvas
        if (canvasRef.current) {
          FabricImage.fromURL(e.target?.result as string).then((fabricImg) => {
            if (!canvasRef.current) return;

            fabricImg.set({
              left: 0,
              top: 0,
              selectable: true,
            });

            canvasRef.current.clear();
            canvasRef.current.add(fabricImg);
            canvasRef.current.renderAll();

            // Resize canvas to fit image
            canvasRef.current.setDimensions({
              width: Math.min(img.width, 1200),
              height: Math.min(img.height, 800),
            });
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  // Update tool selection
  const handleToolChange = useCallback((tool: Tool) => {
    setActiveTool(tool);
    if (canvasRef.current) {
      canvasRef.current.selection = tool === 'select';
    }
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.25, 1000));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.25, 25));
  }, []);

  const handleZoomFit = useCallback(() => {
    if (canvasRef.current && originalImage) {
      const containerWidth = 1200; // TODO: Get from container
      const containerHeight = 800;
      const imageWidth = originalImage.width;
      const imageHeight = originalImage.height;

      const scaleX = (containerWidth * 0.9) / imageWidth;
      const scaleY = (containerHeight * 0.9) / imageHeight;
      const scale = Math.min(scaleX, scaleY);

      setZoom(Math.round(scale * 100));
      setPan({ x: 0, y: 0 });
    }
  }, [originalImage]);

  // Process image with current adjustments
  const processImage = useCallback(() => {
    if (!originalImage) return;

    setIsProcessing(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const processed = applyBasicAdjustments(originalImage, adjustments.basic);
        setProcessedImage(processed);

        // Update canvas
        if (canvasRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = processed.width;
          canvas.height = processed.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.putImageData(processed, 0, 0);

            FabricImage.fromURL(canvas.toDataURL()).then((fabricImg) => {
              if (!canvasRef.current) return;

              fabricImg.set({
                left: 0,
                top: 0,
                selectable: true,
              });

              canvasRef.current.clear();
              canvasRef.current.add(fabricImg);
              canvasRef.current.renderAll();
            });
          }
        }
      } catch (error) {
        console.error('Error processing image:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 10);
  }, [originalImage, adjustments]);

  // Debounced version for real-time preview
  const debouncedProcessImage = useCallback(
    debounce(processImage, 300),
    [processImage]
  );

  // Process image when adjustments change
  useEffect(() => {
    if (originalImage) {
      debouncedProcessImage();
    }
  }, [originalImage, adjustments, debouncedProcessImage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleShortcut = (action: ShortcutAction) => {
      switch (action) {
        case 'export':
          if (originalImage) setShowExportDialog(true);
          break;
        case 'fit':
          handleZoomFit();
          break;
        case 'zoom100':
          setZoom(100);
          break;
        case 'zoomIn':
          handleZoomIn();
          break;
        case 'zoomOut':
          handleZoomOut();
          break;
        case 'toggleAdjustmentsPanel':
          setShowAdjustmentsPanel(prev => !prev);
          break;
        case 'toggleToolsPanel':
          setShowToolsPanel(prev => !prev);
          break;
      }
    };

    return registerShortcuts(handleShortcut);
  }, [originalImage, handleZoomFit, handleZoomIn, handleZoomOut]);

  return (
    <div className="flex flex-col h-screen bg-background select-none">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">Image Editor</h1>
            </div>
            <p className="text-xs text-muted-foreground">
              {originalImage
                ? `${originalImage.width}×${originalImage.height}px`
                : 'Upload an image to get started'}
            </p>
          </div>
        </div>
        <Toolbar
          onImageUpload={handleImageUpload}
          hasImage={!!originalImage}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomFit={handleZoomFit}
          onExport={() => setShowExportDialog(true)}
          onShowShortcuts={() => setShowShortcutsDialog(true)}
        />
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tools Panel */}
        {showToolsPanel && (
          <ToolsPanel
            activeTool={activeTool}
            onToolChange={handleToolChange}
          />
        )}

        {/* Canvas */}
        <CanvasArea
          canvasRef={initializeCanvas}
          zoom={zoom}
          pan={pan}
          onPanChange={setPan}
          originalImage={originalImage}
          isProcessing={isProcessing}
        />

        {/* Adjustments Panel */}
        {showAdjustmentsPanel && (
          <AdjustmentsPanel
            adjustments={adjustments}
            onAdjustmentsChange={setAdjustments}
            hasImage={!!originalImage}
            layers={layers}
            activeLayerId={activeLayerId}
            onLayerSelect={setActiveLayerId}
            onLayersChange={setLayers}
          />
        )}
      </div>

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        imageData={processedImage || originalImage}
      />

      {/* Shortcuts Dialog */}
      <ShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={setShowShortcutsDialog}
      />
    </div>
  );
}
