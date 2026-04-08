import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, easeInOut, motion } from 'framer-motion';
import type { Profile } from '../../types/profile';
import SwipeCard from '../match/SwipeCard';

interface SwipeContainerProps {
  profiles: Profile[];
  onSwipe: (direction: 'left' | 'right', profile: Profile) => void;
  onCommentSend?: (profile: Profile, comment: string) => Promise<void> | void;
}

const SWIPE_REMOVE_DELAY_MS = 100;
const SWIPE_RESET_DELAY_MS = 300;

const cardVariants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
  exit: (direction: 'left' | 'right') => ({
    x: direction === 'left' ? -1000 : 1000,
    rotate: direction === 'left' ? -20 : 20,
    opacity: 0,
    transition: { duration: 0.4, ease: easeInOut },
  }),
};

const SwipeContainer: React.FC<SwipeContainerProps> = ({ profiles, onSwipe, onCommentSend }) => {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [isSwipePending, setIsSwipePending] = useState(false);

  const removeTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (removeTimerRef.current !== null) {
      window.clearTimeout(removeTimerRef.current);
      removeTimerRef.current = null;
    }

    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const activeProfile = profiles[0];

      if (!activeProfile || isSwipePending) {
        return;
      }

      clearTimers();
      setIsSwipePending(true);
      setExitDirection(direction);

      removeTimerRef.current = window.setTimeout(() => {
        onSwipe(direction, activeProfile);

        resetTimerRef.current = window.setTimeout(() => {
          setExitDirection(null);
          setIsSwipePending(false);
        }, SWIPE_RESET_DELAY_MS);
      }, SWIPE_REMOVE_DELAY_MS);
    },
    [clearTimers, isSwipePending, onSwipe, profiles]
  );

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div className="relative z-10 flex h-[70vh] w-full max-w-sm items-center justify-center md:max-w-md">
      <AnimatePresence custom={exitDirection}>
        {profiles.length > 0 ? (
          <motion.div
            key={profiles[0].id}
            custom={exitDirection}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 h-full w-full"
          >
            <SwipeCard
              profile={profiles[0]}
              onSwipe={handleSwipe}
              onCommentSend={onCommentSend}
              disabled={isSwipePending}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default SwipeContainer;
