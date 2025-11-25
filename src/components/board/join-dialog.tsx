'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface JoinDialogProps {
  onJoin: (name: string) => void;
}

export function JoinDialog({ onJoin }: JoinDialogProps) {
  const [name, setName] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  // Check if name is already stored
  useEffect(() => {
    const storedName = localStorage.getItem('shadeworks-username');
    if (storedName) {
      onJoin(storedName);
      setIsVisible(false);
    }
  }, [onJoin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('shadeworks-username', name.trim());
      onJoin(name.trim());
      setIsVisible(false);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-md mx-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <svg 
                      className="w-5 h-5 text-accent" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">
                      Join Board
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ve been invited to collaborate
                    </p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 pb-6">
                <label className="block mb-2 text-sm font-medium text-foreground">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                  autoFocus
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  maxLength={20}
                />
                
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full mt-4 px-4 py-3 bg-accent text-accent-foreground font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Join Board
                </button>

                <p className="mt-3 text-xs text-center text-muted-foreground">
                  Your name will be visible to other collaborators
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

