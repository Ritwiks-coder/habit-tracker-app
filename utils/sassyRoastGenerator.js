// utils/sassyRoastGenerator.js

export const generateDynamicMessage = (userProfile, isSassyMode, progressPercentage) => {
  const age = userProfile?.ageBracket || '30-49'; // Default if missing
  const gender = userProfile?.gender || 'Other';

  // 1. PROFESSIONAL MODE (Clean, encouraging Sassy mode off)
  if (!isSassyMode) {
    if (progressPercentage === 0) return "Ready for a productive day? Let's get started.";
    if (progressPercentage < 50) return "Solid start. Keep building that momentum.";
    if (progressPercentage < 100) return "You're almost there. Finish strong!";
    return "Outstanding work today. Rest and recharge.";
  }

  // 2. SASSY MODE (The Demographic Engine)
  if (progressPercentage === 0) {
    if (age === 'Under 18') return "Put down the phone, your screen time is already embarrassing today.";
    if (age === '18-29') return `Stop doomscrolling for five minutes, ${gender === 'Male' ? 'bro' : 'bestie'}. Do your habits.`;
    if (age === '30-49') return "Your back already hurts. Don't let your daily streak fail too. Get up.";
    if (age === '50+') return "You've survived decades on this planet, but checking a box is too hard?";
    return "You have literally done nothing today. Impressively lazy.";
  }

  if (progressPercentage < 50) {
    if (age === '18-29') return "Is this your 'soft life' era? Because you're barely trying.";
    if (age === '30-49') return "Halfway done. Don't fall asleep on the couch before you finish.";
    return "Barely trying is still trying, I guess. Keep going.";
  }

  if (progressPercentage < 100) {
    if (gender === 'Male') return "Come on, be the alpha you claim to be on the internet. Finish the list.";
    if (gender === 'Female') return "Girl, romanticize your life later. Do the last habit now.";
    return "You're so close. Don't quit now, it's a bad look.";
  }

  // 100% Completed
  return "Fine. You actually crushed it today. I have no insults for you... until tomorrow. 👑";
};
