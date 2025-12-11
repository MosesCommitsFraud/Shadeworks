'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MousePointer2,
  Paintbrush,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Hand,
  Pipette,
} from 'lucide-react';
import type { Tool } from '@/lib/editor/types';
import { cn } from '@/lib/utils';

interface ToolsPanelProps {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
}

const TOOLS: Array<{
  id: Tool;
  icon: typeof MousePointer2;
  label: string;
  shortcut: string;
}> = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'brush', icon: Paintbrush, label: 'Brush', shortcut: 'B' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'O' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'hand', icon: Hand, label: 'Hand (Pan)', shortcut: 'H' },
  { id: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
];

export function ToolsPanel({ tool, onToolChange }: ToolsPanelProps) {
  return (
    <div className="w-16 border-r border-border bg-card flex flex-col items-center py-4 gap-2">
      <TooltipProvider delayDuration={300}>
        {TOOLS.map((toolItem) => {
          const Icon = toolItem.icon;
          const isActive = tool === toolItem.id;

          return (
            <Tooltip key={toolItem.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => onToolChange(toolItem.id)}
                  className={cn(
                    'w-10 h-10',
                    isActive && 'bg-primary text-primary-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-2">
                <span>{toolItem.label}</span>
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded">
                  {toolItem.shortcut}
                </kbd>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
