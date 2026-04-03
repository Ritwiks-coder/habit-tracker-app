// utils/quotes.js

const normalQuotes = {
  morning: [
    { text: "Each morning we are born again. What we do today matters most.", author: "Buddha" },
    { text: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" }
  ],
  afternoon: [
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" }
  ],
  evening: [
    { text: "The best preparation for tomorrow is doing your best today.", author: "H. Jackson Brown Jr." },
    { text: "Let a joy keep you. Reach out your hands and take it when it runs by.", author: "Carl Sandburg" },
    { text: "Night is a world lit by itself.", author: "Antonio Porchia" }
  ]
};

const sassyQuotes = {
  morning: [
    { text: "Good morning! Time to get up before your bed legally adopts you.", author: "Your App" },
    { text: "The early bird gets the worm. But the second mouse gets the cheese. Choose wisely.", author: "Your App" },
    { text: "Drink some water. You are essentially a houseplant with complicated emotions.", author: "Your App" }
  ],
  afternoon: [
    { text: "Afternoon slump? Have a coffee, or just stare blankly at the wall for 10 minutes.", author: "Your App" },
    { text: "You're halfway through the day. Don't ruin it by making bad decisions now.", author: "Your App" },
    { text: "Stop procrastinating. I can literally see you doing nothing from here.", author: "Your App" }
  ],
  evening: [
    { text: "You survived today. Reward yourself by actually going to sleep on time for once.", author: "Your App" },
    { text: "Put the phone down. The internet will still be chaotic tomorrow.", author: "Your App" },
    { text: "Night time is for sleeping, not for overthinking everything you said in 2018.", author: "Your App" }
  ]
};

// Helper function to get a random quote based on time and mode
export const getQuoteOfTheDay = (playfulMode) => {
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  
  if (hour >= 12 && hour < 18) timeOfDay = 'afternoon';
  else if (hour >= 18) timeOfDay = 'evening';

  const quotePool = playfulMode ? sassyQuotes[timeOfDay] : normalQuotes[timeOfDay];
  
  // Pick a random quote from the pool based on the current day of the year
  // This ensures the quote stays the same all morning, but changes the next day
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const randomIndex = dayOfYear % quotePool.length;

  return quotePool[randomIndex];
};
