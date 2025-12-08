'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface BeforeAfterSliderProps {
  originalImage: ImageData;
  processedImage: ImageData;
  zoom: number;
  className?: string;
}

export function BeforeAfterSlider({
  originalImage,
  processedImage,
  zoom,
  className,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50); // Percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);

  // Draw images to canvases
  useEffect(() => {
    if (!originalCanvasRef.current || !processedCanvasRef.current) return;

    const originalCanvas = originalCanvasRef.current;
    const processedCanvas = processedCanvasRef.current;

    // Set canvas sizes to actual image dimensions (will be scaled via CSS)
    const width = originalImage.width;
    const height = originalImage.height;

    originalCanvas.width = width;
    originalCanvas.height = height;
    processedCanvas.width = width;
    processedCanvas.height = height;

    const originalCtx = originalCanvas.getContext('2d')!;
    const processedCtx = processedCanvas.getContext('2d')!;

    // Draw original image at native size
    originalCtx.putImageData(originalImage, 0, 0);

    // Draw processed image at native size
    processedCtx.putImageData(processedImage, 0, 0);
  }, [originalImage, processedImage]);

  // Handle mouse/touch move
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  // Mouse events
  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events
  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSliderPosition((prev) => Math.max(0, prev - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        setSliderPosition((prev) => Math.min(100, prev + 1));
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global mouse/touch up events
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalTouchEnd = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchend', handleGlobalTouchEnd);
    }

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging]);

  const scaledWidth = originalImage.width * (zoom / 100);
  const scaledHeight = originalImage.height * (zoom / 100);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block overflow-hidden cursor-ew-resize select-none',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Processed image (full width) */}
      <canvas
        ref={processedCanvasRef}
        style={{
          display: 'block',
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          imageRendering: zoom > 100 ? 'pixelated' : 'auto',
          background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
      />

      {/* Original image (clipped by slider position) */}
      <div
        className="absolute top-0 left-0 overflow-hidden"
        style={{ width: `${sliderPosition}%`, height: '100%' }}
      >
        <canvas
          ref={originalCanvasRef}
          style={{
            display: 'block',
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            imageRendering: zoom > 100 ? 'pixelated' : 'auto',
            background: 'repeating-conic-gradient(#e5e5e5 0% 25%, #ffffff 0% 50%) 50% / 20px 20px',
          }}
        />
      </div>

      {/* Slider line and handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-accent pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
          <div className="w-8 h-8 rounded-full bg-accent shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-background flex items-center justify-center">
              <svg
                className="w-3 h-3 text-accent"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M15 19l-7-7 7-7" />
                <path d="M9 19l7-7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 px-2 py-1 rounded bg-background/80 text-xs font-medium pointer-events-none">
        Original
      </div>
      <div className="absolute top-2 right-2 px-2 py-1 rounded bg-background/80 text-xs font-medium pointer-events-none">
        Processed
      </div>
    </div>
  );
}
