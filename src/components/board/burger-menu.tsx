'use client';

import { useState } from 'react';
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
  Grid3x3,
  Dot,
  Minus,
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
      // Default behavior: capture canvas and download
      console.log('Export image clicked');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'p-2.5 rounded-lg transition-all duration-200',
            'bg-card/95 backdrop-blur-md border border-border',
            'hover:bg-secondary/80 text-muted-foreground hover:text-foreground',
            'shadow-2xl'
          )}
          aria-label="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {/* Main Actions */}
        <DropdownMenuItem onClick={onOpen}>
          <FolderOpen className="w-4 h-4" />
          <span>Open</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSave}>
          <Save className="w-4 h-4" />
          <span>Save to</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportImage}>
          <Image className="w-4 h-4" />
          <span>Export Image</span>
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
          <span>Find on Canvas</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onClear} variant="destructive">
          <RotateCcw className="w-4 h-4" />
          <span>Reset Canvas</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light">
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor className="w-4 h-4" />
            <span>System</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* Canvas Background */}
        <DropdownMenuLabel>Canvas Background</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={canvasBackground}
          onValueChange={(value) =>
            onCanvasBackgroundChange(value as 'none' | 'dots' | 'lines' | 'grid')
          }
        >
          <DropdownMenuRadioItem value="none">
            <X className="w-4 h-4" />
            <span>None</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dots">
            <Dot className="w-4 h-4" />
            <span>Dots</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="lines">
            <Minus className="w-4 h-4" />
            <span>Lines</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="grid">
            <Grid3x3 className="w-4 h-4" />
            <span>Grid</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        {/* Links */}
        <DropdownMenuLabel>Resources</DropdownMenuLabel>
        <DropdownMenuItem onClick={onHelp}>
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </DropdownMenuItem>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
