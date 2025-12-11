'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import type { Layer } from '@/lib/editor/types';
import { cn } from '@/lib/utils';

interface LayerItemProps {
  layer: Layer;
  isSelected: boolean;
  thumbnail?: string;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  onOpacityChange: (opacity: number) => void;
}

export function LayerItem({
  layer,
  isSelected,
  thumbnail,
  onSelect,
  onToggleVisibility,
  onToggleLock,
  onDelete,
  onDuplicate,
  onRename,
  onOpacityChange,
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);

  const handleRename = () => {
    if (editName.trim() && editName !== layer.name) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'group p-2 rounded-md transition-colors cursor-pointer border',
        isSelected
          ? 'bg-accent/20 border-accent'
          : 'bg-card hover:bg-accent/10 border-transparent'
      )}
      onClick={onSelect}
    >
      {/* Layer header */}
      <div className="flex items-center gap-2">
        {/* Thumbnail */}
        <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden border border-border">
          {thumbnail ? (
            <img src={thumbnail} alt={layer.name} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              {layer.type === 'image' && '🖼️'}
              {layer.type === 'text' && 'T'}
              {layer.type === 'shape' && '▢'}
              {layer.type === 'group' && '📁'}
            </div>
          )}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditName(layer.name);
                  setIsEditing(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="h-6 text-xs px-2"
              autoFocus
            />
          ) : (
            <div
              className="text-sm truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {layer.name}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {layer.type} • {Math.round(layer.opacity)}%
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            title={layer.visible ? 'Hide' : 'Show'}
          >
            {layer.visible ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            title={layer.locked ? 'Unlock' : 'Lock'}
          >
            {layer.locked ? (
              <Lock className="h-3 w-3" />
            ) : (
              <Unlock className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            title="Duplicate"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Opacity slider (shown when selected) */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-16">Opacity</span>
            <Slider
              value={[layer.opacity]}
              onValueChange={([value]) => onOpacityChange(value)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right">
              {Math.round(layer.opacity)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
