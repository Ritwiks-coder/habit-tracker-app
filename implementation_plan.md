# Implementation Plan: Swipe Card with Speed Trap

## Goal

Build the core interaction of the "Bas 5 Min" app: the Tinder-style `SwipeCard`.
The task requires a card component that lets users swipe right to complete, left to skip, and a `useSpeedTrap` hook to prevent rapid point farming.

## Proposed Changes

We will create a custom hook and a custom component. Then, we will integrate them into `HomeScreen`.

### Core Logic & Hook

#### [NEW] [useSpeedTrap.js](file:///c:/Users/ritik/Videos/UIUX/HabitTracker/hooks/useSpeedTrap.js)
- A React hook returning `checkSpeedTrap()`.
- Uses a timestamp or `useRef(Date.now())` to track the last successful completion time.
- If the gap between now and the last swipe right is under `3000ms`, it returns `false` (triggering an alert to slow down).
- If it's over `3000ms`, it updates the timestamp and returns `true`.

### UI Components

#### [NEW] [SwipeCard.js](file:///c:/Users/ritik/Videos/UIUX/HabitTracker/components/SwipeCard.js)
- Utilize `PanResponder` and `Animated.ValueXY` to track X/Y translations.
- Calculate rotation interpolating the `Animated.Value` from X position `-screenWidth` to `screenWidth` into `-12deg` to `12deg`.
- Show "DONE" (green) and "SKIP" (red) overlay tags depending on the direction of drag (Left `< 0`, Right `> 0`).
- **Release Logic:**
  - If X > 120 (Right Swipe threshold): call `speedTrapCheck`. If true, complete swipe animation to off-screen right and trigger `onComplete` prop. If false (too fast), use `Animated.spring` to bounce the card back to the center and show the cooldown alert.
  - If X < -120 (Left Swipe threshold): complete swipe animation off-screen left and trigger `onSkip` prop.
  - Otherwise, use `Animated.spring` back to center (0, 0 position).

### Integration

#### [MODIFY] [HomeScreen.js](file:///c:/Users/ritik/Videos/UIUX/HabitTracker/screens/HomeScreen.js)
- Maintain a local state array of mock daily tasks (e.g., "Drink Water", "Read 5 pages").
- Render the tasks as a deck using `position: 'absolute'`.
- Pass `onSwipeRight` (+10 points to context/state) and `onSwipeLeft` (-50 points) functions to the top card.

## Verification Plan

### Manual Verification
1. I will run the Expo app on the user's terminal/simulator (or I will implement the code and ask the user to verify on their device).
2. The user should open the Home Screen.
3. The user will drag the top card right and release quickly. Wait 3 seconds, swipe again.
4. The user will drag the next top card right rapidly right after the first one and watch the card bounce back with an alert saying "Speed Trap Triggered".
5. The user will swipe a card left to verify the Skip action triggers.
