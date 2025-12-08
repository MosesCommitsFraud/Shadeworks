import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

/**
 * Check if a keyboard event matches a shortcut definition
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
  const ctrlMatches = (shortcut.ctrl ?? false) === (event.ctrlKey || event.metaKey);
  const shiftMatches = (shortcut.shift ?? false) === event.shiftKey;
  const altMatches = (shortcut.alt ?? false) === event.altKey;

  return keyMatches && ctrlMatches && shiftMatches && altMatches;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        if (matchesShortcut(event, shortcut)) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  // Use Cmd on Mac, Ctrl on Windows/Linux
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  if (shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format key name
  let keyName = shortcut.key.toUpperCase();
  switch (keyName) {
    case 'ARROWUP':
      keyName = '↑';
      break;
    case 'ARROWDOWN':
      keyName = '↓';
      break;
    case 'ARROWLEFT':
      keyName = '←';
      break;
    case 'ARROWRIGHT':
      keyName = '→';
      break;
    case ' ':
      keyName = 'Space';
      break;
    case 'ESCAPE':
      keyName = 'Esc';
      break;
  }

  parts.push(keyName);

  return parts.join(isMac ? '' : '+');
}

/**
 * Default shortcuts for the dither editor
 */
export function getDefaultShortcuts(handlers: {
  onExport?: () => void;
  onToggleComparison?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomFit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}): KeyboardShortcut[] {
  return [
    // Export
    ...(handlers.onExport
      ? [
          {
            key: 's',
            ctrl: true,
            action: handlers.onExport,
            description: 'Export image',
          },
        ]
      : []),

    // Toggle comparison
    ...(handlers.onToggleComparison
      ? [
          {
            key: 'c',
            action: handlers.onToggleComparison,
            description: 'Toggle before/after comparison',
            preventDefault: true,
          },
        ]
      : []),

    // Zoom controls
    ...(handlers.onZoomIn
      ? [
          {
            key: '+',
            action: handlers.onZoomIn,
            description: 'Zoom in',
            preventDefault: true,
          },
          {
            key: '=',
            action: handlers.onZoomIn,
            description: 'Zoom in',
            preventDefault: true,
          },
        ]
      : []),

    ...(handlers.onZoomOut
      ? [
          {
            key: '-',
            action: handlers.onZoomOut,
            description: 'Zoom out',
            preventDefault: true,
          },
        ]
      : []),

    ...(handlers.onZoomFit
      ? [
          {
            key: '0',
            action: handlers.onZoomFit,
            description: 'Fit to screen',
            preventDefault: true,
          },
        ]
      : []),

    // Undo/Redo
    ...(handlers.onUndo
      ? [
          {
            key: 'z',
            ctrl: true,
            action: handlers.onUndo,
            description: 'Undo',
          },
        ]
      : []),

    ...(handlers.onRedo
      ? [
          {
            key: 'z',
            ctrl: true,
            shift: true,
            action: handlers.onRedo,
            description: 'Redo',
          },
          {
            key: 'y',
            ctrl: true,
            action: handlers.onRedo,
            description: 'Redo',
          },
        ]
      : []),
  ];
}
