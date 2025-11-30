'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import getStroke from 'perfect-freehand';
import type { Tool, BoardElement, Point } from '@/lib/board-types';
import { CollaborationManager } from '@/lib/collaboration';
import { CollaboratorCursors } from './collaborator-cursor';

interface CanvasProps {
  tool: Tool;
  strokeColor: string;
  strokeWidth: number;
  collaboration: CollaborationManager | null;
  elements: BoardElement[];
  onAddElement: (element: BoardElement) => void;
  onUpdateElement: (id: string, updates: Partial<BoardElement>) => void;
  onDeleteElement: (id: string) => void;
  onStartTransform?: () => void;
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
  collaboration,
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  onStartTransform,
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
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);
  const [lassoPoints, setLassoPoints] = useState<Point[]>([]);
  
  // Move and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [originalElements, setOriginalElements] = useState<BoardElement[]>([]);
  const [originalBounds, setOriginalBounds] = useState<BoundingBox | null>(null);
  
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
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)));
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

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

  const getMousePosition = useCallback((e: React.MouseEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  // Get selected elements and their combined bounds
  const selectedElements = selectedIds.map(id => elements.find(el => el.id === id)).filter(Boolean) as BoardElement[];
  const selectedBounds = getCombinedBounds(selectedIds, elements);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getMousePosition(e);
    
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
      case 'eraser': {
        const eraseRadius = strokeWidth * 2;
        elements.forEach((el) => {
          if (el.type === 'pen' || el.type === 'line') {
            const isNear = el.points.some(
              (p) => Math.hypot(p.x - point.x, p.y - point.y) < eraseRadius
            );
            if (isNear) onDeleteElement(el.id);
          } else if (el.type === 'rectangle' || el.type === 'ellipse') {
            if (
              el.x !== undefined &&
              el.y !== undefined &&
              el.width !== undefined &&
              el.height !== undefined
            ) {
              if (
                point.x >= el.x &&
                point.x <= el.x + el.width &&
                point.y >= el.y &&
                point.y <= el.y + el.height
              ) {
                onDeleteElement(el.id);
              }
            }
          }
        });
        break;
      }
      case 'frame':
      case 'web-embed': {
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
  }, [isDrawing, currentElement, startPoint, tool, collaboration, getMousePosition, isPanning, panStart, elements, onDeleteElement, strokeWidth, isDragging, isResizing, selectedIds, dragStart, originalElements, originalBounds, resizeHandle, onUpdateElement, shiftPressed, isBoxSelecting, lassoPoints]);

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
      if (selectedBounds &&
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
      
      // Find clicked element
      const clicked = [...elements].reverse().find((el) => {
        const bounds = getBoundingBox(el);
        if (!bounds) return false;
        return (
          point.x >= bounds.x &&
          point.x <= bounds.x + bounds.width &&
          point.y >= bounds.y &&
          point.y <= bounds.y + bounds.height
        );
      });
      
      if (clicked) {
        // Shift-click to add to selection
        if (shiftPressed) {
          if (selectedIds.includes(clicked.id)) {
            setSelectedIds(selectedIds.filter(id => id !== clicked.id));
          } else {
            setSelectedIds([...selectedIds, clicked.id]);
          }
        } else {
          setSelectedIds([clicked.id]);
          onStartTransform?.();
          setIsDragging(true);
          setDragStart(point);
          setOriginalElements([{ ...clicked }]);
        }
      } else {
        // Start box selection
        setSelectedIds([]);
        setIsBoxSelecting(true);
        setSelectionBox({ x: point.x, y: point.y, width: 0, height: 0 });
      }
      return;
    }

    if (tool === 'text') {
      setTextInput(point);
      setTextValue('');
      setTimeout(() => textInputRef.current?.focus(), 10);
      return;
    }

    if (tool === 'eraser') {
      setIsDrawing(true);
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
      };
      setCurrentElement(newElement);
      setIsDrawing(true);
      return;
    }

    const newElement: BoardElement = {
      id: uuid(),
      type: tool as 'pen' | 'line' | 'rectangle' | 'ellipse' | 'frame' | 'web-embed',
      points: [point],
      strokeColor,
      strokeWidth,
    };

    if (tool === 'rectangle' || tool === 'ellipse' || tool === 'frame' || tool === 'web-embed') {
      newElement.x = point.x;
      newElement.y = point.y;
      newElement.width = 0;
      newElement.height = 0;
    }

    setCurrentElement(newElement);
    setIsDrawing(true);
  }, [tool, strokeColor, strokeWidth, getMousePosition, elements, pan, selectedBounds, selectedElements, selectedIds, shiftPressed, onStartTransform]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    // Finish box selection
    if (isBoxSelecting && selectionBox) {
      const selected: string[] = [];
      elements.forEach(el => {
        const bounds = getBoundingBox(el);
        if (bounds) {
          // Check if element is within selection box
          if (
            bounds.x >= selectionBox.x &&
            bounds.y >= selectionBox.y &&
            bounds.x + bounds.width <= selectionBox.x + selectionBox.width &&
            bounds.y + bounds.height <= selectionBox.y + selectionBox.height
          ) {
            selected.push(el.id);
          }
        }
      });
      setSelectedIds(selected);
      setIsBoxSelecting(false);
      setSelectionBox(null);
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
      if (currentElement.type === 'pen' && currentElement.points.length > 1) {
        onAddElement(currentElement);
      } else if (currentElement.type === 'line' && currentElement.points.length === 2) {
        onAddElement(currentElement);
      } else if (currentElement.type === 'laser' && currentElement.points.length > 1) {
        // Add laser element and schedule it for removal after 2 seconds
        onAddElement(currentElement);
        setTimeout(() => {
          onDeleteElement(currentElement.id);
        }, 2000);
      } else if (
        (currentElement.type === 'rectangle' || currentElement.type === 'ellipse' || currentElement.type === 'frame' || currentElement.type === 'web-embed') &&
        currentElement.width &&
        currentElement.height &&
        currentElement.width > 2 &&
        currentElement.height > 2
      ) {
        onAddElement(currentElement);
      }
    }

    setIsDrawing(false);
    setCurrentElement(null);
    setStartPoint(null);
    setLassoPoints([]);
  }, [currentElement, isDrawing, onAddElement, isPanning, isDragging, isResizing, isBoxSelecting, selectionBox, elements, tool, lassoPoints, onDeleteElement]);

  const handleTextSubmit = useCallback(() => {
    if (textInput && textValue.trim()) {
      const fontSize = strokeWidth * 4 + 12;
      const textWidth = textValue.length * fontSize * 0.55;
      const textHeight = fontSize * 1.2;
      
      // x,y is top-left of bounding box
      // The text input is positioned at textInput.y - 10 (see input style below)
      // So the actual top of the text should be around that position
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
      };
      onAddElement(newElement);
    }
    setTextInput(null);
    setTextValue('');
  }, [textInput, textValue, strokeColor, strokeWidth, onAddElement]);

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

  const renderElement = (element: BoardElement, isPreview = false) => {
    const opacity = isPreview ? 0.7 : 1;

    switch (element.type) {
      case 'pen': {
        const stroke = getStroke(element.points.map((p) => [p.x, p.y]), {
          size: element.strokeWidth * 2,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const pathData = getSvgPathFromStroke(stroke);
        return (
          <path
            key={element.id}
            d={pathData}
            fill={element.strokeColor}
            opacity={opacity}
          />
        );
      }
      case 'line': {
        if (element.points.length < 2) return null;
        return (
          <line
            key={element.id}
            x1={element.points[0].x}
            y1={element.points[0].y}
            x2={element.points[1].x}
            y2={element.points[1].y}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      }
      case 'rectangle': {
        return (
          <rect
            key={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            fill="none"
            rx={4}
            opacity={opacity}
          />
        );
      }
      case 'ellipse': {
        const cx = (element.x || 0) + (element.width || 0) / 2;
        const cy = (element.y || 0) + (element.height || 0) / 2;
        return (
          <ellipse
            key={element.id}
            cx={cx}
            cy={cy}
            rx={(element.width || 0) / 2}
            ry={(element.height || 0) / 2}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth}
            fill="none"
            opacity={opacity}
          />
        );
      }
      case 'text': {
        const fontSize = element.strokeWidth * 4 + 12;
        const scaleX = element.scaleX ?? 1;
        const scaleY = element.scaleY ?? 1;
        const x = element.x ?? 0;
        const y = element.y ?? 0;
        const baselineOffset = fontSize * 0.82;

        return (
          <text
            key={element.id}
            opacity={opacity}
            fill={element.strokeColor}
            fontSize={fontSize}
            fontFamily="inherit"
            x={0}
            y={baselineOffset}
            transform={`translate(${x}, ${y}) scale(${scaleX}, ${scaleY})`}
          >
            {element.text}
          </text>
        );
      }
      case 'frame': {
        return (
          <g key={element.id}>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              fill="none"
              rx={8}
              opacity={opacity}
              strokeDasharray="8,4"
            />
            {element.label && (
              <text
                x={(element.x ?? 0) + 8}
                y={(element.y ?? 0) - 4}
                fill={element.strokeColor}
                fontSize={14}
                fontFamily="inherit"
                fontWeight="600"
              >
                {element.label}
              </text>
            )}
          </g>
        );
      }
      case 'web-embed': {
        return (
          <g key={element.id}>
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              stroke={element.strokeColor}
              strokeWidth={element.strokeWidth}
              fill="rgba(100, 100, 255, 0.05)"
              rx={4}
              opacity={opacity}
            />
            {element.url && (
              <text
                x={(element.x ?? 0) + (element.width ?? 0) / 2}
                y={(element.y ?? 0) + (element.height ?? 0) / 2}
                fill={element.strokeColor}
                fontSize={12}
                fontFamily="inherit"
                textAnchor="middle"
                opacity={0.7}
              >
                {element.url}
              </text>
            )}
          </g>
        );
      }
      case 'laser': {
        if (element.points.length < 2) return null;
        const stroke = getStroke(element.points.map((p) => [p.x, p.y]), {
          size: 8,
          thinning: 0.3,
          smoothing: 0.5,
          streamline: 0.5,
        });
        const pathData = getSvgPathFromStroke(stroke);
        return (
          <path
            key={element.id}
            d={pathData}
            fill={element.strokeColor}
            opacity={Math.max(0.3, opacity * 0.7)}
            filter="url(#laser-glow)"
          />
        );
      }
      default:
        return null;
    }
  };

  // Render selection box with handles
  const renderSelectionBox = () => {
    if (!selectedBounds || selectedIds.length === 0) return null;
    
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
      case 'frame':
      case 'web-embed':
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

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fff 1px, transparent 1px),
            linear-gradient(to bottom, #fff 1px, transparent 1px)
          `,
          backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />
      
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
        </defs>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render all elements */}
          {elements.map((el) => renderElement(el))}

          {/* Render current element being drawn */}
          {currentElement && renderElement(currentElement, true)}

          {/* Render selection box */}
          {tool === 'select' && renderSelectionBox()}

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
        <input
          ref={textInputRef}
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
          onBlur={() => {
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
            top: textInput.y * zoom + pan.y - (strokeWidth * 4 + 12) * 0.82 * zoom,
            fontSize: (strokeWidth * 4 + 12) * zoom,
            color: strokeColor,
            minWidth: '100px',
          }}
          placeholder="Type..."
        />
      )}

      {/* Zoom Control */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-lg p-1.5 shadow-xl">
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
            className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
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
            className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all"
            title="Zoom In"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all text-xs"
            title="Reset Zoom"
          >
            Reset
          </button>
        </div>
        <div className="text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
          Ctrl+Scroll to zoom • Middle-click to pan
        </div>
      </div>
    </div>
  );
}
