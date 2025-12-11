'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModernSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

export function ModernSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  className,
  label,
  showValue = true,
  formatValue,
}: ModernSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = x / rect.width;
      let newValue = min + percent * (max - min);

      // Snap to step
      newValue = Math.round(newValue / step) * step;
      newValue = Math.max(min, Math.min(max, newValue));

      onChange(newValue);
    },
    [min, max, step, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        updateValue(e.clientX);
      }
    },
    [isDragging, updateValue]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayValue = formatValue ? formatValue(value) : value;

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showValue && <span className="text-muted-foreground">{displayValue}</span>}
        </div>
      )}
      <div
        ref={sliderRef}
        className="relative h-1.5 bg-muted rounded-full cursor-pointer group"
        onMouseDown={handleMouseDown}
      >
        {/* Progress bar */}
        <div
          className="absolute h-full bg-accent rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
        {/* Hover effect */}
        <div
          className="absolute h-full bg-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
