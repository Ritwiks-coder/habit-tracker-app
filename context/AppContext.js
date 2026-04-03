import React, { createContext, useContext, useState, useEffect } from 'react';

// ✅ 1. Firebase Imports (Native SDK)
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';

// ✅ 2. Smart Task Engine
import { analyzeTask, smartSortTasks } from '../utils/smartTaskEngine';

const AppContext = createContext();

// ✅ Clean, universal suggestions for the Add Task screen
export const SUGGESTED_HABITS = [
  { name: 'Drink Water', icon: '💧', timeCategory: 'Morning', estimatedTime: 2 },
  { name: 'Make Bed', icon: '✨', timeCategory: 'Morning', estimatedTime: 5 },
  { name: 'Stretch / Yoga', icon: '🧘', timeCategory: 'Morning', estimatedTime: 15 },
  { name: 'Read a Book', icon: '📚', timeCategory: 'Evening', estimatedTime: 30 },
  { name: 'Quick Workout', icon: '💪', timeCategory: 'Evening', estimatedTime: 20 },
  { name: 'Journaling', icon: '📓', timeCategory: 'Night', estimatedTime: 10 },
];


export const AppProvider = ({ children }) => {
  // ==========================================
  // FIREBASE: AUTH & REAL-TIME PROFILE
  // ==========================================
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [draftTasks, setDraftTasks] = useState(SUGGESTED_HABITS);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async (authUser) => {
      
      // 🔥 THE FIX: SILENT AUTO-LOGIN ENGINE 🔥
      if (!authUser) {
        console.log("👻 No user found. Triggering silent anonymous login...");
        try {
          await auth().signInAnonymously();
          // We return here because the sign-in will re-trigger onAuthStateChanged with the new user!
        } catch (error) {
          console.error("❌ Auto-login failed:", error);
        }
        return; 
      }

      console.log("👤 User authenticated:", authUser.uid);
      setUser(authUser);
      
      // 1. Listen to User Profile (Points, Ghost Mode, Routine Lock)
      const unsubscribeProfile = firestore()
        .collection('users')
        .doc(authUser.uid)
        .onSnapshot(doc => {
          if (doc.exists) setUserProfile(doc.data());
        });

      // 2. Listen to Habits Subcollection (REAL-TIME SYNC)
      const unsubscribeTasks = firestore()
        .collection('users')
        .doc(authUser.uid)
        .collection('habits')
        .onSnapshot(snapshot => {
          if (!snapshot) {
            console.log("❌ Snapshot is null");
            return;
          }
          
          console.log("📡 Real-time listener fired! Total docs:", snapshot.size);
          
          // Check if this is a new user (no habits yet)
          if (snapshot.empty) {
            console.log("📋 No habits found. Showing empty state.");
            setTasks([]); // Just set to empty — no auto-saving anymore
          } else {
            // Map the Firebase documents into a standard array
            const fetchedTasks = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));

            // Sort them using our smart engine before updating the UI
            const sortedTasks = smartSortTasks(fetchedTasks);
            setTasks(sortedTasks);
          }
        }, error => {
          console.error("❌ Error fetching tasks:", error);
        });

      // Cleanup listeners when user logs out or component unmounts
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
  
  // MIDNIGHT RESET ENGINE
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastResetDate !== today) {
      // Reset all tasks via Firestore batch update
      if (user && tasks.length > 0) {
        try {
          const batch = firestore().batch();
          tasks.forEach((task) => {
            const taskRef = firestore()
              .collection('users')
              .doc(user.uid)
              .collection('habits')
              .doc(task.id);
            batch.update(taskRef, { completed: false, skipped: false });
          });
          batch.commit();
        } catch (error) {
          console.error("Error resetting tasks:", error);
        }
      }
      setLastResetDate(today);
    }
  }, [lastResetDate, user, tasks]);

  // ✅ COMPLETE TASK
  const completeTask = async (id) => {
    if (!user) return;
    try {
      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(id)
        .update({ completed: true });

      await firestore().collection('users').doc(user.uid).set({
        totalPoints: firestore.FieldValue.increment(10)
      }, { merge: true });

      setCoins(c => c + 1);
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  // ✅ SKIP TASK
  const skipTask = async (id, skipMethod = 'free') => {
    if (!user) return;
    try {
      setSkipsCount(prev => prev + 1);
      const isHeavyPenalty = skipsCount >= 2;
      let penalty = 0;
      
      if (skipMethod === 'coins' && coins >= 5 && isHeavyPenalty) {
        setCoins(c => c - 5);
      } else if (skipMethod === 'ad' && isHeavyPenalty) {
        // Watched an ad
      } else {
        penalty = isHeavyPenalty ? 50 : 10;
      }

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('habits')
        .doc(id)
        .update({ skipped: true });

      if (penalty > 0) {
        await firestore().collection('users').doc(user.uid).set({
          totalPoints: firestore.FieldValue.increment(-penalty)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error skipping task:", error);
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
      taskName        = arg1.name || arg1.text || arg1.title || '';
      timeCategory    = arg1.time || arg1.timeCategory || 'Morning';
      icon            = arg1.icon || '⭐';
      descPlayful     = arg1.descPlayful || '';
      descProfessional= arg1.descProfessional || '';
      order           = arg1.order ?? 50;
    } else if (typeof arg1 === 'string') {
      taskName     = arg1;
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
      name:            taskName,
      timeCategory:    timeCategory,
      icon:            icon,
      descPlayful:     descPlayful,
      descProfessional:descProfessional,
      order:           order,
      estimatedTime:   estimatedTime,
      sortWeight:      sortWeight,
      completed:       false,
      skipped:         false,
      createdAt:       new Date().toISOString(),
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
      points, 
      tasks: sortedTasks, draftTasks, setDraftTasks, coins, skipsCount, routineDays, routineSaved,
      completeTask, skipTask, addTask, removeTask, saveBulkTasks, saveRoutine, startRoutine, forceUnlock,
      completedCount, skippedCount, remainingCount,
      playfulMode, setPlayfulMode,
      sidebarOpen, setSidebarOpen,
      ghostMode, setGhostMode,
      isRoutineLocked, routineLockedUntil,
      businessSidebarOpen, setBusinessSidebarOpen,
      businessProfile, setBusinessProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);