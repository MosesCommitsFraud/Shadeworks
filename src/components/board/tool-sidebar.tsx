'use client';

import { useMemo, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { ChevronLeft, ChevronRight, Circle, Minus, Square, Type, Pencil, ArrowUpToLine, ArrowDownToLine, X, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Tool, COLORS, STROKE_WIDTHS, FONTS, FONT_SIZES, BoardElement } from '@/lib/board-types';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';

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

const SIDEBAR_HIDDEN_COLORS = new Set(['#a78bfa', '#c084fc', '#e879f9']);

const CONTROL_BUTTON =
  'rounded-md border border-input bg-background/50 shadow-xs transition-all duration-200 hover:bg-muted/60 hover:text-foreground active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background';
const CONTROL_BUTTON_SELECTED = 'bg-muted/70 border-foreground/20 shadow-sm';
const SWATCH_BASE =
  'w-7 h-7 rounded-md border border-input bg-background shadow-xs transition-all duration-200 hover:scale-110 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background';

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
  const sidebarColors = orderedColors.filter((color) => !SIDEBAR_HIDDEN_COLORS.has(color));

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
        <div className="relative bg-card/95 backdrop-blur-md border border-border rounded-md shadow-2xl overflow-hidden">
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-16 bg-card/95 backdrop-blur-md border border-border rounded-l-md',
            'transition-all duration-200 hover:bg-muted/60 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background'
          )}
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
            {selectedTool === 'pen' && <Pencil className="w-4 h-4 text-foreground" />}
            {selectedTool === 'line' && <Minus className="w-4 h-4 text-foreground" />}
            {selectedTool === 'rectangle' && <Square className="w-4 h-4 text-foreground" />}
            {selectedTool === 'ellipse' && <Circle className="w-4 h-4 text-foreground" />}
            {selectedTool === 'text' && <Type className="w-4 h-4 text-foreground" />}
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
              {sidebarColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onStrokeColorChange(color)}
                  className={cn(
                    SWATCH_BASE,
                    strokeColor === color ? 'scale-105' : undefined
                  )}
                  style={{
                    backgroundColor: color,
                    boxShadow:
                      strokeColor === color
                        ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color}, 0 0 14px ${color}66`
                        : undefined,
                  }}
                  title={color}
                />
              ))}
              {/* Custom color picker */}
              <button
                onClick={() => setShowStrokeColorPicker(true)}
                className={cn(SWATCH_BASE, 'cursor-pointer overflow-hidden')}
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
                      SWATCH_BASE,
                      'relative',
                      fillColor === 'transparent' ? 'scale-105' : undefined
                    )}
                    style={{
                      background: 'linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5), linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)',
                      backgroundSize: '6px 6px',
                      backgroundPosition: '0 0, 3px 3px',
                      boxShadow:
                        fillColor === 'transparent'
                          ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--foreground) / 0.5)`
                          : undefined,
                    }}
                    title="Transparent"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-0.5 bg-red-500 rotate-45" />
                    </div>
                  </button>
                  {sidebarColors.map((color) => (
                    <button
                      key={`fill-${color}`}
                      onClick={() => onFillColorChange(color)}
                      className={cn(
                        SWATCH_BASE,
                        fillColor === color ? 'scale-105' : undefined
                      )}
                      style={{
                        backgroundColor: color,
                        boxShadow:
                          fillColor === color
                            ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color}, 0 0 14px ${color}66`
                            : undefined,
                      }}
                      title={color}
                    />
                  ))}
                  {/* Custom color picker */}
                  <button
                    onClick={() => setShowFillColorPicker(true)}
                    className={cn(SWATCH_BASE, 'cursor-pointer overflow-hidden')}
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
                  <Button
                    key={font.value}
                    onClick={() => onFontFamilyChange(font.value)}
                    className={cn(
                      'h-8 w-full justify-center px-2 text-xs',
                      CONTROL_BUTTON,
                      fontFamily === font.value
                        ? CONTROL_BUTTON_SELECTED
                        : undefined
                    )}
                    variant="outline"
                    size="sm"
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </Button>
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
                <ToggleGroup
                  type="single"
                  value={textAlign}
                  onValueChange={(value) => {
                    if (!value) return;
                    onTextAlignChange(value as 'left' | 'center' | 'right');
                  }}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <ToggleGroupItem
                    value="left"
                    aria-label="Align left"
                    className={cn(CONTROL_BUTTON, 'h-8 w-8 p-0 data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm')}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="center"
                    aria-label="Align center"
                    className={cn(CONTROL_BUTTON, 'h-8 w-8 p-0 data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm')}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="right"
                    aria-label="Align right"
                    className={cn(CONTROL_BUTTON, 'h-8 w-8 p-0 data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm')}
                  >
                    <AlignRight className="w-3.5 h-3.5" />
                  </ToggleGroupItem>
                </ToggleGroup>
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stroke Width
                </label>
                <span className="text-xs text-muted-foreground tabular-nums">{strokeWidth}px</span>
              </div>
              <ToggleGroup
                type="single"
                value={strokeWidth.toString()}
                onValueChange={(value) => {
                  if (!value) return;
                  onStrokeWidthChange(Number(value));
                }}
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2"
              >
                {STROKE_WIDTHS.map((width) => (
                  <ToggleGroupItem
                    key={width}
                    value={width.toString()}
                    aria-label={`Stroke width ${width}px`}
                    className={cn(
                      'flex-1 h-10 min-w-0 px-0',
                      CONTROL_BUTTON,
                      'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                    )}
                  >
                    <div className="flex flex-col items-center justify-center gap-1 w-full">
                      <div className="w-[calc(100%-1.25rem)] bg-foreground/90 rounded-full" style={{ height: width }} />
                    </div>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          {/* Stroke Style (not for text tool) */}
          {showStrokeWidthAndStyle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stroke Style
                </label>
                <span className="text-xs text-muted-foreground capitalize">{strokeStyle}</span>
              </div>
              <ToggleGroup
                type="single"
                value={strokeStyle}
                onValueChange={(value) => {
                  if (!value) return;
                  onStrokeStyleChange(value as 'solid' | 'dashed' | 'dotted');
                }}
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2"
              >
                <ToggleGroupItem
                  value="solid"
                  aria-label="Solid stroke"
                  className={cn(
                    'flex-1 h-10 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                >
                  <div className="w-full h-0.5 bg-foreground mx-2" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="dashed"
                  aria-label="Dashed stroke"
                  className={cn(
                    'flex-1 h-10 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                >
                  <div className="w-full h-0.5 border-t-2 border-dashed border-foreground mx-2" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="dotted"
                  aria-label="Dotted stroke"
                  className={cn(
                    'flex-1 h-10 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                >
                  <div className="w-full h-0.5 border-t-2 border-dotted border-foreground mx-2" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Line Cap (not for text tool) */}
          {showStrokeWidthAndStyle && onLineCapChange && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Line Cap
                </label>
                <span className="text-xs text-muted-foreground capitalize">{lineCap}</span>
              </div>
              <ToggleGroup
                type="single"
                value={lineCap}
                onValueChange={(value) => {
                  if (!value) return;
                  onLineCapChange(value as 'butt' | 'round');
                }}
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2"
              >
                <ToggleGroupItem
                  value="butt"
                  aria-label="Butt line cap"
                  className={cn(
                    'flex-1 h-9 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                  title="Butt (flat)"
                >
                  <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
                    <line x1="4" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="6" strokeLinecap="butt" />
                  </svg>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="round"
                  aria-label="Round line cap"
                  className={cn(
                    'flex-1 h-9 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                  title="Round"
                >
                  <svg width="28" height="20" viewBox="0 0 28 20" className="text-foreground">
                    <line x1="4" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          )}

          {/* Connector corner style (line/arrow) */}
          {showConnectorControls && onConnectorStyleChange && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Corner
                </label>
                <span className="text-xs text-muted-foreground capitalize">{connectorStyle}</span>
              </div>
              <ToggleGroup
                type="single"
                value={connectorStyle}
                onValueChange={(value) => {
                  if (!value) return;
                  onConnectorStyleChange(value as 'sharp' | 'curved' | 'elbow');
                }}
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2"
              >
                <ToggleGroupItem
                  value="sharp"
                  aria-label="Sharp corner"
                  className={cn(
                    'flex-1 h-10 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                  title="Sharp corner"
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" className="text-foreground">
                    <polyline points="2,14 10,6 22,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="curved"
                  aria-label="Curved"
                  className={cn(
                    'flex-1 h-10 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                  title="Curved"
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" className="text-foreground">
                    <path d="M 2 14 Q 10 4 22 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="elbow"
                  aria-label="Elbow"
                  className={cn(
                    'flex-1 h-10 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                  title="Elbow"
                >
                  <svg width="24" height="16" viewBox="0 0 24 16" className="text-foreground">
                    <polyline points="2,14 14,14 14,2 22,2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </ToggleGroupItem>
              </ToggleGroup>
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
                      CONTROL_BUTTON,
                      'h-10 w-full flex items-center justify-center',
                      openArrowEndMenu === 'start' ? CONTROL_BUTTON_SELECTED : undefined
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
                      CONTROL_BUTTON,
                      'h-10 w-full flex items-center justify-center',
                      openArrowEndMenu === 'end' ? CONTROL_BUTTON_SELECTED : undefined
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fill Pattern
                </label>
                <span className="text-xs text-muted-foreground capitalize">{fillPattern}</span>
              </div>
              <ToggleGroup
                type="single"
                value={fillPattern}
                onValueChange={(value) => {
                  if (!value) return;
                  onFillPatternChange?.(value as 'none' | 'solid' | 'criss-cross');
                }}
                variant="outline"
                size="sm"
                className="w-full justify-between gap-2"
              >
                <ToggleGroupItem
                  value="none"
                  aria-label="No fill pattern"
                  className={cn(
                    'flex-1 h-9 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                >
                  <span className="text-xs">None</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="solid"
                  aria-label="Solid fill pattern"
                  className={cn(
                    'flex-1 h-9 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                >
                  <div className="w-6 h-6 rounded-sm bg-foreground/30" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="criss-cross"
                  aria-label="Criss-cross fill pattern"
                  className={cn(
                    'flex-1 h-9 min-w-0 px-0',
                    CONTROL_BUTTON,
                    'data-[state=on]:bg-muted/70 data-[state=on]:border-foreground/20 data-[state=on]:shadow-sm'
                  )}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" className="text-foreground">
                    <pattern id="criss-cross-preview" width="10" height="10" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="10" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>
                      <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeLinecap="round"/>
                    </pattern>
                    <rect width="20" height="20" fill="url(#criss-cross-preview)" />
                  </svg>
                </ToggleGroupItem>
              </ToggleGroup>
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
                  className={cn(CONTROL_BUTTON, 'h-9 flex items-center justify-center')}
                  title="Bring to Front"
                >
                  <ArrowUpToLine className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onMoveForward}
                  className={cn(CONTROL_BUTTON, 'h-9 flex items-center justify-center')}
                  title="Move Forward"
                >
                  <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                </button>
                <button
                  onClick={onMoveBackward}
                  className={cn(CONTROL_BUTTON, 'h-9 flex items-center justify-center')}
                  title="Move Backward"
                >
                  <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
                </button>
                <button
                  onClick={onSendToBack}
                  className={cn(CONTROL_BUTTON, 'h-9 flex items-center justify-center')}
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
            className="fixed right-80 top-1/2 -translate-y-1/2 z-[9999] bg-card border border-border rounded-md p-6 shadow-2xl w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Custom Stroke Color</h3>
              <Button
                onClick={() => setShowStrokeColorPicker(false)}
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
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
                    className="w-32 h-32 rounded-md cursor-pointer border border-border/60 shadow-sm"
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
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="#FFFFFF"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Preview
                </label>
                <div
                  className="w-full h-16 rounded-md border border-border/60 shadow-sm"
                  style={{ backgroundColor: customStrokeColor }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onStrokeColorChange(customStrokeColor);
                    setShowStrokeColorPicker(false);
                  }}
                  className="flex-1"
                >
                  Apply Color
                </Button>
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
            className="fixed right-80 top-1/2 -translate-y-1/2 z-[9999] bg-card border border-border rounded-md p-6 shadow-2xl w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Custom Fill Color</h3>
              <Button
                onClick={() => setShowFillColorPicker(false)}
                variant="ghost"
                size="icon-sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
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
                    className="w-32 h-32 rounded-md cursor-pointer border border-border/60 shadow-sm"
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
                  className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground font-mono text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="#FFFFFF"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Preview
                </label>
                <div
                  className="w-full h-16 rounded-md border border-border/60 shadow-sm"
                  style={{ backgroundColor: customFillColor === 'transparent' ? '#ffffff' : customFillColor }}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (onFillColorChange) {
                      onFillColorChange(customFillColor);
                    }
                    setShowFillColorPicker(false);
                  }}
                  className="flex-1"
                >
                  Apply Color
                </Button>
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
            className="fixed z-[9999] w-[260px] bg-card/95 backdrop-blur-md border border-border rounded-md shadow-2xl p-2"
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
                      CONTROL_BUTTON,
                      'h-10 flex items-center justify-center hover:bg-muted/60',
                      isSelected ? CONTROL_BUTTON_SELECTED : undefined
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
