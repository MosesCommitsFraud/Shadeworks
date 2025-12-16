'use client';

import {
  MousePointer2,
  Pencil,
  Minus,
  ArrowRight,
  Square,
  Circle,
  Eraser,
  Type,
  Trash2,
  Share2,
  Check,
  Pointer,
  Lasso,
} from 'lucide-react';
import { Tool } from '@/lib/board-types';
import type { ConnectionStatus } from '@/lib/collaboration';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { CollaboratorAvatars } from './collaborator-avatars';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/animate-ui/components/radix/tooltip';
import { Kbd } from '@/components/ui/kbd';
import { isMac } from '@/lib/platform';

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

const tools: { id: Tool; icon: React.ElementType; label: string; hotkey: number | string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', hotkey: 'V' },
  { id: 'pen', icon: Pencil, label: 'Pen', hotkey: 1 },
  { id: 'line', icon: Minus, label: 'Line', hotkey: 2 },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow', hotkey: 9 },
  { id: 'rectangle', icon: Square, label: 'Rectangle', hotkey: 3 },
  { id: 'ellipse', icon: Circle, label: 'Ellipse', hotkey: 4 },
  { id: 'text', icon: Type, label: 'Text', hotkey: 5 },
  { id: 'eraser', icon: Eraser, label: 'Eraser', hotkey: 6 },
  { id: 'laser', icon: Pointer, label: 'Laser Pointer', hotkey: 7 },
  { id: 'lasso', icon: Lasso, label: 'Lasso Selection', hotkey: 8 },
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

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/board/${roomId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // V for select tool
      if (e.key === 'v' || e.key === 'V') {
        onToolChange('select');
        return;
      }

      // Number keys 1-9 for tools
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const matchedTool = tools.find((t) => t.hotkey === num);
        if (matchedTool) onToolChange(matchedTool.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToolChange]);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-stretch gap-2">
      {/* Main Tools */}
      <div className="flex items-center gap-1 bg-card/95 backdrop-blur-md border border-border rounded-md p-1.5 shadow-2xl">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onToolChange(tool.id)}
                className={cn(
                  'p-2 rounded-sm transition-all duration-200',
                  'hover:bg-secondary/80',
                  selectedTool === tool.id
                    ? 'bg-accent text-accent-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <tool.icon className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="flex items-center gap-2">
                <span>{tool.label}</span>
                <Kbd>{tool.hotkey}</Kbd>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Collaboration Panel */}
      <div className="flex items-center gap-2 bg-card/95 backdrop-blur-md border border-border rounded-md px-2 py-1.5 shadow-2xl">
        {/* Your Name */}
        <div className="flex items-center gap-2 px-1">
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
          <span className="text-xs font-medium text-foreground max-w-[120px] truncate" title={myName}>
            {myName}
          </span>
          <CollaboratorAvatars users={collaboratorUsers} maxDisplay={5} onFollowUser={onFollowUser} followedUserId={followedUserId} />
        </div>

        <div className="w-px h-5 bg-border" />

        {/* Share Button */}
        <button
          onClick={copyInviteLink}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm transition-all duration-200',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'hover:bg-secondary/80 text-muted-foreground hover:text-foreground'
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Invite</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
