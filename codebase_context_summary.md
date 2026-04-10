# Codebase Context Summary: Habit Tracker App

This document provides a summary of the current application state, data models, and infrastructure for implementing local data persistence (e.g., `AsyncStorage`).

## 1. Global State / Context
The application uses the **React Context API** for global state management. The core logic resides in `context/AppContext.js`.

### State Variables (Tracked in AppContext)
The app balances **Firebase-backed state** (real-time) and **Local Component state** (volatile).

| State Variable | Source | Description |
| :--- | :--- | :--- |
| `user` | Firebase Auth | Current authenticated user object. |
| `userProfile` | Firestore | User metadata (totalPoints, routineLockedUntil, etc.). |
| `tasks` | Firestore | Array of habit objects for the current user. |
| `draftTasks` | Local State | Temporary tasks used during routine building. |
| `points` | Firestore | Derived from `userProfile.totalPoints`. |
| `coins` | Local State | Current session currency (needs persistence). |
| `skipsCount` | Local State | Number of tasks skipped today (needs persistence). |
| `playfulMode` | Local State | Toggle for UI "sassy" vs "professional" copywriting. |
| `isRoutineLocked` | Computed | Boolean based on `routineLockedUntil` timestamp. |
| `sidebarOpen` | Local State | State of the navigation drawer. |

### Core Context Functions
- `addTask(taskObj)`: Validates and saves a new task to Firestore.
- `completeTask(id)`: Marks a task as `completed: true` and increments points/coins.
- `skipTask(id, method)`: Marks a task as `skipped: true`. Handles 'free', 'ad', or 'coins' skip types.
- `removeTask(id)`: Deletes a habit from the database.
- `startRoutine(days)`: Sets a `routineLockedUntil` timestamp in Firestore to prevent task editing.

---

## 2. The Task Data Model
A task is represented as a flat JSON object. When a task is added via `addTask`, it follows this strict schema:

```json
{
  "id": "abc-123-firestore-id",
  "name": "Morning Yoga",
  "timeCategory": "Morning",
  "icon": "🧘",
  "descPlayful": "Stretch like a cat or whatever.",
  "descProfessional": "Complete a 15-minute mobility flow.",
  "order": 50,
  "duration": "15 min",
  "estimatedTime": 15,
  "sortWeight": 0,
  "completed": false,
  "skipped": false,
  "createdAt": "2026-04-08T17:10:00.000Z"
}
```

> [!NOTE]
> `timeCategory` values are strictly: `Morning`, `Afternoon`, `Evening`.

---

## 3. Package Dependencies
Current versioning (from `package.json`):
- **Core**: `expo ~54.0.0`, `react-native 0.81.5`
- **Database**: `@react-native-firebase/firestore`, `@react-native-firebase/auth`
- **Navigation**: `@react-navigation/native`, `@react-navigation/stack`

> [!WARNING]
> `@react-native-async-storage/async-storage` is **NOT** currently installed. You will need to add it before implementing persistence.

---

## 4. File Structure Overview
The app follows a standard React Native Expo structure:

```text
HabitTracker/
├── assets/             # Images and Icons
├── components/         # Reusable UI (Modals, Buttons, Cards)
│   ├── AddTaskModal.js
│   ├── OutOfSkipsModal.js
│   ├── UnifiedDashboardCard.js
│   └── TaskCard.js
├── context/
│   └── AppContext.js   # Main State Provider
├── hooks/              # Custom Logic (useTimeBlock, useSpeedTrap)
├── screens/            # Main Page Components
│   ├── HomeScreen.js
│   ├── TaskListScreen.js
│   └── OnboardingScreen.js
├── utils/              # Helper Engines
│   ├── smartTaskEngine.js (Task Sorting/Prediction)
│   └── NotificationManager.js
├── App.js              # Entry Point & Navigation Wrapper
└── package.json        # Dependencies
```
