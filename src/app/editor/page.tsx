'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Fabric.js
const ImageEditor = dynamic(
  () => import('@/components/editor/image-editor').then((mod) => mod.ImageEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading image editor...</p>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  return <ImageEditor />;
}
