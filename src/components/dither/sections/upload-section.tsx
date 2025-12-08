'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Video } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { loadImageFromFile, imageToImageData } from '@/lib/dither/utils';
import {
  loadVideoFromFile,
  extractFramesFromVideo,
  getVideoMetadata,
  isVideoFile,
  formatTime,
  isVideoTooLong,
  getSuggestedFPS,
} from '@/lib/dither/video-utils';
import type { VideoSettings } from '@/lib/dither/types';

interface UploadSectionProps {
  onImageUpload: (imageData: ImageData) => void;
  onVideoUpload?: (frames: ImageData[], videoSettings: VideoSettings) => void;
}

export function UploadSection({ onImageUpload, onVideoUpload }: UploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionTotal, setExtractionTotal] = useState(0);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Check if it's a video file
      if (isVideoFile(file)) {
        if (!onVideoUpload) {
          alert('Video upload is not supported in this mode');
          return;
        }

        setIsExtracting(true);
        setExtractionProgress(0);

        try {
          // Load video
          const video = await loadVideoFromFile(file);
          const metadata = getVideoMetadata(video);

          // Check if video is too long
          if (isVideoTooLong(metadata.duration, metadata.fps)) {
            const suggestedFPS = getSuggestedFPS(metadata.duration);
            const proceed = confirm(
              `This video is quite long (${formatTime(metadata.duration)}). ` +
              `We recommend extracting at ${suggestedFPS} FPS instead of ${metadata.fps} FPS ` +
              `to keep the frame count manageable. Continue?`
            );

            if (!proceed) {
              setIsExtracting(false);
              return;
            }

            metadata.fps = suggestedFPS;
            metadata.totalFrames = Math.floor(metadata.duration * suggestedFPS);
          }

          setExtractionTotal(metadata.totalFrames);

          // Extract frames
          const frames = await extractFramesFromVideo(
            video,
            metadata.fps,
            (current, total) => {
              setExtractionProgress(current);
              setExtractionTotal(total);
            }
          );

          // Update metadata with actual frame count
          metadata.totalFrames = frames.length;

          onVideoUpload(frames, metadata);
        } catch (error) {
          console.error('Error loading video:', error);
          alert('Failed to load video: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
          setIsExtracting(false);
          setExtractionProgress(0);
          setExtractionTotal(0);
        }
      }
      // Handle image files
      else if (file.type.startsWith('image/')) {
        try {
          const img = await loadImageFromFile(file);
          const imageData = imageToImageData(img);
          onImageUpload(imageData);
        } catch (error) {
          console.error('Error loading image:', error);
          alert('Failed to load image');
        }
      } else {
        alert('Please select an image or video file');
      }
    },
    [onImageUpload, onVideoUpload]
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
        <h3 className="text-sm font-semibold mb-2">Upload Media</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Upload an image or video to apply dithering effects
        </p>
      </div>

      {/* Drag and drop area */}
      <div
        className={`border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors ${
          isExtracting
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:border-accent hover:bg-accent/5'
        }`}
        onDrop={isExtracting ? undefined : handleDrop}
        onDragOver={isExtracting ? undefined : handleDragOver}
        onClick={isExtracting ? undefined : handleClick}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <Video className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">
            {isExtracting ? 'Extracting frames...' : 'Drop image or video here'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isExtracting ? 'Please wait' : 'or click to browse'}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isExtracting}
        />
      </div>

      {/* Extraction progress */}
      {isExtracting && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Extracting frames</span>
            <span className="font-medium">
              {extractionProgress} / {extractionTotal}
            </span>
          </div>
          <Progress
            value={extractionTotal > 0 ? (extractionProgress / extractionTotal) * 100 : 0}
          />
        </div>
      )}

      {/* Upload button */}
      <Button
        className="w-full"
        variant="outline"
        onClick={handleClick}
        disabled={isExtracting}
      >
        <Upload className="h-4 w-4 mr-2" />
        Choose File
      </Button>

      {/* Supported formats */}
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Supported formats:</p>
        <p className="mb-1">Images: PNG, JPEG, WebP, GIF, BMP</p>
        {onVideoUpload && <p>Videos: MP4, WebM, MOV (max 600 frames)</p>}
      </div>
    </div>
  );
}
