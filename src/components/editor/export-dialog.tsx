'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportImage, getDefaultFilename, type ExportFormat } from '@/lib/editor/export-manager';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageData: ImageData | null;
}

export function ExportDialog({ open, onOpenChange, imageData }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(90);
  const [filename, setFilename] = useState(getDefaultFilename('png'));
  const [isExporting, setIsExporting] = useState(false);

  const handleFormatChange = (newFormat: ExportFormat) => {
    setFormat(newFormat);
    // Update filename extension
    const nameParts = filename.split('.');
    nameParts[nameParts.length - 1] = newFormat;
    setFilename(nameParts.join('.'));
  };

  const handleExport = async () => {
    if (!imageData) return;

    setIsExporting(true);
    try {
      await exportImage(imageData, {
        format,
        quality,
        filename,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Image</DialogTitle>
          <DialogDescription>
            Choose your export settings and download the edited image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Filename */}
          <div className="space-y-2">
            <Label htmlFor="filename">Filename</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="my-image.png"
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={(value) => handleFormatChange(value as ExportFormat)}>
              <SelectTrigger id="format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (lossless)</SelectItem>
                <SelectItem value="jpeg">JPEG (smaller file)</SelectItem>
                <SelectItem value="webp">WebP (modern)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality (for JPEG/WebP) */}
          {format !== 'png' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">Quality</Label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                id="quality"
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={1}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Higher quality = larger file size
              </p>
            </div>
          )}

          {/* Image info */}
          {imageData && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <p className="text-muted-foreground">
                Dimensions: <span className="font-medium text-foreground">{imageData.width} × {imageData.height}px</span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={!imageData || isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
