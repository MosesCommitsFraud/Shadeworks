'use client';

import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { getModifierKey, getShiftKey, isMac } from '@/lib/utils/platform';
import type { MediaType } from '@/lib/dither/types';

interface HotkeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mediaType?: MediaType;
}

export function HotkeysDialog({ open, onOpenChange, mediaType = 'image' }: HotkeysDialogProps) {
  const modKey = useMemo(() => getModifierKey(), []);
  const shiftKey = useMemo(() => getShiftKey(), []);

  const shortcuts = useMemo(() => {
    const baseShortcuts = [
      {
        category: 'General',
        items: [
          { keys: [modKey, 'S'], description: 'Save project (quick save)' },
          { keys: [modKey, 'E'], description: 'Export image (PNG, 72 DPI)' },
          { keys: [modKey, 'Z'], description: 'Undo (if available)' },
          { keys: [modKey, 'Y'], description: 'Redo (if available)' },
          { keys: ['?'], description: 'Show keyboard shortcuts' },
        ],
      },
      {
        category: 'View',
        items: [
          { keys: ['C'], description: 'Toggle comparison mode (before/after)' },
          { keys: ['+'], description: 'Zoom in' },
          { keys: ['-'], description: 'Zoom out' },
          { keys: ['0'], description: 'Zoom to fit' },
          { keys: ['1'], description: 'Zoom to 100%' },
        ],
      },
      {
        category: 'Navigation',
        items: [
          { keys: ['Space', '+', 'Drag'], description: 'Pan around canvas' },
          { keys: ['Esc'], description: 'Close dialogs / Cancel actions' },
        ],
      },
    ];

    // Add video controls if in video mode
    if (mediaType === 'video') {
      baseShortcuts.push({
        category: 'Video Controls',
        items: [
          { keys: ['Space'], description: 'Play/Pause video' },
          { keys: ['←'], description: 'Previous frame' },
          { keys: ['→'], description: 'Next frame' },
          { keys: [modKey, 'K'], description: 'Add/update keyframe' },
        ],
      });
    }

    baseShortcuts.push({
      category: 'File Management',
      items: [
        { keys: [modKey, 'N'], description: 'New project' },
        { keys: [modKey, 'O'], description: 'Open project (.swdither)' },
        { keys: [modKey, shiftKey, 'S'], description: 'Save As...' },
      ],
    });

    return baseShortcuts;
  }, [modKey, shiftKey, mediaType]);

  // Don't render dialog content if not open to avoid performance issues
  if (!open) {
    return <Dialog open={false} onOpenChange={onOpenChange} />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick reference for all keyboard shortcuts
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {shortcuts.map((section, idx) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold mb-3">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <KbdGroup>
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center gap-1">
                            <Kbd>{key}</Kbd>
                            {keyIdx < shortcut.keys.length - 1 && key !== '+' && (
                              <span className="text-xs text-muted-foreground">
                                {shortcut.keys[keyIdx + 1] === '+' ? '' : '+'}
                              </span>
                            )}
                          </span>
                        ))}
                      </KbdGroup>
                    </div>
                  ))}
                </div>
                {idx < shortcuts.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}

            <Separator />

            {/* Additional Notes */}
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Note:</strong> Some shortcuts may vary depending on your browser and operating system.
              </p>
              {!isMac() && (
                <p>
                  On macOS, use <Kbd>⌘</Kbd> instead of <Kbd>Ctrl</Kbd>.
                </p>
              )}
              <p>
                The editor will warn you before navigating away if you have unsaved changes.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
