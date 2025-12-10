'use client';

import type { Tool } from '@/lib/editor/types';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MousePointer2,
  Brush,
  Eraser,
  Type,
  Crop,
  Pipette,
  Hand,
  ZoomIn,
  Square,
  Circle,
  Lasso,
  Wand2,
} from 'lucide-react';

interface ToolsPanelProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: Array<{
  id: Tool;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut: string;
}> = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'brush', icon: Brush, label: 'Brush', shortcut: 'B' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'crop', icon: Crop, label: 'Crop', shortcut: 'C' },
  { id: 'rectangle-select', icon: Square, label: 'Rectangle Select', shortcut: 'M' },
  { id: 'ellipse-select', icon: Circle, label: 'Ellipse Select', shortcut: 'L' },
  { id: 'lasso-select', icon: Lasso, label: 'Lasso', shortcut: 'L' },
  { id: 'magic-wand', icon: Wand2, label: 'Magic Wand', shortcut: 'W' },
  { id: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom', shortcut: 'Z' },
];

export function ToolsPanel({ activeTool, onToolChange }: ToolsPanelProps) {
  return (
    <div className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-1">
      <TooltipProvider>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => onToolChange(tool.id)}
                  className="w-12 h-12"
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{tool.label}</p>
                <p className="text-xs text-muted-foreground">{tool.shortcut}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
