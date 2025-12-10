'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function BackgroundRemover() {
  const router = useRouter();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpg' | 'webp'>('png');
  const [selectedScale, setSelectedScale] = useState<number>(1);
  const [jpgQuality, setJpgQuality] = useState<number>(95);
  const [webpQuality, setWebpQuality] = useState<number>(90);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const convertImageToPNG = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setProcessedImage(null);
    setProcessedBlob(null);

    try {
      const pngDataUrl = await convertImageToPNG(file);
      setOriginalImage(pngDataUrl);
    } catch (err) {
      setError('Failed to load image');
      console.error(err);
    }
  }, [convertImageToPNG]);

  const handleRemoveBackground = useCallback(async () => {
    if (!originalImage) return;

    setIsProcessing(true);
    setError(null);
    setProcessedImage(null);

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const blob = await removeBackground(originalImage, {
        progress: (_key, current, total) => {
          setProgress(`Processing: ${Math.round((current / total) * 100)}%`);
        },
      });

      setProcessedBlob(blob);
      const url = URL.createObjectURL(blob);
      setProcessedImage(url);
    } catch (err) {
      console.error('Error removing background:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove background');
    } finally {
      setIsProcessing(false);
      setProgress('');
    }
  }, [originalImage]);

  const downloadImage = useCallback(async () => {
    if (!processedBlob || !canvasRef.current) return;

    const format = selectedFormat;
    const scale = selectedScale;
    const quality = format === 'jpg' ? jpgQuality / 100 : format === 'webp' ? webpQuality / 100 : 1;

    try {
      const img = new Image();
      const blobUrl = URL.createObjectURL(processedBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        if (format === 'jpg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return;
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          const scaleSuffix = scale !== 1 ? `_${scale}x` : '';
          link.download = `no-background${scaleSuffix}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
        }, `image/${format === 'jpg' ? 'jpeg' : format}`, quality);

        URL.revokeObjectURL(blobUrl);
      };

      img.src = blobUrl;
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download image');
    }
  }, [processedBlob, selectedFormat, selectedScale, jpgQuality, webpQuality]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setProcessedBlob(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background select-none">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Background Remover</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {!originalImage ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full max-w-2xl border-2 border-dashed border-border rounded-lg p-16 text-center hover:border-accent transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-4">
                <svg
                  className="w-20 h-20 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <p className="text-xl font-medium">Drop an image here or click to browse</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Supports JPG, PNG, WEBP, AVIF and more
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Main Preview Area */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid lg:grid-cols-2 gap-6 h-full">
                {/* Original Image */}
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground">Original</h2>
                  <div className="border border-border rounded-lg overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:20px_20px] h-[calc(100%-2rem)]">
                    <img
                      ref={imgRef}
                      src={originalImage}
                      alt="Original"
                      className="w-full h-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>

                {/* Processed Image */}
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground">Background Removed</h2>
                  <div className="border border-border rounded-lg overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:20px_20px] h-[calc(100%-2rem)] flex items-center justify-center">
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {isProcessing ? (progress || 'Processing...') : 'Click "Remove Background" to start'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-6 bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {isProcessing && (
                <div className="mt-6 flex items-center justify-center gap-3 p-4 bg-secondary/30 rounded-lg">
                  <div className="w-5 h-5 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">{progress || 'Processing image...'}</span>
                </div>
              )}
            </div>

            {/* Right Sidebar - Controls */}
            <div className="w-80 border-l border-border bg-card overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Process Button */}
                <div>
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (progress || 'Processing...') : 'Remove Background'}
                  </Button>
                </div>

                {processedImage && (
                  <>
                    {/* Export Format */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Export Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={selectedFormat === 'png' ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat('png')}
                          className="w-full"
                          size="sm"
                        >
                          PNG
                        </Button>
                        <Button
                          variant={selectedFormat === 'jpg' ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat('jpg')}
                          className="w-full"
                          size="sm"
                        >
                          JPG
                        </Button>
                        <Button
                          variant={selectedFormat === 'webp' ? 'default' : 'outline'}
                          onClick={() => setSelectedFormat('webp')}
                          className="w-full"
                          size="sm"
                        >
                          WebP
                        </Button>
                      </div>
                    </div>

                    {/* Image Scale */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Image Scale</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={selectedScale === 0.25 ? 'default' : 'outline'}
                          onClick={() => setSelectedScale(0.25)}
                          size="sm"
                        >
                          25%
                        </Button>
                        <Button
                          variant={selectedScale === 0.5 ? 'default' : 'outline'}
                          onClick={() => setSelectedScale(0.5)}
                          size="sm"
                        >
                          50%
                        </Button>
                        <Button
                          variant={selectedScale === 0.75 ? 'default' : 'outline'}
                          onClick={() => setSelectedScale(0.75)}
                          size="sm"
                        >
                          75%
                        </Button>
                        <Button
                          variant={selectedScale === 1 ? 'default' : 'outline'}
                          onClick={() => setSelectedScale(1)}
                          size="sm"
                        >
                          100%
                        </Button>
                        <Button
                          variant={selectedScale === 1.5 ? 'default' : 'outline'}
                          onClick={() => setSelectedScale(1.5)}
                          size="sm"
                        >
                          150%
                        </Button>
                        <Button
                          variant={selectedScale === 2 ? 'default' : 'outline'}
                          onClick={() => setSelectedScale(2)}
                          size="sm"
                        >
                          200%
                        </Button>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="4"
                        step="0.1"
                        value={selectedScale}
                        onChange={(e) => setSelectedScale(parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        Custom: {Math.round(selectedScale * 100)}%
                      </div>
                    </div>

                    {/* Quality Settings */}
                    {selectedFormat === 'jpg' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">JPG Quality: {jpgQuality}%</label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={jpgQuality}
                          onChange={(e) => setJpgQuality(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Lower size</span>
                          <span>Higher quality</span>
                        </div>
                      </div>
                    )}

                    {selectedFormat === 'webp' && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">WebP Quality: {webpQuality}%</label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={webpQuality}
                          onChange={(e) => setWebpQuality(parseInt(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Lower size</span>
                          <span>Higher quality</span>
                        </div>
                      </div>
                    )}

                    {/* Download Button */}
                    <Button
                      onClick={downloadImage}
                      className="w-full"
                      size="lg"
                      variant="default"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {selectedFormat.toUpperCase()}
                    </Button>
                  </>
                )}

                {/* New Image Button */}
                <Button
                  onClick={handleReset}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  New Image
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
