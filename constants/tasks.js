export const PREDEFINED_TASKS = [
  // MORNING tasks
  { id: 'drink_water', keywords: ['water', 'drink', 'hydrate'], name: 'Drink Water', icon: '💧', time: 'Morning', order: 10, descPlayful: 'Hydrate yourself, you lazy sloth 💀', descProfessional: 'Stay hydrated for optimal performance.' },
  { id: 'make_bed', keywords: ['bed', 'sheets', 'tidy'], name: 'Make Bed', icon: '🛏️', time: 'Morning', order: 20, descPlayful: 'Your bed is judging you rn 👀', descProfessional: 'Start your day with a clean space.' },
  { id: 'meditation', keywords: ['meditat', 'breathe', 'calm', 'mindful'], name: 'Meditation', icon: '🧘', time: 'Morning', order: 30, descPlayful: 'Shush your brain for 10 mins 🧠', descProfessional: 'Practice mindfulness and focus.' },
  { id: 'exercise', keywords: ['workout', 'gym', 'exercise', 'lift', 'pushup'], name: 'Exercise', icon: '💪', time: 'Morning', order: 40, descPlayful: "No pain, no gain... or just pain 😅", descProfessional: 'Complete your exercise routine.' },
  { id: 'walk', keywords: ['walk', 'steps', 'stroll', 'jog', 'run'], name: 'Morning Walk', icon: '🚶', time: 'Morning', order: 50, descPlayful: "Touch some grass, it won't hurt 😂", descProfessional: 'Complete your daily walking goal.' },
  { id: 'cold_shower', keywords: ['shower', 'cold', 'bath'], name: 'Cold Shower', icon: '🚿', time: 'Morning', order: 60, descPlayful: 'Brrr... but make it a vibe 🥶', descProfessional: 'Boost energy with a cold shower.' },
  { id: 'healthy_breakfast', keywords: ['breakfast', 'morning meal', 'eat morning'], name: 'Healthy Breakfast', icon: '🥣', time: 'Morning', order: 70, descPlayful: 'Eat breakfast or your metabolism will cry 😭', descProfessional: 'Fuel your body with a nutritious breakfast.' },
  { id: 'vitamins', keywords: ['vitamin', 'supplement', 'medicine', 'pill'], name: 'Take Vitamins', icon: '💊', time: 'Morning', order: 80, descPlayful: "Don't forget your gummy bears 🐻", descProfessional: 'Maintain your supplement routine.' },

  // AFTERNOON tasks
  { id: 'water_afternoon', keywords: ['water', 'drink', 'glass'], name: 'Drink a glass of water', icon: '💧', time: 'Afternoon', order: 20, descPlayful: 'Hydrate before you dehydrate 🌵', descProfessional: 'Drink water to maintain focus and energy.' },
  { id: 'stretch_afternoon', keywords: ['stretch', '5 minutes', 'move'], name: 'Stretch for 5 minutes', icon: '🧘', time: 'Afternoon', order: 40, descPlayful: 'Un-pretzel your spine 🥨', descProfessional: 'Take a quick stretch break to relieve tension.' },
  { id: 'quick_walk', keywords: ['walk', 'quick', 'outside'], name: 'Quick walk', icon: '🚶', time: 'Afternoon', order: 60, descPlayful: 'Go look at the sky for a bit 🌤️', descProfessional: 'Take a short walk to refresh your mind.' },

  // EVENING tasks
  { id: 'walk_evening', keywords: ['evening walk', 'stroll', 'walk evening'], name: 'Evening Walk', icon: '🌅', time: 'Evening', order: 20, descPlayful: 'Sunset walks hit different 🌇', descProfessional: 'Unwind with an evening walk.' },
  { id: 'healthy_meal', keywords: ['meal', 'eat', 'food', 'diet', 'healthy', 'greens', 'salad'], name: 'Healthy Meal', icon: '🥗', time: 'Evening', order: 40, descPlayful: 'Eat like your future self is watching 👀', descProfessional: 'Maintain a balanced, nutritious diet.' },
  { id: 'family_time', keywords: ['family', 'friends', 'social', 'connect'], name: 'Family Time', icon: '👨‍👩‍👧', time: 'Evening', order: 50, descPlayful: 'Put the phone down and actually talk 😂', descProfessional: 'Spend quality time with loved ones.' },
  { id: 'hobby', keywords: ['hobby', 'creative', 'art', 'music', 'draw'], name: 'Creative Hobby', icon: '🎨', time: 'Evening', order: 70, descPlayful: "Bob Ross mode: activated 🎨", descProfessional: 'Engage in a creative activity.' },
  { id: 'read', keywords: ['read', 'book', 'pages'], name: 'Read 10 pages', icon: '📚', time: 'Evening', order: 80, descPlayful: 'Books > Netflix. Fight me 📖', descProfessional: 'Expand your knowledge through reading.' },
  { id: 'no_screen', keywords: ['screen', 'phone', 'social', 'detox', 'tiktok'], name: 'No Screen Time', icon: '📵', time: 'Evening', order: 90, descPlayful: 'Touch grass, not TikTok 🌿', descProfessional: 'Reduce screen exposure for mental clarity.' },

  // NIGHT tasks mapped to Evening
  { id: 'skincare', keywords: ['skin', 'skincare', 'moistur', 'face'], name: 'Skincare Routine', icon: '✨', time: 'Evening', order: 120, descPlayful: 'Glow up in your sleep bestie ✨', descProfessional: 'Maintain a consistent skincare routine.' },
  { id: 'plan_tomorrow', keywords: ['plan', 'tomorrow', 'prepare', 'schedule'], name: 'Plan Tomorrow', icon: '📋', time: 'Evening', order: 130, descPlayful: "Future you will thank present you 🤝", descProfessional: 'Prepare and plan for tomorrow.' },
  { id: 'journal', keywords: ['journal', 'write', 'diary', 'notes'], name: 'Journaling', icon: '📝', time: 'Evening', order: 140, descPlayful: 'Spill your feelings on paper 😤', descProfessional: 'Reflect and document your thoughts.' },
  { id: 'gratitude', keywords: ['gratitude', 'grateful', 'thankful', 'appreciate'], name: 'Gratitude', icon: '🙏', time: 'Evening', order: 150, descPlayful: 'Count blessings, not followers 😇', descProfessional: 'Practice daily gratitude for wellbeing.' },
  { id: 'stretch', keywords: ['stretch', 'yoga', 'flexibility', 'relax body'], name: 'Stretch before bed', icon: '🤸', time: 'Evening', order: 160, descPlayful: 'Be a human pretzel before bed 🥨', descProfessional: 'Release muscle tension before sleep.' },
  { id: 'meditation_night', keywords: ['night meditation', 'relax', 'calm night'], name: 'Night Meditation', icon: '🌙', time: 'Evening', order: 180, descPlayful: 'Tell your anxiety to go to sleep 🛏️', descProfessional: 'Relax your mind before sleep.' },
  { id: 'sleep', keywords: ['sleep', 'bed', 'rest', 'nap', 'early'], name: 'Sleep Early', icon: '😴', time: 'Evening', order: 200, descPlayful: 'Go pass out, you need it 💤', descProfessional: 'Maintain a healthy sleep schedule.' },
];

export const findMatchingTask = (userInput) => {
  const input = userInput.toLowerCase();
  return PREDEFINED_TASKS.find(task =>
    task.keywords.some(keyword => input.includes(keyword))
  ) || null;
};

export const getTaskDesc = (task, playfulMode) => {
  return playfulMode ? task.descPlayful : task.descProfessional;
};

// Get tasks filtered by time
export const getTasksByTime = (time) => {
  return PREDEFINED_TASKS.filter(t => t.time === time);
};