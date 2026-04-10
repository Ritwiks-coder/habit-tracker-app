import React, { createContext, useContext, useState, useEffect } from 'react';

// ✅ 1. Firebase Imports (Native SDK)
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 2. Smart Task Engine
import { analyzeTask, smartSortTasks } from '../utils/smartTaskEngine';

const AppContext = createContext();

// ✅ 3. THE VANISH ENGINE: Determine current time block
export const getCurrentTimeBlock = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 17) return 'Afternoon';
  return 'Evening';
};

// ✅ Clean, universal suggestions for the Add Task screen
export const SUGGESTED_HABITS = [
  { name: 'Drink Water', icon: '💧', timeCategory: 'Morning', estimatedTime: 2 },
  { name: 'Make Bed', icon: '✨', timeCategory: 'Morning', estimatedTime: 5 },
  { name: 'Stretch / Yoga', icon: '🧘', timeCategory: 'Morning', estimatedTime: 15 },
  { name: 'Read a Book', icon: '📚', timeCategory: 'Evening', estimatedTime: 30 },
  { name: 'Quick Workout', icon: '💪', timeCategory: 'Evening', estimatedTime: 20 },
  { name: 'Journaling', icon: '📓', timeCategory: 'Evening', estimatedTime: 10 },
];


export const AppProvider = ({ children }) => {
  // ==========================================
  // FIREBASE: AUTH & REAL-TIME PROFILE
  // ==========================================
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [draftTasks, setDraftTasks] = useState(SUGGESTED_HABITS);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async (authUser) => {

      // ✅ THE FIX: Stop auto-logging in! Just clear the data and show Auth screens.
      if (!authUser) {
        console.log("👋 User logged out. Showing Auth screens.");
        setUser(null);
        setUserProfile(null);
        setTasks([]);
        setAuthLoading(false);
        return;
      }

      console.log("👤 User authenticated:", authUser.uid);
      setUser(authUser);

      // 1. Listen to User Profile
      const unsubscribeProfile = firestore()
        .collection('users')
        .doc(authUser.uid)
        .onSnapshot(doc => {
          if (doc.exists) {
            setUserProfile(doc.data());
          } else {
            setUserProfile(null);
          }
          setAuthLoading(false);
        }, (error) => {
          console.error("Profile snapshot error:", error);
          setAuthLoading(false);
        });

      // 2. Listen to Habits Subcollection
      const unsubscribeTasks = firestore()
        .collection('users')
        .doc(authUser.uid)
        .collection('habits')
        .onSnapshot(snapshot => {
          if (!snapshot) return;
          if (snapshot.empty) {
            setTasks([]);
          } else {
            const fetchedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(smartSortTasks(fetchedTasks));
          }
        });

      return () => {
        unsubscribeProfile();
        unsubscribeTasks();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  // Firebase-driven state (Replaces local useState)
  const points = userProfile?.totalPoints || 0;
  const ghostMode = userProfile?.ghostMode || false;

  // ✅ 3. ROUTINE LOCK CHECK (crash-safe)
  let routineLockedUntil = null;
  try {
    const raw = userProfile?.routineLockedUntil;
    if (raw && typeof raw.toDate === 'function') {
      routineLockedUntil = raw.toDate();
    } else if (raw?.seconds) {
      routineLockedUntil = new Date(raw.seconds * 1000); // Serialized fallback
    }
  } catch (e) {
    console.error('⚠️ routineLockedUntil parse error:', e);
  }
  const isRoutineLocked = routineLockedUntil instanceof Date && !isNaN(routineLockedUntil)
    ? new Date() < routineLockedUntil
    : false;

  const setGhostMode = async (newValue) => {
    if (user) {
      await firestore().collection('users').doc(user.uid).set({ ghostMode: newValue }, { merge: true });
    }
  };

  // ==========================================
  // LOCAL STATE (Not moved to Firebase)
  // ==========================================
  const [lastResetDate, setLastResetDate] = useState(null);
  const [coins, setCoins] = useState(10);
  const [skipsCount, setSkipsCount] = useState(0);
  const [playfulMode, setPlayfulMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [businessSidebarOpen, setBusinessSidebarOpen] = useState(false);
  const [persistenceLoaded, setPersistenceLoaded] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

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

  const [routineDays, setRoutineDays] = useState(null);
  const [routineSaved, setRoutineSaved] = useState(false);

  // ==========================================
  // LOGIC & ACTIONS
  // ==========================================

  // ==========================================
  // 💾 PERSISTENCE & MIDNIGHT RESET ENGINE
  // ==========================================

  // 1. Initial Load & Local Reset
  useEffect(() => {
    const loadData = async () => {
      try {
        const [coinsVal, skipsVal, playfulVal, lastLogin, onboardingVal] = await Promise.all([
          AsyncStorage.getItem('@app_coins'),
          AsyncStorage.getItem('@app_skips'),
          AsyncStorage.getItem('@app_playful'),
          AsyncStorage.getItem('@app_last_login'),
          AsyncStorage.getItem('@has_seen_onboarding')
        ]);

        if (coinsVal !== null) setCoins(parseInt(coinsVal));
        if (playfulVal !== null) setPlayfulMode(JSON.parse(playfulVal));
        if (onboardingVal !== null) setHasSeenOnboarding(JSON.parse(onboardingVal));

        const today = new Date().toDateString();
        if (lastLogin !== today) {
          console.log("🌞 New Day Detected (Local). Resetting skips...");
          setSkipsCount(0);
          await AsyncStorage.setItem('@app_last_login', today);
        } else if (skipsVal !== null) {
          setSkipsCount(parseInt(skipsVal));
        }

        setPersistenceLoaded(true);
      } catch (e) {
        console.error("Persistence Load Error:", e);
        setPersistenceLoaded(true);
      }
    };
    loadData();
  }, []);

  // 2. Firestore Midnight Reset (Syncs with Local Reset)
  useEffect(() => {
    if (!user || !persistenceLoaded) return;

    const resetFirestoreHabits = async () => {
      const today = new Date().toDateString();
      const lastLogged = userProfile?.lastLogged || null;

      if (lastLogged !== today) {
        console.log("🔥 New Day Detected (Cloud). Batch resetting Firestore habits...");
        try {
          const batch = firestore().batch();
          const snapshot = await firestore()
            .collection('users')
            .doc(user.uid)
            .collection('habits')
            .get();

          snapshot.docs.forEach((doc) => {
            batch.update(doc.ref, { completed: false, skipped: false });
          });

          // Update Cloud lastLogged date
          batch.update(firestore().collection('users').doc(user.uid), {
            lastLogged: today
          });

          await batch.commit();
        } catch (error) {
          console.error("Firestore Reset Error:", error);
        }
      }
    };

    resetFirestoreHabits();
  }, [user, userProfile, persistenceLoaded]);

  // 3. Auto-Save Hooks
  useEffect(() => {
    if (persistenceLoaded) {
      AsyncStorage.setItem('@app_coins', coins.toString());
    }
  }, [coins, persistenceLoaded]);

  useEffect(() => {
    if (persistenceLoaded) {
      AsyncStorage.setItem('@app_skips', skipsCount.toString());
    }
  }, [skipsCount, persistenceLoaded]);

  useEffect(() => {
    if (persistenceLoaded) {
      AsyncStorage.setItem('@app_playful', JSON.stringify(playfulMode));
    }
  }, [playfulMode, persistenceLoaded]);

  // ✅ COMPLETE TASK (Refactored for Economy Engine)
  const completeTask = async (taskId) => {
    if (!user) return;

    // Find the task in our local state to determine toggle
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const isCurrentlyCompleted = task.completed;
    const newStatus = !isCurrentlyCompleted;

    // 1. Update economy (+10 if checking, -10 if unchecking)
    const delta = newStatus ? 10 : -10;

    // Update local economy first for instant feedback
    setCoins(prev => prev + delta);

    try {
      // 2. Sync to Firestore: Update the Habit
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(taskId)
        .update({
          completed: newStatus,
          completedAt: newStatus ? firestore.FieldValue.serverTimestamp() : null
        });

      // 3. Sync to Firestore: Update User Profile (Points & Coins move in lockstep)
      await firestore().collection('users').doc(user.uid).set({
        totalPoints: firestore.FieldValue.increment(delta),
        coins: firestore.FieldValue.increment(delta)
      }, { merge: true });

    } catch (error) {
      console.error("Error toggling task in Firebase:", error);
      // Rollback local economy if it fails? 
      // For now, we'll keep it simple as Firestore listeners will fix the state.
    }
  };

  // ✅ SKIP TASK (Refactored for Economy Engine)
  const skipTask = async (taskId, method = 'free') => {
    if (!user) return;
    try {
      let penalty = 0;

      if (method === 'free') {
        setSkipsCount(prev => prev + 1);
      } else if (method === 'coins') {
        penalty = 50;
        // Update local economy
        setCoins(prev => Math.max(0, prev - penalty));
      }

      // 1. Update Habit Status
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(taskId)
        .update({ skipped: true });

      // 2. Sync Economy to Firestore if there's a penalty
      if (penalty > 0) {
        await firestore().collection('users').doc(user.uid).set({
          totalPoints: firestore.FieldValue.increment(-penalty),
          coins: firestore.FieldValue.increment(-penalty)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error skipping task:", error);
    }
  };

  // ✅ SPEND COINS
  const spendCoins = async (amount) => {
    if (!user) return;
    try {
      // 1. Update local state
      setCoins(prev => Math.max(0, prev - amount));

      // 2. Sync to Firestore
      await firestore().collection('users').doc(user.uid).set({
        totalPoints: firestore.FieldValue.increment(-amount),
        coins: firestore.FieldValue.increment(-amount)
      }, { merge: true });

      return true;
    } catch (error) {
      console.error("Error spending coins:", error);
      return false;
    }
  };

  // ✅ ADD TASK (with full debug logging)
  const addTask = async (arg1, arg2) => {
    console.log('\n--- 🆕 ADD TASK TRIGGERED ---');
    console.log('  arg1:', JSON.stringify(arg1));
    console.log('  arg2:', arg2);
    console.log('  user:', user?.uid ?? 'NULL ⚠️');
    console.log('  isRoutineLocked:', isRoutineLocked);
    console.log('  routineLockedUntil:', routineLockedUntil);
    console.log('  userProfile.routineLockedUntil (raw):', JSON.stringify(userProfile?.routineLockedUntil));

    let taskName = '';
    let timeCategory = 'Morning';
    let icon = '⭐';
    let descPlayful = '';
    let descProfessional = '';
    let order = 50;

    if (typeof arg1 === 'object' && arg1 !== null) {
      taskName = arg1.name || arg1.text || arg1.title || '';
      timeCategory = arg1.time || arg1.timeCategory || 'Morning';
      icon = arg1.icon || '⭐';
      descPlayful = arg1.descPlayful || '';
      descProfessional = arg1.descProfessional || '';
      order = arg1.order ?? 50;
    } else if (typeof arg1 === 'string') {
      taskName = arg1;
      timeCategory = typeof arg2 === 'string' ? arg2 : 'Morning';
    }

    console.log('  → Extracted name:', taskName, '| timeCategory:', timeCategory);

    // 1. Guard: empty name
    if (!taskName) {
      console.log('  🛑 STOPPED: taskName is empty.');
      return;
    }

    // 2. Guard: routine locked
    if (isRoutineLocked) {
      console.log('  🛑 STOPPED: Routine is locked until', routineLockedUntil);
      Alert.alert(
        'Routine Locked 🔒',
        'You cannot add new tasks while a routine is active. Commit to what you have!'
      );
      return;
    }

    // 3. Guard: slot full
    const currentTasksInSlot = tasks.filter(t => t.timeCategory === timeCategory).length;
    console.log('  Tasks in slot:', currentTasksInSlot, '/', 6);
    if (currentTasksInSlot >= 6) {
      Alert.alert('Slot Full', `Maximum 6 tasks allowed in ${timeCategory}.`);
      return;
    }

    // 4. Guard: no auth user
    if (!user) {
      console.log('  🛑 STOPPED: No authenticated user.');
      return;
    }

    const { estimatedTime, sortWeight } = analyzeTask(taskName);

    const newTask = {
      name: taskName,
      timeCategory: timeCategory,
      icon: icon,
      descPlayful: descPlayful,
      descProfessional: descProfessional,
      order: order,
      estimatedTime: estimatedTime,
      sortWeight: sortWeight,
      completed: false,
      skipped: false,
      createdAt: new Date().toISOString(),
    };

    console.log('  📦 Task ready to save:', JSON.stringify({ name: newTask.name, timeCategory: newTask.timeCategory, icon: newTask.icon }));

    try {
      await firestore().collection('users').doc(user.uid).collection('habits').add(newTask);
      console.log('  ✅ SUCCESS: Task saved to Firestore!');
    } catch (error) {
      console.error('  🛑 FIREBASE ERROR:', error);
    }
  };

  // ✅ REMOVE TASK
  const removeTask = async (id) => {
    if (!user) return;
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(id)
        .delete();
    } catch (error) {
      console.error("Error removing task:", error);
    }
  };

  const saveBulkTasks = async (taskArray) => {
    if (!user || !user.uid) {
      return false;
    }

    try {
      const batch = firestore().batch();

      taskArray.forEach((task) => {
        const taskRef = firestore().collection('users').doc(user.uid).collection('habits').doc();
        batch.set(taskRef, {
          name: task.name || 'New Task',
          timeCategory: task.timeCategory || 'Morning',
          icon: task.icon || '🎯',
          estimatedTime: task.estimatedTime || 15,
          sortWeight: task.sortWeight || 0,
          completed: false,
          skipped: false,
          createdAt: new Date().toISOString(),
        });
      });

      await batch.commit();

      // 1. Instantly wipe the draft state so Draft Mode turns off globally
      setDraftTasks([]);
      return true;

    } catch (error) {
      console.error("Bulk Save Error:", error);
      return false;
    }
  };

  // ✅ SAVE ONBOARDING DATA
  const completeOnboarding = async (gender, ageBracket) => {
    if (!user) return;
    try {
      await firestore().collection('users').doc(user.uid).set({
        onboardingCompleted: true,
        gender: gender,
        ageBracket: ageBracket
      }, { merge: true });
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };
 
  // ✅ 4. INTRO COMPLETION (Local Persistence)
  const completeIntro = async () => {
    try {
      setHasSeenOnboarding(true);
      await AsyncStorage.setItem('@has_seen_onboarding', 'true');
    } catch (error) {
      console.error("Error setting intro status:", error);
    }
  };


  // ✅ START ROUTINE
  const startRoutine = async (daysToLock) => {
    if (!user) return;
    try {
      const unlockDate = new Date();
      unlockDate.setDate(unlockDate.getDate() + daysToLock);

      await firestore().collection('users').doc(user.uid).set({
        routineLockedUntil: firestore.Timestamp.fromDate(unlockDate)
      }, { merge: true });
    } catch (error) {
      console.error("Error starting routine:", error);
    }
  };

  // 🔧 TEMP: Force-Unlock (delete routineLockedUntil from Firestore)
  const forceUnlock = async () => {
    if (!user) { Alert.alert('No user', 'Not authenticated yet.'); return; }
    try {
      await firestore().collection('users').doc(user.uid).update({
        routineLockedUntil: firestore.FieldValue.delete()
      });
      Alert.alert('✅ Unlocked', 'routineLockedUntil deleted. You can now add tasks!');
      console.log('🔓 Force unlock successful.');
    } catch (error) {
      console.error('❌ forceUnlock error:', error);
      Alert.alert('Error', error.message);
    }
  };

  const saveRoutine = (days) => {
    setRoutineDays(days);
    setRoutineSaved(true);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const skippedCount = tasks.filter(t => t.skipped).length;
  const remainingCount = tasks.filter(t => !t.completed && !t.skipped).length;

  const sortedTasks = smartSortTasks(tasks);

  return (
    <AppContext.Provider value={{
      user,
      userProfile,
      authLoading,
      points,
      tasks: sortedTasks, draftTasks, setDraftTasks, coins, setCoins, skipsCount, routineDays, routineSaved,
      completeTask, skipTask, spendCoins, addTask, removeTask, saveBulkTasks, saveRoutine, startRoutine, forceUnlock,
      completedCount, skippedCount, remainingCount,
      playfulMode, setPlayfulMode,
      sidebarOpen, setSidebarOpen,
      ghostMode, setGhostMode,
      isRoutineLocked, routineLockedUntil,
      businessSidebarOpen, setBusinessSidebarOpen,
      businessProfile, setBusinessProfile,
      completeOnboarding,
      hasSeenOnboarding, completeIntro
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);