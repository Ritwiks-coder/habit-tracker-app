Project: Bas 5 Min (Habit Tracker for Lazy People)
Tech Stack: React Native, Expo, React Navigation, Context API.
Design: Soft Claymorphism (rounded corners, soft shadows). Colors: Primary Green #10B981, Background #F5F5F5.

Core Rules:

Tasks use Tinder-style swipe cards. Swipe Right = Done (+10 points). Swipe Left = Skip (-50 points, or watch an ad to skip for free).

There is NO "Strike" system.

Users cannot spam right-swipes to farm points. We use a "Speed Trap" (cooldown timer) between swipes.

The app has a playfulMode global state. If ON, text and alerts are sarcastic/funny. If OFF, text is professional.