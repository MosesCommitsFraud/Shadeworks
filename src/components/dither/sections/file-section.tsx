'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText, FolderOpen, Save, Download, FileWarning } from 'lucide-react';
import type { DitherProject } from '@/lib/dither/project';
import {
  createProject,
  saveProject,
  loadProject,
  extractImageData,
} from '@/lib/dither/project';
import type {
  DitheringSettings,
  AdjustmentSettings,
  ColorModeSettings,
  Palette,
} from '@/lib/dither/types';

interface FileSectionProps {
  originalImage: ImageData | null;
  ditheringSettings: DitheringSettings;
  adjustmentSettings: AdjustmentSettings;
  colorModeSettings: ColorModeSettings;
  palette: Palette;
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
}

export function FileSection({
  originalImage,
  ditheringSettings,
  adjustmentSettings,
  colorModeSettings,
  palette,
  zoom,
  pan,
  projectName = 'untitled',
  hasUnsavedChanges,
  onNewProject,
  onProjectLoad,
  onProjectSave,
}: FileSectionProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState(projectName);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!originalImage) return;

    const project = createProject(
      saveName || 'untitled',
      originalImage,
      {
        dithering: ditheringSettings,
        adjustments: adjustmentSettings,
        colorMode: colorModeSettings,
        palette,
      },
      { zoom, pan }
    );

    saveProject(project);
    setSaveDialogOpen(false);
    onProjectSave();
  };

  const handleQuickSave = () => {
    if (!originalImage) return;

    const project = createProject(
      projectName || 'untitled',
      originalImage,
      {
        dithering: ditheringSettings,
        adjustments: adjustmentSettings,
        colorMode: colorModeSettings,
        palette,
      },
      { zoom, pan }
    );

    saveProject(project);
    onProjectSave();
  };

  const handleLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const project = await loadProject(file);
      const image = await extractImageData(project);

      onProjectLoad(
        image,
        project.settings,
        project.ui && project.ui.zoom !== undefined && project.ui.pan !== undefined
          ? { zoom: project.ui.zoom, pan: project.ui.pan }
          : undefined,
        project.metadata.name
      );
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project: ' + (error as Error).message);
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Project</Label>
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{projectName}</span>
          {hasUnsavedChanges && (
            <span className="text-xs text-destructive flex items-center gap-1">
              <FileWarning className="h-3 w-3" />
              Unsaved
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={onNewProject}
        >
          <FileText className="h-4 w-4 mr-2" />
          New Project
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleOpenClick}
          disabled={loading}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          {loading ? 'Opening...' : 'Open Project'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".swdither"
          onChange={handleLoad}
          className="hidden"
        />

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleQuickSave}
          disabled={!originalImage}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!originalImage}
        >
          <Download className="h-4 w-4 mr-2" />
          Save As...
        </Button>
      </div>

      <div className="border-t border-border pt-4 space-y-2">
        <Label className="text-xs text-muted-foreground">
          Project files (.swdither) contain:
        </Label>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Original image</li>
          <li>All settings & adjustments</li>
          <li>Palette configuration</li>
          <li>View state (zoom/pan)</li>
        </ul>
      </div>

      {/* Save As Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Project As</DialogTitle>
            <DialogDescription>
              Choose a name for your dithering project file (.swdither)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!saveName.trim()}>
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
