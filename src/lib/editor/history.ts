// @ts-nocheck - Fabric.js v6 has incomplete TypeScript definitions
import type { HistoryState } from './types';

const MAX_HISTORY_SIZE = 50;

export class CanvasHistory {
  private undoStack: HistoryState[] = [];
  private redoStack: HistoryState[] = [];
  private isUndoing = false;
  private isRedoing = false;

  constructor(private canvas: any) {}

  /**
   * Save current canvas state to history
   */
  saveState(): void {
    if (this.isUndoing || this.isRedoing) return;

    const state: HistoryState = {
      canvasState: JSON.stringify(this.canvas.toJSON()),
      timestamp: Date.now(),
    };

    this.undoStack.push(state);

    // Limit stack size
    if (this.undoStack.length > MAX_HISTORY_SIZE) {
      this.undoStack.shift();
    }

    // Clear redo stack on new action
    this.redoStack = [];
  }

  /**
   * Undo last action
   */
  async undo(): Promise<boolean> {
    if (this.undoStack.length === 0) return false;

    this.isUndoing = true;

    // Save current state to redo stack before undoing
    const currentState: HistoryState = {
      canvasState: JSON.stringify(this.canvas.toJSON()),
      timestamp: Date.now(),
    };
    this.redoStack.push(currentState);

    // Get previous state
    const previousState = this.undoStack.pop();
    if (previousState) {
      await this.loadState(previousState);
    }

    this.isUndoing = false;
    return true;
  }

  /**
   * Redo last undone action
   */
  async redo(): Promise<boolean> {
    if (this.redoStack.length === 0) return false;

    this.isRedoing = true;

    // Save current state to undo stack
    const currentState: HistoryState = {
      canvasState: JSON.stringify(this.canvas.toJSON()),
      timestamp: Date.now(),
    };
    this.undoStack.push(currentState);

    // Get next state
    const nextState = this.redoStack.pop();
    if (nextState) {
      await this.loadState(nextState);
    }

    this.isRedoing = false;
    return true;
  }

  /**
   * Load canvas state from history
   */
  private async loadState(state: HistoryState): Promise<void> {
    return new Promise((resolve) => {
      this.canvas.loadFromJSON(state.canvasState, () => {
        this.canvas.requestRenderAll();
        resolve();
      });
    });
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo stack size
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get redo stack size
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }
}
