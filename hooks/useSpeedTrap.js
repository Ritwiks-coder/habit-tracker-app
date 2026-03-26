import { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export const useSpeedTrap = (cooldownMs = 3000, onTriggered) => {
  const lastSwipeTime = useRef(0);
  const [isLocked, setIsLocked] = useState(false);
  const { playfulMode } = useApp();

  const checkSpeedTrap = () => {
    const now = Date.now();
    const timeSinceLastSwipe = now - lastSwipeTime.current;

    if (timeSinceLastSwipe < cooldownMs) {
      if (onTriggered) {
        onTriggered({
          title: "Woah there, Flash! ⚡",
          message: playfulMode 
            ? "You swiped that a bit too fast. Are you actually doing the task, or just farming points? Slow down!"
            : "Please take a moment between completing tasks to ensure accuracy.",
          type: 'warning'
        });
      }
      return false; 
    }

    lastSwipeTime.current = now;
    setIsLocked(true); // Lock the next card momentarily
    
    // Auto-unlock after cooldown
    setTimeout(() => {
      setIsLocked(false);
    }, cooldownMs);

    return true; 
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => setIsLocked(false);
  }, []);

  return { checkSpeedTrap, isLocked };
};
