'use client';

import { useState, useRef, useCallback } from 'react';

export function BackgroundRemover() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    setProcessedImage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
    };
    reader.readAsDataURL(file);

  }, []);

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

  const handleDownload = useCallback(() => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'no-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImage]);

  const handleReset = useCallback(() => {
    setOriginalImage(null);
    setProcessedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Background Remover</h1>
          <p className="text-muted-foreground">
            Remove backgrounds from images using AI - completely free and runs in your browser
          </p>
        </div>


        {!originalImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-accent transition-colors cursor-pointer"
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
                className="w-16 h-16 text-muted-foreground"
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
                <p className="text-lg font-medium">Drop an image here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports JPG, PNG, WEBP and more
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Original</h2>
                <div className="border border-border rounded-lg overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:20px_20px]">
                  <img
                    ref={imgRef}
                    src={originalImage}
                    alt="Original"
                    className="w-full h-auto"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Background Removed</h2>
                <div className="border border-border rounded-lg overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:20px_20px] min-h-[200px] flex items-center justify-center">
                  {processedImage ? (
                    <img
                      src={processedImage}
                      alt="Processed"
                      className="w-full h-auto"
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      {isProcessing ? 'Processing...' : 'Click "Remove Background" to start'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-3 p-4 bg-secondary/30 rounded-lg">
                <div className="w-5 h-5 border-3 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="font-medium">{progress || 'Processing image...'}</span>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleRemoveBackground}
                disabled={isProcessing}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? (progress || 'Processing...') : 'Remove Background'}
              </button>

              {processedImage && (
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Download PNG
                </button>
              )}

              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                New Image
              </button>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="mt-12 p-6 bg-secondary/50 rounded-lg">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Powered by @imgly/background-removal - Advanced AI background removal</li>
            <li>• Runs entirely in your browser - no server uploads, your images stay private</li>
            <li>• First use downloads the ML model - subsequent uses are cached and faster</li>
            <li>• Works offline after the model is cached</li>
            <li>• Completely free with no limits</li>
            <li>• Works on people, products, animals, and objects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
