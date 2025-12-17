'use client';

import { useState, useEffect } from 'react';
import {
  Menu,
  FolderOpen,
  Save,
  Image,
  Share2,
  Search,
  HelpCircle,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  X,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';
import { isMac } from '@/lib/platform';

interface BurgerMenuProps {
  onClear: () => void;
  onExportImage?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onFindOnCanvas?: () => void;
  onHelp?: () => void;
  canvasBackground: 'none' | 'dots' | 'lines' | 'grid';
  onCanvasBackgroundChange: (background: 'none' | 'dots' | 'lines' | 'grid') => void;
  roomId?: string;
}

export function BurgerMenu({
  onClear,
  onExportImage,
  onOpen,
  onSave,
  onFindOnCanvas,
  onHelp,
  canvasBackground,
  onCanvasBackgroundChange,
  roomId,
}: BurgerMenuProps) {
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const copyInviteLink = async () => {
    if (roomId) {
      const link = `${window.location.origin}/board/${roomId}`;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportImage = () => {
    if (onExportImage) {
      onExportImage();
    } else {
      console.log('Export image clicked');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const ctrlKey = isMac() ? e.metaKey : e.ctrlKey;

      // Ctrl+O - Open
      if (ctrlKey && e.key === 'o') {
        e.preventDefault();
        onOpen?.();
      }

      // Ctrl+S - Save
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }

      // Ctrl+Shift+E - Export Image
      if (ctrlKey && e.shiftKey && (e.key === 'E' || e.key === 'e')) {
        e.preventDefault();
        handleExportImage();
      }

      // Ctrl+F - Find on canvas
      if (ctrlKey && e.key === 'f') {
        e.preventDefault();
        onFindOnCanvas?.();
      }

      // ? - Help
      if (e.key === '?' && !ctrlKey) {
        e.preventDefault();
        onHelp?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpen, onSave, onExportImage, onFindOnCanvas, onHelp]);

  const modKey = isMac() ? '⌘' : 'Ctrl';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'p-2.5 rounded-md transition-all duration-200',
            'bg-card/95 backdrop-blur-md border border-border',
            'hover:bg-muted/60 text-muted-foreground hover:text-foreground',
            'shadow-2xl'
          )}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {/* Main Actions */}
        <DropdownMenuItem onClick={onOpen}>
          <FolderOpen className="w-4 h-4" />
          <span>Open</span>
          <div className="ml-auto flex gap-0.5">
            <Kbd>{modKey}</Kbd>
            <Kbd>O</Kbd>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onSave}>
          <Save className="w-4 h-4" />
          <span>Save to...</span>
          <div className="ml-auto flex gap-0.5">
            <Kbd>{modKey}</Kbd>
            <Kbd>S</Kbd>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleExportImage}>
          <Image className="w-4 h-4" />
          <span>Export image...</span>
          <div className="ml-auto flex gap-0.5">
            <Kbd>{modKey}</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>E</Kbd>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Collaboration */}
        <DropdownMenuItem onClick={copyInviteLink}>
          <Share2 className="w-4 h-4" />
          <span>{copied ? 'Link Copied!' : 'Invite'}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Canvas Actions */}
        <DropdownMenuItem onClick={onFindOnCanvas}>
          <Search className="w-4 h-4" />
          <span>Find on canvas</span>
          <div className="ml-auto flex gap-0.5">
            <Kbd>{modKey}</Kbd>
            <Kbd>F</Kbd>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onHelp}>
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
          <Kbd className="ml-auto">?</Kbd>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onClear} className="text-red-400 dark:text-red-400">
          <RotateCcw className="w-4 h-4 !text-red-400 dark:!text-red-400" />
          <span>Reset the canvas</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Links */}
        <DropdownMenuItem asChild>
          <a href="https://github.com/MosesCommitsFraud/Shadeworks" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/docs" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
            <span>Documentation</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <div className="px-2 py-1.5 flex items-center justify-between gap-2">
          <DropdownMenuLabel className="p-0 m-0">Theme</DropdownMenuLabel>
          <div className="flex items-center bg-secondary/40 rounded-md p-0.5 gap-0.5">
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all flex items-center justify-center',
                theme === 'light' ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-muted/60'
              )}
              aria-label="Light theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all flex items-center justify-center',
                theme === 'dark' ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-muted/60'
              )}
              aria-label="Dark theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all flex items-center justify-center',
                theme === 'system' ? 'bg-accent text-accent-foreground shadow-sm' : 'hover:bg-muted/60'
              )}
              aria-label="System theme"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Canvas Background */}
        <div className="px-2 py-1.5 flex items-center justify-between gap-2">
          <DropdownMenuLabel className="p-0 m-0">Canvas</DropdownMenuLabel>
          <div className="flex gap-0.5">
            <button
              onClick={() => onCanvasBackgroundChange('none')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden flex items-center justify-center',
                'bg-background',
                canvasBackground === 'none'
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-border hover:bg-muted/60'
              )}
              aria-label="No background"
              title="None"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
            <button
              onClick={() => onCanvasBackgroundChange('dots')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden',
                'bg-background',
                canvasBackground === 'dots'
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-border hover:bg-muted/60'
              )}
              aria-label="Dots background"
              title="Dots"
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '6px 6px',
                }}
              />
            </button>
            <button
              onClick={() => onCanvasBackgroundChange('lines')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden',
                'bg-background',
                canvasBackground === 'lines'
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-border hover:bg-muted/60'
              )}
              aria-label="Lines background"
              title="Lines"
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                  backgroundSize: '6px 6px',
                }}
              />
            </button>
            <button
              onClick={() => onCanvasBackgroundChange('grid')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden',
                'bg-background',
                canvasBackground === 'grid'
                  ? 'border-accent ring-2 ring-accent/20'
                  : 'border-border hover:bg-muted/60'
              )}
              aria-label="Grid background"
              title="Grid"
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: '6px 6px',
                }}
              />
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
