'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { initializeCanvas, generateLayerId } from '@/lib/editor/fabric-helpers';
import { CanvasHistory } from '@/lib/editor/history';
import type { Tool, ToolSettings } from '@/lib/editor/types';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditorCanvasProps {
  tool: Tool;
  toolSettings: ToolSettings;
  onCanvasReady: (canvas: fabric.Canvas, history: CanvasHistory) => void;
  onSelectionChange: (objects: fabric.Object[]) => void;
  onObjectModified: () => void;
}

export function EditorCanvas({
  tool,
  toolSettings,
  onCanvasReady,
  onSelectionChange,
  onObjectModified,
}: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<CanvasHistory | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingObject, setDrawingObject] = useState<fabric.Object | null>(null);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const canvas = initializeCanvas(canvasRef.current, width, height);
    const history = new CanvasHistory(canvas);

    fabricCanvasRef.current = canvas;
    historyRef.current = history;

    // Set up event listeners
    canvas.on('selection:created', (e) => {
      onSelectionChange(e.selected || []);
    });

    canvas.on('selection:updated', (e) => {
      onSelectionChange(e.selected || []);
    });

    canvas.on('selection:cleared', () => {
      onSelectionChange([]);
    });

    canvas.on('object:modified', () => {
      history.saveState();
      onObjectModified();
    });

    canvas.on('object:added', () => {
      history.saveState();
      onObjectModified();
    });

    canvas.on('object:removed', () => {
      history.saveState();
      onObjectModified();
    });

    // Notify parent
    onCanvasReady(canvas, history);

    return () => {
      canvas.dispose();
    };
  }, [onCanvasReady, onSelectionChange, onObjectModified]);

  // Handle tool changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Reset drawing modes
    canvas.isDrawingMode = false;
    canvas.selection = true;

    switch (tool) {
      case 'select':
        canvas.selection = true;
        canvas.defaultCursor = 'default';
        break;

      case 'brush':
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = toolSettings.strokeColor;
        canvas.freeDrawingBrush.width = toolSettings.strokeWidth;
        break;

      case 'eraser':
        // Use white pencil brush as eraser (draw with background color)
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = '#ffffff'; // Use white as eraser
        canvas.freeDrawingBrush.width = toolSettings.strokeWidth;
        break;

      case 'hand':
        canvas.selection = false;
        canvas.defaultCursor = 'grab';
        break;

      default:
        canvas.selection = true;
        canvas.defaultCursor = 'crosshair';
        break;
    }

    canvas.requestRenderAll();
  }, [tool, toolSettings]);

  // Handle zoom
  const handleZoom = useCallback((delta: number) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
    setZoom(newZoom);
    canvas.setZoom(newZoom);
    canvas.requestRenderAll();
  }, [zoom]);

  const handleZoomIn = useCallback(() => handleZoom(0.1), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom(-0.1), [handleZoom]);

  const handleFitToScreen = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const objects = canvas.getObjects();
    if (objects.length === 0) {
      setZoom(1);
      canvas.setZoom(1);
      canvas.requestRenderAll();
      return;
    }

    // Get bounding box of all objects
    const group = new fabric.Group(objects);
    const boundingBox = group.getBoundingRect();
    group.destroy();

    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = containerRef.current?.clientHeight || 600;
    const padding = 40;

    // Calculate scale to fit
    const scaleX = (containerWidth - padding * 2) / boundingBox.width;
    const scaleY = (containerHeight - padding * 2) / boundingBox.height;
    const scale = Math.min(scaleX, scaleY, 1);

    setZoom(scale);
    canvas.setZoom(scale);
    canvas.requestRenderAll();
  }, []);

  // Handle panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'hand' || e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [tool, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Handle wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        handleZoom(delta);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleZoom]);

  return (
    <div className="flex flex-col h-full bg-muted/10">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom Out (Ctrl + -)"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleFitToScreen}
          title="Fit to Screen (Ctrl + 0)"
          className="px-3"
        >
          <Maximize2 className="h-4 w-4 mr-1" />
          {Math.round(zoom * 100)}%
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom In (Ctrl + +)"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: isPanning ? 'grabbing' : undefined }}
      >
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
