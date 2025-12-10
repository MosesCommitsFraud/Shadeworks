'use client';

import { useEffect, useRef } from 'react';
import type { HistogramData } from '@/lib/editor/types';

interface HistogramProps {
  data: HistogramData | null;
  width?: number;
  height?: number;
}

export function Histogram({ data, width = 256, height = 100 }: HistogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max value for scaling
    const maxR = Math.max(...data.r);
    const maxG = Math.max(...data.g);
    const maxB = Math.max(...data.b);
    const maxValue = Math.max(maxR, maxG, maxB);

    if (maxValue === 0) return;

    // Draw RGB channels with transparency
    const drawChannel = (channelData: number[], color: string, alpha: number) => {
      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const value = channelData[i];
        const y = height - (value / maxValue) * height;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
    };

    // Draw channels - RGB with blending
    drawChannel(data.r, '#ff0000', 0.5);
    drawChannel(data.g, '#00ff00', 0.5);
    drawChannel(data.b, '#0000ff', 0.5);

    // Draw luminance as overlay
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * width;
      const value = data.luminance[i];
      const y = height - (value / maxValue) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    ctx.globalAlpha = 1;
  }, [data, width, height]);

  if (!data) {
    return (
      <div
        className="flex items-center justify-center bg-muted rounded"
        style={{ width, height }}
      >
        <p className="text-xs text-muted-foreground">No histogram data</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded bg-black"
    />
  );
}
