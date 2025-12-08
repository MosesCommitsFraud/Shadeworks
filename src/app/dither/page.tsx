'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues
const DitherEditor = dynamic(
  () => import('@/components/dither/dither-editor').then((mod) => mod.DitherEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-screen h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dither editor...</p>
        </div>
      </div>
    ),
  }
);

export default function DitherPage() {
  return <DitherEditor />;
}
