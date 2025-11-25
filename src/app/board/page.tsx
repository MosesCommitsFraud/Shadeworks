'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';

export default function BoardPage() {
  const router = useRouter();

  useEffect(() => {
    // Generate a new room ID and redirect
    const roomId = uuid().substring(0, 10);
    router.replace(`/board/${roomId}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Creating your board...</p>
      </div>
    </div>
  );
}

