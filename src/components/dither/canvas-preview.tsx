'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, SplitSquareHorizontal } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { BeforeAfterSlider } from './components/before-after-slider';
import { getModifierKey } from '@/lib/utils/platform';

interface CanvasPreviewProps {
  originalImage: ImageData | null;
  processedImage: ImageData | null;
  isProcessing: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  comparisonMode?: boolean;
  onComparisonModeChange?: (mode: boolean) => void;
  onRegisterZoomHandlers?: (handlers: {
    zoomIn: () => void;
    zoomOut: () => void;
    zoomFit: () => void;
  }) => void;
}

export function CanvasPreview({
  originalImage,
  processedImage,
  isProcessing,
  zoom,
  onZoomChange,
  comparisonMode: externalComparisonMode,
  onComparisonModeChange,
  onRegisterZoomHandlers,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [internalComparisonMode, setInternalComparisonMode] = useState(false);

  // Use external comparison mode if provided, otherwise use internal
  const comparisonMode = externalComparisonMode !== undefined ? externalComparisonMode : internalComparisonMode;

  // Get OS-appropriate modifier key
  const modKey = getModifierKey();

  // Derived values
  const displayImage = processedImage || originalImage;
  const canCompare = originalImage && processedImage;

  // Wheel zoom handler with native event listener to prevent browser zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Ctrl+Scroll or pinch-to-zoom (two-finger trackpad)
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom delta
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const prevZoom = zoom;
        const newZoom = Math.max(25, Math.min(400, prevZoom * delta));

        // Calculate canvas center position before zoom
        const canvasElement = canvasRef.current;
        if (canvasElement) {
          const canvasRect = canvasElement.getBoundingClientRect();
          const canvasCenterX = canvasRect.left + canvasRect.width / 2 - rect.left;
          const canvasCenterY = canvasRect.top + canvasRect.height / 2 - rect.top;

          // Calculate offset from mouse to canvas center
          const offsetX = mouseX - canvasCenterX;
          const offsetY = mouseY - canvasCenterY;

          // Adjust pan to keep the same point under cursor
          const scaleFactor = newZoom / prevZoom - 1;
          setPan((prevPan) => ({
            x: prevPan.x - offsetX * scaleFactor,
            y: prevPan.y - offsetY * scaleFactor,
          }));
        }

        onZoomChange(newZoom);
      } else {
        // Regular scroll for panning
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [onZoomChange, zoom]);

  // Draw image on canvas
  useEffect(() => {
    // Skip drawing if in comparison mode (BeforeAfterSlider handles it)
    if (comparisonMode && canCompare) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageToDisplay = processedImage || originalImage;

    if (!imageToDisplay) {
      // Clear canvas and show placeholder
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Set canvas size
    canvas.width = imageToDisplay.width;
    canvas.height = imageToDisplay.height;

    // Draw image
    ctx.putImageData(imageToDisplay, 0, 0);
  }, [originalImage, processedImage, comparisonMode, canCompare]);

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom * 1.25, 400));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom / 1.25, 25));
  };

  const handleFitToScreen = () => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imageWidth = canvasRef.current.width;
    const imageHeight = canvasRef.current.height;

    const scaleX = (containerWidth * 0.9) / imageWidth;
    const scaleY = (containerHeight * 0.9) / imageHeight;
    const scale = Math.min(scaleX, scaleY);

    onZoomChange(Math.round(scale * 100));
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Register zoom handlers with parent
  useEffect(() => {
    if (onRegisterZoomHandlers) {
      onRegisterZoomHandlers({
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        zoomFit: handleFitToScreen,
      });
    }
  }, [onRegisterZoomHandlers, handleZoomIn, handleZoomOut, handleFitToScreen]);

  const handleToggleComparison = () => {
    if (onComparisonModeChange) {
      onComparisonModeChange(!comparisonMode);
    } else {
      setInternalComparisonMode(!comparisonMode);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          disabled={zoom <= 25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleFitToScreen}
          disabled={!displayImage}
        >
          <Maximize2 className="h-4 w-4 mr-2" />
          Fit
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          disabled={zoom >= 400}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="flex items-center px-3 bg-card border border-border rounded-md text-sm">
          {Math.round(zoom)}%
        </div>
        <Button
          variant={comparisonMode ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleComparison}
          disabled={!canCompare}
          title="Compare before/after (C)"
        >
          <SplitSquareHorizontal className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute top-20 right-4 z-10 bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="text-sm mb-2">Processing...</p>
          <Progress value={undefined} className="w-32" />
        </div>
      )}

      {/* Canvas container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden"
        style={{
          cursor: comparisonMode && canCompare ? 'ew-resize' : 'move',
        }}
        onMouseDown={comparisonMode ? undefined : handleMouseDown}
        onMouseMove={comparisonMode ? undefined : handleMouseMove}
        onMouseUp={comparisonMode ? undefined : handleMouseUp}
        onMouseLeave={comparisonMode ? undefined : handleMouseUp}
      >
        {!displayImage ? (
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No image loaded</p>
            <p className="text-sm">Upload an image to get started</p>
          </div>
        ) : comparisonMode && canCompare ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            <BeforeAfterSlider
              originalImage={originalImage}
              processedImage={processedImage}
              zoom={zoom}
            />
          </div>
        ) : displayImage ? (
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px)`,
              imageRendering: zoom > 100 ? 'pixelated' : 'auto',
            }}
          >
            <canvas
              ref={canvasRef}
              style={{
                width: `${displayImage.width * (zoom / 100)}px`,
                height: `${displayImage.height * (zoom / 100)}px`,
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                background:
                  'repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
              }}
            />
          </div>
        ) : null}
      </div>

      {/* Image info */}
      {displayImage && (
        <div className="absolute bottom-4 left-4 z-10 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
          {displayImage.width} × {displayImage.height}
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <KbdGroup>
            <Kbd>{modKey}</Kbd>
            <span>+</span>
            <Kbd>S</Kbd>
          </KbdGroup>
          <span>Export</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>C</Kbd>
          <span>Compare</span>
        </div>
        <div className="flex items-center gap-2">
          <KbdGroup>
            <Kbd>+</Kbd>
            <span>/</span>
            <Kbd>-</Kbd>
          </KbdGroup>
          <span>Zoom</span>
        </div>
        <div className="flex items-center gap-2">
          <Kbd>0</Kbd>
          <span>Fit</span>
        </div>
        <div className="border-t border-border pt-1.5 mt-0.5">
          <KbdGroup>
            <Kbd>{modKey}</Kbd>
            <span className="mx-1">+</span>
            <span>Scroll to zoom</span>
          </KbdGroup>
        </div>
      </div>
    </div>
  );
}
