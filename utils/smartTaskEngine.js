/**
 * Smart Task Engine
 * Analyzes task names to estimate duration and prioritization
 */

const TASK_KEYWORDS = {
  // Time estimates (in minutes)
  quick: { keywords: ['drink', 'water', 'stretch', 'check', 'read'], time: 5 },
  short: { keywords: ['make', 'bed', 'shower', 'email', 'call'], time: 15 },
  medium: { keywords: ['walk', 'exercise', 'meditation', 'run', 'cook'], time: 30 },
  long: { keywords: ['project', 'work', 'study', 'reading', 'journaling'], time: 60 },
  veryLong: { keywords: ['workout', 'study session', 'deep work'], time: 120 },
};

/**
 * Analyze a task name and return estimated time and sort weight
 * @param {string} taskName - The name of the task
 * @returns {object} { estimatedTime: string, sortWeight: number }
 */
export const analyzeTask = (taskName) => {
  const lowerName = taskName.toLowerCase();
  let estimatedMinutes = 20; // Default
  let sortWeight = 5; // Default priority (1-10, higher = more urgent)

  // Find matching time category
  for (const [category, { keywords, time }] of Object.entries(TASK_KEYWORDS)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      estimatedMinutes = time;
      break;
    }
  }

  // Determine sort weight based on time
  if (estimatedMinutes <= 5) sortWeight = 8; // Quick wins get high priority
  else if (estimatedMinutes <= 15) sortWeight = 7;
  else if (estimatedMinutes <= 30) sortWeight = 6;
  else if (estimatedMinutes <= 60) sortWeight = 4;
  else sortWeight = 3; // Long tasks get lower priority

  // Convert to readable format
  const estimatedTime = formatTime(estimatedMinutes);

  return { estimatedTime, sortWeight };
};

/**
 * Format minutes into a readable time string
 * @param {number} minutes
 * @returns {string} e.g., "5 min", "1 hr", "1.5 hrs"
 */
export const formatTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = minutes / 60;
  return hours % 1 === 0 ? `${hours} hr` : `${hours.toFixed(1)} hrs`;
};

/**
 * Sort tasks intelligently based on 3-tier time system, then sort weight
 * @param {array} tasks - Array of task objects
 * @returns {array} Sorted tasks (Morning → Afternoon → Evening → Completed → Skipped)
 */
export const smartSortTasks = (tasks) => {
  // ✅ 3-TIER TIME ORDERING: Morning (1) → Afternoon (2) → Evening (3)
  const timeOrder = {
    'Morning': 1,
    'Afternoon': 2,
    'Evening': 3,
  };

  return [...tasks].sort((a, b) => {
    // Completed and skipped tasks go to bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.skipped !== b.skipped) return a.skipped ? 1 : -1;

    // 🌅 First: Sort by time slot (Morning → Afternoon → Evening)
    const timeA = timeOrder[a.timeCategory] || 99;
    const timeB = timeOrder[b.timeCategory] || 99;
    if (timeA !== timeB) return timeA - timeB;

    // 📊 Then: Sort by sortWeight within same time slot (higher = more urgent)
    if ((b.sortWeight || 5) !== (a.sortWeight || 5)) {
      return (b.sortWeight || 5) - (a.sortWeight || 5);
    }

    // ⏰ Finally: By creation time (newer first)
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
};

/**
 * Suggested tasks organized by time category
 * Each category has 11 high-quality habit suggestions
 */
export const suggestedTasksByCategory = {
  Morning: [
    "Drink Water",
    "Make Bed",
    "Brush Teeth",
    "10 Min Stretch",
    "Meditate",
    "Drink Coffee",
    "Eat Breakfast",
    "Journal",
    "Read News",
    "Review Daily Goals",
    "Gratitude Practice",
  ],
  Afternoon: [
    "Deep Work Session",
    "Check Emails",
    "Eat Lunch",
    "Quick Walk",
    "Drink Water",
    "Power Nap",
    "Listen to Podcast",
    "Study",
    "Organize Desk",
    "Stretch Break",
    "Team Meeting",
  ],
  Evening: [
    "Go to Gym",
    "Eat Dinner",
    "Call Family",
    "Read Book",
    "Clean Room",
    "Plan Tomorrow",
    "Skincare Routine",
    "No Screens",
    "Drink Herbal Tea",
    "Prep Clothes",
    "Sleep Early",
  ],
};
// ── SMART EMOJI ENGINE (GLOBAL) ──
export const getTaskEmoji = (name) => {
  const n = name?.toLowerCase() || '';
  
  // Hygiene & Self Care
  if (n.includes('shower') || n.includes('bath') || n.includes('wash')) return '🚿';
  if (n.includes('skin') || n.includes('teeth') || n.includes('brush') || n.includes('clean') || n.includes('face')) return '✨';
  if (n.includes('meds') || n.includes('pill') || n.includes('vitamin') || n.includes('supplement')) return '💊';
  
  // Fitness & Health
  if (n.includes('water') || n.includes('hydrate') || n.includes('drink')) return '💧';
  if (n.includes('gym') || n.includes('workout') || n.includes('exercise') || n.includes('lift')) return '💪';
  if (n.includes('run') || n.includes('jog') || n.includes('walk') || n.includes('cardio') || n.includes('steps')) return '🏃‍♂️';
  
  // Mindfulness & Learning
  if (n.includes('read') || n.includes('book') || n.includes('study') || n.includes('journal') || n.includes('write')) return '📖';
  if (n.includes('meditat') || n.includes('breath') || n.includes('yoga') || n.includes('stretch')) return '🧘‍♂️'; // <-- FIXED: Now catches "meditation"
  
  // Food & Nutrition
  if (n.includes('eat') || n.includes('food') || n.includes('lunch') || n.includes('dinner') || n.includes('meal')) return '🍽️';
  if (n.includes('breakfast') || n.includes('coffee') || n.includes('tea')) return '☕';
  
  // Work & Productivity
  if (n.includes('work') || n.includes('office') || n.includes('email') || n.includes('plan') || n.includes('code') || n.includes('design')) return '💻';
  
  // Rest & Devices
  if (n.includes('sleep') || n.includes('bed') || n.includes('nap') || n.includes('wake')) return '🌙';
  if (n.includes('screen') || n.includes('phone') || n.includes('social') || n.includes('tv') || n.includes('scroll')) return '📱';
  
  // Social
  if (n.includes('family') || n.includes('call') || n.includes('friend')) return '📞';
  
  // ── NEW DEFAULT FOR CUSTOM TASKS ──
  return '🎯'; 
};