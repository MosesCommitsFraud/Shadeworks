'use client';

import * as React from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
  type SpringOptions,
} from 'motion/react';

interface CollaboratorCursorProps {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

const springTransition: SpringOptions = { stiffness: 500, damping: 50, bounce: 0 };

export function CollaboratorCursor({ 
  name, 
  color, 
  x: targetX, 
  y: targetY,
}: CollaboratorCursorProps) {
  const motionX = useMotionValue(targetX);
  const motionY = useMotionValue(targetY);
  
  const springX = useSpring(motionX, springTransition);
  const springY = useSpring(motionY, springTransition);
  
  // Follow label with more lag for nice trailing effect
  const followSpringX = useSpring(motionX, { stiffness: 300, damping: 40, bounce: 0 });
  const followSpringY = useSpring(motionY, { stiffness: 300, damping: 40, bounce: 0 });

  React.useEffect(() => {
    motionX.set(targetX);
    motionY.set(targetY);
  }, [targetX, targetY, motionX, motionY]);

  // Get contrasting text color
  const textColor = React.useMemo(() => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, [color]);

  return (
    <AnimatePresence>
      {/* Cursor pointer */}
      <motion.div
        data-slot="collaborator-cursor"
        style={{
          pointerEvents: 'none',
          zIndex: 9999,
          position: 'absolute',
          top: springY,
          left: springX,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <svg
          className="size-5 drop-shadow-md"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 40 40"
          style={{ color }}
        >
          <path
            fill="currentColor"
            stroke="#fff"
            strokeWidth="2"
            d="M1.8 4.4 7 36.2c.3 1.8 2.6 2.3 3.6.8l3.9-5.7c1.7-2.5 4.5-4.1 7.5-4.3l6.9-.5c1.8-.1 2.5-2.4 1.1-3.5L5 2.5c-1.4-1.1-3.5 0-3.3 1.9Z"
          />
        </svg>
      </motion.div>

      {/* Name label with trailing animation */}
      <motion.div
        data-slot="collaborator-cursor-label"
        style={{
          pointerEvents: 'none',
          zIndex: 9998,
          position: 'absolute',
          top: followSpringY,
          left: followSpringX,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <div
          className="ml-4 mt-5 rounded-full px-2.5 py-1 text-xs font-medium shadow-lg whitespace-nowrap"
          style={{
            backgroundColor: color,
            color: textColor,
          }}
        >
          {name}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Container component for multiple collaborator cursors
interface CollaboratorCursorsProps {
  cursors: Array<{
    id: string;
    name: string;
    color: string;
    x: number;
    y: number;
  }>;
}

export function CollaboratorCursors({ cursors }: CollaboratorCursorsProps) {
  return (
    <>
      {cursors.map((cursor) => (
        <CollaboratorCursor
          key={cursor.id}
          id={cursor.id}
          name={cursor.name}
          color={cursor.color}
          x={cursor.x}
          y={cursor.y}
        />
      ))}
    </>
  );
}
