import { useState, useEffect } from 'react';

const BLOCKS = [
  { name: 'Morning', start: 6, end: 11, next: 'Afternoon' },
  { name: 'Afternoon', start: 12, end: 16, next: 'Evening' },
  { name: 'Evening', start: 17, end: 20, next: 'Night' },
  { name: 'Night', start: 21, end: 29, next: 'Morning' }, // 24-29 maps to 0-5
];

export function useTimeBlock() {
  const [timeState, setTimeState] = useState(calculateTimeBlock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(calculateTimeBlock(new Date()));
    }, 60000); // update every minute to keep countdown reactive
    return () => clearInterval(timer);
  }, []);

  const filterTasksByTime = (tasks) => {
    const todayStr = new Date().toDateString();

    return tasks.filter(t => {
      // Late Start logic:
      // Since we only want to show tasks relevant to the *current* time of day,
      // any task with a time/timeCategory matching currentBlock is returned.
      // If it belongs to a passed block (e.g. Morning, when it's Afternoon),
      // it is filtered out and the user escapes penalty in the deck.
      const taskTime = t.timeCategory || t.time;
      return taskTime === timeState.currentBlock;
    });
  };

  return { ...timeState, filterTasksByTime };
}

function calculateTimeBlock(now) {
  let h = now.getHours();
  // Map overnight hours so 0-5 becomes 24-29 for continuous block logic
  let mappedH = h < 6 ? h + 24 : h;
  let currentBlock = BLOCKS.find(b => mappedH >= b.start && mappedH <= b.end) || BLOCKS[0];
  
  let endHour = currentBlock.end + 1; // e.g. 11:59 is end, next starts at 12:00 / endHour = 12
  let target = new Date(now);
  target.setHours(endHour % 24, 0, 0, 0);
  
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  
  const diffMs = target - now;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return {
    currentBlock: currentBlock.name,
    nextBlockName: currentBlock.next,
    timeUntilNextBlock: `${diffHrs}h ${diffMins}m`
  };
}
