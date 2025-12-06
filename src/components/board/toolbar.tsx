'use client';

import {
  MousePointer2,
  Pencil,
  Minus,
  Square,
  Circle,
  Eraser,
  Type,
  Trash2,
  Share2,
  Check,
  Copy,
  LayoutTemplate,
  Globe,
  Pointer,
  Lasso,
  Pipette
} from 'lucide-react';
import { Tool, COLORS, STROKE_WIDTHS } from '@/lib/board-types';
import type { ConnectionStatus } from '@/lib/collaboration';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CollaboratorAvatars } from './collaborator-avatars';

interface ToolbarProps {
  selectedTool: Tool;
  onToolChange: (tool: Tool) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
  roomId: string;
  connectedUsers: number;
  peerCount: number;
  connectionStatus: ConnectionStatus;
  myName: string;
  collaboratorUsers: Array<{ id: string; name: string; color: string; viewport?: { pan: { x: number; y: number }; zoom: number } }>;
  onFollowUser: (userId: string) => void;
  followedUserId: string | null;
}

const tools: { id: Tool; icon: React.ElementType; label: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'pen', icon: Pencil, label: 'Pen' },
  { id: 'line', icon: Minus, label: 'Line' },
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'eyedropper', icon: Pipette, label: 'Color Picker' },
  { id: 'frame', icon: LayoutTemplate, label: 'Frame' },
  { id: 'web-embed', icon: Globe, label: 'Web Embed' },
  { id: 'laser', icon: Pointer, label: 'Laser Pointer' },
  { id: 'lasso', icon: Lasso, label: 'Lasso Selection' },
];

export function Toolbar({
  selectedTool,
  onToolChange,
  strokeColor,
  onStrokeColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onClear,
  roomId,
  connectedUsers,
  peerCount,
  connectionStatus,
  myName,
  collaboratorUsers,
  onFollowUser,
  followedUserId,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showWidths, setShowWidths] = useState(false);

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/board/${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
      {/* Main Tools */}
      <div className="flex items-center gap-1 bg-card/95 backdrop-blur-md border border-border rounded-xl p-1.5 shadow-2xl">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={cn(
              'p-2.5 rounded-lg transition-all duration-200',
              'hover:bg-secondary/80',
              selectedTool === tool.id 
                ? 'bg-accent text-accent-foreground shadow-lg' 
                : 'text-muted-foreground hover:text-foreground'
            )}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => { setShowColors(!showColors); setShowWidths(false); }}
            className="p-2.5 rounded-lg hover:bg-secondary/80 transition-all duration-200"
            title="Stroke Color"
          >
            <div 
              className="w-5 h-5 rounded-md border-2 border-foreground/20" 
              style={{ backgroundColor: strokeColor }}
            />
          </button>
          
          {showColors && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-2xl">
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => { onStrokeColorChange(color); setShowColors(false); }}
                    className={cn(
                      'w-7 h-7 rounded-lg border-2 transition-all duration-200 hover:scale-110',
                      strokeColor === color ? 'border-foreground shadow-lg' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Stroke Width */}
        <div className="relative">
          <button
            onClick={() => { setShowWidths(!showWidths); setShowColors(false); }}
            className="p-2.5 rounded-lg hover:bg-secondary/80 transition-all duration-200 text-muted-foreground hover:text-foreground"
            title="Stroke Width"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <div 
                className="rounded-full bg-current"
                style={{ width: Math.min(strokeWidth + 4, 16), height: Math.min(strokeWidth + 4, 16) }}
              />
            </div>
          </button>
          
          {showWidths && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-card/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-2xl">
              <div className="flex gap-2">
                {STROKE_WIDTHS.map((width) => (
                  <button
                    key={width}
                    onClick={() => { onStrokeWidthChange(width); setShowWidths(false); }}
                    className={cn(
                      'w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center hover:bg-secondary/50',
                      strokeWidth === width ? 'border-accent bg-secondary/50' : 'border-transparent'
                    )}
                  >
                    <div 
                      className="rounded-full bg-foreground"
                      style={{ width: width + 4, height: width + 4 }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        {/* Clear Canvas */}
        <button
          onClick={onClear}
          className="p-2.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-200"
          title="Clear Canvas"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      {/* Collaboration Panel */}
      <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-xl p-1.5 shadow-2xl">
        {/* Your Name */}
        <div className="flex items-center gap-2 px-3 py-1.5 h-10">
          {/* Status indicator */}
          <div
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              connectionStatus === 'connected' && peerCount > 0 ? "bg-green-500" :
              connectionStatus === 'connected' ? "bg-yellow-500 animate-pulse" :
              connectionStatus === 'connecting' ? "bg-yellow-500 animate-pulse" :
              "bg-red-500"
            )}
            title={
              connectionStatus === 'connected' && peerCount > 0
                ? `Connected to ${peerCount} peer(s)`
                : connectionStatus === 'connected'
                  ? 'Waiting for collaborators...'
                  : connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Disconnected'
            }
          />
          <span className="text-sm font-medium text-foreground max-w-[140px] truncate" title={myName}>
            {myName}
          </span>
          <CollaboratorAvatars users={collaboratorUsers} maxDisplay={5} onFollowUser={onFollowUser} followedUserId={followedUserId} />
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        {/* Share Button */}
        <button
          onClick={copyInviteLink}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
            copied 
              ? 'bg-green-500/20 text-green-400' 
              : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
          )}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Invite</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

