"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import {
    generateEncryptionKey,
    exportKeyToString,
    isEncryptionSupported,
} from "@/lib/encryption";

export default function BoardPage() {
    const router = useRouter();

    useEffect(() => {
        const createRoom = async () => {
            // Generate a new room ID
            const roomId = uuid().substring(0, 10);

            // Generate encryption key if supported
            if (isEncryptionSupported()) {
                try {
                    const key = await generateEncryptionKey();
                    const keyString = await exportKeyToString(key);
                    // Navigate with the encryption key in the URL hash
                    router.replace(`/board/${roomId}#${keyString}`);
                } catch (error) {
                    console.error("Failed to generate encryption key:", error);
                    // Fallback to unencrypted room
                    router.replace(`/board/${roomId}`);
                }
            } else {
                // Web Crypto not available, create unencrypted room
                console.warn(
                    "Web Crypto API not available, room will not be encrypted",
                );
                router.replace(`/board/${roomId}`);
            }
        };

        createRoom();
    }, [router]);

    return (
        <div className="flex items-center justify-center w-screen h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground">
                    Creating your secure board...
                </p>
            </div>
        </div>
    );
}
