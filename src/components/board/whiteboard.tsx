'use client';

import { useState, useEffect, useCallback } from 'react';
import { Canvas } from './canvas';
import { Toolbar } from './toolbar';
import { CollaborationManager } from '@/lib/collaboration';
import type { Tool, BoardElement } from '@/lib/board-types';

interface WhiteboardProps {
  roomId: string;
}

export function Whiteboard({ roomId }: WhiteboardProps) {
  const [tool, setTool] = useState<Tool>('pen');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborationManager | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(1);

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

  const handleAddElement = useCallback((element: BoardElement) => {
    if (collaboration) {
      collaboration.addElement(element);
    } else {
      setElements((prev) => [...prev, element]);
    }
  }, [collaboration]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    if (collaboration) {
      collaboration.updateElement(id, updates);
    } else {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    }
  }, [collaboration]);

  const handleDeleteElement = useCallback((id: string) => {
    if (collaboration) {
      collaboration.deleteElement(id);
    } else {
      setElements((prev) => prev.filter((el) => el.id !== id));
    }
  }, [collaboration]);

  const handleClear = useCallback(() => {
    if (collaboration) {
      collaboration.clearAll();
    } else {
      setElements([]);
    }
  }, [collaboration]);

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
      />
    </div>
  );
}

