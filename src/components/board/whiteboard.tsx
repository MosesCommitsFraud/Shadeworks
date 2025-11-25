'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from './canvas';
import { Toolbar } from './toolbar';
import { CollaborationManager } from '@/lib/collaboration';
import type { Tool, BoardElement } from '@/lib/board-types';

interface WhiteboardProps {
  roomId: string;
}

const MAX_UNDO_STACK = 50;

export function Whiteboard({ roomId }: WhiteboardProps) {
  const [tool, setTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborationManager | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(1);
  
  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<BoardElement[][]>([]);
  const [redoStack, setRedoStack] = useState<BoardElement[][]>([]);
  const isUndoingRef = useRef(false);

  // Initialize collaboration
  useEffect(() => {
    const collab = new CollaborationManager(roomId);
    setCollaboration(collab);

    // Load initial elements
    setElements(collab.getElements());

    // Subscribe to element changes
    const unsubElements = collab.onElementsChange((newElements) => {
      setElements(newElements);
    });

    // Subscribe to awareness changes for user count
    const unsubAwareness = collab.onAwarenessChange((states) => {
      setConnectedUsers(states.size);
    });

    return () => {
      unsubElements();
      unsubAwareness();
      collab.destroy();
    };
  }, [roomId]);

  // Save state to undo stack
  const saveToUndoStack = useCallback((currentElements: BoardElement[]) => {
    if (isUndoingRef.current) return;
    
    setUndoStack(prev => {
      const newStack = [...prev, currentElements];
      // Limit stack size
      if (newStack.length > MAX_UNDO_STACK) {
        return newStack.slice(-MAX_UNDO_STACK);
      }
      return newStack;
    });
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, []);

  // Undo function
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    
    isUndoingRef.current = true;
    
    const previousState = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
    
    // Save current state to redo stack
    setRedoStack(prev => [...prev, elements]);
    setUndoStack(newUndoStack);
    
    // Apply previous state
    if (collaboration) {
      collaboration.clearAll();
      previousState.forEach(el => collaboration.addElement(el));
    } else {
      setElements(previousState);
    }
    
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 100);
  }, [undoStack, elements, collaboration]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    isUndoingRef.current = true;
    
    const nextState = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
    
    // Save current state to undo stack
    setUndoStack(prev => [...prev, elements]);
    setRedoStack(newRedoStack);
    
    // Apply next state
    if (collaboration) {
      collaboration.clearAll();
      nextState.forEach(el => collaboration.addElement(el));
    } else {
      setElements(nextState);
    }
    
    setTimeout(() => {
      isUndoingRef.current = false;
    }, 100);
  }, [redoStack, elements, collaboration]);

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleAddElement = useCallback((element: BoardElement) => {
    // Save current state before adding
    saveToUndoStack(elements);
    
    if (collaboration) {
      collaboration.addElement(element);
    } else {
      setElements((prev) => [...prev, element]);
    }
  }, [collaboration, elements, saveToUndoStack]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    if (collaboration) {
      collaboration.updateElement(id, updates);
    } else {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    }
  }, [collaboration]);

  // Save state when starting to move/resize (called from canvas)
  const handleStartTransform = useCallback(() => {
    saveToUndoStack(elements);
  }, [elements, saveToUndoStack]);

  const handleDeleteElement = useCallback((id: string) => {
    // Save current state before deleting
    saveToUndoStack(elements);
    
    if (collaboration) {
      collaboration.deleteElement(id);
    } else {
      setElements((prev) => prev.filter((el) => el.id !== id));
    }
  }, [collaboration, elements, saveToUndoStack]);

  const handleClear = useCallback(() => {
    // Save current state before clearing
    saveToUndoStack(elements);
    
    if (collaboration) {
      collaboration.clearAll();
    } else {
      setElements([]);
    }
  }, [collaboration, elements, saveToUndoStack]);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Toolbar
        selectedTool={tool}
        onToolChange={setTool}
        strokeColor={strokeColor}
        onStrokeColorChange={setStrokeColor}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        onClear={handleClear}
        roomId={roomId}
        connectedUsers={connectedUsers}
      />
      
      <Canvas
        tool={tool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        collaboration={collaboration}
        elements={elements}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onStartTransform={handleStartTransform}
      />
    </div>
  );
}
