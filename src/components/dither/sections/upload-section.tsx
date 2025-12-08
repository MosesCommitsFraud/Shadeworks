'use client';

import { useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { loadImageFromFile, imageToImageData } from '@/lib/dither/utils';

interface UploadSectionProps {
  onImageUpload: (imageData: ImageData) => void;
}

export function UploadSection({ onImageUpload }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      try {
        const img = await loadImageFromFile(file);
        const imageData = imageToImageData(img);
        onImageUpload(imageData);
      } catch (error) {
        console.error('Error loading image:', error);
        alert('Failed to load image');
      }
    },
    [onImageUpload]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Upload Image</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Upload an image to apply dithering effects
        </p>
      </div>

      {/* Drag and drop area */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center gap-2">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium">Drop image here</p>
          <p className="text-xs text-muted-foreground">or click to browse</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Upload button */}
      <Button className="w-full" variant="outline" onClick={handleClick}>
        <Upload className="h-4 w-4 mr-2" />
        Choose File
      </Button>

      {/* Supported formats */}
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Supported formats:</p>
        <p>PNG, JPEG, WebP, GIF, BMP</p>
      </div>
    </div>
  );
}
