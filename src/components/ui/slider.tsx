"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SmoothSliderProps {
  min?: number
  max?: number
  step?: number
  defaultValue?: number | number[]
  value?: number | number[]
  onChange?: (value: number) => void
  onValueChange?: (value: number[]) => void
  label?: string
  showValue?: boolean
  className?: string
  disabled?: boolean
}

export function SmoothSlider({
  min = 0,
  max = 100,
  step = 1,
  defaultValue = 50,
  value: controlledValue,
  onChange,
  onValueChange,
  label,
  showValue = false,
  className,
  disabled = false,
}: SmoothSliderProps) {
  // Handle both array and number formats
  const normalizeValue = (v: number | number[] | undefined, def: number | number[]): number => {
    if (v === undefined) return Array.isArray(def) ? def[0] : def
    return Array.isArray(v) ? v[0] : v
  }

  const [internalValue, setInternalValue] = useState(() => normalizeValue(defaultValue, 50))
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const value = normalizeValue(controlledValue, internalValue)

  const percentage = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return

      const rect = trackRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      const rawValue = min + percentage * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))

      setInternalValue(clampedValue)
      onChange?.(clampedValue)
      onValueChange?.([clampedValue])
    },
    [min, max, step, onChange, onValueChange, disabled],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      updateValue(e.clientX)
    },
    [updateValue],
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      setIsDragging(true)
      updateValue(e.touches[0].clientX)
    },
    [updateValue],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      updateValue(e.touches[0].clientX)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchmove", handleTouchMove)
    document.addEventListener("touchend", handleEnd)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleEnd)
    }
  }, [isDragging, updateValue])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      let newValue = value

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(max, value + step)
          break
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(min, value - step)
          break
        case "Home":
          newValue = min
          break
        case "End":
          newValue = max
          break
        default:
          return
      }

      e.preventDefault()
      setInternalValue(newValue)
      onChange?.(newValue)
      onValueChange?.([newValue])
    },
    [value, min, max, step, onChange, onValueChange, disabled],
  )

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-3">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showValue && (
            <span
              className={cn(
                "text-sm tabular-nums transition-all duration-300 ease-out",
                isDragging ? "text-foreground scale-110" : "text-muted-foreground",
              )}
            >
              {Math.round(value)}
            </span>
          )}
        </div>
      )}

      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label || "Slider"}
        aria-disabled={disabled}
        className={cn(
          "relative w-full rounded-full",
          "bg-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-all duration-200 ease-out",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          isDragging ? "h-3" : isHovering ? "h-2" : "h-1.5",
        )}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseEnter={() => !disabled && setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onKeyDown={handleKeyDown}
      >
        {/* Filled track */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full",
            "bg-primary",
            "transition-all duration-150 ease-out",
          )}
          style={{ width: `${percentage}%` }}
        />

        {/* Glow effect on active */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full",
            "bg-primary/30 blur-sm",
            "transition-all duration-300 ease-out",
            isDragging ? "opacity-100" : "opacity-0",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export { SmoothSlider as Slider }
