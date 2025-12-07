'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import type { BoardElement } from '@/lib/board-types';

interface FindCanvasProps {
  isOpen: boolean;
  onClose: () => void;
  elements: BoardElement[];
  onFocusElement: (element: BoardElement) => void;
  onHighlightElements?: (elementIds: string[]) => void;
  currentHighlightId?: string | null;
}

export function FindCanvas({ isOpen, onClose, elements, onFocusElement, onHighlightElements }: FindCanvasProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<BoardElement[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      inputRef.current?.select();
    } else {
      // Clear highlights when closed
      if (onHighlightElements) {
        onHighlightElements([]);
      }
      setSearchQuery('');
      setResults([]);
      setCurrentIndex(0);
    }
  }, [isOpen, onHighlightElements]);

  // Search elements
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setCurrentIndex(0);
      if (onHighlightElements) {
        onHighlightElements([]);
      }
      return;
    }

    const query = searchQuery.toLowerCase();
    const matchingElements = elements.filter(el => {
      if (el.type === 'text') {
        return el.text?.toLowerCase().includes(query);
      }
      if (el.type === 'frame') {
        return el.label?.toLowerCase().includes(query);
      }
      return false;
    });

    setResults(matchingElements);
    setCurrentIndex(0);

    // Highlight all results
    if (onHighlightElements) {
      onHighlightElements(matchingElements.map(el => el.id));
    }

    // Focus first result
    if (matchingElements.length > 0) {
      onFocusElement(matchingElements[0]);
    }
  }, [searchQuery, elements, onFocusElement, onHighlightElements]);

  const handleNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    onFocusElement(results[nextIndex]);
  };

  const handlePrevious = () => {
    if (results.length === 0) return;
    const prevIndex = currentIndex === 0 ? results.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onFocusElement(results[prevIndex]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevious();
      } else {
        handleNext();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-card/95 backdrop-blur-md border border-border rounded-lg shadow-2xl p-3 w-96 max-w-[90vw]">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
            placeholder="Find text on canvas..."
          />
          {results.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>
                {currentIndex + 1} / {results.length}
              </span>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handlePrevious}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title="Previous (Shift+Enter)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  title="Next (Enter)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
