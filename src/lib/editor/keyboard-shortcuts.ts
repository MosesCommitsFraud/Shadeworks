/**
 * Keyboard Shortcuts Manager
 * Handles keyboard shortcuts for the image editor
 */

export type ShortcutAction =
  | 'undo'
  | 'redo'
  | 'export'
  | 'fit'
  | 'zoomIn'
  | 'zoomOut'
  | 'zoom100'
  | 'toggleLayersPanel'
  | 'toggleAdjustmentsPanel'
  | 'toggleToolsPanel'
  | 'deleteLayer'
  | 'duplicateLayer'
  | 'newLayer'
  | 'selectTool'
  | 'brushTool'
  | 'eraserTool'
  | 'textTool'
  | 'cropTool';

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: ShortcutAction;
  description: string;
}

export const SHORTCUTS: Shortcut[] = [
  // File operations
  { key: 'e', ctrl: true, shift: true, action: 'export', description: 'Export image' },

  // Edit operations
  { key: 'z', ctrl: true, action: 'undo', description: 'Undo' },
  { key: 'z', ctrl: true, shift: true, action: 'redo', description: 'Redo' },

  // View operations
  { key: '0', ctrl: true, action: 'fit', description: 'Fit to screen' },
  { key: '1', ctrl: true, action: 'zoom100', description: '100% zoom' },
  { key: '=', ctrl: true, action: 'zoomIn', description: 'Zoom in' },
  { key: '+', ctrl: true, action: 'zoomIn', description: 'Zoom in' },
  { key: '-', ctrl: true, action: 'zoomOut', description: 'Zoom out' },

  // Panel toggles
  { key: 'Tab', action: 'toggleLayersPanel', description: 'Toggle layers panel' },

  // Layer operations
  { key: 'Delete', action: 'deleteLayer', description: 'Delete selected layer' },
  { key: 'Backspace', action: 'deleteLayer', description: 'Delete selected layer' },
  { key: 'j', ctrl: true, action: 'duplicateLayer', description: 'Duplicate layer' },
  { key: 'n', ctrl: true, shift: true, action: 'newLayer', description: 'New layer' },

  // Tool selection
  { key: 'v', action: 'selectTool', description: 'Select tool' },
  { key: 'b', action: 'brushTool', description: 'Brush tool' },
  { key: 'e', action: 'eraserTool', description: 'Eraser tool' },
  { key: 't', action: 'textTool', description: 'Text tool' },
  { key: 'c', action: 'cropTool', description: 'Crop tool' },
];

export type ShortcutHandler = (action: ShortcutAction) => void;

/**
 * Check if keyboard event matches a shortcut
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

  const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatch = !!shortcut.ctrl === ctrlKey;
  const shiftMatch = !!shortcut.shift === event.shiftKey;
  const altMatch = !!shortcut.alt === event.altKey;

  return keyMatch && ctrlMatch && shiftMatch && altMatch;
}

/**
 * Register keyboard shortcuts
 */
export function registerShortcuts(handler: ShortcutHandler): () => void {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Don't handle shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    for (const shortcut of SHORTCUTS) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        handler(shortcut.action);
        break;
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Get shortcut display string
 */
export function getShortcutString(shortcut: Shortcut): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

/**
 * Group shortcuts by category
 */
export function getShortcutsByCategory(): Record<string, Shortcut[]> {
  return {
    'File': SHORTCUTS.filter(s => ['export'].includes(s.action)),
    'Edit': SHORTCUTS.filter(s => ['undo', 'redo'].includes(s.action)),
    'View': SHORTCUTS.filter(s => ['fit', 'zoom100', 'zoomIn', 'zoomOut', 'toggleLayersPanel', 'toggleAdjustmentsPanel', 'toggleToolsPanel'].includes(s.action)),
    'Layers': SHORTCUTS.filter(s => ['deleteLayer', 'duplicateLayer', 'newLayer'].includes(s.action)),
    'Tools': SHORTCUTS.filter(s => ['selectTool', 'brushTool', 'eraserTool', 'textTool', 'cropTool'].includes(s.action)),
  };
}
