'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface HotkeysDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HotkeysDialog({ open, onOpenChange }: HotkeysDialogProps) {
  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Ctrl', 'S'], description: 'Save project (quick save)' },
        { keys: ['Ctrl', 'E'], description: 'Export image (PNG, 72 DPI)' },
        { keys: ['Ctrl', 'Z'], description: 'Undo (if available)' },
        { keys: ['Ctrl', 'Y'], description: 'Redo (if available)' },
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
    {
      category: 'File Management',
      items: [
        { keys: ['Ctrl', 'N'], description: 'New project' },
        { keys: ['Ctrl', 'O'], description: 'Open project (.swdither)' },
        { keys: ['Ctrl', 'Shift', 'S'], description: 'Save As...' },
      ],
    },
  ];

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
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <span key={keyIdx} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-xs text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
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
              <p>
                On macOS, use <kbd className="px-1 py-0.5 text-xs bg-muted border border-border rounded">Cmd</kbd> instead of <kbd className="px-1 py-0.5 text-xs bg-muted border border-border rounded">Ctrl</kbd>.
              </p>
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
