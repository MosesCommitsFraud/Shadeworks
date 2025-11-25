'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Y.js
const Whiteboard = dynamic(
  () => import('@/components/board/whiteboard').then((mod) => mod.Whiteboard),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    )
  }
);

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default function BoardRoomPage({ params }: PageProps) {
  const { roomId } = use(params);
  
  return <Whiteboard roomId={roomId} />;
}

