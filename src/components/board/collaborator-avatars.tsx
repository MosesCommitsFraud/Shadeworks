"use client";

import {
    AvatarGroup,
    AvatarGroupTooltip,
} from "@/components/animate-ui/components/animate/avatar-group";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAnimalIcon } from "@/lib/animal-icons";
import { Eye } from "lucide-react";

interface CollaboratorUser {
    id: string;
    name: string;
    color: string;
    viewport?: { pan: { x: number; y: number }; zoom: number };
}

interface CollaboratorAvatarsProps {
    users: CollaboratorUser[];
    maxDisplay?: number;
    onFollowUser: (userId: string) => void;
    followedUserId: string | null;
    spectatedUserIds?: Set<string>;
}

/**
 * Displays a group of collaborator avatars with animal icons
 * Uses the user's assigned color and shows their full name in a tooltip
 */
export function CollaboratorAvatars({
    users,
    maxDisplay = 5,
    onFollowUser,
    followedUserId,
    spectatedUserIds = new Set(),
}: CollaboratorAvatarsProps) {
    if (users.length === 0) return null;

    const avatarElements = users.slice(0, maxDisplay).map((user) => {
        const AnimalIcon = getAnimalIcon(user.name);
        const isFollowed = followedUserId === user.id;
        const isBeingSpectated = spectatedUserIds.has(user.id);

        return (
            <div key={user.id} className="relative">
                <Avatar
                    className={`size-7 border-2 cursor-pointer transition-all ${
                        isFollowed
                            ? "border-white ring-2 ring-offset-2 ring-offset-background scale-110"
                            : "border-background hover:ring-2 hover:ring-white/30"
                    }`}
                    style={{
                        backgroundColor: user.color,
                        ...(isFollowed && { ringColor: user.color }),
                    }}
                    onClick={() => onFollowUser(user.id)}
                >
                    <AvatarFallback
                        className="bg-transparent text-white/90"
                        style={{
                            backgroundColor: user.color,
                        }}
                    >
                        <AnimalIcon className="size-3.5" strokeWidth={2.5} />
                    </AvatarFallback>
                    <AvatarGroupTooltip>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: user.color }}
                                />
                                <span className="font-medium">{user.name}</span>
                                {isBeingSpectated && (
                                    <Eye className="w-3 h-3 text-muted-foreground" />
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                                {isFollowed
                                    ? "Click to unfollow"
                                    : "Click to follow"}
                            </span>
                        </div>
                    </AvatarGroupTooltip>
                </Avatar>
                {isBeingSpectated && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-background flex items-center justify-center">
                        <Eye className="w-2 h-2 text-muted-foreground" />
                    </div>
                )}
            </div>
        );
    });

    // Add overflow indicator if needed
    if (users.length > maxDisplay) {
        avatarElements.push(
            <Avatar
                key="overflow"
                className="size-7 border-2 border-background bg-muted"
            >
                <AvatarFallback className="bg-muted text-muted-foreground text-xs font-semibold">
                    +{users.length - maxDisplay}
                </AvatarFallback>
            </Avatar>,
        );
    }

    return (
        <AvatarGroup className="ml-2 -space-x-2 h-7" translate="-12%">
            {avatarElements}
        </AvatarGroup>
    );
}
