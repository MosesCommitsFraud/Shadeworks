'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Circle, Minus, Square, Type, Pencil, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
import { Tool, COLORS, STROKE_WIDTHS, BoardElement } from '@/lib/board-types';
import { cn } from '@/lib/utils';

interface ToolSidebarProps {
  selectedTool: Tool;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  fillColor?: string;
  onFillColorChange?: (color: string) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  onStrokeStyleChange: (style: 'solid' | 'dashed' | 'dotted') => void;
  cornerRadius: number;
  onCornerRadiusChange: (radius: number) => void;
  selectedElements?: BoardElement[];
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

// Tools that have adjustable properties
const ADJUSTABLE_TOOLS: Tool[] = ['pen', 'line', 'rectangle', 'ellipse', 'text', 'frame'];

export function ToolSidebar({
  selectedTool,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  fillColor = 'transparent',
  onFillColorChange,
  opacity,
  onOpacityChange,
  strokeStyle,
  onStrokeStyleChange,
  cornerRadius,
  onCornerRadiusChange,
  selectedElements = [],
  onBringToFront,
  onSendToBack,
}: ToolSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Don't show sidebar for non-adjustable tools
  if (!ADJUSTABLE_TOOLS.includes(selectedTool) && selectedElements.length === 0) {
    return null;
  }

  const showFill = selectedTool === 'rectangle' || selectedTool === 'ellipse' || selectedTool === 'frame';
  const showCornerRadius = selectedTool === 'rectangle' || selectedTool === 'frame';
  const hasSelectedElements = selectedElements.length > 0;

  return (
    <div
      className={cn(
        'fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-out',
        isCollapsed ? 'translate-x-[calc(100%-3rem)]' : 'translate-x-0'
      )}
    >
      <div className="relative bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-16 bg-card/95 backdrop-blur-md border border-border rounded-l-xl hover:bg-accent/20 transition-colors flex items-center justify-center"
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {/* Sidebar Content */}
        <div className={cn('w-64 p-4 space-y-4', isCollapsed && 'opacity-0 pointer-events-none')}>
          {/* Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            {selectedTool === 'pen' && <Pencil className="w-4 h-4 text-accent" />}
            {selectedTool === 'line' && <Minus className="w-4 h-4 text-accent" />}
            {selectedTool === 'rectangle' && <Square className="w-4 h-4 text-accent" />}
            {selectedTool === 'ellipse' && <Circle className="w-4 h-4 text-accent" />}
            {selectedTool === 'text' && <Type className="w-4 h-4 text-accent" />}
            <span className="text-sm font-semibold text-foreground capitalize">
              {hasSelectedElements ? `${selectedElements.length} Selected` : `${selectedTool} Properties`}
            </span>
          </div>

          {/* Stroke Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stroke Color
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onStrokeColorChange(color)}
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg',
                    strokeColor === color
                      ? 'border-accent shadow-lg scale-105'
                      : 'border-border/50'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Fill Color (for shapes) */}
          {showFill && onFillColorChange && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fill Color
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {/* Transparent option */}
                <button
                  onClick={() => onFillColorChange('transparent')}
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg relative',
                    fillColor === 'transparent'
                      ? 'border-accent shadow-lg scale-105'
                      : 'border-border/50'
                  )}
                  style={{
                    background: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5), linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)',
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px'
                  }}
                  title="Transparent"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-red-500 rotate-45" />
                  </div>
                </button>
                {COLORS.map((color) => (
                  <button
                    key={`fill-${color}`}
                    onClick={() => onFillColorChange(color)}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg',
                      fillColor === color
                        ? 'border-accent shadow-lg scale-105'
                        : 'border-border/50'
                    )}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stroke Width */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stroke Width
            </label>
            <div className="flex gap-2">
              {STROKE_WIDTHS.map((width) => (
                <button
                  key={width}
                  onClick={() => onStrokeWidthChange(width)}
                  className={cn(
                    'flex-1 h-12 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    strokeWidth === width
                      ? 'border-accent bg-secondary/50'
                      : 'border-border/50'
                  )}
                >
                  <div
                    className="rounded-full bg-foreground"
                    style={{ width: width + 2, height: width + 2 }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Style */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Stroke Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onStrokeStyleChange('solid')}
                className={cn(
                  'h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                  strokeStyle === 'solid'
                    ? 'border-accent bg-secondary/50'
                    : 'border-border/50'
                )}
              >
                <div className="w-full h-0.5 bg-foreground mx-2" />
              </button>
              <button
                onClick={() => onStrokeStyleChange('dashed')}
                className={cn(
                  'h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                  strokeStyle === 'dashed'
                    ? 'border-accent bg-secondary/50'
                    : 'border-border/50'
                )}
              >
                <div className="w-full h-0.5 border-t-2 border-dashed border-foreground mx-2" />
              </button>
              <button
                onClick={() => onStrokeStyleChange('dotted')}
                className={cn(
                  'h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                  strokeStyle === 'dotted'
                    ? 'border-accent bg-secondary/50'
                    : 'border-border/50'
                )}
              >
                <div className="w-full h-0.5 border-t-2 border-dotted border-foreground mx-2" />
              </button>
            </div>
          </div>

          {/* Corner Radius (for rectangles) */}
          {showCornerRadius && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Corner Radius
              </label>
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={cornerRadius}
                  onChange={(e) => onCornerRadiusChange(Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sharp</span>
                  <span className="font-medium text-foreground">{cornerRadius}px</span>
                  <span>Round</span>
                </div>
              </div>
            </div>
          )}

          {/* Opacity */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Opacity
            </label>
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span className="font-medium text-foreground">{opacity}%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Layer Order (when elements are selected) */}
          {hasSelectedElements && onBringToFront && onSendToBack && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Layer Order
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onBringToFront}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-border/50 hover:border-accent hover:bg-secondary/50 transition-all duration-200"
                >
                  <ArrowUpToLine className="w-4 h-4" />
                  <span className="text-xs font-medium">Front</span>
                </button>
                <button
                  onClick={onSendToBack}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 border-border/50 hover:border-accent hover:bg-secondary/50 transition-all duration-200"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span className="text-xs font-medium">Back</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
