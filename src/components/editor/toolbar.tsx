'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  HelpCircle,
  Keyboard,
} from 'lucide-react';

interface ToolbarProps {
  onImageUpload: (file: File) => void;
  hasImage: boolean;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onExport: () => void;
}

export function Toolbar({
  onImageUpload,
  hasImage,
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onExport,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        Upload
      </Button>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 border-l pl-2 ml-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          disabled={zoom <= 25}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onZoomFit}
          disabled={!hasImage}
          className="gap-1"
        >
          <Maximize2 className="h-4 w-4" />
          Fit
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          disabled={zoom >= 1000}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="px-3 text-sm font-medium min-w-[60px] text-center">
          {Math.round(zoom)}%
        </div>
      </div>

      {/* Export */}
      <Button
        variant="default"
        size="sm"
        disabled={!hasImage}
        className="gap-2 ml-2"
        onClick={onExport}
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      {/* Help */}
      <div className="flex items-center gap-1 border-l pl-2 ml-1">
        <Button variant="ghost" size="sm" className="gap-2">
          <Keyboard className="h-4 w-4" />
          Hotkeys
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Help
        </Button>
      </div>
    </div>
  );
}
