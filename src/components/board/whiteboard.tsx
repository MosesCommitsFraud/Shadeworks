'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Canvas } from './canvas';
import { Toolbar } from './toolbar';
import { ToolSidebar } from './tool-sidebar';
import { BurgerMenu } from './burger-menu';
import { ExportImageModal } from './export-image-modal';
import { FindCanvas } from './find-canvas';
import { CollaborationManager, type ConnectionStatus } from '@/lib/collaboration';
import { generateFunnyName } from '@/lib/funny-names';
import type { Tool, BoardElement, ShadeworksFile } from '@/lib/board-types';
import { isClosedShape } from '@/lib/board-types';

interface WhiteboardProps {
  roomId: string;
}

const MAX_UNDO_STACK = 100;

export function Whiteboard({ roomId }: WhiteboardProps) {
  const { theme, resolvedTheme } = useTheme();
  const [tool, setTool] = useState<Tool>('select');

  // Default color based on theme: black in light mode, white in dark mode
  const getDefaultStrokeColor = () => {
    const currentTheme = resolvedTheme || theme;
    return currentTheme === 'light' ? '#000000' : '#ffffff';
  };

  const [strokeColor, setStrokeColor] = useState(getDefaultStrokeColor());
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [fillColor, setFillColor] = useState('transparent');
  const [opacity, setOpacity] = useState(100);
  const [strokeStyle, setStrokeStyle] = useState<'solid' | 'dashed' | 'dotted'>('solid');
  const [cornerRadius, setCornerRadius] = useState(0);
  const [fontFamily, setFontFamily] = useState('var(--font-inter)');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [fontSize, setFontSize] = useState(24);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [fillPattern, setFillPattern] = useState<'none' | 'solid' | 'criss-cross'>('none');
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
  const [canvasBackground, setCanvasBackground] = useState<'none' | 'dots' | 'lines' | 'grid'>('grid');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFindCanvas, setShowFindCanvas] = useState(false);
  const [highlightedElementIds, setHighlightedElementIds] = useState<string[]>([]);

  // Undo/Redo stacks - store snapshots
  const undoStackRef = useRef<BoardElement[][]>([]);
  const redoStackRef = useRef<BoardElement[][]>([]);
  const isUndoingRef = useRef(false);

  // Ref to store the setViewport function from Canvas
  const setViewportRef = useRef<((pan: { x: number; y: number }, zoom: number) => void) | null>(null);

  // Update default stroke color when theme changes
  useEffect(() => {
    const currentTheme = resolvedTheme || theme;
    const defaultColor = currentTheme === 'light' ? '#000000' : '#ffffff';
    const oldDefaultColor = currentTheme === 'light' ? '#ffffff' : '#000000';

    // Update current stroke color if it's a default color
    if (strokeColor === '#ffffff' || strokeColor === '#000000') {
      setStrokeColor(defaultColor);
    }

    // Update all existing elements that use default colors
    if (collaboration) {
      elements.forEach((element) => {
        if (element.strokeColor === oldDefaultColor) {
          collaboration.updateElement(element.id, { strokeColor: defaultColor });
        }
      });
    }
  }, [theme, resolvedTheme, strokeColor, collaboration, elements]);

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

  const handleSave = useCallback(() => {
    // Set default filename with current date
    setSaveFileName(`shadeworks-${new Date().toISOString().split('T')[0]}`);
    setShowSaveDialog(true);
  }, []);

  const handleConfirmSave = useCallback(() => {
    const shadeworksFile: ShadeworksFile = {
      type: 'shadeworks',
      version: 1,
      elements: elements,
      appState: {
        canvasBackground: canvasBackground,
      },
    };

    const jsonString = JSON.stringify(shadeworksFile, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    // Ensure .shadeworks extension
    const fileName = saveFileName.endsWith('.shadeworks')
      ? saveFileName
      : `${saveFileName}.shadeworks`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowSaveDialog(false);
    setSaveFileName('');
  }, [elements, canvasBackground, saveFileName]);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.shadeworks,application/json';

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data: ShadeworksFile = JSON.parse(content);

          // Validate file format
          if (data.type !== 'shadeworks') {
            alert('Invalid file format. Please select a .shadeworks file.');
            return;
          }

          // Save current state to undo before loading
          saveToUndoStack();

          // Load elements
          if (collaboration) {
            collaboration.clearAll();
            data.elements.forEach(el => collaboration.addElement(el));
          } else {
            setElements(data.elements);
          }

          // Load app state
          if (data.appState?.canvasBackground) {
            setCanvasBackground(data.appState.canvasBackground);
          }
        } catch (error) {
          console.error('Error loading file:', error);
          alert('Failed to load file. Please ensure it is a valid .shadeworks file.');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }, [collaboration, saveToUndoStack]);

  const handleExportImage = useCallback(() => {
    setShowExportDialog(true);
  }, []);

  const handleFindOnCanvas = useCallback(() => {
    setShowFindCanvas(true);
  }, []);

  const handleFocusElement = useCallback((element: BoardElement) => {
    // Pan viewport to center on the element
    if (setViewportRef.current) {
      let centerX = 0;
      let centerY = 0;

      if (element.type === 'text' || element.type === 'rectangle' || element.type === 'ellipse' || element.type === 'frame') {
        centerX = (element.x ?? 0) + (element.width ?? 0) / 2;
        centerY = (element.y ?? 0) + (element.height ?? 0) / 2;
      } else if (element.type === 'pen' || element.type === 'line') {
        const xs = element.points.map(p => p.x);
        const ys = element.points.map(p => p.y);
        centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
        centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
      }

      // Get viewport dimensions (assuming window size)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Pan to center the element
      const panX = viewportWidth / 2 - centerX;
      const panY = viewportHeight / 2 - centerY;

      setViewportRef.current({ x: panX, y: panY }, 1);
    }

    // Select the element
    setSelectedElements([element]);
  }, []);

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
        if (
          el.type === 'rectangle' ||
          el.type === 'ellipse' ||
          el.type === 'frame' ||
          (el.type === 'pen' && el.isClosed && el.fillPattern !== 'none')
        ) {
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

  const handleFontFamilyChange = useCallback((font: string) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'text') {
          handleUpdateElement(el.id, { fontFamily: font });
        }
      });
    }
    setFontFamily(font);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleTextAlignChange = useCallback((align: 'left' | 'center' | 'right') => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'text') {
          handleUpdateElement(el.id, { textAlign: align });
        }
      });
    }
    setTextAlign(align);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleFontSizeChange = useCallback((size: number) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'text') {
          handleUpdateElement(el.id, { fontSize: size });
        }
      });
    }
    setFontSize(size);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleLetterSpacingChange = useCallback((spacing: number) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'text') {
          handleUpdateElement(el.id, { letterSpacing: spacing });
        }
      });
    }
    setLetterSpacing(spacing);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleLineHeightChange = useCallback((height: number) => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'text') {
          handleUpdateElement(el.id, { lineHeight: height });
        }
      });
    }
    setLineHeight(height);
  }, [selectedElements, saveToUndoStack, handleUpdateElement]);

  const handleFillPatternChange = useCallback((pattern: 'none' | 'solid' | 'criss-cross') => {
    if (selectedElements.length > 0) {
      saveToUndoStack();
      selectedElements.forEach((el) => {
        if (el.type === 'pen') {
          // Check if the stroke is closed (in case it wasn't detected before)
          const isClosed = el.isClosed ?? isClosedShape(el.points);
          if (isClosed) {
            handleUpdateElement(el.id, {
              fillPattern: pattern,
              isClosed: true, // Make sure isClosed is set
            });
          }
        }
      });
    }
    setFillPattern(pattern);
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
      if (firstElement.fontFamily !== undefined) {
        setFontFamily(firstElement.fontFamily);
      }
      if (firstElement.textAlign !== undefined) {
        setTextAlign(firstElement.textAlign);
      }
      if (firstElement.fontSize !== undefined) {
        setFontSize(firstElement.fontSize);
      }
      if (firstElement.letterSpacing !== undefined) {
        setLetterSpacing(firstElement.letterSpacing);
      }
      if (firstElement.lineHeight !== undefined) {
        setLineHeight(firstElement.lineHeight);
      }
      if (firstElement.fillPattern !== undefined) {
        setFillPattern(firstElement.fillPattern);
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
      {/* Burger Menu and Logo - Top Left */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <BurgerMenu
          onClear={handleClear}
          onSave={handleSave}
          onOpen={handleOpen}
          onExportImage={handleExportImage}
          onFindOnCanvas={handleFindOnCanvas}
          canvasBackground={canvasBackground}
          onCanvasBackgroundChange={setCanvasBackground}
          roomId={roomId}
        />
        {/* Shadeworks Logo */}
        <a
          href="/"
          className="bg-card/95 backdrop-blur-md border border-border rounded-md px-3 py-2 shadow-2xl hover:bg-muted/60 transition-colors"
        >
          <img
            src={(resolvedTheme || theme) === 'light' ? '/logo-text-sw-dark.svg' : '/logo-text-sw-white.svg'}
            alt="Shadeworks"
            className="h-6"
          />
        </a>
      </div>

      {/* Find Canvas */}
      <FindCanvas
        isOpen={showFindCanvas}
        onClose={() => setShowFindCanvas(false)}
        elements={elements}
        onFocusElement={handleFocusElement}
        onHighlightElements={setHighlightedElementIds}
      />

      {/* Colored frame when following a user */}
      {followedUser && (
        <div
          className="absolute inset-0 pointer-events-none z-[100]"
          style={{
            boxShadow: `inset 0 0 0 4px ${followedUser.color}`,
          }}
        >
          <div className="absolute top-4 left-20 px-3 py-1.5 rounded-lg bg-card/95 backdrop-blur-md border-2 shadow-lg flex items-center gap-2"
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
        fontFamily={fontFamily}
        onFontFamilyChange={handleFontFamilyChange}
        textAlign={textAlign}
        onTextAlignChange={handleTextAlignChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        letterSpacing={letterSpacing}
        onLetterSpacingChange={handleLetterSpacingChange}
        lineHeight={lineHeight}
        onLineHeightChange={handleLineHeightChange}
        fillPattern={fillPattern}
        onFillPatternChange={handleFillPatternChange}
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
        fontFamily={fontFamily}
        textAlign={textAlign}
        fontSize={fontSize}
        letterSpacing={letterSpacing}
        lineHeight={lineHeight}
        fillPattern={fillPattern}
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
        canvasBackground={canvasBackground}
        highlightedElementIds={highlightedElementIds}
      />

      {/* Save File Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg shadow-2xl p-6 w-96 max-w-[90vw]">
            <h2 className="text-lg font-semibold mb-4">Save Shadeworks File</h2>
            <div className="mb-4">
              <label htmlFor="filename" className="block text-sm font-medium mb-2 text-muted-foreground">
                File name
              </label>
              <input
                id="filename"
                type="text"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                value={saveFileName}
                onChange={(e) => setSaveFileName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmSave();
                  } else if (e.key === 'Escape') {
                    setShowSaveDialog(false);
                  }
                }}
                autoFocus
                placeholder="Enter file name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {saveFileName && !saveFileName.endsWith('.shadeworks')}
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 rounded-md bg-background hover:bg-muted transition-colors border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={!saveFileName.trim()}
                className="px-4 py-2 rounded-md bg-accent hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Image Dialog */}
      <ExportImageModal
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        elements={elements}
        canvasBackground={canvasBackground}
      />
    </div>
  );
}
