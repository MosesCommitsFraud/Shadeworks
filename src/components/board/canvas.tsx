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
}

interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
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

export function Canvas({
  tool,
  strokeColor,
  strokeWidth,
  collaboration,
  elements,
  onAddElement,
  onUpdateElement,
  onDeleteElement,
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

  // Track remote cursors
  useEffect(() => {
    if (!collaboration) return;

    const unsubscribe = collaboration.onAwarenessChange((states) => {
      const myId = collaboration.getUserInfo().id;
      const cursors: RemoteCursor[] = [];
      
      states.forEach((state, clientId) => {
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
        setCurrentElement({
          ...currentElement,
          x: width < 0 ? point.x : startPoint.x,
          y: height < 0 ? point.y : startPoint.y,
          width: Math.abs(width),
          height: Math.abs(height),
        });
        break;
      }
      case 'ellipse': {
        const width = point.x - startPoint.x;
        const height = point.y - startPoint.y;
        setCurrentElement({
          ...currentElement,
          x: width < 0 ? point.x : startPoint.x,
          y: height < 0 ? point.y : startPoint.y,
          width: Math.abs(width),
          height: Math.abs(height),
        });
        break;
      }
      case 'eraser': {
        // Find elements under cursor and delete them
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
  }, [isDrawing, currentElement, startPoint, tool, collaboration, getMousePosition, isPanning, panStart, elements, onDeleteElement, strokeWidth]);

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
      // Find clicked element
      const clicked = [...elements].reverse().find((el) => {
        if (el.type === 'pen' || el.type === 'line') {
          return el.points.some((p) => Math.hypot(p.x - point.x, p.y - point.y) < 10);
        }
        if (el.type === 'rectangle' || el.type === 'ellipse') {
          return (
            el.x !== undefined &&
            el.y !== undefined &&
            el.width !== undefined &&
            el.height !== undefined &&
            point.x >= el.x &&
            point.x <= el.x + el.width &&
            point.y >= el.y &&
            point.y <= el.y + el.height
          );
        }
        return false;
      });
      setSelectedId(clicked?.id || null);
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
  }, [tool, strokeColor, strokeWidth, getMousePosition, elements, pan]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (currentElement && isDrawing) {
      // Don't add empty shapes
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
  }, [currentElement, isDrawing, onAddElement, isPanning]);

  const handleTextSubmit = useCallback(() => {
    if (textInput && textValue.trim()) {
      const newElement: BoardElement = {
        id: uuid(),
        type: 'text',
        points: [],
        strokeColor,
        strokeWidth,
        text: textValue,
        x: textInput.x,
        y: textInput.y,
      };
      onAddElement(newElement);
    }
    setTextInput(null);
    setTextValue('');
  }, [textInput, textValue, strokeColor, strokeWidth, onAddElement]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedId) {
        onDeleteElement(selectedId);
        setSelectedId(null);
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setTextInput(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, onDeleteElement]);

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
            className={selectedId === element.id ? 'outline outline-2 outline-accent outline-offset-2' : ''}
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
            className={selectedId === element.id ? 'outline outline-2 outline-accent outline-offset-2' : ''}
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
            className={selectedId === element.id ? 'outline outline-2 outline-accent outline-offset-2' : ''}
          />
        );
      }
      case 'text': {
        return (
          <text
            key={element.id}
            x={element.x}
            y={element.y}
            fill={element.strokeColor}
            fontSize={element.strokeWidth * 4 + 12}
            fontFamily="inherit"
            opacity={opacity}
            className={selectedId === element.id ? 'outline outline-2 outline-accent outline-offset-2' : ''}
          >
            {element.text}
          </text>
        );
      }
      default:
        return null;
    }
  };

  const getCursorStyle = () => {
    switch (tool) {
      case 'pen':
      case 'line':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      case 'select':
        return 'default';
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
        Middle-click to pan • Del to delete selected
      </div>
    </div>
  );
}

