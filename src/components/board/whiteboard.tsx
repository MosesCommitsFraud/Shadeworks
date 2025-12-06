'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from './canvas';
import { Toolbar } from './toolbar';
import { ToolSidebar } from './tool-sidebar';
import { CollaborationManager, type ConnectionStatus } from '@/lib/collaboration';
import { generateFunnyName } from '@/lib/funny-names';
import type { Tool, BoardElement } from '@/lib/board-types';

interface WhiteboardProps {
  roomId: string;
}

const MAX_UNDO_STACK = 100;

export function Whiteboard({ roomId }: WhiteboardProps) {
  const [tool, setTool] = useState<Tool>('select');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('transparent');
  const [opacity, setOpacity] = useState(100);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [cornerRadius, setCornerRadius] = useState(0);
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [collaboration, setCollaboration] = useState<CollaborationManager | null>(null);
  const [connectedUsers, setConnectedUsers] = useState(1);
  const [peerCount, setPeerCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [myName, setMyName] = useState<string | null>(null);
  const [collaboratorUsers, setCollaboratorUsers] = useState<Array<{ id: string; name: string; color: string; viewport?: { pan: { x: number; y: number }; zoom: number } }>>([]);
  const [isReady, setIsReady] = useState(false);
  const [followedUserId, setFollowedUserId] = useState<string | null>(null);
  const [selectedElements, setSelectedElements] = useState<BoardElement[]>([]);

  // Undo/Redo stacks - store snapshots
  const undoStackRef = useRef<BoardElement[][]>([]);
  const redoStackRef = useRef<BoardElement[][]>([]);
  const isUndoingRef = useRef(false);

  // Ref to store the setViewport function from Canvas
  const setViewportRef = useRef<((pan: { x: number; y: number }, zoom: number) => void) | null>(null);

  // Initialize collaboration with a random funny name
  useEffect(() => {
    // Get or generate a funny name for this session
    let name = sessionStorage.getItem('shadeworks-name');
    if (!name) {
      name = generateFunnyName();
      sessionStorage.setItem('shadeworks-name', name);
    }
    setMyName(name);

    const collab = new CollaborationManager(roomId, name);
    setCollaboration(collab);

    // Load initial elements
    setElements(collab.getElements());

    // Subscribe to element changes
    const unsubElements = collab.onElementsChange((newElements) => {
      setElements(newElements);
    });

    // Subscribe to awareness changes for user count and collaborator info
    const unsubAwareness = collab.onAwarenessChange((states) => {
      setConnectedUsers(states.size);

      // Extract collaborator user info (excluding current user)
      const users: Array<{ id: string; name: string; color: string; viewport?: { pan: { x: number; y: number }; zoom: number } }> = [];
      states.forEach((state) => {
        if (state.user && state.user.id !== collab.getUserInfo().id) {
          users.push({
            id: state.user.id,
            name: state.user.name,
            color: state.user.color,
            viewport: state.user.viewport,
          });
        }
      });
      setCollaboratorUsers(users);
    });

    // Subscribe to connection status changes
    const unsubConnection = collab.onConnectionChange((status, peers) => {
      setConnectionStatus(status);
      setPeerCount(peers);
    });

    setIsReady(true);

    return () => {
      unsubElements();
      unsubAwareness();
      unsubConnection();
      collab.destroy();
    };
  }, [roomId]);

  // Save state to undo stack
  const saveToUndoStack = useCallback(() => {
    if (isUndoingRef.current) return;
    
    const snapshot = JSON.parse(JSON.stringify(elements));
    undoStackRef.current = [...undoStackRef.current, snapshot].slice(-MAX_UNDO_STACK);
    redoStackRef.current = []; // Clear redo on new action
  }, [elements]);

  // Apply state to collaboration
  const applyState = useCallback((newElements: BoardElement[]) => {
    if (collaboration) {
      collaboration.clearAll();
      newElements.forEach(el => collaboration.addElement(el));
    } else {
      setElements(newElements);
    }
  }, [collaboration]);

  // Undo function - instant
  const handleUndo = useCallback(() => {
    if (undoStackRef.current.length === 0) return;
    
    isUndoingRef.current = true;
    
    // Save current to redo
    const currentSnapshot = JSON.parse(JSON.stringify(elements));
    redoStackRef.current = [...redoStackRef.current, currentSnapshot];
    
    // Pop from undo
    const previousState = undoStackRef.current.pop()!;
    
    // Apply
    applyState(previousState);
    
    // Reset flag immediately
    requestAnimationFrame(() => {
      isUndoingRef.current = false;
    });
  }, [elements, applyState]);

  // Redo function - instant
  const handleRedo = useCallback(() => {
    if (redoStackRef.current.length === 0) return;
    
    isUndoingRef.current = true;
    
    // Save current to undo
    const currentSnapshot = JSON.parse(JSON.stringify(elements));
    undoStackRef.current = [...undoStackRef.current, currentSnapshot];
    
    // Pop from redo
    const nextState = redoStackRef.current.pop()!;
    
    // Apply
    applyState(nextState);
    
    // Reset flag immediately
    requestAnimationFrame(() => {
      isUndoingRef.current = false;
    });
  }, [elements, applyState]);

  // Handle keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
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
    saveToUndoStack();
    
    if (collaboration) {
      collaboration.addElement(element);
    } else {
      setElements((prev) => [...prev, element]);
    }
  }, [collaboration, saveToUndoStack]);

  const handleUpdateElement = useCallback((id: string, updates: Partial<BoardElement>) => {
    if (collaboration) {
      collaboration.updateElement(id, updates);
    } else {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    }
  }, [collaboration]);

  const handleStartTransform = useCallback(() => {
    saveToUndoStack();
  }, [saveToUndoStack]);

  const handleDeleteElement = useCallback((id: string) => {
    saveToUndoStack();
    
    if (collaboration) {
      collaboration.deleteElement(id);
    } else {
      setElements((prev) => prev.filter((el) => el.id !== id));
    }
  }, [collaboration, saveToUndoStack]);

  const handleClear = useCallback(() => {
    saveToUndoStack();

    if (collaboration) {
      collaboration.clearAll();
    } else {
      setElements([]);
    }
  }, [collaboration, saveToUndoStack]);

  const handleFollowUser = useCallback((userId: string) => {
    // Toggle follow mode - if clicking the same user, unfollow
    setFollowedUserId(prev => prev === userId ? null : userId);
  }, []);

  const handleBringToFront = useCallback(() => {
    if (selectedElements.length === 0) return;
    saveToUndoStack();

    const maxZIndex = Math.max(...elements.map(el => el.zIndex || 0), 0);
    selectedElements.forEach((selectedEl) => {
      handleUpdateElement(selectedEl.id, { zIndex: maxZIndex + 1 });
    });
  }, [selectedElements, elements, saveToUndoStack, handleUpdateElement]);

  const handleSendToBack = useCallback(() => {
    if (selectedElements.length === 0) return;
    saveToUndoStack();

    const minZIndex = Math.min(...elements.map(el => el.zIndex || 0), 0);
    selectedElements.forEach((selectedEl) => {
      handleUpdateElement(selectedEl.id, { zIndex: minZIndex - 1 });
    });
  }, [selectedElements, elements, saveToUndoStack, handleUpdateElement]);

  // Handle property changes - apply to selected elements if any, otherwise update defaults
  const handleStrokeColorChange = useCallback((color: string) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        handleUpdateElement(el.id, { strokeColor: color });
      });
    }
    setStrokeColor(color);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleStrokeWidthChange = useCallback((width: number) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        handleUpdateElement(el.id, { strokeWidth: width });
      });
    }
    setStrokeWidth(width);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleFillColorChange = useCallback((color: string) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'rectangle' || el.type === 'ellipse' || el.type === 'frame') {
          handleUpdateElement(el.id, { fillColor: color });
        }
      });
    }
    setFillColor(color);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleOpacityChange = useCallback((newOpacity: number) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        handleUpdateElement(el.id, { opacity: newOpacity });
      });
    }
    setOpacity(newOpacity);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleStrokeStyleChange = useCallback((style: 'solid' | 'dashed' | 'dotted') => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        handleUpdateElement(el.id, { strokeStyle: style });
      });
    }
    setStrokeStyle(style);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleCornerRadiusChange = useCallback((radius: number) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'rectangle' || el.type === 'frame') {
          handleUpdateElement(el.id, { cornerRadius: radius });
        }
      });
    }
    setCornerRadius(radius);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  // Sync sidebar properties with selected elements
  useEffect(() => {
    if (selectedElements.length > 0) {
      // Use the first selected element's properties to populate the sidebar
      const firstElement = selectedElements[0];
      setStrokeColor(firstElement.strokeColor);
      setStrokeWidth(firstElement.strokeWidth);
      if (firstElement.fillColor !== undefined) {
        setFillColor(firstElement.fillColor);
      }
      if (firstElement.opacity !== undefined) {
        setOpacity(firstElement.opacity);
      }
      if (firstElement.strokeStyle !== undefined) {
        setStrokeStyle(firstElement.strokeStyle);
      }
      if (firstElement.cornerRadius !== undefined) {
        setCornerRadius(firstElement.cornerRadius);
      }
    }
  }, [selectedElements]);

  // Continuously track followed user's viewport
  useEffect(() => {
    if (!followedUserId || !setViewportRef.current) return;

    const followedUser = collaboratorUsers.find(u => u.id === followedUserId);
    if (followedUser && followedUser.viewport) {
      setViewportRef.current(followedUser.viewport.pan, followedUser.viewport.zoom);
    }
  }, [followedUserId, collaboratorUsers]);

  // Show loading while connecting
  if (!isReady) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Connecting to board...</p>
        </div>
      </div>
    );
  }

  const followedUser = followedUserId ? collaboratorUsers.find(u => u.id === followedUserId) : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Colored frame when following a user */}
      {followedUser && (
        <div
          className="absolute inset-0 pointer-events-none z-[100]"
          style={{
            boxShadow: `inset 0 0 0 4px ${followedUser.color}`,
          }}
        >
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-md border-2 shadow-lg flex items-center gap-2"
            style={{ borderColor: followedUser.color }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: followedUser.color }} />
            <span className="text-sm font-medium">Following {followedUser.name}</span>
            <button
              onClick={() => setFollowedUserId(null)}
              className="ml-2 text-muted-foreground hover:text-foreground transition-colors pointer-events-auto"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
        peerCount={peerCount}
        connectionStatus={connectionStatus}
        myName={myName || 'Connecting...'}
        collaboratorUsers={collaboratorUsers}
        onFollowUser={handleFollowUser}
        followedUserId={followedUserId}
      />

      <ToolSidebar
        selectedTool={tool}
        strokeColor={strokeColor}
        onStrokeColorChange={handleStrokeColorChange}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={handleStrokeWidthChange}
        fillColor={fillColor}
        onFillColorChange={handleFillColorChange}
        opacity={opacity}
        onOpacityChange={handleOpacityChange}
        strokeStyle={strokeStyle}
        onStrokeStyleChange={handleStrokeStyleChange}
        cornerRadius={cornerRadius}
        onCornerRadiusChange={handleCornerRadiusChange}
        selectedElements={selectedElements}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
      />

      <Canvas
        tool={tool}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        fillColor={fillColor}
        opacity={opacity}
        strokeStyle={strokeStyle}
        cornerRadius={cornerRadius}
        collaboration={collaboration}
        elements={elements}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onStartTransform={handleStartTransform}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToolChange={setTool}
        onSetViewport={(setter) => {
          setViewportRef.current = setter;
        }}
        onSelectionChange={setSelectedElements}
        onStrokeColorChange={handleStrokeColorChange}
        onFillColorChange={handleFillColorChange}
      />
    </div>
  );
}
