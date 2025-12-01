'use client';

import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@/components/animate-ui/components/animate/avatar-group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAnimalIcon } from '@/lib/animal-icons';

interface CollaboratorUser {
  id: string;
  name: string;
  color: string;
}

interface CollaboratorAvatarsProps {
  users: CollaboratorUser[];
  maxDisplay?: number;
}

/**
 * Displays a group of collaborator avatars with animal icons
 * Uses the user's assigned color and shows their full name in a tooltip
 */
export function CollaboratorAvatars({
  users,
  maxDisplay = 5
}: CollaboratorAvatarsProps) {
  if (users.length === 0) return null;

  const avatarElements = users.slice(0, maxDisplay).map((user) => {
    const AnimalIcon = getAnimalIcon(user.name);

    return (
      <Avatar
        key={user.id}
        className="size-7 border-2 border-background"
        style={{ backgroundColor: user.color }}
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
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: user.color }}
            />
            <span className="font-medium">{user.name}</span>
          </div>
        </AvatarGroupTooltip>
      </Avatar>
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
      </Avatar>
    );
  }

  return (
    <AvatarGroup className="ml-2 -space-x-2 h-7" translate="-12%">
      {avatarElements}
    </AvatarGroup>
  );
}
