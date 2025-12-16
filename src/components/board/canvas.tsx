'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import getStroke from 'perfect-freehand';
import type { Tool, BoardElement, Point } from '@/lib/board-types';
import { isClosedShape } from '@/lib/board-types';
import { CollaborationManager } from '@/lib/collaboration';
import { CollaboratorCursors } from './collaborator-cursor';

interface CanvasProps {
  tool: Tool;
  strokeColor: string;
  strokeWidth: number;
  fillColor?: string;
  opacity?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number;
  letterSpacing?: number;
  lineHeight?: number;
  fillPattern?: 'none' | 'solid' | 'criss-cross';
  collaboration: CollaborationManager | null;
  elements: BoardElement[];
  onAddElement: (element: BoardElement) => void;
  onUpdateElement: (id: string, updates: Partial<BoardElement>) => void;
  onDeleteElement: (id: string) => void;
  onStartTransform?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onToolChange?: (tool: Tool) => void;
  onSetViewport?: (setter: (pan: { x: number; y: number }, zoom: number) => void) => void;
  onSelectionChange?: (elements: BoardElement[]) => void;
  onStrokeColorChange?: (color: string) => void;
  onFillColorChange?: (color: string) => void;
  canvasBackground?: 'none' | 'dots' | 'lines' | 'grid';
  highlightedElementIds?: string[];
}

interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null;

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Convert perfect-freehand points to SVG path
function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

// Wrap text to fit within a given width
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  if (!text) return [''];

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  // More accurate character width estimation for typical fonts
  const avgCharWidth = fontSize * 0.6;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + ' ' + word : word;
    const estimatedWidth = testLine.length * avgCharWidth;

    if (estimatedWidth > maxWidth && currentLine) {
      // Current line is too long, push it and start new line
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  // Add the last line
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [''];
}

// Get bounding box for any element
function getBoundingBox(element: BoardElement): BoundingBox | null {
  if (element.type === 'pen' || element.type === 'line') {
    if (element.points.length === 0) return null;
    const xs = element.points.map(p => p.x);
    const ys = element.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const padding = element.strokeWidth * 2;
    return {
      x: minX - padding,
      y: minY - padding,
      width: Math.max(maxX - minX + padding * 2, 20),
      height: Math.max(maxY - minY + padding * 2, 20),
    };
  }

  if (element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'frame' || element.type === 'web-embed') {
    return {
      x: element.x ?? 0,
      y: element.y ?? 0,
      width: element.width ?? 0,
      height: element.height ?? 0,
    };
  }

  if (element.type === 'text') {
    if (element.width !== undefined && element.height !== undefined) {
      return {
        x: element.x ?? 0,
        y: element.y ?? 0,
        width: element.width,
        height: element.height,
      };
    }
    const fontSize = element.strokeWidth * 4 + 12;
    if (element.isTextBox) {
      // For text boxes, use the defined dimensions
      return {
        x: element.x ?? 0,
        y: element.y ?? 0,
        width: element.width ?? 200,
        height: element.height ?? 100,
      };
    }
    const textWidth = (element.text?.length ?? 0) * fontSize * 0.55;
    const textHeight = fontSize * 1.2;
    return {
      x: element.x ?? 0,
      y: element.y ?? 0,
      width: Math.max(textWidth, 60),
      height: textHeight,
    };
  }

  if (element.type === 'laser') {
    if (element.points.length === 0) return null;
    const xs = element.points.map(p => p.x);
    const ys = element.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const padding = 20;
    return {
      x: minX - padding,
      y: minY - padding,
      width: Math.max(maxX - minX + padding * 2, 20),
      height: Math.max(maxY - minY + padding * 2, 20),
    };
  }

  return null;
}

// Get combined bounding box for multiple elements
function getCombinedBounds(elementIds: string[], elements: BoardElement[]): BoundingBox | null {
  const boxes = elementIds
    .map(id => elements.find(el => el.id === id))
    .filter(Boolean)
    .map(el => getBoundingBox(el!))
    .filter(Boolean) as BoundingBox[];
  
  if (boxes.length === 0) return null;
  
  const minX = Math.min(...boxes.map(b => b.x));
  const minY = Math.min(...boxes.map(b => b.y));
  const maxX = Math.max(...boxes.map(b => b.x + b.width));
  const maxY = Math.max(...boxes.map(b => b.y + b.height));
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function Canvas({
  tool,
  strokeColor,
  strokeWidth,
  fillColor = 'transparent',
  opacity = 100,
  strokeStyle = 'solid',
  cornerRadius = 0,
  fontFamily = 'var(--font-inter)',
  textAlign = 'left',
  fontSize = 24,
  letterSpacing = 0,
  lineHeight = 1.5,
  fillPattern = 'none',
  collaboration,
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onStartTransform,
  onUndo,
  onRedo,
  onToolChange,
  onSetViewport,
  onSelectionChange,
  onStrokeColorChange,
  onFillColorChange,
  canvasBackground = 'grid',
  highlightedElementIds = [],
}: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<BoardElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [textInput, setTextInput] = useState<{ x: number; y: number; width?: number; height?: number; isTextBox?: boolean } | null>(null);
  const [textValue, setTextValue] = useState('');
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

  // Eraser preview state
  const [eraserMarkedIds, setEraserMarkedIds] = useState<Set<string>>(new Set());

  // Move and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [originalElements, setOriginalElements] = useState<BoardElement[]>([]);
  const [originalBounds, setOriginalBounds] = useState<BoundingBox | null>(null);

  // Line endpoint dragging state
  const [isDraggingLineEndpoint, setIsDraggingLineEndpoint] = useState(false);
  const [lineEndpointIndex, setLineEndpointIndex] = useState<number | null>(null);
  const [isDraggingLineStroke, setIsDraggingLineStroke] = useState(false);

  // Box selection state
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [selectionBox, setSelectionBox] = useState<BoundingBox | null>(null);

  // Shift key tracking
  const [shiftPressed, setShiftPressed] = useState(false);

  // Track shift key and other shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftPressed(true);
      if (e.key === 'Delete' && selectedIds.length > 0) {
        selectedIds.forEach(id => onDeleteElement(id));
        setSelectedIds([]);
      }
      if (e.key === 'Escape') {
        setSelectedIds([]);
        setTextInput(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedIds, onDeleteElement]);

  // Wheel zoom handler with native event listener to prevent browser zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser back/forward navigation on horizontal scroll
      if (Math.abs(e.deltaX) > 0) {
        e.preventDefault();
      }

      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + Scroll
        e.preventDefault();

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const delta = e.deltaY > 0 ? 0.9 : 1.1;

        setZoom(prevZoom => {
          const newZoom = Math.max(0.1, Math.min(5, prevZoom * delta));

          // Calculate world position under cursor before zoom
          const worldX = (mouseX - pan.x) / prevZoom;
          const worldY = (mouseY - pan.y) / prevZoom;

          // Adjust pan so the same world position stays under cursor
          setPan({
            x: mouseX - worldX * newZoom,
            y: mouseY - worldY * newZoom,
          });

          return newZoom;
        });
      } else if (!e.ctrlKey && !e.metaKey && (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0)) {
        // Two-finger trackpad pan (no modifier keys)
        e.preventDefault();
        setPan(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [pan]);

  // Track remote cursors
  useEffect(() => {
    if (!collaboration) return;

    const unsubscribe = collaboration.onAwarenessChange((states) => {
      const myId = collaboration.getUserInfo().id;
      const cursors: RemoteCursor[] = [];
      
      states.forEach((state) => {
        if (state.user && state.user.id !== myId && state.user.cursor) {
          cursors.push({
            id: state.user.id,
            name: state.user.name,
            color: state.user.color,
            x: state.user.cursor.x,
            y: state.user.cursor.y,
          });
        }
      });
      
      setRemoteCursors(cursors);
    });

    return unsubscribe;
  }, [collaboration]);

  // Broadcast viewport changes to other users
  useEffect(() => {
    if (!collaboration) return;
    collaboration.updateViewport(pan, zoom);
  }, [collaboration, pan, zoom]);

  // Clear eraser marked IDs when tool changes
  useEffect(() => {
    if (tool !== 'eraser') {
      setEraserMarkedIds(new Set());
    }
  }, [tool]);

  // Expose viewport setter to parent component
  useEffect(() => {
    if (onSetViewport) {
      onSetViewport((newPan, newZoom) => {
        setPan(newPan);
        setZoom(newZoom);
      });
    }
  }, [onSetViewport]);

  const getMousePosition = useCallback((e: React.MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Helper function to check if a point is near a line segment
  const pointToLineDistance = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      // Line segment is actually a point
      return Math.hypot(point.x - lineStart.x, point.y - lineStart.y);
    }

    // Calculate projection of point onto line segment
    let t = ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const projX = lineStart.x + t * dx;
    const projY = lineStart.y + t * dy;

    return Math.hypot(point.x - projX, point.y - projY);
  };

  // Helper function to find elements at a point that should be erased
  const getElementsToErase = useCallback((point: Point): string[] => {
    const eraseRadius = strokeWidth * 2;
    const toErase: string[] = [];

    elements.forEach((el) => {
      if (el.type === 'pen' || el.type === 'line') {
        // Check if eraser intersects with any segment of the path
        let isNear = false;
        for (let i = 0; i < el.points.length - 1; i++) {
          const distance = pointToLineDistance(point, el.points[i], el.points[i + 1]);
          if (distance < eraseRadius + (el.strokeWidth || 2)) {
            isNear = true;
            break;
          }
        }
        // Also check if eraser is near any single point (for pen strokes with single points)
        if (!isNear && el.points.length === 1) {
          isNear = Math.hypot(point.x - el.points[0].x, point.y - el.points[0].y) < eraseRadius;
        }
        if (isNear) toErase.push(el.id);
      } else if (el.type === 'rectangle' || el.type === 'ellipse') {
        if (
          el.x !== undefined &&
          el.y !== undefined &&
          el.width !== undefined &&
          el.height !== undefined
        ) {
          // Check if eraser circle intersects with the shape bounds
          const closestX = Math.max(el.x, Math.min(point.x, el.x + el.width));
          const closestY = Math.max(el.y, Math.min(point.y, el.y + el.height));
          const distance = Math.hypot(point.x - closestX, point.y - closestY);
          if (distance < eraseRadius) toErase.push(el.id);
        }
      } else if (el.type === 'text') {
        const bounds = getBoundingBox(el);
        if (bounds) {
          // Check if eraser circle intersects with text bounds
          const closestX = Math.max(bounds.x, Math.min(point.x, bounds.x + bounds.width));
          const closestY = Math.max(bounds.y, Math.min(point.y, bounds.y + bounds.height));
          const distance = Math.hypot(point.x - closestX, point.y - closestY);
          if (distance < eraseRadius) toErase.push(el.id);
        }
      } else if (el.type === 'frame' || el.type === 'web-embed') {
        if (
          el.x !== undefined &&
          el.y !== undefined &&
          el.width !== undefined &&
          el.height !== undefined
        ) {
          // Check if eraser circle intersects with the frame bounds
          const closestX = Math.max(el.x, Math.min(point.x, el.x + el.width));
          const closestY = Math.max(el.y, Math.min(point.y, el.y + el.height));
          const distance = Math.hypot(point.x - closestX, point.y - closestY);
          if (distance < eraseRadius) toErase.push(el.id);
        }
      }
    });

    return toErase;
  }, [elements, strokeWidth]);

  // Get selected elements and their combined bounds
  const selectedElements = selectedIds.map(id => elements.find(el => el.id === id)).filter(Boolean) as BoardElement[];
  const selectedBounds = getCombinedBounds(selectedIds, elements);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getMousePosition(e);
    setLastMousePos(point);

    if (collaboration) {
      collaboration.updateCursor(point.x, point.y);
    }

    // Handle panning
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // Handle box selection
    if (isBoxSelecting && startPoint) {
      const x = Math.min(startPoint.x, point.x);
      const y = Math.min(startPoint.y, point.y);
      const width = Math.abs(point.x - startPoint.x);
      const height = Math.abs(point.y - startPoint.y);
      setSelectionBox({ x, y, width, height });
      return;
    }

    // Handle line endpoint dragging
    if (isDraggingLineEndpoint && lineEndpointIndex !== null && originalElements.length === 1) {
      const originalElement = originalElements[0];
      if (originalElement.type === 'line' && originalElement.points.length === 2) {
        const newPoints = [...originalElement.points];
        newPoints[lineEndpointIndex] = point;
        onUpdateElement(originalElement.id, { points: newPoints });
      }
      return;
    }

    // Handle line stroke width adjustment
    if (isDraggingLineStroke && dragStart && originalElements.length === 1) {
      const originalElement = originalElements[0];
      if (originalElement.type === 'line') {
        const dy = point.y - dragStart.y;
        const originalStrokeWidth = originalElement.strokeWidth || 2;
        const newStrokeWidth = Math.max(1, Math.min(50, originalStrokeWidth + dy / 5));
        onUpdateElement(originalElement.id, { strokeWidth: newStrokeWidth });
      }
      return;
    }

    // Handle dragging (moving elements)
    if (isDragging && dragStart && originalElements.length > 0) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;

      originalElements.forEach(origEl => {
        if (origEl.type === 'pen' || origEl.type === 'line') {
          const newPoints = origEl.points.map(p => ({
            x: p.x + dx,
            y: p.y + dy,
          }));
          onUpdateElement(origEl.id, { points: newPoints });
        } else {
          onUpdateElement(origEl.id, {
            x: (origEl.x ?? 0) + dx,
            y: (origEl.y ?? 0) + dy,
          });
        }
      });
      return;
    }

    // Handle resizing (single element only for now)
    if (isResizing && selectedIds.length === 1 && dragStart && originalBounds && resizeHandle && originalElements.length === 1) {
      const originalElement = originalElements[0];
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      
      let newX = originalBounds.x;
      let newY = originalBounds.y;
      let newWidth = originalBounds.width;
      let newHeight = originalBounds.height;
      
      const aspectRatio = originalBounds.width / originalBounds.height;
      
      switch (resizeHandle) {
        case 'nw':
          newX = originalBounds.x + dx;
          newY = originalBounds.y + dy;
          newWidth = originalBounds.width - dx;
          newHeight = originalBounds.height - dy;
          if (shiftPressed) {
            const avgDelta = (dx + dy) / 2;
            newX = originalBounds.x + avgDelta;
            newY = originalBounds.y + avgDelta / aspectRatio;
            newWidth = originalBounds.width - avgDelta;
            newHeight = newWidth / aspectRatio;
          }
          break;
        case 'n':
          newY = originalBounds.y + dy;
          newHeight = originalBounds.height - dy;
          if (shiftPressed) {
            newWidth = newHeight * aspectRatio;
            newX = originalBounds.x + (originalBounds.width - newWidth) / 2;
          }
          break;
        case 'ne':
          newY = originalBounds.y + dy;
          newWidth = originalBounds.width + dx;
          newHeight = originalBounds.height - dy;
          if (shiftPressed) {
            const avgDelta = (dx - dy) / 2;
            newWidth = originalBounds.width + avgDelta;
            newHeight = newWidth / aspectRatio;
            newY = originalBounds.y + originalBounds.height - newHeight;
          }
          break;
        case 'e':
          newWidth = originalBounds.width + dx;
          if (shiftPressed) {
            newHeight = newWidth / aspectRatio;
            newY = originalBounds.y + (originalBounds.height - newHeight) / 2;
          }
          break;
        case 'se':
          newWidth = originalBounds.width + dx;
          newHeight = originalBounds.height + dy;
          if (shiftPressed) {
            const avgDelta = (dx + dy) / 2;
            newWidth = originalBounds.width + avgDelta;
            newHeight = newWidth / aspectRatio;
          }
          break;
        case 's':
          newHeight = originalBounds.height + dy;
          if (shiftPressed) {
            newWidth = newHeight * aspectRatio;
            newX = originalBounds.x + (originalBounds.width - newWidth) / 2;
          }
          break;
        case 'sw':
          newX = originalBounds.x + dx;
          newWidth = originalBounds.width - dx;
          newHeight = originalBounds.height + dy;
          if (shiftPressed) {
            const avgDelta = (-dx + dy) / 2;
            newWidth = originalBounds.width + avgDelta;
            newHeight = newWidth / aspectRatio;
            newX = originalBounds.x + originalBounds.width - newWidth;
          }
          break;
        case 'w':
          newX = originalBounds.x + dx;
          newWidth = originalBounds.width - dx;
          if (shiftPressed) {
            newHeight = newWidth / aspectRatio;
            newY = originalBounds.y + (originalBounds.height - newHeight) / 2;
          }
          break;
      }
      
      const minSize = 10;
      if (newWidth < minSize) {
        if (resizeHandle.includes('w')) newX = originalBounds.x + originalBounds.width - minSize;
        newWidth = minSize;
      }
      if (newHeight < minSize) {
        if (resizeHandle.includes('n')) newY = originalBounds.y + originalBounds.height - minSize;
        newHeight = minSize;
      }
      
      if (originalElement.type === 'rectangle' || originalElement.type === 'ellipse' || originalElement.type === 'frame' || originalElement.type === 'web-embed') {
        onUpdateElement(selectedIds[0], {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      } else if (originalElement.type === 'pen' || originalElement.type === 'line' || originalElement.type === 'laser') {
        const scaleX = newWidth / originalBounds.width;
        const scaleY = newHeight / originalBounds.height;
        const newPoints = originalElement.points.map(p => ({
          x: newX + (p.x - originalBounds.x) * scaleX,
          y: newY + (p.y - originalBounds.y) * scaleY,
        }));
        onUpdateElement(selectedIds[0], { points: newPoints });
      } else if (originalElement.type === 'text') {
        const scaleX = newWidth / originalBounds.width;
        const scaleY = newHeight / originalBounds.height;
        const origScaleX = originalElement.scaleX ?? 1;
        const origScaleY = originalElement.scaleY ?? 1;
        
        onUpdateElement(selectedIds[0], { 
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
          scaleX: origScaleX * scaleX,
          scaleY: origScaleY * scaleY,
        });
      }
      return;
    }

    // Handle eraser tool - mark elements for deletion preview
    if (tool === 'eraser' && isDrawing) {
      const elementsToMark = getElementsToErase(point);
      if (elementsToMark.length > 0) {
        setEraserMarkedIds(prev => {
          const newSet = new Set(prev);
          elementsToMark.forEach(id => newSet.add(id));
          return newSet;
        });
      }
      return;
    }

    if (!isDrawing || !currentElement || !startPoint) return;

    switch (tool) {
      case 'pen': {
        setCurrentElement({
          ...currentElement,
          points: [...currentElement.points, point],
        });
        break;
      }
      case 'line': {
        setCurrentElement({
          ...currentElement,
          points: [startPoint, point],
        });
        break;
      }
      case 'rectangle': {
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        let finalWidth = Math.abs(width);
        let finalHeight = Math.abs(height);

        if (shiftPressed) {
          const size = Math.max(finalWidth, finalHeight);
          finalWidth = size;
          finalHeight = size;
        }

        setCurrentElement({
          ...currentElement,
          x: width < 0 ? startPoint.x - finalWidth : startPoint.x,
          y: height < 0 ? startPoint.y - finalHeight : startPoint.y,
          width: finalWidth,
          height: finalHeight,
        });
        break;
      }
      case 'ellipse': {
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        let finalWidth = Math.abs(width);
        let finalHeight = Math.abs(height);

        if (shiftPressed) {
          const size = Math.max(finalWidth, finalHeight);
          finalWidth = size;
          finalHeight = size;
        }

        setCurrentElement({
          ...currentElement,
          x: width < 0 ? startPoint.x - finalWidth : startPoint.x,
          y: height < 0 ? startPoint.y - finalHeight : startPoint.y,
          width: finalWidth,
          height: finalHeight,
        });
        break;
      }
      case 'laser': {
        setCurrentElement({
          ...currentElement,
          points: [...currentElement.points, point],
        });
        break;
      }
      case 'lasso': {
        setLassoPoints([...lassoPoints, point]);
        break;
      }
    }
  }, [isDrawing, currentElement, startPoint, tool, collaboration, getMousePosition, isPanning, panStart, elements, onDeleteElement, strokeWidth, isDragging, isResizing, selectedIds, dragStart, originalElements, originalBounds, resizeHandle, onUpdateElement, shiftPressed, isBoxSelecting, lassoPoints, lastMousePos, setLastMousePos, isDraggingLineEndpoint, lineEndpointIndex, isDraggingLineStroke, getElementsToErase]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button for panning
    if (e.button === 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.button !== 0) return;

    const point = getMousePosition(e);
    setStartPoint(point);

    // Get the element ID from the clicked SVG element (check parent if needed)
    let target = e.target as SVGElement;
    let clickedElementId = target.getAttribute('data-element-id');

    // If not found on target, check parent elements up to the SVG root
    if (!clickedElementId && target.parentElement) {
      let parent: Element | null = target.parentElement;
      while (parent && parent.tagName !== 'svg' && !clickedElementId) {
        clickedElementId = parent.getAttribute('data-element-id');
        if (!clickedElementId && parent.parentElement) {
          parent = parent.parentElement;
        } else {
          break;
        }
      }
    }

    const clickedElement = clickedElementId ? elements.find(el => el.id === clickedElementId) : null;

    if (tool === 'select') {
      // Check if clicking on a resize handle first (single selection only)
      if (selectedBounds && selectedIds.length === 1) {
        const handleSize = 8;
        const handles: { handle: ResizeHandle; x: number; y: number }[] = [
          { handle: 'nw', x: selectedBounds.x, y: selectedBounds.y },
          { handle: 'n', x: selectedBounds.x + selectedBounds.width / 2, y: selectedBounds.y },
          { handle: 'ne', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y },
          { handle: 'e', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y + selectedBounds.height / 2 },
          { handle: 'se', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y + selectedBounds.height },
          { handle: 's', x: selectedBounds.x + selectedBounds.width / 2, y: selectedBounds.y + selectedBounds.height },
          { handle: 'sw', x: selectedBounds.x, y: selectedBounds.y + selectedBounds.height },
          { handle: 'w', x: selectedBounds.x, y: selectedBounds.y + selectedBounds.height / 2 },
        ];
        
        for (const h of handles) {
          if (Math.abs(point.x - h.x) <= handleSize && Math.abs(point.y - h.y) <= handleSize) {
            onStartTransform?.();
            setIsResizing(true);
            setResizeHandle(h.handle);
            setDragStart(point);
            setOriginalElements(selectedElements.map(el => ({ ...el })));
            setOriginalBounds({ ...selectedBounds });
            return;
          }
        }
      }
      
      // Check if clicking inside the selection box (for moving)
      // Only allow drag if we actually clicked on an element (not just in the bounding box)
      if (clickedElement && selectedIds.includes(clickedElement.id) && selectedBounds &&
        point.x >= selectedBounds.x &&
        point.x <= selectedBounds.x + selectedBounds.width &&
        point.y >= selectedBounds.y &&
        point.y <= selectedBounds.y + selectedBounds.height
      ) {
        onStartTransform?.();
        setIsDragging(true);
        setDragStart(point);
        setOriginalElements(selectedElements.map(el => ({ ...el })));
        return;
      }
      
      // Use clicked element from event target
      if (clickedElement) {
        // Shift-click to add to selection
        if (shiftPressed) {
          if (selectedIds.includes(clickedElement.id)) {
            setSelectedIds(selectedIds.filter(id => id !== clickedElement.id));
          } else {
            setSelectedIds([...selectedIds, clickedElement.id]);
          }
        } else {
          setSelectedIds([clickedElement.id]);
          onStartTransform?.();
          setIsDragging(true);
          setDragStart(point);
          setOriginalElements([{ ...clickedElement }]);
        }
      } else {
        // Start box selection
        setSelectedIds([]);
        setIsBoxSelecting(true);
        setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 });
      }
      return;
    }

    // For drawing tools, if we clicked on an element, select it instead
    if (tool !== 'eraser' && tool !== 'text' && tool !== 'lasso' && clickedElement) {
      setSelectedIds([clickedElement.id]);
      return;
    }

    if (tool === 'text') {
      // Check if we clicked on an existing text element to edit it
      if (clickedElement && clickedElement.type === 'text') {
        // Enter edit mode for the existing text element
        setTextInput({
          x: clickedElement.x ?? 0,
          y: clickedElement.y ?? 0,
          width: clickedElement.width,
          height: clickedElement.height,
          isTextBox: clickedElement.isTextBox,
        });
        setTextValue(clickedElement.text ?? '');
        // Delete the existing element so we can recreate it when done
        onDeleteElement(clickedElement.id);
        setTimeout(() => textInputRef.current?.focus(), 10);
        return;
      }

      // Start tracking if user drags to create a text box
      setStartPoint(point);
      setIsDrawing(true);
      return;
    }

    if (tool === 'eraser') {
      setIsDrawing(true);
      // Mark elements at initial point for deletion preview
      const elementsToMark = getElementsToErase(point);
      if (elementsToMark.length > 0) {
        setEraserMarkedIds(new Set(elementsToMark));
      }
      return;
    }

    if (tool === 'lasso') {
      setLassoPoints([point]);
      setIsDrawing(true);
      return;
    }

    if (tool === 'laser') {
      const newElement: BoardElement = {
        id: uuid(),
        type: 'laser',
        points: [point],
        strokeColor,
        strokeWidth,
        timestamp: Date.now(),
        opacity,
        strokeStyle,
      };
      setCurrentElement(newElement);
      setIsDrawing(true);
      return;
    }

    const newElement: BoardElement = {
      id: uuid(),
      type: tool as 'pen' | 'line' | 'rectangle' | 'ellipse' | 'text',
      points: [point],
      strokeColor,
      strokeWidth,
      opacity,
      strokeStyle,
      cornerRadius,
    };

    if (tool === 'pen') {
      newElement.fillPattern = fillPattern;
    }

    if (tool === 'rectangle' || tool === 'ellipse') {
      newElement.x = point.x;
      newElement.y = point.y;
      newElement.width = 0;
      newElement.height = 0;
      newElement.fillColor = fillColor;
    }

    setCurrentElement(newElement);
    setIsDrawing(true);
  }, [tool, strokeColor, strokeWidth, fillColor, opacity, strokeStyle, cornerRadius, fillPattern, getMousePosition, elements, pan, selectedBounds, selectedElements, selectedIds, shiftPressed, onStartTransform, getElementsToErase, onDeleteElement]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Handle eraser - delete marked elements on mouse release
    if (tool === 'eraser' && isDrawing) {
      if (eraserMarkedIds.size > 0) {
        eraserMarkedIds.forEach(id => onDeleteElement(id));
      }
      setEraserMarkedIds(new Set());
      setIsDrawing(false);
      return;
    }

    // Finish box selection
    if (isBoxSelecting && selectionBox) {
      // Only perform box selection if the box has a minimum size (5px)
      // This prevents accidental selections from single clicks
      const minBoxSize = 5;
      if (selectionBox.width >= minBoxSize || selectionBox.height >= minBoxSize) {
        const selected: string[] = [];
        elements.forEach(el => {
          const bounds = getBoundingBox(el);
          if (bounds) {
            // Check if element intersects with selection box (any overlap)
            const intersects = !(
              bounds.x + bounds.width < selectionBox.x ||
              bounds.x > selectionBox.x + selectionBox.width ||
              bounds.y + bounds.height < selectionBox.y ||
              bounds.y > selectionBox.y + selectionBox.height
            );
            if (intersects) {
              selected.push(el.id);
            }
          }
        });
        setSelectedIds(selected);
      }
      setIsBoxSelecting(false);
      setSelectionBox(null);
      return;
    }

    if (isDraggingLineEndpoint) {
      setIsDraggingLineEndpoint(false);
      setLineEndpointIndex(null);
      setOriginalElements([]);
      return;
    }

    if (isDraggingLineStroke) {
      setIsDraggingLineStroke(false);
      setDragStart(null);
      setOriginalElements([]);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setOriginalElements([]);
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setDragStart(null);
      setOriginalElements([]);
      setOriginalBounds(null);
      return;
    }

    // Handle text tool - determine if it was a click or drag
    if (tool === 'text' && isDrawing && startPoint) {
      const currentPoint = lastMousePos;
      const dragDistance = Math.hypot(currentPoint.x - startPoint.x, currentPoint.y - startPoint.y);

      if (dragDistance < 5) {
        // It was a click - create simple text
        setTextInput({ x: startPoint.x, y: startPoint.y, isTextBox: false });
        setTextValue('');
        setTimeout(() => textInputRef.current?.focus(), 10);
      } else {
        // It was a drag - create text box
        const width = Math.abs(currentPoint.x - startPoint.x);
        const height = Math.abs(currentPoint.y - startPoint.y);
        const x = Math.min(startPoint.x, currentPoint.x);
        const y = Math.min(startPoint.y, currentPoint.y);

        if (width > 10 && height > 10) {
          setTextInput({ x, y, width, height, isTextBox: true });
          setTextValue('');
          setTimeout(() => textInputRef.current?.focus(), 10);
        }
      }
      setIsDrawing(false);
      setStartPoint(null);
      return;
    }

    // Handle lasso selection
    if (tool === 'lasso' && lassoPoints.length > 2) {
      const selected: string[] = [];
      elements.forEach(el => {
        const bounds = getBoundingBox(el);
        if (bounds) {
          // Simple point-in-polygon check for center of element
          const centerX = bounds.x + bounds.width / 2;
          const centerY = bounds.y + bounds.height / 2;
          let inside = false;
          for (let i = 0, j = lassoPoints.length - 1; i < lassoPoints.length; j = i++) {
            const xi = lassoPoints[i].x, yi = lassoPoints[i].y;
            const xj = lassoPoints[j].x, yj = lassoPoints[j].y;
            const intersect = ((yi > centerY) !== (yj > centerY))
              && (centerX < (xj - xi) * (centerY - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
          }
          if (inside) selected.push(el.id);
        }
      });
      setSelectedIds(selected);
      setLassoPoints([]);
      setIsDrawing(false);
      return;
    }

    if (currentElement && isDrawing) {
      let elementAdded = false;

      if (currentElement.type === 'pen' && currentElement.points.length >= 1) {
        // Check if shape is closed
        const isClosed = isClosedShape(currentElement.points);

        // Add closed flag and apply fill pattern only if shape is closed
        const finalElement: BoardElement = {
          ...currentElement,
          isClosed,
          fillPattern: (isClosed && currentElement.fillPattern !== 'none' ? currentElement.fillPattern : 'none') as 'none' | 'solid' | 'criss-cross',
        };

        onAddElement(finalElement);
        elementAdded = true;
      } else if (currentElement.type === 'line' && currentElement.points.length === 2) {
        onAddElement(currentElement);
        elementAdded = true;
      } else if (currentElement.type === 'laser' && currentElement.points.length > 1) {
        // Add laser element and schedule it for removal after 2 seconds
        onAddElement(currentElement);
        setTimeout(() => {
          onDeleteElement(currentElement.id);
        }, 2000);
        // Don't switch tool for laser
      } else if (
        (currentElement.type === 'rectangle' || currentElement.type === 'ellipse') &&
        currentElement.width &&
        currentElement.height &&
        currentElement.width > 2 &&
        currentElement.height > 2
      ) {
        onAddElement(currentElement);
        elementAdded = true;
      }

      // Switch back to select tool and select the new element (except for pen tool)
      if (elementAdded && currentElement.type !== 'pen') {
        setSelectedIds([currentElement.id]);
        if (onToolChange) {
          onToolChange('select');
        }
      }
    }

    setIsDrawing(false);
    setCurrentElement(null);
    setStartPoint(null);
    setLassoPoints([]);
  }, [currentElement, isDrawing, onAddElement, isPanning, isDragging, isResizing, isBoxSelecting, selectionBox, elements, tool, lassoPoints, onDeleteElement, onToolChange, lastMousePos, startPoint, textInputRef, setTextInput, setTextValue, setIsDrawing, setStartPoint, setSelectedIds, isDraggingLineEndpoint, isDraggingLineStroke, eraserMarkedIds]);

  const handleTextSubmit = useCallback(() => {
    if (textInput && textValue.trim()) {
      const fontSize = strokeWidth * 4 + 12;

      if (textInput.isTextBox) {
        // Get actual height from textarea
        let contentHeight = textInput.height ?? 100;
        const padding = 8;
        const fontSize = strokeWidth * 4 + 12;

        if (textInputRef.current) {
          // The textarea's scrollHeight includes its asymmetric padding and border (2px top + 2px bottom)
          const textareaScrollHeight = textInputRef.current.scrollHeight;
          const paddingTop = (8 - fontSize * 0.18) * zoom;
          const paddingBottom = 8 * zoom;
          const borderWidth = 4 * zoom; // 2px top + 2px bottom
          const textareaPadding = paddingTop + paddingBottom + borderWidth;
          const contentOnlyHeight = (textareaScrollHeight - textareaPadding) / zoom;

          contentHeight = Math.max(
            textInput.height ?? 100,
            contentOnlyHeight + padding * 2 // Add back unscaled padding
          );
        } else {
          // Fallback: Calculate height based on content
          const lineHeight = fontSize * 1.4;
          const lines = textValue.split('\n');
          const totalLines = lines.reduce((acc, line) => {
            if (!line) return acc + 1; // Empty line
            const wrappedLines = wrapText(line, (textInput.width ?? 200) - padding * 2, fontSize);
            return acc + wrappedLines.length;
          }, 0);

          contentHeight = Math.max(
            textInput.height ?? 100,
            totalLines * lineHeight + padding * 2 + fontSize * 0.82
          );
        }

        // Create a text box with defined dimensions
        const newElement: BoardElement = {
          id: uuid(),
          type: 'text',
          points: [],
          strokeColor,
          strokeWidth,
          text: textValue,
          x: textInput.x,
          y: textInput.y,
          width: textInput.width,
          height: contentHeight,
          isTextBox: true,
          scaleX: 1,
          scaleY: 1,
          opacity,
          fontFamily,
          textAlign,
          fontSize,
          letterSpacing,
          lineHeight,
        };
        onAddElement(newElement);

        // Don't switch tools - stay in text mode for continued text creation
        // setSelectedIds([newElement.id]);
      } else {
        // Create simple single-line text
        const textWidth = textValue.length * fontSize * 0.55;
        const textHeight = fontSize * 1.2;

        const newElement: BoardElement = {
          id: uuid(),
          type: 'text',
          points: [],
          strokeColor,
          strokeWidth,
          text: textValue,
          x: textInput.x,
          y: textInput.y - fontSize * 0.82, // Adjust for baseline
          width: Math.max(textWidth, 60),
          height: textHeight,
          scaleX: 1,
          scaleY: 1,
          opacity,
          fontFamily,
          textAlign,
          fontSize,
          letterSpacing,
          lineHeight,
        };
        onAddElement(newElement);

        // Don't switch tools - stay in text mode for continued text creation
        // setSelectedIds([newElement.id]);
      }
    }
    setTextInput(null);
    setTextValue('');
  }, [textInput, textValue, strokeColor, strokeWidth, opacity, fontFamily, textAlign, fontSize, letterSpacing, lineHeight, onAddElement, onToolChange, setSelectedIds, textInputRef, zoom]);

  // Auto-save text on blur or after typing stops
  const textSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = useCallback((value: string) => {
    setTextValue(value);

    // Clear existing timeout
    if (textSaveTimeoutRef.current) {
      clearTimeout(textSaveTimeoutRef.current);
    }

    // Auto-save after 2 seconds of no typing (optional, can be removed if unwanted)
    // textSaveTimeoutRef.current = setTimeout(() => {
    //   if (textInput && value.trim()) {
    //     handleTextSubmit();
    //   }
    // }, 2000);
  }, []);

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textInputRef.current && textInput?.isTextBox) {
      const textarea = textInputRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';
      // Set height to scrollHeight to fit content
      const newHeight = Math.max(textarea.scrollHeight, (textInput.height ?? 100) * zoom);
      textarea.style.height = `${newHeight}px`;
    }
  }, [textValue, textInput, zoom]);

  const renderElement = (element: BoardElement, isPreview = false) => {
    const opacity = isPreview ? 0.7 : 1;
    const isMarkedForDeletion = eraserMarkedIds.has(element.id);

    switch (element.type) {
      case 'pen': {
        const elOpacity = (element.opacity ?? 100) / 100;
        const elStrokeStyle = element.strokeStyle || 'solid';
        const elFillPattern = element.fillPattern || 'none';
        const elFillColor = element.fillColor || '#d1d5db';
        const shouldFill = element.isClosed && elFillPattern !== 'none';

        // For solid strokes, use the filled path approach
        if (elStrokeStyle === 'solid') {
          const stroke = getStroke(element.points.map((p) => [p.x, p.y]), {
            size: element.strokeWidth * 2,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
          });
          const pathData = getSvgPathFromStroke(stroke);

          // Create a simple polygon path from the original points for the fill
          const fillPath = shouldFill
            ? `M ${element.points.map(p => `${p.x},${p.y}`).join(' L ')} Z`
            : '';

          return (
            <g key={element.id}>
              {/* Fill layer - renders under stroke using original points */}
              {shouldFill && (
                <path
                  d={fillPath}
                  fill={elFillPattern === 'solid'
                    ? elFillColor
                    : `url(#fill-pattern-${elFillPattern})`}
                  style={{ color: elFillColor }}
                  opacity={elOpacity * 0.7}
                  pointerEvents="none"
                />
              )}
              {/* Stroke layer */}
              <path
                data-element-id={element.id}
                d={pathData}
                fill={element.strokeColor}
                opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
                pointerEvents="auto"
              />
              {isMarkedForDeletion && (
                <path
                  d={pathData}
                  fill="rgba(0, 0, 0, 0.6)"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        }

        // For dashed/dotted strokes, use polyline with stroke
        const strokeDasharray = elStrokeStyle === 'dashed' ? '10,10' : elStrokeStyle === 'dotted' ? '2,6' : 'none';
        const points = element.points.map(p => `${p.x},${p.y}`).join(' ');
        // Create a wider invisible hitbox for easier clicking (minimum 16px)
        const hitboxWidth = Math.max(element.strokeWidth * 6, 16);
        return (
          <g key={element.id}>
            {/* Fill layer for dashed/dotted strokes */}
            {shouldFill && (
              <polygon
                points={points}
                fill={elFillPattern === 'solid'
                  ? elFillColor
                  : `url(#fill-pattern-${elFillPattern})`}
                style={{ color: elFillColor }}
                opacity={elOpacity * 0.7}
                pointerEvents="none"
              />
            )}
            {/* Invisible wider hitbox for easier clicking */}
            <polyline
              data-element-id={element.id}
              points={points}
              stroke="transparent"
              strokeWidth={hitboxWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              pointerEvents="stroke"
            />
            {/* Visible dashed/dotted stroke */}
            <polyline
              points={points}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={strokeDasharray}
              fill="none"
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              pointerEvents="none"
            />
            {isMarkedForDeletion && (
              <polyline
                points={points}
                stroke="rgba(0, 0, 0, 0.6)"
                strokeWidth={element.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'line': {
        if (element.points.length < 2) return null;
        const elOpacity = (element.opacity ?? 100) / 100;
        const elStrokeStyle = element.strokeStyle || 'solid';
        const strokeDasharray = elStrokeStyle === 'dashed' ? '10,10' : elStrokeStyle === 'dotted' ? '2,6' : 'none';
        // Create a wider invisible hitbox for easier clicking (minimum 16px)
        const hitboxWidth = Math.max(element.strokeWidth * 6, 16);
        return (
          <g key={element.id}>
            {/* Invisible wider hitbox for easier clicking */}
            <line
              data-element-id={element.id}
              x1={element.points[0].x}
              y1={element.points[0].y}
              x2={element.points[1].x}
              y2={element.points[1].y}
              stroke="transparent"
              strokeWidth={hitboxWidth}
              strokeLinecap="round"
              pointerEvents="stroke"
            />
            {/* Visible line */}
            <line
              x1={element.points[0].x}
              y1={element.points[0].y}
              x2={element.points[1].x}
              y2={element.points[1].y}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              pointerEvents="none"
            />
            {isMarkedForDeletion && (
              <line
                x1={element.points[0].x}
                y1={element.points[0].y}
                x2={element.points[1].x}
                y2={element.points[1].y}
                stroke="rgba(0, 0, 0, 0.7)"
                strokeWidth={element.strokeWidth}
                strokeLinecap="round"
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'rectangle': {
        const elOpacity = (element.opacity ?? 100) / 100;
        const elStrokeStyle = element.strokeStyle || 'solid';
        const strokeDasharray = elStrokeStyle === 'dashed' ? '10,10' : elStrokeStyle === 'dotted' ? '2,6' : 'none';
        const elCornerRadius = element.cornerRadius ?? 4;
        const elFillColor = element.fillColor || 'none';
        // Treat 'transparent' same as 'none' for hit detection - invisible fills shouldn't be clickable
        const hasVisibleFill = elFillColor !== 'none' && elFillColor !== 'transparent';
        // Convert transparent to none for proper pointer-events behavior in SVG
        const fillValue = elFillColor === 'transparent' ? 'none' : elFillColor;
        // Only visible parts should be clickable: if has fill AND stroke, allow both; if only stroke, only stroke; if only fill, only fill
        const pointerEventsValue = hasVisibleFill && element.strokeWidth > 0 ? 'visible' :
                                   hasVisibleFill ? 'fill' :
                                   element.strokeWidth > 0 ? 'stroke' : 'none';
        // Create wider invisible hitbox for easier clicking on stroke-only shapes
        const hitboxStrokeWidth = Math.max(element.strokeWidth * 6, 16);
        const hitboxOffset = (hitboxStrokeWidth - element.strokeWidth) / 2;
        return (
          <g key={element.id}>
            {/* Invisible wider hitbox for easier clicking (stroke-only shapes) */}
            {!hasVisibleFill && element.strokeWidth > 0 && (
              <rect
                data-element-id={element.id}
                x={(element.x ?? 0) - hitboxOffset}
                y={(element.y ?? 0) - hitboxOffset}
                width={(element.width ?? 0) + hitboxOffset * 2}
                height={(element.height ?? 0) + hitboxOffset * 2}
                stroke="transparent"
                strokeWidth={hitboxStrokeWidth}
                fill="none"
                rx={elCornerRadius}
                pointerEvents="stroke"
              />
            )}
            {/* Visible rectangle */}
            <rect
              data-element-id={!hasVisibleFill && element.strokeWidth > 0 ? undefined : element.id}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              strokeDasharray={strokeDasharray}
              fill={fillValue}
              rx={elCornerRadius}
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              pointerEvents={!hasVisibleFill && element.strokeWidth > 0 ? 'none' : pointerEventsValue}
            />
            {isMarkedForDeletion && (
              <rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill="rgba(0, 0, 0, 0.7)"
                rx={elCornerRadius}
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'ellipse': {
        const elOpacity = (element.opacity ?? 100) / 100;
        const elStrokeStyle = element.strokeStyle || 'solid';
        const strokeDasharray = elStrokeStyle === 'dashed' ? '10,10' : elStrokeStyle === 'dotted' ? '2,6' : 'none';
        const elFillColor = element.fillColor || 'none';
        const cx = (element.x || 0) + (element.width || 0) / 2;
        const cy = (element.y || 0) + (element.height || 0) / 2;
        // Treat 'transparent' same as 'none' for hit detection - invisible fills shouldn't be clickable
        const hasVisibleFill = elFillColor !== 'none' && elFillColor !== 'transparent';
        // Convert transparent to none for proper pointer-events behavior in SVG
        const fillValue = elFillColor === 'transparent' ? 'none' : elFillColor;
        // Only visible parts should be clickable: if has fill AND stroke, allow both; if only stroke, only stroke; if only fill, only fill
        const pointerEventsValue = hasVisibleFill && element.strokeWidth > 0 ? 'visible' :
                                   hasVisibleFill ? 'fill' :
                                   element.strokeWidth > 0 ? 'stroke' : 'none';
        // Create wider invisible hitbox for easier clicking on stroke-only shapes
        const hitboxStrokeWidth = Math.max(element.strokeWidth * 6, 16);
        const hitboxOffset = (hitboxStrokeWidth - element.strokeWidth) / 2;
        return (
          <g key={element.id}>
            {/* Invisible wider hitbox for easier clicking (stroke-only shapes) */}
            {!hasVisibleFill && element.strokeWidth > 0 && (
              <ellipse
                data-element-id={element.id}
                cx={cx}
                cy={cy}
                rx={(element.width || 0) / 2 + hitboxOffset}
                ry={(element.height || 0) / 2 + hitboxOffset}
                stroke="transparent"
                strokeWidth={hitboxStrokeWidth}
                fill="none"
                pointerEvents="stroke"
              />
            )}
            {/* Visible ellipse */}
            <ellipse
              data-element-id={!hasVisibleFill && element.strokeWidth > 0 ? undefined : element.id}
              cx={cx}
              cy={cy}
              rx={(element.width || 0) / 2}
              ry={(element.height || 0) / 2}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              strokeDasharray={strokeDasharray}
              fill={fillValue}
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              pointerEvents={!hasVisibleFill && element.strokeWidth > 0 ? 'none' : pointerEventsValue}
            />
            {isMarkedForDeletion && (
              <ellipse
                cx={cx}
                cy={cy}
                rx={(element.width || 0) / 2}
                ry={(element.height || 0) / 2}
                fill="rgba(0, 0, 0, 0.7)"
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'text': {
        const elOpacity = (element.opacity ?? 100) / 100;
        const fontSize = element.fontSize ?? (element.strokeWidth * 4 + 12);
        const elLetterSpacing = element.letterSpacing ?? 0;
        const elLineHeight = element.lineHeight ?? 1.4;
        const scaleX = element.scaleX ?? 1;
        const scaleY = element.scaleY ?? 1;
        const x = element.x ?? 0;
        const y = element.y ?? 0;
        const baselineOffset = fontSize * 0.82;

        if (element.isTextBox && element.width && element.height) {
          // Render text box with wrapping
          const padding = 8;
          const lineHeight = fontSize * elLineHeight;

          // Split by newlines first, then wrap each line
          const paragraphs = (element.text || '').split('\n');
          const allLines: string[] = [];

          paragraphs.forEach((paragraph) => {
            if (!paragraph) {
              allLines.push(''); // Preserve empty lines
            } else {
              const wrappedLines = wrapText(paragraph, (element.width ?? 200) - padding * 2, fontSize);
              allLines.push(...wrappedLines);
            }
          });

          return (
            <g key={element.id} data-element-id={element.id}>
              {/* Clickable area for the entire text box */}
              <rect
                x={x}
                y={y}
                width={element.width}
                height={element.height}
                fill="transparent"
                stroke="transparent"
                strokeWidth={1}
                pointerEvents="fill"
              />
              {/* Wrapped text */}
              {allLines.map((line, i) => {
                const elTextAlign = element.textAlign || 'left';
                let textX = x + padding;
                let textAnchor: 'start' | 'middle' | 'end' = 'start';

                if (elTextAlign === 'center') {
                  textX = x + (element.width ?? 0) / 2;
                  textAnchor = 'middle';
                } else if (elTextAlign === 'right') {
                  textX = x + (element.width ?? 0) - padding;
                  textAnchor = 'end';
                }

                return (
                  <text
                    key={i}
                    fill={element.strokeColor}
                    fontSize={fontSize}
                    fontFamily={element.fontFamily || 'var(--font-inter)'}
                    textAnchor={textAnchor}
                    letterSpacing={`${elLetterSpacing}px`}
                    x={textX}
                    y={y + padding + baselineOffset + i * lineHeight}
                    opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
                    pointerEvents="none"
                  >
                    {line}
                  </text>
                );
              })}
              {isMarkedForDeletion && (
                <rect
                  x={x}
                  y={y}
                  width={element.width}
                  height={element.height}
                  fill="rgba(0, 0, 0, 0.7)"
                  pointerEvents="none"
                />
              )}
            </g>
          );
        }

        // Render simple single-line text
        const elTextAlign = element.textAlign || 'left';
        let textX = 0;
        let textAnchor: 'start' | 'middle' | 'end' = 'start';

        if (elTextAlign === 'center') {
          textX = (element.width ?? 0) / 2;
          textAnchor = 'middle';
        } else if (elTextAlign === 'right') {
          textX = element.width ?? 0;
          textAnchor = 'end';
        }

        return (
          <g key={element.id}>
            <text
              data-element-id={element.id}
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              fill={element.strokeColor}
              fontSize={fontSize}
              fontFamily={element.fontFamily || 'var(--font-inter)'}
              textAnchor={textAnchor}
              letterSpacing={`${elLetterSpacing}px`}
              x={textX}
              y={baselineOffset}
              transform={`translate(${x}, ${y}) scale(${scaleX}, ${scaleY})`}
              pointerEvents="auto"
            >
              {element.text}
            </text>
            {isMarkedForDeletion && (
              <rect
                x={x}
                y={y}
                width={element.width ?? 100}
                height={element.height ?? 30}
                fill="rgba(0, 0, 0, 0.7)"
                transform={`scale(${scaleX}, ${scaleY})`}
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'frame': {
        const elOpacity = (element.opacity ?? 100) / 100;
        const elStrokeStyle = element.strokeStyle || 'solid';
        const strokeDasharray = elStrokeStyle === 'dashed' ? '8,4' : elStrokeStyle === 'dotted' ? '2,6' : '8,4'; // Frame defaults to dashed
        const elCornerRadius = element.cornerRadius ?? 8;
        const elFillColor = element.fillColor || 'none';
        // Treat 'transparent' same as 'none' for hit detection - invisible fills shouldn't be clickable
        const hasVisibleFill = elFillColor !== 'none' && elFillColor !== 'transparent';
        // Convert transparent to none for proper pointer-events behavior in SVG
        const fillValue = elFillColor === 'transparent' ? 'none' : elFillColor;
        // Only visible parts should be clickable: if has fill AND stroke, allow both; if only stroke, only stroke; if only fill, only fill
        const pointerEventsValue = hasVisibleFill && element.strokeWidth > 0 ? 'visible' :
                                   hasVisibleFill ? 'fill' :
                                   element.strokeWidth > 0 ? 'stroke' : 'none';
        // Create wider invisible hitbox for easier clicking on stroke-only shapes
        const hitboxStrokeWidth = Math.max(element.strokeWidth * 6, 16);
        const hitboxOffset = (hitboxStrokeWidth - element.strokeWidth) / 2;
        return (
          <g key={element.id}>
            {/* Invisible wider hitbox for easier clicking (stroke-only shapes) */}
            {!hasVisibleFill && element.strokeWidth > 0 && (
              <rect
                data-element-id={element.id}
                x={(element.x ?? 0) - hitboxOffset}
                y={(element.y ?? 0) - hitboxOffset}
                width={(element.width ?? 0) + hitboxOffset * 2}
                height={(element.height ?? 0) + hitboxOffset * 2}
                stroke="transparent"
                strokeWidth={hitboxStrokeWidth}
                fill="none"
                rx={elCornerRadius}
                strokeDasharray={strokeDasharray}
                pointerEvents="stroke"
              />
            )}
            {/* Visible frame */}
            <rect
              data-element-id={!hasVisibleFill && element.strokeWidth > 0 ? undefined : element.id}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              fill={fillValue}
              rx={elCornerRadius}
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              strokeDasharray={strokeDasharray}
              pointerEvents={!hasVisibleFill && element.strokeWidth > 0 ? 'none' : pointerEventsValue}
            />
            {element.label && (
              <text
                x={(element.x ?? 0) + 8}
                y={(element.y ?? 0) - 4}
                fill={element.strokeColor}
                fontSize={14}
                fontFamily="inherit"
                fontWeight="600"
                opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
                pointerEvents="none"
              >
                {element.label}
              </text>
            )}
            {isMarkedForDeletion && (
              <rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill="rgba(0, 0, 0, 0.7)"
                rx={elCornerRadius}
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'web-embed': {
        const elOpacity = (element.opacity ?? 100) / 100;
        const elStrokeStyle = element.strokeStyle || 'solid';
        const strokeDasharray = elStrokeStyle === 'dashed' ? '10,10' : elStrokeStyle === 'dotted' ? '2,6' : 'none';
        const elCornerRadius = element.cornerRadius ?? 4;
        const elFillColor = element.fillColor || 'rgba(100, 100, 255, 0.05)';
        return (
          <g key={element.id}>
            <rect
              data-element-id={element.id}
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              fill={elFillColor}
              rx={elCornerRadius}
              opacity={isMarkedForDeletion ? elOpacity * 0.3 : elOpacity}
              strokeDasharray={strokeDasharray}
              pointerEvents="auto"
            />
            {element.url && (
              <text
                x={(element.x ?? 0) + (element.width ?? 0) / 2}
                y={(element.y ?? 0) + (element.height ?? 0) / 2}
                fill={element.strokeColor}
                fontSize={12}
                fontFamily="inherit"
                textAnchor="middle"
                opacity={isMarkedForDeletion ? elOpacity * 0.3 * 0.7 : elOpacity * 0.7}
                pointerEvents="none"
              >
                {element.url}
              </text>
            )}
            {isMarkedForDeletion && (
              <rect
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill="rgba(0, 0, 0, 0.7)"
                rx={elCornerRadius}
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      case 'laser': {
        if (element.points.length < 2) return null;
        const elOpacity = (element.opacity ?? 100) / 100;
        const stroke = getStroke(element.points.map((p) => [p.x, p.y]), {
          size: 8,
          thinning: 0.3,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const pathData = getSvgPathFromStroke(stroke);
        return (
          <g key={element.id}>
            <path
              data-element-id={element.id}
              d={pathData}
              fill={element.strokeColor}
              opacity={isMarkedForDeletion ? Math.max(0.3, elOpacity * 0.7) * 0.3 : Math.max(0.3, elOpacity * 0.7)}
              filter="url(#laser-glow)"
              pointerEvents="auto"
            />
            {isMarkedForDeletion && (
              <path
                d={pathData}
                fill="rgba(0, 0, 0, 0.7)"
                pointerEvents="none"
              />
            )}
          </g>
        );
      }
      default:
        return null;
    }
  };

  // Render line-specific control points
  const renderLineControls = useCallback((element: BoardElement) => {
    if (element.points.length < 2) return null;

    const p1 = element.points[0];
    const p2 = element.points[1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const dotSize = 8;

    const handleEndpointMouseDown = (e: React.MouseEvent, endpointIndex: number) => {
      e.stopPropagation();
      onStartTransform?.();
      setIsDraggingLineEndpoint(true);
      setLineEndpointIndex(endpointIndex);
      setOriginalElements([{ ...element }]);
    };

    const handleStrokeMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
      const point = getMousePosition(e);
      onStartTransform?.();
      setIsDraggingLineStroke(true);
      setDragStart(point);
      setOriginalElements([{ ...element }]);
    };

    return (
      <g>
        {/* Dashed line connecting the endpoints */}
        <line
          x1={p1.x}
          y1={p1.y}
          x2={p2.x}
          y2={p2.y}
          stroke="var(--accent)"
          strokeWidth={2}
          strokeDasharray="5,5"
          pointerEvents="none"
        />

        {/* Endpoint dots */}
        <circle
          cx={p1.x}
          cy={p1.y}
          r={dotSize / 2}
          fill="var(--accent)"
          stroke="var(--background)"
          strokeWidth={2}
          style={{ cursor: 'move' }}
          onMouseDown={(e) => handleEndpointMouseDown(e, 0)}
        />
        <circle
          cx={p2.x}
          cy={p2.y}
          r={dotSize / 2}
          fill="var(--accent)"
          stroke="var(--background)"
          strokeWidth={2}
          style={{ cursor: 'move' }}
          onMouseDown={(e) => handleEndpointMouseDown(e, 1)}
        />

        {/* Middle control for stroke width */}
        <rect
          x={midX - dotSize / 2}
          y={midY - dotSize / 2}
          width={dotSize}
          height={dotSize}
          fill="var(--accent)"
          stroke="var(--background)"
          strokeWidth={2}
          rx={2}
          style={{ cursor: 'ns-resize' }}
          onMouseDown={handleStrokeMouseDown}
        />
      </g>
    );
  }, [onStartTransform, getMousePosition]);

  // Render selection box with handles
  const renderSelectionBox = () => {
    if (!selectedBounds || selectedIds.length === 0) return null;

    // For single line selection, use line-specific controls instead
    if (selectedIds.length === 1) {
      const selectedElement = elements.find(el => el.id === selectedIds[0]);
      if (selectedElement?.type === 'line') {
        return renderLineControls(selectedElement);
      }
    }

    const handleSize = 8;
    const handles: { pos: ResizeHandle; x: number; y: number; cursor: string }[] = selectedIds.length === 1 ? [
      { pos: 'nw', x: selectedBounds.x, y: selectedBounds.y, cursor: 'nwse-resize' },
      { pos: 'n', x: selectedBounds.x + selectedBounds.width / 2, y: selectedBounds.y, cursor: 'ns-resize' },
      { pos: 'ne', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y, cursor: 'nesw-resize' },
      { pos: 'e', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y + selectedBounds.height / 2, cursor: 'ew-resize' },
      { pos: 'se', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y + selectedBounds.height, cursor: 'nwse-resize' },
      { pos: 's', x: selectedBounds.x + selectedBounds.width / 2, y: selectedBounds.y + selectedBounds.height, cursor: 'ns-resize' },
      { pos: 'sw', x: selectedBounds.x, y: selectedBounds.y + selectedBounds.height, cursor: 'nesw-resize' },
      { pos: 'w', x: selectedBounds.x, y: selectedBounds.y + selectedBounds.height / 2, cursor: 'ew-resize' },
    ] : [];

    return (
      <g>
        {/* Selection border */}
        <rect
          x={selectedBounds.x}
          y={selectedBounds.y}
          width={selectedBounds.width}
          height={selectedBounds.height}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={2}
          strokeDasharray="5,5"
          pointerEvents="none"
        />

        {/* Resize handles (only for single selection) */}
        {handles.map((handle) => (
          <rect
            key={handle.pos}
            x={handle.x - handleSize / 2}
            y={handle.y - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="var(--accent)"
            stroke="var(--background)"
            strokeWidth={1}
            rx={2}
            style={{ cursor: handle.cursor }}
          />
        ))}
      </g>
    );
  };

  // Render highlight boxes for search results
  const renderHighlights = () => {
    if (highlightedElementIds.length === 0) return null;

    return (
      <g>
        {highlightedElementIds.map(id => {
          const element = elements.find(el => el.id === id);
          if (!element) return null;

          const bounds = getBoundingBox(element);
          if (!bounds) return null;

          // Add padding around the element
          const padding = 8;
          return (
            <rect
              key={`highlight-${id}`}
              x={bounds.x - padding}
              y={bounds.y - padding}
              width={bounds.width + padding * 2}
              height={bounds.height + padding * 2}
              fill="none"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              strokeDasharray="4,4"
              pointerEvents="none"
              opacity={0.8}
              rx={4}
            />
          );
        })}
      </g>
    );
  };

  const getCursorStyle = () => {
    if (isDragging) return 'grabbing';
    if (isResizing) {
      switch (resizeHandle) {
        case 'nw':
        case 'se':
          return 'nwse-resize';
        case 'ne':
        case 'sw':
          return 'nesw-resize';
        case 'n':
        case 's':
          return 'ns-resize';
        case 'e':
        case 'w':
          return 'ew-resize';
      }
    }

    switch (tool) {
      case 'pen':
      case 'line':
      case 'rectangle':
      case 'ellipse':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      case 'select':
        return selectedIds.length > 0 ? 'grab' : 'crosshair';
      case 'text':
        return 'text';
      case 'laser':
        return 'pointer';
      case 'lasso':
        return 'crosshair';
      default:
        return 'crosshair';
    }
  };

  // Update parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      const selected = elements.filter(el => selectedIds.includes(el.id));
      onSelectionChange(selected);
    }
  }, [selectedIds, elements, onSelectionChange]);

  // Helper function to get background style
  const getBackgroundStyle = () => {
    const spacing = 40 * zoom;
    const position = `${pan.x}px ${pan.y}px`;
    const gridColor = 'currentColor'; // Will inherit from parent's text color

    switch (canvasBackground) {
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: position,
        };
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, ${gridColor} 1.5px, transparent 1.5px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: position,
        };
      case 'lines':
        return {
          backgroundImage: `linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          backgroundPosition: position,
        };
      case 'none':
      default:
        return {
          backgroundImage: 'none',
        };
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      {/* Canvas Background */}
      {canvasBackground !== 'none' && (
        <div
          className="absolute inset-0 pointer-events-none text-foreground opacity-[0.08] dark:opacity-[0.05]"
          style={getBackgroundStyle()}
        />
      )}
      
      {/* Main SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <filter id="laser-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Pattern definitions for pen fill */}
          {/* Criss-cross pattern - diagonal lines both ways with organic spacing */}
          <pattern id="fill-pattern-criss-cross" width="24" height="24" patternUnits="userSpaceOnUse">
            {/* Diagonal lines going one way */}
            <line x1="0" y1="0" x2="24" y2="24" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
            <line x1="-6" y1="0" x2="18" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
            <line x1="6" y1="0" x2="30" y2="24" stroke="currentColor" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
            <line x1="-12" y1="0" x2="12" y2="24" stroke="currentColor" strokeWidth="0.9" opacity="0.4" strokeLinecap="round" />
            <line x1="12" y1="0" x2="36" y2="24" stroke="currentColor" strokeWidth="0.9" opacity="0.4" strokeLinecap="round" />
            {/* Diagonal lines going the other way */}
            <line x1="0" y1="24" x2="24" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
            <line x1="-6" y1="24" x2="18" y2="0" stroke="currentColor" strokeWidth="0.9" opacity="0.5" strokeLinecap="round" />
            <line x1="6" y1="24" x2="30" y2="0" stroke="currentColor" strokeWidth="1.1" opacity="0.5" strokeLinecap="round" />
            <line x1="-12" y1="24" x2="12" y2="0" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" />
            <line x1="12" y1="24" x2="36" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
          </pattern>
        </defs>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render all elements sorted by zIndex */}
          {[...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0)).map((el) => renderElement(el))}

          {/* Render current element being drawn */}
          {currentElement && renderElement(currentElement, true)}

          {/* Render selection box */}
          {tool === 'select' && renderSelectionBox()}

          {/* Render search result highlights */}
          {renderHighlights()}

          {/* Render box selection rectangle */}
          {isBoxSelecting && selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(98, 114, 164, 0.2)"
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          )}

          {/* Render lasso selection path */}
          {tool === 'lasso' && lassoPoints.length > 0 && (
            <polyline
              points={lassoPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.7}
            />
          )}

          {/* Render text box preview while dragging */}
          {tool === 'text' && isDrawing && startPoint && (
            <rect
              x={Math.min(startPoint.x, lastMousePos.x)}
              y={Math.min(startPoint.y, lastMousePos.y)}
              width={Math.abs(lastMousePos.x - startPoint.x)}
              height={Math.abs(lastMousePos.y - startPoint.y)}
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth * 0.5}
              strokeDasharray="4,4"
              opacity={0.5}
              rx={4}
            />
          )}
        </g>

      </svg>
      
      {/* Remote Cursors - Animated */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
      >
        <CollaboratorCursors cursors={remoteCursors} />
      </div>

      {/* Text Input */}
      {textInput && (
        textInput.isTextBox ? (
          <textarea
            ref={textInputRef}
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextSubmit();
              }
              if (e.key === 'Escape') {
                setTextInput(null);
                setTextValue('');
              }
            }}
            onBlur={(e) => {
              // Don't close if clicking on sidebar or other UI elements
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget && (
                relatedTarget.closest('.fixed.right-4') || // Sidebar
                relatedTarget.tagName === 'BUTTON' ||
                relatedTarget.tagName === 'SELECT' ||
                relatedTarget.tagName === 'INPUT'
              )) {
                return;
              }
              // Save text on blur if there's content
              if (textValue.trim()) {
                handleTextSubmit();
              } else {
                setTextInput(null);
                setTextValue('');
              }
            }}
            className="absolute bg-transparent border-2 border-dashed border-accent/50 outline-none text-foreground resize-none overflow-hidden"
            style={{
              left: textInput.x * zoom + pan.x,
              top: textInput.y * zoom + pan.y - 2 * zoom, // Account for 2px border
              width: (textInput.width ?? 200) * zoom,
              fontSize: fontSize * zoom,
              fontFamily: fontFamily,
              letterSpacing: `${letterSpacing}px`,
              color: strokeColor,
              lineHeight: lineHeight.toString(),
              textAlign: textAlign,
              // Match SVG padding: horizontal is 8, vertical is 8 but adjusted for baseline
              paddingLeft: `${8 * zoom}px`,
              paddingRight: `${8 * zoom}px`,
              paddingTop: `${(8 - fontSize * 0.18) * zoom}px`,
              paddingBottom: `${8 * zoom}px`,
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap',
              boxSizing: 'border-box',
            }}
            placeholder="Type..."
          />
        ) : (
          <input
            ref={textInputRef as any}
            type="text"
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTextSubmit();
              }
              if (e.key === 'Escape') {
                setTextInput(null);
                setTextValue('');
              }
            }}
            onBlur={(e) => {
              // Don't close if clicking on sidebar or other UI elements
              const relatedTarget = e.relatedTarget as HTMLElement;
              if (relatedTarget && (
                relatedTarget.closest('.fixed.right-4') || // Sidebar
                relatedTarget.tagName === 'BUTTON' ||
                relatedTarget.tagName === 'SELECT' ||
                relatedTarget.tagName === 'INPUT'
              )) {
                return;
              }
              // Save text on blur if there's content
              if (textValue.trim()) {
                handleTextSubmit();
              } else {
                setTextInput(null);
                setTextValue('');
              }
            }}
            className="absolute bg-transparent border-none outline-none text-foreground"
            style={{
              left: textInput.x * zoom + pan.x,
              top: textInput.y * zoom + pan.y - fontSize * 0.82 * zoom,
              fontSize: fontSize * zoom,
              fontFamily: fontFamily,
              letterSpacing: `${letterSpacing}px`,
              color: strokeColor,
              textAlign: textAlign,
              minWidth: '100px',
            }}
            placeholder="Type..."
          />
        )
      )}

      {/* Zoom and Undo/Redo Controls */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-md p-1.5 shadow-xl">
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
            className="p-1.5 rounded-sm hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            title="Zoom Out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-xs font-medium text-foreground min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
            className="p-1.5 rounded-sm hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-sm hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all text-xs"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
        <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-md p-1.5 shadow-xl">
          <button
            onClick={onUndo}
            className="p-1.5 rounded-sm hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={onRedo}
            className="p-1.5 rounded-sm hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
        Ctrl+Scroll to zoom • Two-finger/Middle-click to pan
      </div>
    </div>
  );
}
