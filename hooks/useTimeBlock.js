import { useState, useEffect } from 'react';

const BLOCKS = [
  { name: 'Morning',   start: 5,  end: 11, next: 'Afternoon' },
  { name: 'Afternoon', start: 12, end: 16, next: 'Evening' },
  { name: 'Evening',   start: 17, end: 28, next: 'Morning' }, // 24-28 maps to 0-4
];

export function useTimeBlock() {
  const [timeState, setTimeState] = useState(calculateTimeBlock(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(calculateTimeBlock(new Date()));
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  const filterTasksByTime = (tasks) => {
    return tasks.filter(t => {
      const taskTime = t.timeCategory || t.time;
      return taskTime === timeState.currentBlock;
    });
  };

  return { ...timeState, filterTasksByTime };
}

function calculateTimeBlock(now) {
  let h = now.getHours();
  // Map overnight hours so 0-4 becomes 24-28 for continuous block logic
  let mappedH = h < 5 ? h + 24 : h;
  let currentBlock = BLOCKS.find(b => mappedH >= b.start && mappedH <= b.end) || BLOCKS[0];
  
  let endHour = currentBlock.end + 1; 
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
