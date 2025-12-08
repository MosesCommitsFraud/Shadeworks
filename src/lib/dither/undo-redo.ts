import { useState, useCallback } from 'react';
import type {
  DitheringSettings,
  AdjustmentSettings,
  ColorModeSettings,
  Palette,
} from './types';

/**
 * Complete editor state for undo/redo
 */
export interface EditorState {
  ditheringSettings: DitheringSettings;
  adjustmentSettings: AdjustmentSettings;
  colorModeSettings: ColorModeSettings;
  palette: Palette;
}

/**
 * Undo/Redo history manager
 */
export function useUndoRedo(initialState: EditorState, maxHistorySize: number = 50) {
  const [history, setHistory] = useState<EditorState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  /**
   * Push a new state to history
   */
  const pushState = useCallback(
    (newState: EditorState) => {
      setHistory((prev) => {
        // Remove any states after current index (when undoing then making changes)
        const newHistory = prev.slice(0, currentIndex + 1);

        // Add new state
        newHistory.push(newState);

        // Limit history size
        if (newHistory.length > maxHistorySize) {
          newHistory.shift();
          setCurrentIndex((idx) => idx - 1);
        }

        return newHistory;
      });

      setCurrentIndex((idx) => Math.min(idx + 1, maxHistorySize - 1));
    },
    [currentIndex, maxHistorySize]
  );

  /**
   * Undo to previous state
   */
  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex((idx) => idx - 1);
    }
  }, [canUndo]);

  /**
   * Redo to next state
   */
  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex((idx) => idx + 1);
    }
  }, [canRedo]);

  /**
   * Clear history
   */
  const clearHistory = useCallback(() => {
    setHistory([history[currentIndex]]);
    setCurrentIndex(0);
  }, [history, currentIndex]);

  /**
   * Get current state
   */
  const currentState = history[currentIndex];

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    historySize: history.length,
    currentIndex,
  };
}

/**
 * Create a state snapshot from current settings
 */
export function createStateSnapshot(
  ditheringSettings: DitheringSettings,
  adjustmentSettings: AdjustmentSettings,
  colorModeSettings: ColorModeSettings,
  palette: Palette
): EditorState {
  return {
    ditheringSettings: { ...ditheringSettings },
    adjustmentSettings: { ...adjustmentSettings },
    colorModeSettings: { ...colorModeSettings },
    palette: { ...palette, colors: [...palette.colors] },
  };
}

/**
 * Check if two states are different (to avoid pushing duplicate states)
 */
export function statesAreDifferent(state1: EditorState, state2: EditorState): boolean {
  return JSON.stringify(state1) !== JSON.stringify(state2);
}
