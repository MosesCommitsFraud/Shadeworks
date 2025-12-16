'use client';

import { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { ChevronLeft, ChevronRight, Circle, Minus, Square, Type, Pencil, ArrowUpToLine, ArrowDownToLine, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Tool, COLORS, STROKE_WIDTHS, FONTS, FONT_SIZES, BoardElement } from '@/lib/board-types';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  connectorStyle?: 'sharp' | 'curved' | 'elbow';
  onConnectorStyleChange?: (style: 'sharp' | 'curved' | 'elbow') => void;
  arrowStart?: NonNullable<BoardElement['arrowStart']>;
  onArrowStartChange?: (end: NonNullable<BoardElement['arrowStart']>) => void;
  arrowEnd?: NonNullable<BoardElement['arrowEnd']>;
  onArrowEndChange?: (end: NonNullable<BoardElement['arrowEnd']>) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  textAlign: 'left' | 'center' | 'right';
  onTextAlignChange: (align: 'left' | 'center' | 'right') => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  letterSpacing: number;
  onLetterSpacingChange: (spacing: number) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
  fillPattern?: 'none' | 'solid' | 'criss-cross';
  onFillPatternChange?: (pattern: 'none' | 'solid' | 'criss-cross') => void;
  lineCap?: 'butt' | 'round';
  onLineCapChange?: (cap: 'butt' | 'round') => void;
  selectedElements?: BoardElement[];
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onMoveForward?: () => void;
  onMoveBackward?: () => void;
}

// Tools that have adjustable properties
const ADJUSTABLE_TOOLS: Tool[] = ['pen', 'line', 'arrow', 'rectangle', 'ellipse', 'text'];

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
  connectorStyle = 'sharp',
  onConnectorStyleChange,
  arrowStart = 'arrow',
  onArrowStartChange,
  arrowEnd = 'arrow',
  onArrowEndChange,
  fontFamily,
  onFontFamilyChange,
  textAlign,
  onTextAlignChange,
  fontSize,
  onFontSizeChange,
  letterSpacing,
  onLetterSpacingChange,
  lineHeight,
  onLineHeightChange,
  fillPattern = 'none',
  onFillPatternChange,
  lineCap = 'round',
  onLineCapChange,
  selectedElements = [],
  onBringToFront,
  onSendToBack,
  onMoveForward,
  onMoveBackward,
}: ToolSidebarProps) {
  const { theme, resolvedTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showStrokeColorPicker, setShowStrokeColorPicker] = useState(false);
  const [showFillColorPicker, setShowFillColorPicker] = useState(false);
  const [customStrokeColor, setCustomStrokeColor] = useState(strokeColor);
  const [customFillColor, setCustomFillColor] = useState(fillColor);
  const [openArrowEndMenu, setOpenArrowEndMenu] = useState<'start' | 'end' | null>(null);
  const [arrowEndMenuPos, setArrowEndMenuPos] = useState<{ left: number; top: number } | null>(null);
  const arrowStartButtonRef = useRef<HTMLButtonElement | null>(null);
  const arrowEndButtonRef = useRef<HTMLButtonElement | null>(null);

  const arrowEndOptions = useMemo(
    () =>
      [
        { id: 'arrow', label: 'Arrow' },
        { id: 'triangle', label: 'Triangle' },
        { id: 'triangle-outline', label: 'Triangle Outline' },
        { id: 'diamond', label: 'Diamond' },
        { id: 'diamond-outline', label: 'Diamond Outline' },
        { id: 'circle', label: 'Circle' },
        { id: 'circle-outline', label: 'Circle Outline' },
        { id: 'bar', label: 'Bar' },
      ] as Array<{ id: NonNullable<BoardElement['arrowEnd']>; label: string }>,
    []
  );

  const renderArrowEndPreview = (endType: NonNullable<BoardElement['arrowEnd']>) => {
    const stroke = 'currentColor';
    const sw = 1.8;
    const cx = 18;
    const cy = 10;

    switch (endType) {
      case 'arrow':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="20" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <line x1="20" y1={cy} x2="14.5" y2="6.5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <line x1="20" y1={cy} x2="14.5" y2="13.5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          </svg>
        );
      case 'triangle':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="13" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <polygon points="13,5 23,10 13,15" fill={stroke} />
          </svg>
        );
      case 'triangle-outline':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="13" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <polygon points="13,5 23,10 13,15" fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          </svg>
        );
      case 'diamond':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="12.5" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <polygon points="12.5,10 17.5,5 22.5,10 17.5,15" fill={stroke} />
          </svg>
        );
      case 'diamond-outline':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="12.5" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <polygon points="12.5,10 17.5,5 22.5,10 17.5,15" fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
          </svg>
        );
      case 'circle':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="13" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="4.2" fill={stroke} />
          </svg>
        );
      case 'circle-outline':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="13" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="4.2" fill="none" stroke={stroke} strokeWidth={sw} />
          </svg>
        );
      case 'bar':
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="16" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
            <line x1={cx} y1="4.5" x2={cx} y2="15.5" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          </svg>
        );
      default:
        return (
          <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
            <line x1="3" y1={cy} x2="23" y2={cy} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          </svg>
        );
    }
  };

  const openArrowMenu = (which: 'start' | 'end') => {
    const ref = which === 'start' ? arrowStartButtonRef : arrowEndButtonRef;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) {
      setOpenArrowEndMenu(which);
      return;
    }

    const menuWidth = 260;
    const padding = 8;
    const left = Math.min(
      Math.max(padding, rect.right - menuWidth),
      window.innerWidth - menuWidth - padding
    );
    const top = Math.min(Math.max(padding, rect.bottom + 8), window.innerHeight - padding);

    setArrowEndMenuPos({ left, top });
    setOpenArrowEndMenu(which);
  };

  // Don't show sidebar for non-adjustable tools
  if (!ADJUSTABLE_TOOLS.includes(selectedTool) && selectedElements.length === 0) {
    return null;
  }

  const hasSelectedElements = selectedElements.length > 0;

  // Reorder colors based on theme: black first in light mode, white first in dark mode
  const currentTheme = resolvedTheme || theme;
  const orderedColors = currentTheme === 'light'
    ? COLORS
    : [COLORS[1], COLORS[0], ...COLORS.slice(2)];

  // Determine what controls to show based on selected elements or current tool
  const showFill = hasSelectedElements
    ? selectedElements.some(el =>
        el.type === 'rectangle' ||
        el.type === 'ellipse' ||
        el.type === 'frame' ||
        (el.type === 'pen' && el.isClosed && fillPattern !== 'none')
      )
    : selectedTool === 'rectangle' ||
      selectedTool === 'ellipse' ||
      (selectedTool === 'pen' && fillPattern !== 'none');

  const showCornerRadius = hasSelectedElements
    ? selectedElements.some(el => el.type === 'rectangle' || el.type === 'frame')
    : selectedTool === 'rectangle';

  const isTextTool = hasSelectedElements
    ? selectedElements.some(el => el.type === 'text')
    : selectedTool === 'text';

  const showStrokeWidthAndStyle = !isTextTool;

  const showConnectorControls = hasSelectedElements
    ? selectedElements.some(el => el.type === 'line' || el.type === 'arrow')
    : selectedTool === 'line' || selectedTool === 'arrow';

  const showArrowControls = hasSelectedElements
    ? selectedElements.some(el => el.type === 'arrow')
    : selectedTool === 'arrow';

  return (
    <>
      <div
        className={cn(
          'fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-out',
          isCollapsed ? 'translate-x-[calc(100%-3rem)]' : 'translate-x-0'
        )}
      >
        <div className="relative bg-card/95 backdrop-blur-md border border-border rounded-sm shadow-2xl overflow-hidden">
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-16 bg-card/95 backdrop-blur-md border border-border rounded-l-sm hover:bg-accent/20 transition-colors flex items-center justify-center"
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
            <div className="flex flex-wrap gap-1">
              {orderedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onStrokeColorChange(color)}
                  className={cn(
                    'w-7 h-7 rounded-sm border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg',
                    strokeColor === color
                      ? 'border-accent shadow-lg scale-105'
                      : 'border-border/50'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {/* Custom color picker */}
              <button
                onClick={() => setShowStrokeColorPicker(true)}
                className="w-7 h-7 rounded-sm border-2 border-border/50 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg overflow-hidden"
                title="Custom color"
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%)'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Fill Color (for shapes) */}
          {showFill && onFillColorChange && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fill Color
                </label>
                <div className="flex flex-wrap gap-1">
                  {/* Transparent option */}
                  <button
                    onClick={() => onFillColorChange('transparent')}
                    className={cn(
                      'w-7 h-7 rounded-sm border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg relative',
                      fillColor === 'transparent'
                        ? 'border-accent shadow-lg scale-105'
                        : 'border-border/50'
                    )}
                    style={{
                      background: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5), linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)',
                      backgroundSize: '6px 6px',
                      backgroundPosition: '0 0, 3px 3px'
                    }}
                    title="Transparent"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-0.5 bg-red-500 rotate-45" />
                    </div>
                  </button>
                  {orderedColors.map((color) => (
                    <button
                      key={`fill-${color}`}
                      onClick={() => onFillColorChange(color)}
                      className={cn(
                        'w-7 h-7 rounded-sm border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg',
                        fillColor === color
                          ? 'border-accent shadow-lg scale-105'
                          : 'border-border/50'
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {/* Custom color picker */}
                  <button
                    onClick={() => setShowFillColorPicker(true)}
                    className="w-7 h-7 rounded-sm border-2 border-border/50 cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-lg overflow-hidden"
                    title="Custom fill color"
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        background: 'linear-gradient(135deg, #ff0000 0%, #ff7f00 14%, #ffff00 28%, #00ff00 42%, #0000ff 57%, #4b0082 71%, #9400d3 85%, #ff0000 100%)'
                      }}
                    />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Font Family (for text tool) */}
          {isTextTool && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Font
              </label>
              <div className="grid grid-cols-2 gap-1">
                {FONTS.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => onFontFamilyChange(font.value)}
                    className={cn(
                      'h-8 rounded-sm border transition-all duration-200 flex items-center justify-center text-xs hover:bg-secondary/50',
                      fontFamily === font.value
                        ? 'border-accent bg-secondary/50'
                        : 'border-border/50'
                    )}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Font Size & Text Alignment (for text tool) */}
          {isTextTool && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Size & Align
              </label>
              <div className="flex gap-1">
                <Select
                  value={fontSize.toString()}
                  onValueChange={(value) => onFontSizeChange(Number(value))}
                >
                  <SelectTrigger className="flex-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_SIZES.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}px
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => onTextAlignChange('left')}
                  className={cn(
                    'h-8 w-8 rounded-sm border transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    textAlign === 'left' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onTextAlignChange('center')}
                  className={cn(
                    'h-8 w-8 rounded-sm border transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    textAlign === 'center' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onTextAlignChange('right')}
                  className={cn(
                    'h-8 w-8 rounded-sm border transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    textAlign === 'right' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Letter Spacing & Line Height (for text tool) */}
          {isTextTool && (
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Spacing
              </label>
              <div className="space-y-3">
                <Slider
                  label="Letter"
                  showValue
                  unit="px"
                  value={[letterSpacing]}
                  onValueChange={([v]) => onLetterSpacingChange(v)}
                  min={-2}
                  max={10}
                  step={0.5}
                />
                <Slider
                  label="Line"
                  showValue
                  value={[lineHeight]}
                  onValueChange={([v]) => onLineHeightChange(v)}
                  min={1}
                  max={3}
                  step={0.1}
                />
              </div>
            </div>
          )}

          {/* Stroke Width (not for text tool) */}
          {showStrokeWidthAndStyle && (
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
                      'flex-1 h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                      strokeWidth === width
                        ? 'border-accent bg-secondary/50'
                        : 'border-border/50'
                    )}
                  >
                    <div
                      className="w-full bg-foreground rounded-full mx-2"
                      style={{ height: width }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stroke Style (not for text tool) */}
          {showStrokeWidthAndStyle && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stroke Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onStrokeStyleChange('solid')}
                  className={cn(
                    'h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
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
                    'h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
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
                    'h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    strokeStyle === 'dotted'
                      ? 'border-accent bg-secondary/50'
                      : 'border-border/50'
                  )}
                >
                  <div className="w-full h-0.5 border-t-2 border-dotted border-foreground mx-2" />
                </button>
              </div>
            </div>
          )}

          {/* Line Cap (not for text tool) */}
          {showStrokeWidthAndStyle && onLineCapChange && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Line Cap
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => onLineCapChange('butt')}
                  className={cn(
                    'h-8 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    lineCap === 'butt'
                      ? 'border-accent bg-secondary/50'
                      : 'border-border/50'
                  )}
                  title="Butt (flat)"
                >
                  <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
                    <line x1="4" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="6" strokeLinecap="butt" />
                  </svg>
                </button>
                <button
                  onClick={() => onLineCapChange('round')}
                  className={cn(
                    'h-8 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    lineCap === 'round'
                      ? 'border-accent bg-secondary/50'
                      : 'border-border/50'
                  )}
                  title="Round"
                >
                  <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
                    <line x1="4" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Connector corner style (line/arrow) */}
          {showConnectorControls && onConnectorStyleChange && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Corner
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onConnectorStyleChange('sharp')}
                  className={cn(
                    'h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50 gap-2',
                    connectorStyle === 'sharp' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                  title="Sharp corner"
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" className="text-foreground">
                    <polyline points="2,14 10,6 22,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => onConnectorStyleChange('curved')}
                  className={cn(
                    'h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50 gap-2',
                    connectorStyle === 'curved' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                  title="Curved"
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" className="text-foreground">
                    <path d="M 2 14 Q 10 4 22 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => onConnectorStyleChange('elbow')}
                  className={cn(
                    'h-10 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50 gap-2',
                    connectorStyle === 'elbow' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                  title="Elbow"
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" className="text-foreground">
                    <polyline points="2,14 14,14 14,2 22,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Arrow ends (arrow tool) */}
          {showArrowControls && onArrowStartChange && onArrowEndChange && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Arrow Ends
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1 relative">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Start</div>
                  <button
                    type="button"
                    ref={arrowStartButtonRef}
                    onClick={() => {
                      if (openArrowEndMenu === 'start') {
                        setOpenArrowEndMenu(null);
                        return;
                      }
                      openArrowMenu('start');
                    }}
                    className={cn(
                      'h-10 w-full rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                      openArrowEndMenu === 'start' ? 'border-accent bg-secondary/50' : 'border-border/50'
                    )}
                    title="Start marker"
                  >
                    {renderArrowEndPreview(arrowStart)}
                  </button>
                </div>

                <div className="space-y-1 relative">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">End</div>
                  <button
                    type="button"
                    ref={arrowEndButtonRef}
                    onClick={() => {
                      if (openArrowEndMenu === 'end') {
                        setOpenArrowEndMenu(null);
                        return;
                      }
                      openArrowMenu('end');
                    }}
                    className={cn(
                      'h-10 w-full rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                      openArrowEndMenu === 'end' ? 'border-accent bg-secondary/50' : 'border-border/50'
                    )}
                    title="End marker"
                  >
                    {renderArrowEndPreview(arrowEnd)}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fill Pattern (for pen tool) */}
          {(selectedTool === 'pen' || selectedElements.some(el => el.type === 'pen')) && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fill Pattern
              </label>
              <div className="grid grid-cols-3 gap-1">
                {/* None button */}
                <button
                  onClick={() => onFillPatternChange?.('none')}
                  className={cn(
                    'h-8 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    fillPattern === 'none' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                >
                  <span className="text-xs">None</span>
                </button>

                {/* Solid button */}
                <button
                  onClick={() => onFillPatternChange?.('solid')}
                  className={cn(
                    'h-8 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    fillPattern === 'solid' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                >
                  <div className="w-6 h-6 rounded-sm bg-foreground/30" />
                </button>

                {/* Criss-cross button */}
                <button
                  onClick={() => onFillPatternChange?.('criss-cross')}
                  className={cn(
                    'h-8 rounded-sm border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                    fillPattern === 'criss-cross' ? 'border-accent bg-secondary/50' : 'border-border/50'
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" className="text-foreground">
                    <pattern id="criss-cross-preview" width="10" height="10" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>
                      <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>
                    </pattern>
                    <rect width="20" height="20" fill="url(#criss-cross-preview)" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Corner Radius (for rectangles) */}
          {showCornerRadius && (
            <div className="space-y-2">
              <Slider
                label="Corner Radius"
                showValue
                unit="px"
                value={[cornerRadius]}
                onValueChange={([v]) => onCornerRadiusChange(v)}
                min={0}
                max={50}
                step={1}
              />
            </div>
          )}

          {/* Opacity */}
          <div className="space-y-2">
            <Slider
              label="Opacity"
              showValue
              unit="%"
              value={[opacity]}
              onValueChange={([v]) => onOpacityChange(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          {/* Layer Order (when elements are selected) */}
          {hasSelectedElements && onBringToFront && onSendToBack && onMoveForward && onMoveBackward && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Layer Order
              </label>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={onBringToFront}
                  className="flex items-center justify-center px-2 py-2 rounded-sm border-2 border-border/50 hover:border-accent hover:bg-secondary/50 transition-all duration-200"
                  title="Bring to Front"
                >
                  <ArrowUpToLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onMoveForward}
                  className="flex items-center justify-center px-2 py-2 rounded-sm border-2 border-border/50 hover:border-accent hover:bg-secondary/50 transition-all duration-200"
                  title="Move Forward"
                >
                  <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                </button>
                <button
                  onClick={onMoveBackward}
                  className="flex items-center justify-center px-2 py-2 rounded-sm border-2 border-border/50 hover:border-accent hover:bg-secondary/50 transition-all duration-200"
                  title="Move Backward"
                >
                  <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
                </button>
                <button
                  onClick={onSendToBack}
                  className="flex items-center justify-center px-2 py-2 rounded-sm border-2 border-border/50 hover:border-accent hover:bg-secondary/50 transition-all duration-200"
                  title="Send to Back"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Stroke Color Picker Modal - Outside overflow container */}
      {showStrokeColorPicker && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/50" onClick={() => setShowStrokeColorPicker(false)} />
          <div
            className="fixed right-80 top-1/2 -translate-y-1/2 z-[9999] bg-card border border-border rounded-sm p-6 shadow-2xl w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Custom Stroke Color</h3>
              <button onClick={() => setShowStrokeColorPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Color Wheel */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Color Picker
                </label>
                <div className="flex justify-center">
                  <input
                    type="color"
                    value={customStrokeColor}
                    onChange={(e) => setCustomStrokeColor(e.target.value)}
                    className="w-32 h-32 rounded-sm cursor-pointer border-2 border-border/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Hex Code
                </label>
                <input
                  type="text"
                  value={customStrokeColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                      setCustomStrokeColor(value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary/50 border-2 border-border/50 rounded-sm text-foreground font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                  placeholder="#FFFFFF"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Preview
                </label>
                <div
                  className="w-full h-16 rounded-sm border-2 border-border/50"
                  style={{ backgroundColor: customStrokeColor }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onStrokeColorChange(customStrokeColor);
                    setShowStrokeColorPicker(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Apply Color
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fill Color Picker Modal - Outside overflow container */}
      {showFillColorPicker && (
        <>
          <div className="fixed inset-0 z-[9998] bg-black/50" onClick={() => setShowFillColorPicker(false)} />
          <div
            className="fixed right-80 top-1/2 -translate-y-1/2 z-[9999] bg-card border border-border rounded-sm p-6 shadow-2xl w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Custom Fill Color</h3>
              <button onClick={() => setShowFillColorPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Color Wheel */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Color Picker
                </label>
                <div className="flex justify-center">
                  <input
                    type="color"
                    value={customFillColor === 'transparent' ? '#ffffff' : customFillColor}
                    onChange={(e) => setCustomFillColor(e.target.value)}
                    className="w-32 h-32 rounded-sm cursor-pointer border-2 border-border/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Hex Code
                </label>
                <input
                  type="text"
                  value={customFillColor === 'transparent' ? '' : customFillColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{0,6}$/i.test(value)) {
                      setCustomFillColor(value);
                    }
                  }}
                  className="w-full px-3 py-2 bg-secondary/50 border-2 border-border/50 rounded-sm text-foreground font-mono text-sm focus:border-accent focus:outline-none transition-colors"
                  placeholder="#FFFFFF"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Preview
                </label>
                <div
                  className="w-full h-16 rounded-sm border-2 border-border/50"
                  style={{ backgroundColor: customFillColor === 'transparent' ? '#ffffff' : customFillColor }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onFillColorChange) {
                      onFillColorChange(customFillColor);
                    }
                    setShowFillColorPicker(false);
                  }}
                  className="flex-1 px-4 py-2.5 bg-accent text-accent-foreground rounded-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Apply Color
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Arrow End Picker Menu - Outside overflow container */}
      {openArrowEndMenu && arrowEndMenuPos && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpenArrowEndMenu(null)} />
          <div
            className="fixed z-[9999] w-[260px] bg-card/95 backdrop-blur-md border border-border rounded-sm shadow-2xl p-2"
            style={{ left: arrowEndMenuPos.left, top: arrowEndMenuPos.top }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-2 gap-1">
              {arrowEndOptions.map((opt) => {
                const isSelected = openArrowEndMenu === 'start' ? arrowStart === opt.id : arrowEnd === opt.id;
                return (
                  <button
                    key={`${openArrowEndMenu}-${opt.id}`}
                    type="button"
                    onClick={() => {
                      if (openArrowEndMenu === 'start') onArrowStartChange?.(opt.id);
                      else onArrowEndChange?.(opt.id);
                      setOpenArrowEndMenu(null);
                    }}
                    className={cn(
                      'h-10 rounded-sm border-2 transition-all duration-150 flex items-center justify-center hover:bg-secondary/60',
                      isSelected ? 'border-accent bg-secondary/50' : 'border-border/50'
                    )}
                    title={opt.label}
                  >
                    {renderArrowEndPreview(opt.id)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
