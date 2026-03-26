import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [points, setPoints] = useState(260);
  const [lastResetDate, setLastResetDate] = useState(null);

  const [coins, setCoins] = useState(10); // Start with 10 coins
  const [skipsCount, setSkipsCount] = useState(0); // Track total skips
  const [playfulMode, setPlayfulMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // --- GHOST MODE STATE ---
  const [ghostMode, setGhostMode] = useState(false);
  
  // --- BUSINESS SIDEBAR STATE ---
  const [businessSidebarOpen, setBusinessSidebarOpen] = useState(false);

  // --- BUSINESS PROFILE STATE ---
  const [businessProfile, setBusinessProfile] = useState({
    name: 'Bean & Brew',
    category: 'Cafe & Bakery',
    phone: '+1 (555) 123-4567',
    address: '123 Coffee Lane, Tech District',
    description: 'Artisanal coffee, fresh daily pastries, and a cozy atmosphere for remote workers and coffee lovers alike.',
    website: 'www.beanandbrew.local',
    logo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop',
    coverPhoto: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop'
  });

  const [tasks, setTasks] = useState([
    { id: '1', name: 'Drink Water', icon: '💧', time: 'Morning', timeCategory: 'Morning', completed: false, skipped: false, createdAt: Date.now() },
    { id: '2', name: 'Make Bed', icon: '🛏️', time: 'Morning', timeCategory: 'Morning', completed: false, skipped: false, createdAt: Date.now() },
    { id: '3', name: 'Meditation 10 Min', icon: '🧘', time: 'Morning', timeCategory: 'Morning', completed: false, skipped: false, createdAt: Date.now() },
    { id: '4', name: 'Morning Walk', icon: '🚶', time: 'Morning', timeCategory: 'Morning', completed: false, skipped: false, createdAt: Date.now() },
    { id: '5', name: 'Read Book', icon: '📚', time: 'Evening', timeCategory: 'Evening', completed: false, skipped: false, createdAt: Date.now() },
    { id: '6', name: 'Exercise', icon: '💪', time: 'Evening', timeCategory: 'Evening', completed: false, skipped: false, createdAt: Date.now() },
    { id: '7', name: 'Journaling', icon: '📝', time: 'Night', timeCategory: 'Night', completed: false, skipped: false, createdAt: Date.now() },
  ]);
  const [routineDays, setRoutineDays] = useState(null);
  const [routineSaved, setRoutineSaved] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      // Reset all tasks for new day
      setTasks(prev => prev.map(t => ({ ...t, completed: false, skipped: false })));
      setLastResetDate(today);
    }
  }, [lastResetDate]);

  const completeTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    setPoints(p => p + 10);
    setCoins(c => c + 1);
  };

  const skipTask = (id, skipMethod = 'free') => {
    // skipMethod: 'free', 'coins', 'ad'
    setSkipsCount(prev => prev + 1);
    
    // Calculate penalty based on how many skips they've already done
    const isHeavyPenalty = skipsCount >= 2;
    
    if (skipMethod === 'coins' && coins >= 5 && isHeavyPenalty) {
      setCoins(c => c - 5);
      // Neutralized the -50 penalty
    } else if (skipMethod === 'ad' && isHeavyPenalty) {
      // Watched an ad, neutralized penalty
    } else {
      // Apply penalty
      const penalty = isHeavyPenalty ? 50 : 10;
      setPoints(p => p - penalty);
    }

    setTasks(prev => prev.map(t => t.id === id ? { ...t, skipped: true } : t));
  };

  const addTask = (task) => {
    setTasks(prev => [...prev, {
      ...task,
      id: Date.now().toString(),
      completed: false,
      skipped: false,
      timeCategory: task.time,
      createdAt: Date.now(),
    }]);
  };

  const removeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const saveRoutine = (days) => {
    setRoutineDays(days);
    setRoutineSaved(true);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const skippedCount = tasks.filter(t => t.skipped).length;
  const remainingCount = tasks.filter(t => !t.completed && !t.skipped).length;

  return (
    <AppContext.Provider value={{
      points, tasks, coins, skipsCount, routineDays, routineSaved,
      completeTask, skipTask, addTask, removeTask, saveRoutine,
      completedCount, skippedCount, remainingCount,
      playfulMode, setPlayfulMode,
      sidebarOpen, setSidebarOpen,
      ghostMode, setGhostMode,
      businessSidebarOpen, setBusinessSidebarOpen, // <--- Added perfectly right here!
      businessProfile, setBusinessProfile // <--- Added global business profile state
    }}>
      {children}
    </AppContext.Provider>
  );
};

const getUserLevel = (points) => {
  if (points < 100) return { level: 1, title: 'Beginner' };
  if (points < 300) return { level: 2, title: 'Rookie' };
  if (points < 600) return { level: 3, title: 'Grinder' };
  if (points < 1000) return { level: 4, title: 'Hustler' };
  if (points < 1500) return { level: 5, title: 'Warrior' };
  if (points < 2000) return { level: 6, title: 'Legend' };
  return { level: 7, title: 'GOD MODE' };
};

export const useApp = () => useContext(AppContext);