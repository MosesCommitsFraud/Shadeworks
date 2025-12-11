'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Download, ZoomIn, ZoomOut, Maximize2, Crop, Paintbrush, Eraser, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModernSlider } from '@/components/ui/modern-slider';
import { useRouter } from 'next/navigation';

type ViewState = 'original' | 'comparing' | 'processed';
type Tool = 'none' | 'crop' | 'brush' | 'erase';

interface BrushStroke {
  points: { x: number; y: number }[];
  size: number;
  strength: number;
  type: 'restore' | 'erase';
}

export function BackgroundRemover() {
  const router = useRouter();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [selectedScale, setSelectedScale] = useState<number>(1);
  const [jpgQuality, setJpgQuality] = useState<number>(95);
  const [webpQuality, setWebpQuality] = useState<number>(90);
  const [viewState, setViewState] = useState<ViewState>('original');
  const [swipePosition, setSwipePosition] = useState(0);

  // Zoom and pan state
  const [zoom, setZoom] = useState<number>(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>('none');
  const [brushSize, setBrushSize] = useState<number>(50);
  const [brushStrength, setBrushStrength] = useState<number>(100);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [undoStack, setUndoStack] = useState<BrushStroke[][]>([]);
  const [redoStack, setRedoStack] = useState<BrushStroke[][]>([]);

  // Crop state
  const [cropArea, setCropArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const workingCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalImageDataRef = useRef<ImageData | null>(null);
  const processedImageDataRef = useRef<ImageData | null>(null);

  // Ensure we have an offscreen working canvas for brush operations
  useEffect(() => {
    if (!workingCanvasRef.current) {
      workingCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  const convertImageToPNG = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setProcessedImage(null);
    setBrushStrokes([]);
    setUndoStack([]);
    setRedoStack([]);
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setActiveTool('none');

    try {
      const pngDataUrl = await convertImageToPNG(file);
      setOriginalImage(pngDataUrl);
    } catch (err) {
      setError('Failed to load image');
      console.error(err);
    }
  }, [convertImageToPNG]);

  const handleRemoveBackground = useCallback(async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);
    setBrushStrokes([]);
    setUndoStack([]);
    setRedoStack([]);

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const blob = await removeBackground(originalImage, {
        progress: (_key, current, total) => {
          setProgress(`Processing: ${Math.round((current / total) * 100)}%`);
        },
      });

      const url = URL.createObjectURL(blob);

      // Load both images and their data before starting animation
      const processedImg = new Image();
      const originalImg = new Image();

      await Promise.all([
        new Promise<void>((resolve) => {
          processedImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = processedImg.width;
            canvas.height = processedImg.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(processedImg, 0, 0);
              processedImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            resolve();
          };
          processedImg.src = url;
        }),
        new Promise<void>((resolve) => {
          originalImg.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = originalImg.width;
            canvas.height = originalImg.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(originalImg, 0, 0);
              originalImageDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            resolve();
          };
          originalImg.src = originalImage;
        })
      ]);

      setProcessedImage(url);

      // Start comparison animation
      setViewState('comparing');
      setSwipePosition(0);
    } catch (err) {
      console.error('Error removing background:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove background');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  }, [originalImage]);

  // Animate the swipe comparison when processing completes
  useEffect(() => {
    if (viewState === 'comparing') {
      let animationFrame: number;
      let startTime = Date.now();
      const duration = 2500;
      const pauseAtEnd = 800;

      const animate = () => {
        const elapsed = Date.now() - startTime;

        if (elapsed < duration) {
          const progress = elapsed / duration;
          const eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          setSwipePosition(eased * 100);
          animationFrame = requestAnimationFrame(animate);
        } else if (elapsed < duration + pauseAtEnd) {
          setSwipePosition(100);
          animationFrame = requestAnimationFrame(animate);
        } else {
          setViewState('processed');
        }
      };

      animationFrame = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [viewState]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.25, 1000));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.25, 25));
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const imageWidth = canvasRef.current.width;
    const imageHeight = canvasRef.current.height;

    const scaleX = (containerWidth * 0.9) / imageWidth;
    const scaleY = (containerHeight * 0.9) / imageHeight;
    const scale = Math.min(scaleX, scaleY);

    setZoom(Math.round(scale * 100));
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleFitToScreen();
      }
      // Undo/Redo
      else if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleFitToScreen]);

  // Wheel handling: pinch/ctrl+wheel zooms, two-finger scroll pans
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

        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const prevZoom = zoom;
        const newZoom = Math.max(25, Math.min(1000, prevZoom * delta));

        // Zoom towards mouse position
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const offsetX = mouseX - centerX;
        const offsetY = mouseY - centerY;

        const scaleFactor = newZoom / prevZoom - 1;
        setPan((prevPan) => ({
          x: prevPan.x - offsetX * scaleFactor,
          y: prevPan.y - offsetY * scaleFactor,
        }));

        setZoom(newZoom);
      } else {
        // Regular scroll for panning
        e.preventDefault();
        setPan((prev) => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom]);

  // Get canvas coordinates from mouse event
  const getCanvasCoords = useCallback((e: React.MouseEvent): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height);

    return { x, y };
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Allow panning with middle click or shift+drag regardless of tool
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    // Always allow panning with left click when no tool is active
    if (activeTool === 'none') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === 'crop' && viewState === 'processed') {
      const coords = getCanvasCoords(e);
      if (coords) {
        setCropStart(coords);
        setCropArea({ ...coords, width: 0, height: 0 });
      }
    } else if ((activeTool === 'brush' || activeTool === 'erase') && viewState === 'processed') {
      const coords = getCanvasCoords(e);
      if (coords) {
        setIsDrawing(true);
        setCurrentStroke({
          points: [coords],
          size: brushSize,
          strength: brushStrength,
          type: activeTool === 'brush' ? 'restore' : 'erase',
        });
      }
    }
  }, [activeTool, pan, brushSize, brushStrength, getCanvasCoords, viewState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (activeTool === 'crop' && cropStart && viewState === 'processed') {
      const coords = getCanvasCoords(e);
      if (coords) {
        setCropArea({
          x: Math.min(cropStart.x, coords.x),
          y: Math.min(cropStart.y, coords.y),
          width: Math.abs(coords.x - cropStart.x),
          height: Math.abs(coords.y - cropStart.y),
        });
      }
    } else if (isDrawing && currentStroke && viewState === 'processed') {
      const coords = getCanvasCoords(e);
      if (coords) {
        setCurrentStroke({
          ...currentStroke,
          points: [...currentStroke.points, coords],
        });
      }
    }
  }, [isPanning, panStart, activeTool, cropStart, isDrawing, currentStroke, getCanvasCoords, viewState]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);

    if (activeTool === 'crop' && cropArea && cropArea.width > 0 && cropArea.height > 0) {
      applyCrop();
      setCropStart(null);
      setCropArea(null);
    }

    if (isDrawing && currentStroke && currentStroke.points.length > 1) {
      const newStrokes = [...brushStrokes, currentStroke];
      setBrushStrokes(newStrokes);
      setUndoStack([...undoStack, brushStrokes]);
      setRedoStack([]);
      setCurrentStroke(null);
      setIsDrawing(false);

      // Apply the stroke to the canvas
      applyBrushStrokes(newStrokes);
    } else {
      setCurrentStroke(null);
      setIsDrawing(false);
    }
  }, [activeTool, cropArea, isDrawing, currentStroke, brushStrokes, undoStack]);

  const applyCrop = useCallback(async () => {
    if (!cropArea || !processedImage) return;

    // Render the current processed image (without overlays) to an offscreen canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = processedImage;
    });

    if (!img.width || !img.height) return;

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = img.width;
    sourceCanvas.height = img.height;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (!sourceCtx) return;
    sourceCtx.drawImage(img, 0, 0);

    const x = Math.floor(cropArea.x);
    const y = Math.floor(cropArea.y);
    const w = Math.floor(cropArea.width);
    const h = Math.floor(cropArea.height);
    if (w <= 0 || h <= 0) return;

    let croppedData: ImageData;
    try {
      croppedData = sourceCtx.getImageData(x, y, w, h);
    } catch {
      return;
    }

    // Update visible canvas to show crop
    if (canvasRef.current) {
      const displayCanvas = canvasRef.current;
      const displayCtx = displayCanvas.getContext('2d');
      if (displayCtx) {
        displayCanvas.width = w;
        displayCanvas.height = h;
        displayCtx.putImageData(croppedData, 0, 0);
      }
    }

    // Create a new data URL from cropped pixels
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = w;
    cropCanvas.height = h;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;
    cropCtx.putImageData(croppedData, 0, 0);
    const url = cropCanvas.toDataURL('image/png');
    setProcessedImage(url);

    processedImageDataRef.current = croppedData;

    // Crop original image data to stay aligned
    if (originalImageDataRef.current) {
      try {
        const croppedOrig = new ImageData(
          new Uint8ClampedArray(originalImageDataRef.current.data),
          originalImageDataRef.current.width,
          originalImageDataRef.current.height
        );
        const origCanvas = document.createElement('canvas');
        origCanvas.width = croppedOrig.width;
        origCanvas.height = croppedOrig.height;
        const origCtx = origCanvas.getContext('2d');
        if (origCtx) {
          origCtx.putImageData(croppedOrig, 0, 0);
          originalImageDataRef.current = origCtx.getImageData(x, y, w, h);
        }
      } catch {
        // ignore if out of bounds
      }
    }

    setActiveTool('none');
    setBrushStrokes([]);
    setUndoStack([]);
    setRedoStack([]);
  }, [cropArea, processedImage]);

  const applyBrushStrokes = useCallback((strokes: BrushStroke[]) => {
    if (!processedImageDataRef.current || !originalImageDataRef.current || !workingCanvasRef.current) {
      console.error('Missing image data or canvas for brush strokes');
      return;
    }

    const canvas = workingCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start with a fresh copy of the original processed image (without any previous strokes)
    const baseImageData = processedImageDataRef.current;
    const workingData = new ImageData(
      new Uint8ClampedArray(baseImageData.data),
      baseImageData.width,
      baseImageData.height
    );

    // Apply each stroke
    strokes.forEach((stroke) => {
      stroke.points.forEach((point, i) => {
        if (i === 0) return;

        const prevPoint = stroke.points[i - 1];
        const distance = Math.hypot(point.x - prevPoint.x, point.y - prevPoint.y);
        const steps = Math.max(1, Math.ceil(distance / 2));

        for (let step = 0; step <= steps; step++) {
          const t = steps > 0 ? step / steps : 0;
          const x = Math.round(prevPoint.x + (point.x - prevPoint.x) * t);
          const y = Math.round(prevPoint.y + (point.y - prevPoint.y) * t);

          // Draw circle at this point
          for (let dy = -stroke.size; dy <= stroke.size; dy++) {
            for (let dx = -stroke.size; dx <= stroke.size; dx++) {
              const dist = Math.hypot(dx, dy);
              if (dist > stroke.size) continue;

              const px = x + dx;
              const py = y + dy;

              if (px < 0 || px >= workingData.width || py < 0 || py >= workingData.height) continue;

              const idx = (py * workingData.width + px) * 4;
              const alpha = (1 - dist / stroke.size) * (stroke.strength / 100);

              if (stroke.type === 'restore') {
                // Restore from original - blend the original image back in
                if (originalImageDataRef.current) {
                  const origR = originalImageDataRef.current.data[idx];
                  const origG = originalImageDataRef.current.data[idx + 1];
                  const origB = originalImageDataRef.current.data[idx + 2];
                  const origA = originalImageDataRef.current.data[idx + 3];

                  workingData.data[idx] = Math.round(workingData.data[idx] * (1 - alpha) + origR * alpha);
                  workingData.data[idx + 1] = Math.round(workingData.data[idx + 1] * (1 - alpha) + origG * alpha);
                  workingData.data[idx + 2] = Math.round(workingData.data[idx + 2] * (1 - alpha) + origB * alpha);
                  workingData.data[idx + 3] = Math.round(workingData.data[idx + 3] * (1 - alpha) + origA * alpha);
                }
              } else {
                // Erase - reduce alpha channel only
                workingData.data[idx + 3] = Math.round(workingData.data[idx + 3] * (1 - alpha));
              }
            }
          }
        }
      });
    });

    canvas.width = workingData.width;
    canvas.height = workingData.height;
    ctx.putImageData(workingData, 0, 0);

    // Update processed image
    const url = canvas.toDataURL('image/png');
    setProcessedImage(url);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const newUndoStack = [...undoStack];
    const prevState = newUndoStack.pop()!;
    setUndoStack(newUndoStack);
    setRedoStack([...redoStack, brushStrokes]);
    setBrushStrokes(prevState);
    applyBrushStrokes(prevState);
  }, [undoStack, redoStack, brushStrokes, applyBrushStrokes]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop()!;
    setRedoStack(newRedoStack);
    setUndoStack([...undoStack, brushStrokes]);
    setBrushStrokes(nextState);
    applyBrushStrokes(nextState);
  }, [redoStack, undoStack, brushStrokes, applyBrushStrokes]);

  const downloadImage = useCallback(async () => {
    if (!canvasRef.current) return;

    const format = selectedFormat;
    const scale = selectedScale;
    const quality = format === 'jpg' ? jpgQuality / 100 : format === 'webp' ? webpQuality / 100 : 1;

    try {
      const sourceCanvas = canvasRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = sourceCanvas.width * scale;
      canvas.height = sourceCanvas.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (format === 'jpg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(sourceCanvas, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const scaleSuffix = scale !== 1 ? `_${scale}x` : '';
        link.download = `no-background${scaleSuffix}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }, `image/${format === 'jpg' ? 'jpeg' : format}`, quality);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download image');
    }
  }, [selectedFormat, selectedScale, jpgQuality, webpQuality]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    setViewState('original');
    setSwipePosition(0);
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setBrushStrokes([]);
    setUndoStack([]);
    setRedoStack([]);
    setActiveTool('none');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (viewState === 'processed' && processedImage) {
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Draw current stroke preview
        if (currentStroke && currentStroke.points.length > 0) {
          ctx.save();
          currentStroke.points.forEach((point, i) => {
            if (i === 0) return;
            const prevPoint = currentStroke.points[i - 1];

            ctx.strokeStyle = currentStroke.type === 'restore' ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = currentStroke.size * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(point.x, point.y);
            ctx.stroke();
          });
          ctx.restore();
        }

        // Draw crop area
        if (cropArea && activeTool === 'crop') {
          ctx.save();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2 / (zoom / 100);
          ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);
          ctx.restore();
        }
      };
      img.src = processedImage;
    }
  }, [viewState, processedImage, currentStroke, cropArea, activeTool, zoom]);

  const getCursor = () => {
    if (activeTool === 'crop') return 'crosshair';
    if (activeTool === 'brush' || activeTool === 'erase') return 'crosshair';
    return isPanning ? 'grabbing' : 'grab';
  };

  return (
    <div className="flex flex-col h-screen bg-background select-none">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Background Remover</h1>
          </div>
        </div>

        {/* Zoom controls in header */}
        {originalImage && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 25}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-3 h-9 bg-muted rounded-md text-sm min-w-[70px] justify-center">
              {Math.round(zoom)}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 1000}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFitToScreen}
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fit
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {!originalImage ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full max-w-2xl border-2 border-dashed border-border rounded-lg p-16 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-20 h-20 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <p className="text-xl font-medium">Drop an image here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports JPG, PNG, WEBP, AVIF and more
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Preview Area */}
            <div
              ref={containerRef}
              className="flex-1 overflow-hidden flex items-center justify-center bg-background relative"
              style={{ cursor: getCursor() }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px)`,
                }}
              >
                {viewState === 'original' && (
                  <div className="relative">
                    <img
                      src={originalImage}
                      alt="Original"
                      style={{
                        width: `${zoom}%`,
                        imageRendering: zoom > 100 ? 'pixelated' : 'auto',
                      }}
                      className="object-contain max-w-none"
                      crossOrigin="anonymous"
                    />
                    {!processedImage && !isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-card/90 backdrop-blur-sm px-6 py-3 rounded-lg border border-border">
                          <p className="text-sm text-muted-foreground">
                            Click "Remove Background" to start
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {viewState === 'comparing' && processedImage && (
                  <div className="relative">
                    <img
                      src={originalImage}
                      alt="Original"
                      style={{
                        width: `${zoom}%`,
                        imageRendering: zoom > 100 ? 'pixelated' : 'auto',
                      }}
                      className="object-contain max-w-none"
                      crossOrigin="anonymous"
                    />

                    <div
                      className="absolute inset-0 overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:20px_20px] rounded-lg"
                      style={{
                        clipPath: `inset(0 ${100 - swipePosition}% 0 0)`
                      }}
                    >
                      <img
                        src={processedImage}
                        alt="Processed"
                        style={{
                          width: `${zoom}%`,
                          imageRendering: zoom > 100 ? 'pixelated' : 'auto',
                        }}
                        className="object-contain max-w-none"
                      />
                    </div>

                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-accent shadow-lg"
                      style={{
                        left: `${swipePosition}%`,
                        transition: 'left 0.05s linear'
                      }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-xl">
                        <div className="w-6 h-6 border-2 border-white rounded-full" />
                      </div>
                    </div>
                  </div>
                )}

                {viewState === 'processed' && processedImage && (
                  <canvas
                    ref={canvasRef}
                    style={{
                      width: `${zoom}%`,
                      imageRendering: zoom > 100 ? 'pixelated' : 'auto',
                      background: 'repeating-conic-gradient(#e5e7eb 0% 25%, white 0% 50%) 50% / 20px 20px',
                      maxWidth: 'none',
                    }}
                    className="rounded-lg shadow-lg"
                  />
                )}
              </div>

              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md z-50">
                  <div className="flex flex-col items-center gap-4 bg-card px-8 py-6 rounded-lg border border-border shadow-xl">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium text-lg">{progress || 'Processing image...'}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive text-destructive px-6 py-3 rounded-lg max-w-md z-50">
                  {error}
                </div>
              )}
            </div>

            {/* Right Sidebar - Controls */}
            <div className="w-80 border-l border-border bg-card/50 backdrop-blur-sm overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Process Button */}
                <div>
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (progress || 'Processing...') : 'Remove Background'}
                  </Button>
                </div>

                {processedImage && viewState === 'processed' && (
                  <>
                    {/* Tools */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Tools</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={activeTool === 'crop' ? 'default' : 'outline'}
                          onClick={() => setActiveTool(activeTool === 'crop' ? 'none' : 'crop')}
                          size="sm"
                        >
                          <Crop className="w-4 h-4 mr-2" />
                          Crop
                        </Button>
                        <Button
                          variant={activeTool === 'brush' ? 'default' : 'outline'}
                          onClick={() => setActiveTool(activeTool === 'brush' ? 'none' : 'brush')}
                          size="sm"
                        >
                          <Paintbrush className="w-4 h-4 mr-2" />
                          Restore
                        </Button>
                        <Button
                          variant={activeTool === 'erase' ? 'default' : 'outline'}
                          onClick={() => setActiveTool(activeTool === 'erase' ? 'none' : 'erase')}
                          size="sm"
                        >
                          <Eraser className="w-4 h-4 mr-2" />
                          Erase
                        </Button>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUndo}
                            disabled={undoStack.length === 0}
                            className="flex-1"
                          >
                            <Undo className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            className="flex-1"
                          >
                            <Redo className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Brush Settings */}
                    {(activeTool === 'brush' || activeTool === 'erase') && (
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <ModernSlider
                          label="Brush Size"
                          value={brushSize}
                          onChange={setBrushSize}
                          min={1}
                          max={100}
                          step={1}
                          formatValue={(v) => `${v}px`}
                        />
                        <ModernSlider
                          label="Brush Strength"
                          value={brushStrength}
                          onChange={setBrushStrength}
                          min={1}
                          max={100}
                          step={1}
                          formatValue={(v) => `${v}%`}
                        />
                      </div>
                    )}

                    {/* Export Format */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Export Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedFormat === 'png' ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat('png')}
                          size="sm"
                        >
                          PNG
                        </Button>
                        <Button
                          variant={selectedFormat === 'jpg' ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat('jpg')}
                          size="sm"
                        >
                          JPG
                        </Button>
                        <Button
                          variant={selectedFormat === 'webp' ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat('webp')}
                          size="sm"
                        >
                          WebP
                        </Button>
                      </div>
                    </div>

                    {/* Image Scale */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Image Scale</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[0.25, 0.5, 0.75, 1, 1.5, 2].map((scale) => (
                          <Button
                            key={scale}
                            variant={selectedScale === scale ? 'default' : 'outline'}
                            onClick={() => setSelectedScale(scale)}
                            size="sm"
                          >
                            {Math.round(scale * 100)}%
                          </Button>
                        ))}
                      </div>
                      <ModernSlider
                        label="Custom Scale"
                        value={selectedScale}
                        onChange={setSelectedScale}
                        min={0.1}
                        max={4}
                        step={0.1}
                        formatValue={(v) => `${Math.round(v * 100)}%`}
                      />
                    </div>

                    {/* Quality Settings */}
                    {selectedFormat === 'jpg' && (
                      <ModernSlider
                        label="JPG Quality"
                        value={jpgQuality}
                        onChange={setJpgQuality}
                        min={1}
                        max={100}
                        step={1}
                        formatValue={(v) => `${v}%`}
                      />
                    )}

                    {selectedFormat === 'webp' && (
                      <ModernSlider
                        label="WebP Quality"
                        value={webpQuality}
                        onChange={setWebpQuality}
                        min={1}
                        max={100}
                        step={1}
                        formatValue={(v) => `${v}%`}
                      />
                    )}

                    {/* Download Button */}
                    <Button
                      onClick={downloadImage}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {selectedFormat.toUpperCase()}
                    </Button>
                  </>
                )}

                {/* New Image Button */}
                <Button
                  onClick={handleReset}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  New Image
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <canvas ref={workingCanvasRef} className="hidden" />
    </div>
  );
}
