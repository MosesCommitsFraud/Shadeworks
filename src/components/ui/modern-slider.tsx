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
  const [isHovering, setIsHovering] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;
  const isActive = isHovering || isDragging;
  const thumbWidth = isDragging ? 34 : isActive ? 30 : 28;
  const thumbHeight = isDragging ? 18 : isActive ? 16 : 14;
  const thumbOffsetX = Math.round(thumbWidth * 0.14) + 1;

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

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      updateValue(e.clientX);
    },
    [updateValue]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      e.preventDefault();
      updateValue(e.clientX);
    },
    [isDragging, updateValue]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const handleWindowPointerUp = () => setIsDragging(false);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [isDragging]);

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
        className="relative h-1.5 rounded-full bg-muted cursor-pointer group touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {/* Progress bar */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 z-10 rounded-full bg-accent',
            isDragging ? 'transition-none' : 'transition-[width] duration-150 ease-out'
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* End-cap "thumb" */}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 40"
          className={cn(
            "pointer-events-none absolute z-20 block text-accent",
            "transition-[opacity,transform,width,height] duration-200 ease-in-out",
            "opacity-0",
            isDragging ? "opacity-100" : "group-hover:opacity-100"
          )}
          style={{
            left: `${percentage}%`,
            top: "50%",
            width: thumbWidth,
            height: thumbHeight,
            transform: `translate(${-thumbOffsetX}px, -50%)`,
          }}
        >
          <path
            fill="currentColor"
            d="M0 14C6 14 8 6 16 6C30 6 35 0 50 0H80C91 0 100 9 100 20C100 31 91 40 80 40H50C35 40 30 34 16 34C8 34 6 26 0 26Z"
          />
        </svg>
        {/* Hover effect */}
        <div
          className={cn(
            'absolute inset-y-0 left-0 z-0 rounded-full bg-accent/20 opacity-0',
            'transition-[width,opacity] duration-200 ease-out',
            isDragging ? 'opacity-100' : 'group-hover:opacity-100'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
