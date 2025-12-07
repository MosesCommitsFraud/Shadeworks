'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Download, Copy, HelpCircle } from 'lucide-react';
import type { BoardElement } from '@/lib/board-types';

interface ExportImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: BoardElement[];
  canvasBackground: 'none' | 'dots' | 'lines' | 'grid';
}

// Get bounding box for any element
function getBoundingBox(element: BoardElement): { x: number; y: number; width: number; height: number } | null {
  if (element.type === 'pen' || element.type === 'line' || element.type === 'laser') {
    if (element.points.length === 0) return null;
    const xs = element.points.map(p => p.x);
    const ys = element.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const padding = (element.strokeWidth || 2) * 2;
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
    const fontSize = (element.strokeWidth || 1) * 4 + 12;
    if (element.width !== undefined && element.height !== undefined) {
      return {
        x: element.x ?? 0,
        y: element.y ?? 0,
        width: element.width,
        height: element.height,
      };
    }
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

// Get combined bounding box for all elements
function getSceneBounds(elements: BoardElement[]): { x: number; y: number; width: number; height: number } {
  const boxes = elements.map(el => getBoundingBox(el)).filter(Boolean) as { x: number; y: number; width: number; height: number }[];

  if (boxes.length === 0) {
    return { x: 0, y: 0, width: 800, height: 600 };
  }

  const minX = Math.min(...boxes.map(b => b.x));
  const minY = Math.min(...boxes.map(b => b.y));
  const maxX = Math.max(...boxes.map(b => b.x + b.width));
  const maxY = Math.max(...boxes.map(b => b.y + b.height));

  const padding = 40;

  return {
    x: minX - padding,
    y: minY - padding,
    width: maxX - minX + padding * 2,
    height: maxY - minY + padding * 2,
  };
}

export function ExportImageModal({ isOpen, onClose, elements, canvasBackground }: ExportImageModalProps) {
  const [includeBackground, setIncludeBackground] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [embedScene, setEmbedScene] = useState(false);
  const [scale, setScale] = useState<1 | 2 | 3>(2);
  const [fileName, setFileName] = useState('');
  const [showEmbedTooltip, setShowEmbedTooltip] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      const date = new Date().toISOString().split('T')[0];
      setFileName(`shadeworks-${date}`);
      updatePreview();
    }
  }, [isOpen, includeBackground, darkMode, embedScene, elements, canvasBackground]);

  const updatePreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = getSceneBounds(elements);
    const previewScale = 0.5; // Scale down for preview

    canvas.width = Math.min(bounds.width * previewScale, 400);
    canvas.height = Math.min(bounds.height * previewScale, 300);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    if (includeBackground) {
      ctx.fillStyle = darkMode ? '#0a0a0a' : '#f2f2f2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid pattern if enabled
      if (canvasBackground !== 'none') {
        ctx.save();
        ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;

        const spacing = 40 * previewScale;

        if (canvasBackground === 'grid' || canvasBackground === 'lines') {
          for (let x = 0; x <= canvas.width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
        }

        if (canvasBackground === 'grid') {
          for (let y = 0; y <= canvas.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
        }

        if (canvasBackground === 'dots') {
          ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
          for (let x = 0; x <= canvas.width; x += spacing) {
            for (let y = 0; y <= canvas.height; y += spacing) {
              ctx.beginPath();
              ctx.arc(x, y, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.restore();
      }
    }

    // Draw elements (simplified preview)
    ctx.save();
    ctx.translate(-bounds.x * previewScale, -bounds.y * previewScale);
    ctx.scale(previewScale, previewScale);

    elements.forEach(el => {
      ctx.globalAlpha = (el.opacity ?? 100) / 100;

      if (el.type === 'rectangle') {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.beginPath();
        ctx.roundRect(el.x!, el.y!, el.width!, el.height!, el.cornerRadius ?? 0);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'ellipse') {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.beginPath();
        ctx.ellipse((el.x ?? 0) + (el.width ?? 0) / 2, (el.y ?? 0) + (el.height ?? 0) / 2, (el.width ?? 0) / 2, (el.height ?? 0) / 2, 0, 0, Math.PI * 2);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'line' && el.points.length === 2) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        ctx.lineTo(el.points[1].x, el.points[1].y);
        ctx.stroke();
      } else if (el.type === 'text') {
        const fontSize = (el.strokeWidth || 1) * 4 + 12;
        ctx.fillStyle = el.strokeColor;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillText(el.text || '', el.x ?? 0, (el.y ?? 0) + fontSize);
      }

      ctx.globalAlpha = 1;
    });

    ctx.restore();
  };

  const exportImage = async (format: 'png' | 'svg') => {
    if (format === 'png') {
      await exportPNG();
    } else {
      await exportSVG();
    }
  };

  const exportPNG = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = getSceneBounds(elements);

    canvas.width = bounds.width * scale;
    canvas.height = bounds.height * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);

    // Draw background
    if (includeBackground) {
      ctx.fillStyle = darkMode ? '#0a0a0a' : '#f2f2f2';
      ctx.fillRect(0, 0, bounds.width, bounds.height);

      // Draw grid pattern
      if (canvasBackground !== 'none') {
        ctx.save();
        ctx.strokeStyle = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;

        const spacing = 40;

        if (canvasBackground === 'grid' || canvasBackground === 'lines') {
          for (let x = 0; x <= bounds.width; x += spacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, bounds.height);
            ctx.stroke();
          }
        }

        if (canvasBackground === 'grid') {
          for (let y = 0; y <= bounds.height; y += spacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(bounds.width, y);
            ctx.stroke();
          }
        }

        if (canvasBackground === 'dots') {
          ctx.fillStyle = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';
          for (let x = 0; x <= bounds.width; x += spacing) {
            for (let y = 0; y <= bounds.height; y += spacing) {
              ctx.beginPath();
              ctx.arc(x, y, 1.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        ctx.restore();
      }
    }

    // Draw elements
    ctx.translate(-bounds.x, -bounds.y);

    elements.forEach(el => {
      ctx.globalAlpha = (el.opacity ?? 100) / 100;

      if (el.type === 'rectangle') {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.beginPath();
        ctx.roundRect(el.x!, el.y!, el.width!, el.height!, el.cornerRadius ?? 0);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'ellipse') {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.beginPath();
        ctx.ellipse((el.x ?? 0) + (el.width ?? 0) / 2, (el.y ?? 0) + (el.height ?? 0) / 2, (el.width ?? 0) / 2, (el.height ?? 0) / 2, 0, 0, Math.PI * 2);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      } else if (el.type === 'line' && el.points.length === 2) {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        ctx.lineTo(el.points[1].x, el.points[1].y);
        ctx.stroke();
      } else if (el.type === 'pen') {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        el.points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      } else if (el.type === 'text') {
        const fontSize = (el.strokeWidth || 1) * 4 + 12;
        ctx.fillStyle = el.strokeColor;
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textBaseline = 'top';

        if (el.isTextBox && el.width && el.height) {
          const padding = 8;
          const lineHeight = fontSize * 1.4;
          const lines = (el.text || '').split('\n');
          let yOffset = (el.y ?? 0) + padding;

          lines.forEach(line => {
            ctx.fillText(line, (el.x ?? 0) + padding, yOffset);
            yOffset += lineHeight;
          });
        } else {
          ctx.fillText(el.text || '', el.x ?? 0, el.y ?? 0);
        }
      }

      ctx.globalAlpha = 1;
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName || 'export'}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  const exportSVG = async () => {
    const bounds = getSceneBounds(elements);

    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${bounds.width * scale}" height="${bounds.height * scale}" viewBox="0 0 ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;

    // Add background
    if (includeBackground) {
      svgContent += `\n  <rect width="${bounds.width}" height="${bounds.height}" fill="${darkMode ? '#0a0a0a' : '#f2f2f2'}"/>`;

      // Add grid pattern
      if (canvasBackground !== 'none') {
        const spacing = 40;
        const color = darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)';

        if (canvasBackground === 'grid') {
          svgContent += `\n  <defs>
    <pattern id="grid" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="${color}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${bounds.width}" height="${bounds.height}" fill="url(#grid)"/>`;
        } else if (canvasBackground === 'dots') {
          svgContent += `\n  <defs>
    <pattern id="dots" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <circle cx="0" cy="0" r="1.5" fill="${color}"/>
    </pattern>
  </defs>
  <rect width="${bounds.width}" height="${bounds.height}" fill="url(#dots)"/>`;
        } else if (canvasBackground === 'lines') {
          svgContent += `\n  <defs>
    <pattern id="lines" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <path d="M ${spacing} 0 L 0 0" fill="none" stroke="${color}" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${bounds.width}" height="${bounds.height}" fill="url(#lines)"/>`;
        }
      }
    }

    // Add elements
    svgContent += `\n  <g transform="translate(${-bounds.x}, ${-bounds.y})">`;

    elements.forEach(el => {
      const opacity = (el.opacity ?? 100) / 100;

      if (el.type === 'rectangle') {
        svgContent += `\n    <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.fillColor || 'none'}" rx="${el.cornerRadius ?? 0}" opacity="${opacity}"/>`;
      } else if (el.type === 'ellipse') {
        const cx = (el.x ?? 0) + (el.width ?? 0) / 2;
        const cy = (el.y ?? 0) + (el.height ?? 0) / 2;
        svgContent += `\n    <ellipse cx="${cx}" cy="${cy}" rx="${(el.width ?? 0) / 2}" ry="${(el.height ?? 0) / 2}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="${el.fillColor || 'none'}" opacity="${opacity}"/>`;
      } else if (el.type === 'line' && el.points.length === 2) {
        svgContent += `\n    <line x1="${el.points[0].x}" y1="${el.points[0].y}" x2="${el.points[1].x}" y2="${el.points[1].y}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" stroke-linecap="round" opacity="${opacity}"/>`;
      } else if (el.type === 'pen' && el.points.length > 0) {
        const pathData = `M ${el.points.map(p => `${p.x},${p.y}`).join(' L ')}`;
        svgContent += `\n    <path d="${pathData}" stroke="${el.strokeColor}" stroke-width="${el.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}"/>`;
      } else if (el.type === 'text') {
        const fontSize = (el.strokeWidth || 1) * 4 + 12;
        svgContent += `\n    <text x="${el.x}" y="${(el.y ?? 0) + fontSize}" fill="${el.strokeColor}" font-size="${fontSize}" font-family="sans-serif" opacity="${opacity}">${el.text || ''}</text>`;
      }
    });

    svgContent += '\n  </g>';

    // Embed scene data if requested
    if (embedScene) {
      const sceneData = JSON.stringify({
        type: 'shadeworks',
        version: 1,
        elements,
        appState: { canvasBackground },
      });
      svgContent += `\n  <metadata>
    <shadeworks>${sceneData}</shadeworks>
  </metadata>`;
    }

    svgContent += '\n</svg>';

    // Download SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName || 'export'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = getSceneBounds(elements);

    canvas.width = bounds.width * scale;
    canvas.height = bounds.height * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);

    if (includeBackground) {
      ctx.fillStyle = darkMode ? '#0a0a0a' : '#f2f2f2';
      ctx.fillRect(0, 0, bounds.width, bounds.height);
    }

    ctx.translate(-bounds.x, -bounds.y);

    elements.forEach(el => {
      ctx.globalAlpha = (el.opacity ?? 100) / 100;

      if (el.type === 'rectangle') {
        ctx.strokeStyle = el.strokeColor;
        ctx.lineWidth = el.strokeWidth;
        ctx.fillStyle = el.fillColor || 'transparent';
        ctx.beginPath();
        ctx.roundRect(el.x!, el.y!, el.width!, el.height!, el.cornerRadius ?? 0);
        if (el.fillColor && el.fillColor !== 'transparent') ctx.fill();
        ctx.stroke();
      }
    });

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg shadow-2xl p-6 w-[800px] max-w-[90vw] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Export image</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div>
            <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20 flex items-center justify-center min-h-[200px]">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-[300px] rounded"
                style={{ imageRendering: 'auto' }}
              />
            </div>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="mt-4 w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="File name"
            />
          </div>

          {/* Options */}
          <div className="space-y-4">
            {/* Background Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Background</span>
              <button
                onClick={() => setIncludeBackground(!includeBackground)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeBackground ? 'bg-accent' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeBackground ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? 'bg-accent' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Embed Scene Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Embed scene</span>
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowEmbedTooltip(true)}
                    onMouseLeave={() => setShowEmbedTooltip(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  {showEmbedTooltip && (
                    <div className="absolute left-0 top-6 w-64 p-2 bg-popover border border-border rounded-md shadow-lg text-xs z-10">
                      Scene data will be saved into the PNG/SVG file so that the scene can be restored from it. Will increase exported file size.
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEmbedScene(!embedScene)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  embedScene ? 'bg-accent' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    embedScene ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Scale */}
            <div>
              <span className="text-sm font-medium mb-2 block">Scale</span>
              <div className="flex gap-1.5">
                {([1, 2, 3] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`px-3 py-1 rounded-md transition-colors text-sm ${
                      scale === s
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>

            {/* Export Buttons */}
            <div className="pt-4 space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => exportImage('png')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md transition-colors text-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
                <button
                  onClick={() => exportImage('svg')}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md transition-colors text-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG
                </button>
              </div>
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors text-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy to clipboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
