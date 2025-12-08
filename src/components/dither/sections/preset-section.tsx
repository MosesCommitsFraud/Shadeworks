'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Save, Download, Upload, Trash2, Star } from 'lucide-react';
import type {
  DitheringSettings,
  AdjustmentSettings,
  ColorModeSettings,
  Palette,
} from '@/lib/dither/types';
import {
  type DitherPreset,
  getAllPresets,
  savePreset,
  deletePreset,
  exportPresetAsJSON,
  importPresetFromJSON,
  createPresetFromSettings,
} from '@/lib/dither/presets';

interface PresetSectionProps {
  ditheringSettings: DitheringSettings;
  adjustmentSettings: AdjustmentSettings;
  colorModeSettings: ColorModeSettings;
  palette: Palette;
  onApplyPreset: (preset: DitherPreset) => void;
  hasImage: boolean;
}

export function PresetSection({
  ditheringSettings,
  adjustmentSettings,
  colorModeSettings,
  palette,
  onApplyPreset,
  hasImage,
}: PresetSectionProps) {
  const [allPresets, setAllPresets] = useState<DitherPreset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [importError, setImportError] = useState('');

  // Load presets on mount and when custom presets change
  useEffect(() => {
    setAllPresets(getAllPresets());
  }, []);

  const handleApplyPreset = (preset: DitherPreset) => {
    onApplyPreset(preset);
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) return;

    try {
      const newPreset = createPresetFromSettings(
        presetName.trim(),
        presetDescription.trim(),
        ditheringSettings,
        adjustmentSettings,
        colorModeSettings,
        palette.type || 'bw'
      );

      savePreset(newPreset);
      setAllPresets(getAllPresets());
      setSaveDialogOpen(false);
      setPresetName('');
      setPresetDescription('');
    } catch (error) {
      console.error('Error saving preset:', error);
    }
  };

  const handleDeletePreset = (presetId: string) => {
    if (confirm('Are you sure you want to delete this preset?')) {
      try {
        deletePreset(presetId);
        setAllPresets(getAllPresets());
      } catch (error) {
        console.error('Error deleting preset:', error);
      }
    }
  };

  const handleExportPreset = (preset: DitherPreset) => {
    try {
      exportPresetAsJSON(preset);
    } catch (error) {
      console.error('Error exporting preset:', error);
    }
  };

  const handleImportPreset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const preset = importPresetFromJSON(jsonString);
        savePreset(preset);
        setAllPresets(getAllPresets());
        setImportError('');
      } catch (error) {
        setImportError(error instanceof Error ? error.message : 'Import failed');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const defaultPresets = allPresets.filter((p) => p.category !== 'custom');
  const customPresets = allPresets.filter((p) => p.category === 'custom');

  const groupedDefaultPresets = {
    retro: defaultPresets.filter((p) => p.category === 'retro'),
    print: defaultPresets.filter((p) => p.category === 'print'),
    artistic: defaultPresets.filter((p) => p.category === 'artistic'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-2">Presets</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Quick settings for common styles and use cases
        </p>
      </div>

      {/* Save Current Settings */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setSaveDialogOpen(true)}
          disabled={!hasImage}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Current Settings
        </Button>
      </div>

      <Separator />

      {/* Default Presets */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Default Presets</h4>

        <Accordion type="single" collapsible className="w-full">
          {/* Retro */}
          <AccordionItem value="retro">
            <AccordionTrigger className="text-sm">
              Retro Gaming ({groupedDefaultPresets.retro.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupedDefaultPresets.retro.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onApply={() => handleApplyPreset(preset)}
                    onExport={() => handleExportPreset(preset)}
                    disabled={!hasImage}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Print */}
          <AccordionItem value="print">
            <AccordionTrigger className="text-sm">
              Print ({groupedDefaultPresets.print.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupedDefaultPresets.print.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onApply={() => handleApplyPreset(preset)}
                    onExport={() => handleExportPreset(preset)}
                    disabled={!hasImage}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Artistic */}
          <AccordionItem value="artistic">
            <AccordionTrigger className="text-sm">
              Artistic ({groupedDefaultPresets.artistic.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {groupedDefaultPresets.artistic.map((preset) => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onApply={() => handleApplyPreset(preset)}
                    onExport={() => handleExportPreset(preset)}
                    disabled={!hasImage}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Custom Presets */}
      {customPresets.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Custom Presets ({customPresets.length})</h4>
            <div className="space-y-2">
              {customPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onApply={() => handleApplyPreset(preset)}
                  onExport={() => handleExportPreset(preset)}
                  onDelete={() => handleDeletePreset(preset.id)}
                  disabled={!hasImage}
                  isCustom
                />
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Import Preset */}
      <div className="space-y-2">
        <Label htmlFor="import-preset">Import Preset</Label>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" asChild>
            <label htmlFor="import-preset" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
              <input
                id="import-preset"
                type="file"
                accept=".json"
                onChange={handleImportPreset}
                className="hidden"
              />
            </label>
          </Button>
        </div>
        {importError && (
          <p className="text-xs text-destructive">{importError}</p>
        )}
      </div>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Save your current settings as a preset for quick access later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">Preset Name *</Label>
              <Input
                id="preset-name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="My Custom Preset"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preset-description">Description</Label>
              <Input
                id="preset-description"
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Brief description of this preset"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface PresetCardProps {
  preset: DitherPreset;
  onApply: () => void;
  onExport: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  isCustom?: boolean;
}

function PresetCard({
  preset,
  onApply,
  onExport,
  onDelete,
  disabled = false,
  isCustom = false,
}: PresetCardProps) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-2 hover:bg-accent/5 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h5 className="text-sm font-medium truncate">{preset.name}</h5>
            {!isCustom && <Star className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {preset.description}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          className="flex-1"
          onClick={onApply}
          disabled={disabled}
        >
          Apply
        </Button>
        <Button variant="outline" size="sm" onClick={onExport} title="Export as JSON">
          <Download className="h-3 w-3" />
        </Button>
        {isCustom && onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title="Delete preset"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
