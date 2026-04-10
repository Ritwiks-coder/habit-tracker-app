import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 1. Tell the app how to handle notifications when the app is OPEN
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 2. Function to ask the user for permission
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  // Required for Android 13+
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('sassy-channel', {
      name: 'Sassy Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10B981',
    });
  }

  return true;
}

// 3. Function to schedule the 8:00 PM Daily Sassy Reminder
export async function scheduleEveningWarning(userName, isSassyMode) {
  // First, clear any old scheduled notifications so we don't spam them
  await Notifications.cancelAllScheduledNotificationsAsync();

  const title = isSassyMode ? "Oh, look who's slacking. 👀" : "Evening Routine Reminder";
  const body = isSassyMode
    ? `Hey ${userName || 'lazybones'}, it's 8 PM. Your evening tasks are about to vanish. Get it done or lose your streak.`
    : `Hi ${userName || 'there'}, don't forget to complete your evening tasks before you sleep!`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
      data: { route: 'Home' }, // We can use this later to open a specific screen
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      hour: 20, // 8:00 PM (24-hour format)
      minute: 0,
      repeats: true, // Happens every single day!
      channelId: 'sassy-channel',
    },
    // For testing (uncomment to trigger in 5 seconds):
    /*
    trigger: {
      seconds: 5,
      repeats: false,
    },
    */
  });

  console.log("Evening warning scheduled for 8:00 PM!");
}

// 4. Function to schedule the 9:00 AM Daily Morning Wakeup
export async function scheduleMorningReminder(userName, isSassyMode) {
  const title = isSassyMode ? "Rise and grind! ☀️" : "Morning Routine Reminder";
  const body = isSassyMode
    ? `Hey ${userName || 'lazybones'}, it's 9 AM. Your morning time block ends soon. Get moving!`
    : `Good morning ${userName || 'there'}! Time to start your morning routine tasks.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
      data: { route: 'Home' },
      channelId: 'sassy-channel',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      hour: 9, // 9:00 AM
      minute: 0,
      repeats: true,
      channelId: 'sassy-channel',
    },
  });

  console.log("Morning reminder scheduled for 9:00 AM!");
}
