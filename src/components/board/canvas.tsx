'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import getStroke from 'perfect-freehand';
import type { Tool, BoardElement, Point } from '@/lib/board-types';
import { CollaborationManager } from '@/lib/collaboration';

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
  
  if (element.type === 'rectangle' || element.type === 'ellipse') {
    return {
      x: element.x ?? 0,
      y: element.y ?? 0,
      width: element.width ?? 0,
      height: element.height ?? 0,
    };
  }
  
  if (element.type === 'text') {
    // Text stores x,y as top-left of bounding box
    // width/height are the box dimensions
    if (element.width !== undefined && element.height !== undefined) {
      return {
        x: element.x ?? 0,
        y: element.y ?? 0,
        width: element.width,
        height: element.height,
      };
    }
    // Fallback for legacy text without stored dimensions
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
  
  return null;
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
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<BoardElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState('');
  const textInputRef = useRef<HTMLInputElement>(null);
  
  // Move and resize state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [originalElement, setOriginalElement] = useState<BoardElement | null>(null);
  const [originalBounds, setOriginalBounds] = useState<BoundingBox | null>(null);
  
  // Shift key tracking for aspect ratio lock
  const [shiftPressed, setShiftPressed] = useState(false);

  // Track shift key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftPressed(true);
      if (e.key === 'Delete' && selectedId) {
        onDeleteElement(selectedId);
        setSelectedId(null);
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
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
  }, [selectedId, onDeleteElement]);

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
      x: e.clientX - rect.left - pan.x,
      y: e.clientY - rect.top - pan.y,
    };
  }, [pan]);

  // Get selected element
  const selectedElement = selectedId ? elements.find(el => el.id === selectedId) : null;
  const selectedBounds = selectedElement ? getBoundingBox(selectedElement) : null;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const point = getMousePosition(e);
    
    // Update cursor position for collaboration
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

    // Handle dragging (moving element)
    if (isDragging && selectedId && dragStart && originalElement) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      
      if (originalElement.type === 'pen' || originalElement.type === 'line') {
        const newPoints = originalElement.points.map(p => ({
          x: p.x + dx,
          y: p.y + dy,
        }));
        onUpdateElement(selectedId, { points: newPoints });
      } else {
        onUpdateElement(selectedId, {
          x: (originalElement.x ?? 0) + dx,
          y: (originalElement.y ?? 0) + dy,
        });
      }
      return;
    }

    // Handle resizing
    if (isResizing && selectedId && dragStart && originalBounds && resizeHandle && originalElement) {
      const dx = point.x - dragStart.x;
      const dy = point.y - dragStart.y;
      
      let newX = originalBounds.x;
      let newY = originalBounds.y;
      let newWidth = originalBounds.width;
      let newHeight = originalBounds.height;
      
      // Calculate aspect ratio for shift-constrained resize
      const aspectRatio = originalBounds.width / originalBounds.height;
      
      // Calculate new bounds based on handle
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
      
      // Enforce minimum size
      const minSize = 10;
      if (newWidth < minSize) {
        if (resizeHandle.includes('w')) newX = originalBounds.x + originalBounds.width - minSize;
        newWidth = minSize;
      }
      if (newHeight < minSize) {
        if (resizeHandle.includes('n')) newY = originalBounds.y + originalBounds.height - minSize;
        newHeight = minSize;
      }
      
      // Update element based on type
      if (originalElement.type === 'rectangle' || originalElement.type === 'ellipse') {
        onUpdateElement(selectedId, {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        });
      } else if (originalElement.type === 'pen' || originalElement.type === 'line') {
        // Scale points proportionally
        const scaleX = newWidth / originalBounds.width;
        const scaleY = newHeight / originalBounds.height;
        const newPoints = originalElement.points.map(p => ({
          x: newX + (p.x - originalBounds.x) * scaleX,
          y: newY + (p.y - originalBounds.y) * scaleY,
        }));
        onUpdateElement(selectedId, { points: newPoints });
      } else if (originalElement.type === 'text') {
        // For text, use scaleX and scaleY for squishing/stretching
        const scaleX = newWidth / originalBounds.width;
        const scaleY = newHeight / originalBounds.height;
        const origScaleX = originalElement.scaleX ?? 1;
        const origScaleY = originalElement.scaleY ?? 1;
        
        onUpdateElement(selectedId, { 
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
        
        // Shift for square
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
        
        // Shift for circle
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
    }
  }, [isDrawing, currentElement, startPoint, tool, collaboration, getMousePosition, isPanning, panStart, elements, onDeleteElement, strokeWidth, isDragging, isResizing, selectedId, dragStart, originalElement, originalBounds, resizeHandle, onUpdateElement, shiftPressed]);

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
      // Check if clicking on a resize handle first
      if (selectedBounds && selectedElement) {
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
            setOriginalElement({ ...selectedElement });
            setOriginalBounds({ ...selectedBounds });
            return;
          }
        }
        
        // Check if clicking inside the selection box (for moving)
        if (
          point.x >= selectedBounds.x &&
          point.x <= selectedBounds.x + selectedBounds.width &&
          point.y >= selectedBounds.y &&
          point.y <= selectedBounds.y + selectedBounds.height
        ) {
          onStartTransform?.();
          setIsDragging(true);
          setDragStart(point);
          setOriginalElement({ ...selectedElement });
          return;
        }
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
        setSelectedId(clicked.id);
        onStartTransform?.();
        setIsDragging(true);
        setDragStart(point);
        setOriginalElement({ ...clicked });
      } else {
        setSelectedId(null);
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

    const newElement: BoardElement = {
      id: uuid(),
      type: tool as 'pen' | 'line' | 'rectangle' | 'ellipse',
      points: [point],
      strokeColor,
      strokeWidth,
    };

    if (tool === 'rectangle' || tool === 'ellipse') {
      newElement.x = point.x;
      newElement.y = point.y;
      newElement.width = 0;
      newElement.height = 0;
    }

    setCurrentElement(newElement);
    setIsDrawing(true);
  }, [tool, strokeColor, strokeWidth, getMousePosition, elements, pan, selectedBounds, selectedElement]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setOriginalElement(null);
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      setDragStart(null);
      setOriginalElement(null);
      setOriginalBounds(null);
      return;
    }

    if (currentElement && isDrawing) {
      if (currentElement.type === 'pen' && currentElement.points.length > 1) {
        onAddElement(currentElement);
      } else if (currentElement.type === 'line' && currentElement.points.length === 2) {
        onAddElement(currentElement);
      } else if (
        (currentElement.type === 'rectangle' || currentElement.type === 'ellipse') &&
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
  }, [currentElement, isDrawing, onAddElement, isPanning, isDragging, isResizing]);

  const handleTextSubmit = useCallback(() => {
    if (textInput && textValue.trim()) {
      const fontSize = strokeWidth * 4 + 12;
      const textWidth = textValue.length * fontSize * 0.55;
      const textHeight = fontSize * 1.2;
      
      // Store x,y as top-left of bounding box
      const newElement: BoardElement = {
        id: uuid(),
        type: 'text',
        points: [],
        strokeColor,
        strokeWidth,
        text: textValue,
        x: textInput.x,
        y: textInput.y - fontSize, // Adjust so text appears at click position
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
        
        // Text baseline offset from top of bounding box
        const baselineOffset = fontSize * 0.82;
        
        // Scale the text around top-left corner (x, y) of bounding box
        // Transform sequence: translate to origin, scale, translate back
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
      default:
        return null;
    }
  };

  // Render selection box with handles
  const renderSelectionBox = () => {
    if (!selectedBounds || !selectedId) return null;
    
    const handleSize = 8;
    const handles: { pos: ResizeHandle; x: number; y: number; cursor: string }[] = [
      { pos: 'nw', x: selectedBounds.x, y: selectedBounds.y, cursor: 'nwse-resize' },
      { pos: 'n', x: selectedBounds.x + selectedBounds.width / 2, y: selectedBounds.y, cursor: 'ns-resize' },
      { pos: 'ne', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y, cursor: 'nesw-resize' },
      { pos: 'e', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y + selectedBounds.height / 2, cursor: 'ew-resize' },
      { pos: 'se', x: selectedBounds.x + selectedBounds.width, y: selectedBounds.y + selectedBounds.height, cursor: 'nwse-resize' },
      { pos: 's', x: selectedBounds.x + selectedBounds.width / 2, y: selectedBounds.y + selectedBounds.height, cursor: 'ns-resize' },
      { pos: 'sw', x: selectedBounds.x, y: selectedBounds.y + selectedBounds.height, cursor: 'nesw-resize' },
      { pos: 'w', x: selectedBounds.x, y: selectedBounds.y + selectedBounds.height / 2, cursor: 'ew-resize' },
    ];
    
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
        
        {/* Resize handles */}
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
        return 'crosshair';
      case 'eraser':
        return 'cell';
      case 'select':
        return selectedId ? 'grab' : 'default';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0a0a0a]">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #fff 1px, transparent 1px),
            linear-gradient(to bottom, #fff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
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
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {/* Render all elements */}
          {elements.map((el) => renderElement(el))}
          
          {/* Render current element being drawn */}
          {currentElement && renderElement(currentElement, true)}
          
          {/* Render selection box */}
          {tool === 'select' && renderSelectionBox()}
        </g>
        
        {/* Remote Cursors */}
        {remoteCursors.map((cursor) => (
          <g key={cursor.id} transform={`translate(${cursor.x + pan.x}, ${cursor.y + pan.y})`}>
            <path
              d="M0,0 L0,16 L4,12 L8,20 L10,19 L6,11 L12,11 Z"
              fill={cursor.color}
              stroke="#000"
              strokeWidth={1}
            />
            <rect
              x={14}
              y={12}
              rx={4}
              width={Math.max(cursor.name.length * 7 + 12, 40)}
              height={20}
              fill={cursor.color}
            />
            <text
              x={20}
              y={26}
              fill="#000"
              fontSize={12}
              fontWeight={500}
            >
              {cursor.name}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Text Input */}
      {textInput && (
        <input
          ref={textInputRef}
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleTextSubmit();
            if (e.key === 'Escape') {
              setTextInput(null);
              setTextValue('');
            }
          }}
          onBlur={handleTextSubmit}
          className="absolute bg-transparent border-none outline-none text-foreground"
          style={{
            left: textInput.x + pan.x,
            top: textInput.y + pan.y - 10,
            fontSize: strokeWidth * 4 + 12,
            color: strokeColor,
            minWidth: '100px',
          }}
          placeholder="Type here..."
        />
      )}
      
      {/* Zoom/Pan Info */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border">
        Ctrl+Z to undo • Del to delete • Shift to constrain ratio
      </div>
    </div>
  );
}
