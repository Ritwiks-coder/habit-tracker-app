🤖 Google Antigravity Context: "Bas 5 Min" Habit Tracker
Project Overview & Core Philosophy

App Name: Bas 5 Min

Type: Gamified Daily Habit Tracker for "lazy people."

Platform: Mobile App (iOS/Android)

Core Philosophy: Eliminate "Task Paralysis." Emphasize clean UI, highly fluid animations, and a seamless workflow that requires minimal cognitive effort.

Tech Stack Environment

Framework: React Native + Expo SDK 54

Navigation: React Navigation (Stack + Bottom Tabs)

State Management: React Context API

Animations: React Native Animated API

Gestures: React Native PanResponder + Gesture Handler

Icons/Gradients: react-native-svg, expo-linear-gradient

AI Integration: Anthropic Claude API (claude-sonnet-4-20250514) for dynamic task descriptions.

Backend/Notifications: Firebase & FCM (Planned)

Design System & UI/UX Language

Aesthetic: Soft Claymorphism (tactile, friendly, soft shadows, rounded corners).

Typography: Roboto. (Headings: 34px/28px Weight 800; Body: 18px/15px; Labels: 11px Weight 700 ALL CAPS).

Border Radius Rules: Cards (28px), Standard Buttons (14px), Pill Buttons/Nav (40px), Sidebar (28px top/bottom-right only).

Core Colors:

Primary Green: #10B981 (Dark: #059669, Light: #34D399)

Done Gradient: #00BC7D → #00D492

Nav Background: #EFFFFA

Skip Action: #FB2C36 (Icon) / #FFE2E2 (Border)

Warning/Streak: #F59E0B

Shadow Rules:

Cards: Color #10B981, Offset (0,8), Opacity 0.15, Radius 16.

Buttons: Color #00BC7D, Offset (0,6), Opacity 0.45, Radius 12.

Core Mechanics & Features to Implement

Swipe-Based Task Interaction (The "Bas 5 Min" Loop):

Tasks are presented as Tinder-style cards (Front card visible, Back card scaled to 0.92 and faded).

Rotate during drag (-12° to 12°). Spring animation back if not swiped far enough.

Swipe RIGHT = Complete (Green DONE label).

Swipe LEFT = Skip (Red SKIP label).

Playful Mode System (Global Toggle):

ON (Playful): Fun descriptions ("Hydrate yourself, you lazy sloth 💀"), casual greetings, meme-style notifications (Zomato/Swiggy style).

OFF (Professional): Clean descriptions ("Stay hydrated for optimal performance"), professional greetings.

Vague Scheduling Stacks:

Tasks are sorted purely into Morning ☀️, Evening 🌅, Night 🌙 tabs.

Gamification, Penalties & Merchant Mode:

Complete task = +10 points. Skip with coins = -50 points.

Strike System: 3 strikes = -25 points penalty.

Skip Escape: Watch an Ad (free skip) OR use Coins OR take a Strike.

Coins for Coupons (Merchant Mode): Earned coins aren't just for skipping tasks! They serve a real-world B2C ecosystem where users can buy coupons from merchants. The sidebar includes a "Switch to Merchant Mode" toggle to facilitate this.

Smart Task Matching (AI Integration):

User types "5min walk" -> App checks predefined tasks -> If no match, calls Claude API to generate Playful/Professional descriptions.

Leaderboard & Ghost Mode:

A ranked list of users based on 🔥 score.

Ghost Mode Toggle: When ON, all other users are blurred (opacity 0.25) and names show as "••••••" to reduce competitive anxiety.

Data Model Architecture (Reference)

Task: id, name, icon, time (Morning/Evening/Night), completed, skipped, descPlayful, descProfessional, notifPlayful, notifProfessional, isManual, aiGenerated.

User: name, avatar, points, strikes, coins, routineDays (3/7/21), routineSaved, playfulMode, ghostMode, isMerchant.

Immediate Development Priorities (Screens to Build)

Task List Screen: Implement the Morning/Evening/Night filter, Add Task button, and Set Routine card (3/7/21 days).

Leaderboard Screen: Implement the list UI and the Ghost Mode blur/redaction logic.

Add Task Modal: Wire up the smart search and Claude API integration for descriptions.

Sidebar: Implement Merchant Mode toggle and Coupon Store navigation.