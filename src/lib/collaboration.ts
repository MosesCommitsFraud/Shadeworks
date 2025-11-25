'use client';

import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import type { BoardElement, Cursor } from './board-types';

export class CollaborationManager {
  private doc: Y.Doc;
  private provider: WebrtcProvider | null = null;
  private elements: Y.Array<BoardElement>;
  private awareness: Map<number, Cursor> | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;

  constructor(roomId: string, userName?: string) {
    this.doc = new Y.Doc();
    this.elements = this.doc.getArray<BoardElement>('elements');
    this.userId = Math.random().toString(36).substring(2, 9);
    this.userName = userName || `User ${this.userId.substring(0, 4)}`;
    this.userColor = this.getRandomColor();

    // Connect to the room
    this.provider = new WebrtcProvider(roomId, this.doc, {
      signaling: ['wss://signaling.yjs.dev'],
    });

    // Set user awareness
    this.provider.awareness.setLocalStateField('user', {
      id: this.userId,
      name: this.userName,
      color: this.userColor,
      cursor: null,
    });
  }

  private getRandomColor(): string {
    const colors = [
      '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80',
      '#34d399', '#22d3d8', '#38bdf8', '#60a5fa', '#818cf8',
      '#a78bfa', '#c084fc', '#e879f9', '#f472b6',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getElements(): BoardElement[] {
    return this.elements.toArray();
  }

  addElement(element: BoardElement): void {
    this.elements.push([element]);
  }

  updateElement(id: string, updates: Partial<BoardElement>): void {
    const index = this.elements.toArray().findIndex(el => el.id === id);
    if (index !== -1) {
      const element = this.elements.get(index);
      this.elements.delete(index, 1);
      this.elements.insert(index, [{ ...element, ...updates }]);
    }
  }

  deleteElement(id: string): void {
    const index = this.elements.toArray().findIndex(el => el.id === id);
    if (index !== -1) {
      this.elements.delete(index, 1);
    }
  }

  clearAll(): void {
    this.elements.delete(0, this.elements.length);
  }

  onElementsChange(callback: (elements: BoardElement[]) => void): () => void {
    const handler = () => {
      callback(this.elements.toArray());
    };
    this.elements.observe(handler);
    return () => this.elements.unobserve(handler);
  }

  updateCursor(x: number, y: number): void {
    if (this.provider) {
      this.provider.awareness.setLocalStateField('user', {
        id: this.userId,
        name: this.userName,
        color: this.userColor,
        cursor: { x, y },
      });
    }
  }

  onAwarenessChange(callback: (users: Map<number, { user: { id: string; name: string; color: string; cursor: { x: number; y: number } | null } }>) => void): () => void {
    if (!this.provider) return () => {};
    
    const handler = () => {
      const states = this.provider!.awareness.getStates() as Map<number, { user: { id: string; name: string; color: string; cursor: { x: number; y: number } | null } }>;
      callback(states);
    };
    
    this.provider.awareness.on('change', handler);
    handler(); // Initial call
    
    return () => {
      this.provider?.awareness.off('change', handler);
    };
  }

  getConnectedUsers(): number {
    if (!this.provider) return 1;
    return this.provider.awareness.getStates().size;
  }

  getUserInfo() {
    return {
      id: this.userId,
      name: this.userName,
      color: this.userColor,
    };
  }

  destroy(): void {
    this.provider?.destroy();
    this.doc.destroy();
  }
}

