'use client';

import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Upload,
  Sliders,
  Palette as PaletteIcon,
  Grip,
  Pipette,
  Star,
  Download,
  FileText,
  KeySquare,
} from 'lucide-react';
import type { Palette, DitheringSettings, AdjustmentSettings, ColorModeSettings, VideoSettings, MediaType, AnimatedSettings, TimelineState } from '@/lib/dither/types';
import { UploadSection } from './sections/upload-section';
import { DitheringSection } from './sections/dithering-section';
import { PaletteSection } from './sections/palette-section';
import { AdjustmentsSection } from './sections/adjustments-section';
import { ColorModeSection } from './sections/color-mode-section';
import { ExportSection, type ExportOptions, type VideoExportOptions } from './sections/export-section';
import { PresetSection } from './sections/preset-section';
import { FileSection } from './sections/file-section';
import { KeyframeSection } from './sections/keyframe-section';
import type { DitherPreset } from '@/lib/dither/presets';

type Section = 'file' | 'upload' | 'adjust' | 'mode' | 'dither' | 'palette' | 'preset' | 'export' | 'keyframes';

const SECTIONS: Array<{ id: Section; label: string; icon: typeof Upload }> = [
  { id: 'file', label: 'File', icon: FileText },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'adjust', label: 'Adjust', icon: Sliders },
  { id: 'mode', label: 'Mode', icon: Pipette },
  { id: 'dither', label: 'Dither', icon: Grip },
  { id: 'palette', label: 'Palette', icon: PaletteIcon },
  { id: 'keyframes', label: 'Keyframes', icon: KeySquare },
  { id: 'preset', label: 'Preset', icon: Star },
  { id: 'export', label: 'Export', icon: Download },
];

interface ControlSidebarProps {
  originalImage: ImageData | null;
  processedImage: ImageData | null;
  onImageUpload: (imageData: ImageData) => void;
  onVideoUpload?: (frames: ImageData[], videoSettings: VideoSettings) => void;
  palette: Palette;
  onPaletteChange: (palette: Palette) => void;
  ditheringSettings: DitheringSettings;
  onDitheringSettingsChange: (settings: Partial<DitheringSettings>) => void;
  adjustmentSettings: AdjustmentSettings;
  onAdjustmentSettingsChange: (settings: Partial<AdjustmentSettings>) => void;
  colorModeSettings: ColorModeSettings;
  onColorModeSettingsChange: (settings: Partial<ColorModeSettings>) => void;
  onExport: (options: ExportOptions) => void;
  isExporting: boolean;
  onApplyPreset: (preset: DitherPreset) => void;
  zoom: number;
  pan: { x: number; y: number };
  projectName?: string;
  hasUnsavedChanges: boolean;
  onNewProject: () => void;
  onProjectLoad: (
    image: ImageData,
    settings: {
      dithering: DitheringSettings;
      adjustments: AdjustmentSettings;
      colorMode: ColorModeSettings;
      palette: Palette;
    },
    ui?: { zoom: number; pan: { x: number; y: number } },
    projectName?: string
  ) => void;
  onProjectSave: () => void;
  mediaType?: MediaType;
  videoSettings?: VideoSettings | null;
  processedFrames?: ImageData[];
  onVideoExport?: (format: 'mp4' | 'webm' | 'gif', options: VideoExportOptions) => void;

  // Keyframe/animation props
  animatedAdjustments?: AnimatedSettings<AdjustmentSettings>;
  animatedDithering?: AnimatedSettings<DitheringSettings>;
  animatedColorMode?: AnimatedSettings<ColorModeSettings>;
  timelineState?: TimelineState;
  onAnimatedAdjustmentsChange?: (settings: AnimatedSettings<AdjustmentSettings>) => void;
  onAnimatedDitheringChange?: (settings: AnimatedSettings<DitheringSettings>) => void;
  onAnimatedColorModeChange?: (settings: AnimatedSettings<ColorModeSettings>) => void;
  onJumpToFrame?: (frame: number) => void;
}

export function ControlSidebar({
  originalImage,
  processedImage,
  onImageUpload,
  onVideoUpload,
  palette,
  onPaletteChange,
  ditheringSettings,
  onDitheringSettingsChange,
  adjustmentSettings,
  onAdjustmentSettingsChange,
  colorModeSettings,
  onColorModeSettingsChange,
  onExport,
  isExporting,
  onApplyPreset,
  zoom,
  pan,
  projectName,
  hasUnsavedChanges,
  onNewProject,
  onProjectLoad,
  onProjectSave,
  mediaType,
  videoSettings,
  processedFrames,
  onVideoExport,
  animatedAdjustments,
  animatedDithering,
  animatedColorMode,
  timelineState,
  onAnimatedAdjustmentsChange,
  onAnimatedDitheringChange,
  onAnimatedColorModeChange,
  onJumpToFrame,
}: ControlSidebarProps) {
  const [activeSection, setActiveSection] = useState<Section>('file');

  // Check if we have any media loaded (image or video)
  const hasMedia = !!originalImage || (mediaType === 'video' && !!processedFrames && processedFrames.length > 0);

  const renderSection = () => {
    switch (activeSection) {
      case 'file':
        return (
          <FileSection
            originalImage={originalImage}
            ditheringSettings={ditheringSettings}
            adjustmentSettings={adjustmentSettings}
            colorModeSettings={colorModeSettings}
            palette={palette}
            zoom={zoom}
            pan={pan}
            projectName={projectName}
            hasUnsavedChanges={hasUnsavedChanges}
            onNewProject={onNewProject}
            onProjectLoad={onProjectLoad}
            onProjectSave={onProjectSave}
          />
        );
      case 'upload':
        return <UploadSection onImageUpload={onImageUpload} onVideoUpload={onVideoUpload} />;
      case 'adjust':
        return (
          <AdjustmentsSection
            settings={adjustmentSettings}
            onSettingsChange={onAdjustmentSettingsChange}
            hasImage={hasMedia}
          />
        );
      case 'mode':
        return (
          <ColorModeSection
            settings={colorModeSettings}
            onSettingsChange={onColorModeSettingsChange}
            hasImage={hasMedia}
          />
        );
      case 'dither':
        return (
          <DitheringSection
            settings={ditheringSettings}
            onSettingsChange={onDitheringSettingsChange}
            hasImage={hasMedia}
          />
        );
      case 'palette':
        return (
          <PaletteSection
            palette={palette}
            onPaletteChange={onPaletteChange}
            hasImage={hasMedia}
            originalImage={originalImage}
          />
        );
      case 'preset':
        return (
          <PresetSection
            ditheringSettings={ditheringSettings}
            adjustmentSettings={adjustmentSettings}
            colorModeSettings={colorModeSettings}
            palette={palette}
            onApplyPreset={onApplyPreset}
            hasImage={hasMedia}
          />
        );
      case 'keyframes':
        return (
          <KeyframeSection
            animatedAdjustments={animatedAdjustments || { keyframes: [], enabled: false }}
            animatedDithering={animatedDithering || { keyframes: [], enabled: false }}
            animatedColorMode={animatedColorMode || { keyframes: [], enabled: false }}
            adjustmentSettings={adjustmentSettings}
            ditheringSettings={ditheringSettings}
            colorModeSettings={colorModeSettings}
            timelineState={timelineState || { currentFrame: 0, currentTime: 0, isPlaying: false, playbackSpeed: 1 }}
            totalFrames={videoSettings?.totalFrames || 0}
            onAnimatedAdjustmentsChange={onAnimatedAdjustmentsChange || (() => {})}
            onAnimatedDitheringChange={onAnimatedDitheringChange || (() => {})}
            onAnimatedColorModeChange={onAnimatedColorModeChange || (() => {})}
            onJumpToFrame={onJumpToFrame}
            hasVideo={mediaType === 'video' && !!videoSettings}
          />
        );
      case 'export':
        return (
          <ExportSection
            processedImage={processedImage}
            palette={palette}
            onExport={onExport}
            isExporting={isExporting}
            mediaType={mediaType}
            videoSettings={videoSettings}
            processedFrames={processedFrames}
            onVideoExport={onVideoExport}
          />
        );
      default:
        return null;
    }
  };

  return (
    <aside className="w-80 border-r border-border bg-card flex">
      {/* Vertical Navigation */}
      <nav className="w-16 border-r border-border bg-muted/30 flex flex-col items-center py-4 gap-2">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all relative group',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/10 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Section Header */}
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold">
            {SECTIONS.find((s) => s.id === activeSection)?.label}
          </h2>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1" style={{ scrollbarGutter: 'stable' }}>
          <div className="p-4">{renderSection()}</div>
        </ScrollArea>
      </div>
    </aside>
  );
}
