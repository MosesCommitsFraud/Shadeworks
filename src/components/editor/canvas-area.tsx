'use client';

import { useEffect, useRef, useState } from 'react';
import { Progress } from '@/components/ui/progress';

interface CanvasAreaProps {
  canvasRef: (element: HTMLCanvasElement) => void | (() => void);
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  originalImage: ImageData | null;
  isProcessing: boolean;
  processingProgress?: number;
}

export function CanvasArea({
  canvasRef,
  zoom,
  pan,
  onPanChange,
  originalImage,
  isProcessing,
  processingProgress = 0,
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize canvas
  useEffect(() => {
    if (canvasElementRef.current) {
      const cleanup = canvasRef(canvasElementRef.current);
      return cleanup;
    }
  }, [canvasRef]);

  // Handle wheel zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        // Zoom handled by parent component
      } else {
        // Pan
        e.preventDefault();
        onPanChange({
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pan, onPanChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.spaceKey) {
      // Middle mouse or space key
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden relative bg-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute top-4 right-4 z-10 bg-card border border-border rounded-lg p-4 shadow-lg min-w-[200px]">
          <p className="text-sm mb-2">Processing...</p>
          <Progress value={processingProgress || undefined} className="w-full" />
        </div>
      )}

      {/* Canvas wrapper */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center center',
        }}
      >
        <canvas
          ref={canvasElementRef}
          className="shadow-2xl"
          style={{
            background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
          }}
        />
      </div>

      {/* No image placeholder */}
      {!originalImage && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">No image loaded</p>
            <p className="text-sm">Upload an image to get started</p>
          </div>
        </div>
      )}

      {/* Image info */}
      {originalImage && (
        <div className="absolute bottom-4 left-4 z-10 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground">
          {originalImage.width} × {originalImage.height}
        </div>
      )}
    </div>
  );
}
