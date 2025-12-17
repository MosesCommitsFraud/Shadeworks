'use client';

import { useState, useEffect, useRef, type CSSProperties } from 'react';
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

function useSlidingHighlight(activeKey: string, enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [style, setStyle] = useState<CSSProperties>({});
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const updateRef = useRef<(() => void) | null>(null);
  const lastRef = useRef<{ width: number; height: number; transform: string } | null>(null);
  updateRef.current = () => {
    const container = containerRef.current;
    const active = itemRefs.current.get(activeKey);
    if (!container || !active) return;

    const listRect = container.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    const x = itemRect.left - listRect.left;
    const y = itemRect.top - listRect.top;
    const next = {
      width: itemRect.width,
      height: itemRect.height,
      transform: `translate3d(${x}px, ${y}px, 0)`,
    };

    const last = lastRef.current;
    if (
      last &&
      last.width === next.width &&
      last.height === next.height &&
      last.transform === next.transform
    ) {
      return;
    }
    lastRef.current = next;
    setStyle(next);
  };

  useEffect(() => {
    if (!enabled) return;
    const update = () => updateRef.current?.();
    const raf = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const raf = requestAnimationFrame(() => updateRef.current?.());
    return () => cancelAnimationFrame(raf);
  }, [activeKey, enabled]);

  const refCallbacks = useRef<Map<string, (node: HTMLButtonElement | null) => void>>(new Map());
  const register = (key: string) => {
    const existing = refCallbacks.current.get(key);
    if (existing) return existing;

    const cb = (node: HTMLButtonElement | null) => {
      if (node) itemRefs.current.set(key, node);
      else itemRefs.current.delete(key);

      if (enabledRef.current) {
        requestAnimationFrame(() => updateRef.current?.());
      }
    };
    refCallbacks.current.set(key, cb);
    return cb;
  };

  return { containerRef, register, style };
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

  const selectedTheme = theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system';
  const themeHighlight = useSlidingHighlight(selectedTheme, isOpen);
  const hasThemeHighlight = typeof themeHighlight.style.width === 'number' && typeof themeHighlight.style.height === 'number';

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
          <div
            ref={themeHighlight.containerRef}
            className="relative flex items-center bg-secondary/40 rounded-md p-0.5 gap-0.5"
          >
            <div
              className="pointer-events-none absolute z-0 top-0 left-0 rounded-sm bg-muted/70 border border-foreground/10 shadow-sm transition-all duration-300 ease-out will-change-transform"
              style={{ ...themeHighlight.style, opacity: hasThemeHighlight ? 1 : 0 }}
            />
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'relative z-10 w-7 h-7 rounded-sm transition-colors duration-200 flex items-center justify-center',
                'hover:bg-muted/60',
                selectedTheme === 'light' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Light theme"
              ref={themeHighlight.register('light')}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'relative z-10 w-7 h-7 rounded-sm transition-colors duration-200 flex items-center justify-center',
                'hover:bg-muted/60',
                selectedTheme === 'dark' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Dark theme"
              ref={themeHighlight.register('dark')}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={cn(
                'relative z-10 w-7 h-7 rounded-sm transition-colors duration-200 flex items-center justify-center',
                'hover:bg-muted/60',
                selectedTheme === 'system' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="System theme"
              ref={themeHighlight.register('system')}
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
                'bg-background hover:bg-muted/60',
                canvasBackground === 'none'
                  ? 'border-foreground/30 ring-2 ring-foreground/10'
                  : 'border-border'
              )}
              aria-label="No background"
              title="None"
            >
              <X className="w-3 h-3" />
            </button>
            <button
              onClick={() => onCanvasBackgroundChange('dots')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden',
                'bg-background hover:bg-muted/60',
                canvasBackground === 'dots'
                  ? 'border-foreground/30 ring-2 ring-foreground/10'
                  : 'border-border'
              )}
              aria-label="Dots background"
              title="Dots"
            >
              <div
                className="w-full h-full"
                style={{
                  color: 'var(--foreground)',
                  opacity: 0.35,
                  backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: 'center',
                }}
              />
            </button>
            <button
              onClick={() => onCanvasBackgroundChange('lines')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden',
                'bg-background hover:bg-muted/60',
                canvasBackground === 'lines'
                  ? 'border-foreground/30 ring-2 ring-foreground/10'
                  : 'border-border'
              )}
              aria-label="Lines background"
              title="Lines"
            >
              <div
                className="w-full h-full"
                style={{
                  color: 'var(--foreground)',
                  opacity: 0.35,
                  backgroundImage: 'linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                  backgroundSize: '8px 8px',
                  backgroundPosition: 'center',
                }}
              />
            </button>
            <button
              onClick={() => onCanvasBackgroundChange('grid')}
              className={cn(
                'w-7 h-7 rounded-sm transition-all border-2 overflow-hidden',
                'bg-background hover:bg-muted/60',
                canvasBackground === 'grid'
                  ? 'border-foreground/30 ring-2 ring-foreground/10'
                  : 'border-border'
              )}
              aria-label="Grid background"
              title="Grid"
            >
              <div
                className="w-full h-full"
                style={{
                  color: 'var(--foreground)',
                  opacity: 0.35,
                  backgroundImage: `
                    linear-gradient(to right, currentColor 1px, transparent 1px),
                    linear-gradient(to bottom, currentColor 1px, transparent 1px)
                  `,
                  backgroundSize: '8px 8px',
                  backgroundPosition: 'center',
                }}
              />
            </button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
