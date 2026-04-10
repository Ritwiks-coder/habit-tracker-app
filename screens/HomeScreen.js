import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as Notifications from 'expo-notifications';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, Animated, PanResponder, Image, Modal, TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp, SUGGESTED_HABITS, getCurrentTimeBlock } from '../context/AppContext';
import CustomAlertModal from '../components/CustomAlertModal';
import { useTimeBlock } from '../hooks/useTimeBlock';
import { getQuoteOfTheDay } from '../utils/quotes';
import UnifiedDashboardCard from '../components/UnifiedDashboardCard';
import { scheduleEveningWarning, scheduleMorningReminder } from '../utils/NotificationManager';
import OutOfSkipsModal from '../components/OutOfSkipsModal';


// ✅ IMPORT THE NEW SMART EMOJI ENGINE HERE
import { getTaskEmoji } from '../utils/smartTaskEngine';
import { RewardedAd, RewardedAdEventType, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : 'YOUR_PRODUCTION_ID_HERE';
const rewarded = RewardedAd.createForAdRequest(adUnitId);

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
};

const CATEGORY_WEIGHTS = { morning: 1, afternoon: 2, evening: 3 };

const TIME_BASED_QUOTES = {
  morning: ["Rise and grind! Let's get it.", "Fresh morning, fresh start.", "Time to dominate your morning."],
  afternoon: ["Keep that momentum rolling!", "Halfway there. Don't stop now.", "Afternoon slump? Not for you."],
  evening: ["Sun is setting, but you're still winning.", "Wind down and reflect on a good day.", "Evening push! Finish strong."]
};

const COMPLETION_DATA = {
  morning: { icon: '☕', text: 'Morning routine crushed! Grab that coffee and enjoy the day.' },
  afternoon: {
    icon: '🌴',
    text: 'Afternoon cleared! Kick back and relax. Your evening routine kicks off at 5:00 PM.'
  },
  evening: { icon: '🍷', text: 'All done. Time to wind down and relax.' }
};

const SASSY_TIME_QUOTES = {
  morning: ["Oh, you're awake? Prove you're not useless today.", "Drink water or dry up like a raisin. Let's go.", "Get up. Your competitors are already working."],
  afternoon: ["Are you napping? Wake up and swipe these tasks.", "Half the day is gone. What have you actually done?", "No excuses. Get it done."],
  evening: ["Don't even think about opening Netflix yet.", "Finish your list so I can stop judging you.", "Wrap it up, boss."]
};

const SASSY_COMPLETION_DATA = {
  morning: { icon: '☕', text: 'Wow, you actually finished early. Don\'t let it get to your head.' },
  afternoon: {
    icon: '🛋️',
    text: 'Enjoy your little break. Don\'t get too comfortable though—your evening shift starts at 5:00 PM sharp.'
  },
  evening: { icon: '🍷', text: 'Finally finished. Pour a glass and leave me alone.' }
};

const getSafeDuration = (durationInMinutes) => {
  // 1. If it's missing, null, or Not a Number, just return null so we can fallback to timeCategory
  if (!durationInMinutes || isNaN(durationInMinutes)) {
    return null;
  }

  // 2. If it is a real number, safely calculate the math
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height < 700 ? 320 : height < 800 ? 380 : 400;

const FILTER_OPTIONS = [
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
  { key: 'all', label: 'All Time' },
];

const getStartOfPeriod = (period) => {
  const now = new Date();
  if (period === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0, 0);
  }
  if (period === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (period === 'year') return new Date(now.getFullYear(), 0, 1);
  return null;
};

const filterTasksByPeriod = (tasks, period) => {
  if (period === 'all') return tasks;
  const start = getStartOfPeriod(period);

  return tasks.filter(t => {
    // 🔥 BULLETPROOF FIREBASE DATE PARSER 🔥
    let created = null;

    if (t.createdAt) {
      if (typeof t.createdAt.toDate === 'function') {
        created = t.createdAt.toDate(); // Native Firebase object
      } else if (t.createdAt.seconds) {
        created = new Date(t.createdAt.seconds * 1000); // Serialized object
      } else {
        created = new Date(t.createdAt); // Standard string/number fallback
      }
    }

    // If it's a brand new task waiting for a server timestamp, 
    // or if the date is invalid, ALWAYS show it so it doesn't disappear!
    if (!created || isNaN(created.getTime())) return true;

    return created >= start;
  });
};

const IC = '#64748B';

const CalendarSmIcon = () => (
  <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <Path stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      d="M8 2v3M16 2v3M3 8h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
  </Svg>
);

const ChevronIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <Path stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      d="M6 9l6 6 6-6" />
  </Svg>
);

const ShareIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
  </Svg>
);

const BellIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <G fill="none" stroke="#64748B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <Path d="M12 3v2" />
      <Path d="M12 5c-3.31 0-6 2.69-6 6l0 6c-1 0-2 1-2 2h8M12 5c3.31 0 6 2.69 6 6l0 6c1 0 2 1 2 2h-8" />
      <Path d="M10 20c0 1.1 0.9 2 2 2c1.1 0 2-0.9 2-2" />
    </G>
  </Svg>
);

const FlameIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 128 128">
    <Defs>
      <RadialGradient id="fg1" cx="68.884" cy="124.296" r="70.587"
        gradientTransform="matrix(-1 -.00434 -.00713 1.6408 131.986 -79.345)"
        gradientUnits="userSpaceOnUse">
        <Stop offset="0.314" stopColor="#ff9800" />
        <Stop offset="0.662" stopColor="#ff6d00" />
        <Stop offset="0.972" stopColor="#f44336" />
      </RadialGradient>
    </Defs>
    <Path fill="url(#fg1)" d="M35.56 40.73c-.57 6.08-.97 16.84 2.62 21.42c0 0-1.69-11.82 13.46-26.65c6.1-5.97 7.51-14.09 5.38-20.18c-1.21-3.45-3.42-6.3-5.34-8.29c-1.12-1.17-.26-3.1 1.37-3.03c9.86.44 25.84 3.18 32.63 20.22c2.98 7.48 3.2 15.21 1.78 23.07c-.9 5.02-4.1 16.18 3.2 17.55c5.21.98 7.73-3.16 8.86-6.14c.47-1.24 2.1-1.55 2.98-.56c8.8 10.01 9.55 21.8 7.73 31.95c-3.52 19.62-23.39 33.9-43.13 33.9c-24.66 0-44.29-14.11-49.38-39.65c-2.05-10.31-1.01-30.71 14.89-45.11c1.18-1.08 3.11-.12 2.95 1.5Z" />
  </Svg>
);

const WhatsAppIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path fill="#374151" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967c-.273-.099-.471-.148-.67.15c-.197.297-.767.966-.94 1.164c-.173.199-.347.223-.644.075c-.297-.15-1.255-.463-2.39-1.475c-.883-.788-1.48-1.761-1.653-2.059c-.173-.297-.018-.458.13-.606c.134-.133.298-.347.446-.52c.149-.174.198-.298.298-.497c.099-.198.05-.371-.025-.52c-.075-.149-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51c-.173-.008-.371-.01-.57-.01c-.198 0-.52.074-.792.372c-.272.297-1.04 1.016-1.04 2.479c0 1.462 1.065 2.875 1.213 3.074c.149.198 2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625c.712.227 1.36.195 1.871.118c.571-.085 1.758-.719 2.006-1.413c.248-.694.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347" />
    <Path fill="#374151" fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.41A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2m0 1.8a8.2 8.2 0 1 1 0 16.4A8.2 8.2 0 0 1 12 3.8" clipRule="evenodd" />
  </Svg>
);

const IGIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path fill="#374151" d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.771 1.691 4.919 4.919c.058 1.265.069 1.645.069 4.849c0 3.205-.012 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919c-1.266.058-1.644.07-4.85.07c-3.204 0-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92c-.058-1.265-.07-1.644-.07-4.849c0-3.204.013-3.583.07-4.849c.149-3.227 1.664-4.771 4.919-4.919c1.266-.057 1.645-.069 4.849-.069M12 0C8.741 0 8.333.014 7.053.072C2.695.272.273 2.69.073 7.052C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98c.059-1.28.073-1.689.073-4.948c0-3.259-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0m0 5.838a6.162 6.162 0 1 0 0 12.324a6.162 6.162 0 0 0 0-12.324M12 16a4 4 0 1 1 0-8a4 4 0 0 1 0 8m6.406-11.845a1.44 1.44 0 1 0 0 2.881a1.44 1.44 0 0 0 0-2.881" />
  </Svg>
);

const FBIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path fill="#374151" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073" />
  </Svg>
);

const CopyIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <Path stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4A2 2 0 0 1 8 4M16 12h4m0 0-2-2m2 2-2 2" />
  </Svg>
);

const ShareBottomSheet = ({ visible, onClose, completedCount, skippedCount, remainingCount }) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const SHARE_OPTIONS = [
    { label: 'WhatsApp', Icon: WhatsAppIcon },
    { label: 'IG Story', Icon: IGIcon },
    { label: 'FB Status', Icon: FBIcon },
    { label: 'Copy Link', Icon: CopyIcon },
  ];

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[sh.overlay, { opacity: fadeAnim }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[sh.sheet, { transform: [{ translateY: slideAnim }] }]}>
              <View style={sh.handle} />
              <Text style={sh.title}>Share your progress</Text>
              <Text style={sh.subtitle}>Share with friends, status, and story</Text>

              <View style={sh.snapshotCard}>
                <Text style={sh.snapshotLabel}>CURRENT SNAPSHOT</Text>
                <View style={sh.snapshotRow}>
                  <View style={sh.snapStat}>
                    <Text style={[sh.snapNum, { color: '#006C49' }]}>{completedCount}</Text>
                    <Text style={sh.snapUnit}>COMPLETED</Text>
                  </View>
                  <View style={sh.snapStat}>
                    <Text style={[sh.snapNum, { color: '#B91A24' }]}>{skippedCount}</Text>
                    <Text style={sh.snapUnit}>SKIPPED</Text>
                  </View>
                  <View style={sh.snapStat}>
                    <Text style={[sh.snapNum, { color: '#855300' }]}>{remainingCount}</Text>
                    <Text style={sh.snapUnit}>REMAINING</Text>
                  </View>
                </View>
              </View>

              <View style={sh.optionsRow}>
                {SHARE_OPTIONS.map(({ label, Icon }) => (
                  <TouchableOpacity key={label} style={sh.optionItem} activeOpacity={0.7}>
                    <View style={sh.optionIcon}>
                      <Icon />
                    </View>
                    <Text style={sh.optionLabel}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={sh.shareBtn} activeOpacity={0.85} onPress={onClose}>
                <LinearGradient
                  colors={['#00BC7D', '#00D492']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={sh.shareBtnGradient}
                >
                  <Text style={sh.shareBtnText}>Share</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const AllTimeSummaryCard = ({ completedCount, skippedCount, remainingCount }) => (
  <View style={s.allTimeCard}>
    <Text style={s.allTimeTitle}>Your All‑Time Stats</Text>
    <Text style={s.allTimeSub}>Here's everything you've done so far 👇</Text>

    <View style={s.allTimeRow}>
      <LinearGradient colors={['#00BC7D', '#00D492']} style={s.allTimeStat}>
        <Text style={s.allTimeStatNum}>{completedCount}</Text>
        <Text style={s.allTimeStatLabel}>Completed</Text>
      </LinearGradient>

      <LinearGradient colors={['#FB2C36', '#FF6B6B']} style={s.allTimeStat}>
        <Text style={s.allTimeStatNum}>{skippedCount}</Text>
        <Text style={s.allTimeStatLabel}>Rejected</Text>
      </LinearGradient>

      <LinearGradient colors={['#F59E0B', '#FBBF24']} style={s.allTimeStat}>
        <Text style={s.allTimeStatNum}>{remainingCount}</Text>
        <Text style={s.allTimeStatLabel}>Remaining</Text>
      </LinearGradient>
    </View>

    <View style={s.allTimeFooter}>
      <Text style={s.allTimeFooterText}>Keep going — every stack counts 🔥</Text>
    </View>
  </View>
);

const FilterDropdown = ({ visible, selected, onSelect, onClose, anchorRef }) => {
  const slideAnim = useRef(new Animated.Value(-10)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(-10);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.dropdownOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              s.dropdown,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              <View style={s.dropdownHeader}>
                <CalendarSmIcon />
                <Text style={s.dropdownTitle}>Filter Stacks</Text>
              </View>
              <View style={s.dropdownDivider} />

              {FILTER_OPTIONS.map((opt, idx) => {
                const isSelected = selected === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      s.dropdownItem,
                      isSelected && s.dropdownItemSelected,
                      idx === FILTER_OPTIONS.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => { onSelect(opt.key); onClose(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.dropdownItemText, isSelected && s.dropdownItemTextSelected]}>
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <View style={s.dropdownCheck}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✓</Text>
                      </View>
                    )}
                    {opt.key === 'all' && (
                      <View style={s.dropdownBadge}>
                        <Text style={s.dropdownBadgeText}>Summary</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ── SMART SASSY GENERATOR (DYNAMIC & FLICKER-FREE) ──
const getFallbackDesc = (name, isPlayful) => {
  const n = name?.toLowerCase() || '';

  // 1. PROFESSIONAL MODE (Randomized, but stable)
  if (!isPlayful) {
    const proFallbacks = [
      "Stay focused and crush this. ✨",
      "Small steps lead to big results. 📈",
      "Execute with precision. 🎯",
      "Consistency is the ultimate key. 🔑",
      "Clear your mind and begin. 🧠"
    ];
    return proFallbacks[n.length % proFallbacks.length];
  }

  // 2. SPECIFIC KEYWORDS (Sassy Mode)
  if (n.includes('water') || n.includes('drink')) return "Hydrate, you complicated houseplant. 🌿";
  if (n.includes('gym') || n.includes('workout') || n.includes('lift')) return "Couch potatoes don't make history. 💪";
  if (n.includes('read') || n.includes('book')) return "Doomscrolling isn't reading. 📚";
  if (n.includes('sleep') || n.includes('bed')) return "The internet can wait. Go to sleep. 🌙";
  if (n.includes('meditat') || n.includes('breath')) return "Sit still and literally do nothing. You can do this. 🧘♂️";
  if (n.includes('walk') || n.includes('steps')) return "Go touch grass. Literally. 🚶♂️";
  if (n.includes('clean') || n.includes('tidy') || n.includes('wash')) return "Your space reflects your brain. Clean it up. 🧹";
  if (n.includes('eat') || n.includes('meal') || n.includes('food')) return "Fuel up. You aren't you when you're hungry. 🍽️";
  if (n.includes('code') || n.includes('dev')) return "Git commit to your habits. No merge conflicts. 💻";
  if (n.includes('design') || n.includes('ui') || n.includes('ux')) return "Push pixels, not deadlines. Make it pop. ✨";
  if (n.includes('game') || n.includes('play')) return "Level up IRL, not just on the screen. 🎮";

  // 3. DYNAMIC FALLBACKS (Never the same line twice!)
  const sassyFallbacks = [
    "Your future self is begging you. 🚀",
    "Do it now, or regret it later. ⏳",
    "Stop staring at this card and just do it. 🙄",
    "I'm judging you until this is done. 👀",
    "Procrastination is so last year. 💅",
    "Be the main character you claim to be. 🌟"
  ];

  // Uses the length of the task name to predictably pick a random quote
  return sassyFallbacks[n.length % sassyFallbacks.length];
};

// ── SKELETON LOADER ANIMATION ──
const SkeletonBlock = ({ width, height, borderRadius = 8, style }) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ width, height, borderRadius, backgroundColor: '#CBD5E1', opacity: pulseAnim }, style]}
    />
  );
};

const HomeScreenSkeleton = () => (
  <SafeAreaView style={[s.safe, { paddingHorizontal: 20, paddingTop: 16 }]}>
    {/* Header Skeleton */}
    <View style={s.header}>
      <SkeletonBlock width={48} height={48} borderRadius={24} />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <SkeletonBlock width={90} height={36} borderRadius={20} />
        <SkeletonBlock width={79} height={36} borderRadius={20} />
      </View>
    </View>

    {/* Greeting Skeleton */}
    <View style={{ marginTop: 20, gap: 8 }}>
      <SkeletonBlock width={120} height={16} />
      <SkeletonBlock width={200} height={32} />
    </View>

    {/* Quote Skeleton */}
    <View style={{ marginTop: 24, marginBottom: 32, gap: 8 }}>
      <SkeletonBlock width={16} height={16} borderRadius={8} />
      <SkeletonBlock width="100%" height={16} />
      <SkeletonBlock width="80%" height={16} />
      <SkeletonBlock width={100} height={12} style={{ marginTop: 8 }} />
    </View>

    {/* Main Card Skeleton */}
    <SkeletonBlock width="100%" height={CARD_HEIGHT} borderRadius={32} style={{ marginBottom: 24 }} />

    {/* Bottom Filter & Stats Skeleton */}
    <View style={s.filterCard}>
      <View style={[s.filterRow, { marginBottom: 16 }]}>
        <SkeletonBlock width={100} height={36} borderRadius={20} />
        <SkeletonBlock width={40} height={40} borderRadius={20} />
      </View>
      <View style={s.statsRow}>
        <SkeletonBlock width={60} height={50} />
        <SkeletonBlock width={60} height={50} />
        <SkeletonBlock width={60} height={50} />
      </View>
    </View>
  </SafeAreaView>
);

// ADDED NAVIGATION PROP HERE!
const HomeScreen = ({ navigation }) => {
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const {
    user, userProfile, points, coins,
    setSidebarOpen, playfulMode, tasks,
    completedCount, skippedCount, remainingCount,
    skipsCount, completeTask, skipTask, saveBulkTasks,
  } = useApp();
  const { nextBlockName, timeUntilNextBlock } = useTimeBlock();

  // ✅ 2. Set up the dynamic name and avatar
  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || "User";
  const avatarUrl = userProfile?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

  // ✅ 3. Generate the dynamic quote based on Sassy Mode
  const activeQuotes = playfulMode ? SASSY_TIME_QUOTES[timeOfDay] : TIME_BASED_QUOTES[timeOfDay];
  const currentQuote = useMemo(() => activeQuotes[Math.floor(Math.random() * activeQuotes.length)], [timeOfDay, playfulMode]);
  const completionInfo = playfulMode ? SASSY_COMPLETION_DATA[timeOfDay] : COMPLETION_DATA[timeOfDay];

  const [isLoading, setIsLoading] = useState(true);

  const [filterPeriod, setFilterPeriod] = useState('week');
  const [showFilter, setShowFilter] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const [isRestModeActive, setIsRestModeActive] = useState(false);
  const [restDays, setRestDays] = useState(3);
  const [showRestModal, setShowRestModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [skipPressed, setSkipPressed] = useState(false);

  const [isSkipModalVisible, setSkipModalVisible] = useState(false);
  const [taskToSkip, setTaskToSkip] = useState(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      reward => {
        skipTask(taskToSkip, 'ad');
        setSkipModalVisible(false);
        executeSwipeLeft('ad');
      },
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        setAdLoaded(false);
        rewarded.load();
      }
    );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [taskToSkip]);

  // 🔍 DEBUG: Log tasks flow
  useEffect(() => {
    console.log("🏠 HomeScreen - Tasks from Context:", tasks.length, "tasks");
    if (tasks.length > 0) {
      console.log("  First 2 tasks:", tasks.slice(0, 2).map(t => ({ name: t.name, timeCategory: t.timeCategory, completed: t.completed })));
    }
  }, [tasks]);

  const timeInfo = getCurrentTimeBlock();
  const currentBlock = timeInfo; // It is now a string like 'Morning'

  // Filter tasks to ONLY look at the current time block
  const tasksForCurrentBlock = tasks.filter(task => (task.timeBlock || task.timeCategory) === currentBlock);

  // Calculate stats just for this block
  const blockTotal = tasksForCurrentBlock.length;
  const blockCompleted = tasksForCurrentBlock.filter(task => task.completed || task.skipped).length;

  // Calculate grand total for the whole day
  const dailyTotal = tasks.length;
  const dailyCompleted = tasks.filter(task => task.completed || task.skipped).length;

  // Calculate remaining skips
  const skipsRemaining = Math.max(0, 3 - skippedCount);

  const periodTasks = filterTasksByPeriod(tasks, filterPeriod);

  // 🔥 THE VANISH ENGINE: Strict Block-Based Filtering
  // 🔥 THE VANISH ENGINE: Bulletproof Block-Based Filtering
  const activeSwipeTasks = useMemo(() => {
    if (!periodTasks) return [];

    // Clean up current block for match (e.g., 'Morning' -> 'morning')
    const safeCurrentBlock = (currentBlock || 'Morning').toLowerCase().trim();

    const filtered = periodTasks.filter(task => {
      // 1. Skip already processed tasks
      if (task.completed || task.skipped) return false;

      // 2. Data Safety: If category is missing, show it by default so it's not lost
      const category = task.timeCategory || task.timeline;
      if (!category) return true;

      // 3. Bulletproof Match: Case-insensitive and trimmed
      const safeTaskCategory = category.toLowerCase().trim();
      return safeTaskCategory === safeCurrentBlock;

    }).sort((a, b) => (a.order || 50) - (b.order || 50));

    return filtered;
  }, [periodTasks, currentBlock]);

  const remainingInBlock = activeSwipeTasks.length;

  const [recentDones, setRecentDones] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [modalConfig, setModalConfig] = useState({ visible: false, type: '', title: '', message: '' });

  const position = useRef(new Animated.ValueXY()).current;
  const backCardScale = useRef(new Animated.Value(0.95)).current;
  const backCardOpacity = useRef(new Animated.Value(0.7)).current;

  const [floatText, setFloatText] = useState('');
  const [floatColor, setFloatColor] = useState('#10B981');
  const floatAnimY = useRef(new Animated.Value(0)).current;
  const floatAnimOpacity = useRef(new Animated.Value(0)).current;

  const task = activeSwipeTasks[Math.min(currentIndex, activeSwipeTasks.length - 1)];
  const nextTask = activeSwipeTasks[currentIndex + 1];
  const isDone = activeSwipeTasks.length === 0;

  const triggerFloat = (amount, positive) => {
    setFloatText(positive ? `+${amount}` : `-${amount}`);
    setFloatColor(positive ? '#10B981' : '#EF4444');
    floatAnimY.setValue(0);
    floatAnimOpacity.setValue(1);
    Animated.parallel([
      Animated.timing(floatAnimY, { toValue: -40, duration: 800, useNativeDriver: true }),
      Animated.timing(floatAnimOpacity, { toValue: 0, duration: 800, delay: 300, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer(t => {
          if (t <= 1) { setIsLocked(false); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);



  // Fake Network Request (Remove this when we add real Firebase data!)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ 1. Schedule the Daily Reminders (Morning at 9:00 AM, Evening at 8:00 PM)
  useEffect(() => {
    if (userProfile) {
      scheduleMorningReminder(userProfile.displayName, playfulMode);
      scheduleEveningWarning(userProfile.displayName, playfulMode);
    }
  }, [userProfile?.displayName, playfulMode]);

  const closeAlert = () => setModalConfig(prev => ({ ...prev, visible: false }));

  const latest = useRef({});

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (latest.current.isLocked) return;
      position.setValue({ x: gesture.dx, y: gesture.dy * 0.3 });
      const progress = Math.min(Math.abs(gesture.dx) / 150, 1);
      backCardScale.setValue(0.95 + progress * 0.05);
      backCardOpacity.setValue(0.7 + progress * 0.3);
    },
    onPanResponderRelease: (_, gesture) => {
      if (latest.current.isLocked) { latest.current.resetPosition(); return; }
      if (gesture.dx > 100) latest.current.trySwipeRight();
      else if (gesture.dx < -100) latest.current.trySwipeLeft();
      else latest.current.resetPosition();
    },
  })).current;

  const trySwipeRight = () => {
    if (isLocked) return;
    const now = Date.now();
    const newDones = [...recentDones, now].slice(-3);
    setRecentDones(newDones);
    if (newDones.length === 3 && (now - newDones[0] < 5000)) {
      setIsLocked(true);
      setLockTimer(30);
      setModalConfig({ visible: true, type: 'speedtrap', title: 'Hold Up, Ritik !', message: "You finished a 5-minute task in 3 seconds? You're either an Olympian or a liar. Catch your breath for a second." });
      setRecentDones([]);
    }
    Animated.parallel([
      Animated.timing(position, { toValue: { x: width + 100, y: -50 }, duration: 350, useNativeDriver: false }),
      Animated.timing(backCardScale, { toValue: 1, duration: 350, useNativeDriver: false }),
      Animated.timing(backCardOpacity, { toValue: 1, duration: 350, useNativeDriver: false }),
    ]).start(() => { if (task) completeTask(task.id); triggerFloat(10, true); goNext(); });
  };

  const handleSkipRequest = (taskId) => {
    const skipsRemaining = Math.max(0, 3 - skippedCount);
    if (skipsRemaining > 0) {
      skipTask(taskId, 'free'); // Silent skip!
      executeSwipeLeft('free'); // Ensure animation runs
    } else {
      setTaskToSkip(taskId);
      setSkipModalVisible(true); // Open the sassy modal
    }
  };

  const trySwipeLeft = () => {
    if (isLocked) return;
    if (task) {
      handleSkipRequest(task.id);
    }
  };

  const executeSwipeLeft = (type = 'strike') => {
    Animated.parallel([
      Animated.timing(position, { toValue: { x: -width - 100, y: -50 }, duration: 350, useNativeDriver: false }),
      Animated.timing(backCardScale, { toValue: 1, duration: 350, useNativeDriver: false }),
      Animated.timing(backCardOpacity, { toValue: 1, duration: 350, useNativeDriver: false }),
    ]).start(() => { 
      if (task) skipTask(task.id, type); 
      // ONLY trigger visual effect if they actually paid coins
      if (type === 'coins') triggerFloat(50, false); 
      goNext(); 
    });
  };

  const resetPosition = () => {
    Animated.parallel([
      Animated.spring(position, { toValue: { x: 0, y: 0 }, friction: 6, tension: 80, useNativeDriver: false }),
      Animated.spring(backCardScale, { toValue: 0.95, useNativeDriver: false }),
      Animated.spring(backCardOpacity, { toValue: 0.7, useNativeDriver: false }),
    ]).start();
  };

  const goNext = () => {
    position.setValue({ x: 0, y: 0 });
    backCardScale.setValue(0.95);
    backCardOpacity.setValue(0.7);
  };

  const cardRotation = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const skipOpacity = position.x.interpolate({ inputRange: [-150, -20, 0], outputRange: [1, 0.3, 0], extrapolate: 'clamp' });
  const doneOpacity = position.x.interpolate({ inputRange: [0, 20, 150], outputRange: [0, 0.3, 1], extrapolate: 'clamp' });

  latest.current = { trySwipeRight, trySwipeLeft, resetPosition, isLocked };

  const selectedLabel = FILTER_OPTIONS.find(o => o.key === filterPeriod)?.label ?? 'This Week';

  // IF LOADING: Show the Skeleton!
  if (isLoading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <>
      <SafeAreaView style={[s.safe, isRestModeActive && { backgroundColor: '#F8FAFC' }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={s.topSection}>
            <View style={s.header}>
              <TouchableOpacity onPress={() => setSidebarOpen(true)} activeOpacity={0.8}>
                <Image source={{ uri: avatarUrl }} style={s.avatar} resizeMode="cover" />
              </TouchableOpacity>
              <View style={s.headerRight}>
                <TouchableOpacity
                  style={[s.restHeaderBtn, isRestModeActive && s.restHeaderBtnActive]}
                  onPress={() => {
                    if (!isRestModeActive) setShowRestModal(true);
                  }}
                  activeOpacity={isRestModeActive ? 1 : 0.7}
                  disabled={isRestModeActive}
                >
                  <Feather name={isRestModeActive ? "coffee" : "moon"} size={14} color={isRestModeActive ? "#4338CA" : "#64748B"} />
                  <Text style={[s.restHeaderText, isRestModeActive && s.restHeaderTextActive]}>
                    {isRestModeActive ? "Resting..." : `REST (${restDays} Left)`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.streakBadgeWrap}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('DiscountCenter')}
                >
                  <View style={s.streakBadge}>
                    <Text style={s.streakText}>🪙 {coins}</Text>
                  </View>
                  <Animated.Text style={[s.floatingPoints, { color: floatColor, opacity: floatAnimOpacity, transform: [{ translateY: floatAnimY }] }]}>
                    {floatText}
                  </Animated.Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.bellWrap}
                  onPress={() => navigation.navigate('Notifications')}
                  activeOpacity={0.7}
                >
                  <BellIcon />
                  <View style={s.bellDot} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.headerTextRow}>
              <View>
                <Text style={s.greetingText}>{getGreeting()},</Text>
                <Text style={s.nameText}>{displayName}</Text>
              </View>
            </View>

            {/* ✅ Dynamic Quote Engine */}
            <View style={s.quoteContainer}>
              <Feather name="message-square" size={16} color="#D1D5DB" style={s.smallQuoteIcon} />
              <Text style={s.quoteText}>
                {currentQuote}
              </Text>
            </View>

            {/* ✅ Unified Dashboard Card (Progress + Time Block) */}
            <UnifiedDashboardCard
              currentBlock={currentBlock}
              skipsRemaining={skipsRemaining}
              blockCompleted={blockCompleted}
              blockTotal={blockTotal}
              dailyCompleted={dailyCompleted}
              dailyTotal={dailyTotal}
            />

          </View>

          <View style={[s.cardStack, { height: CARD_HEIGHT }]}>
            {isRestModeActive ? (
              <View style={[s.restStateContainer, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                <View style={s.restStateIconBg}>
                  <Feather name="battery-charging" size={48} color="#10B981" />
                </View>
                <Text style={s.restStateTitle}>Rest Mode Activated</Text>
                <Text style={s.restStateDesc}>
                  Taking a break is part of the process. Your streaks are frozen and completely safe. Take this time to recharge your mind and body. You've earned it!
                </Text>
              </View>
            ) : tasks.length === 0 ? (
              // ★ BRAND NEW USER — no tasks exist yet
              <View style={[s.emptyStateCard, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                <View style={s.emptyIconRing}>
                  <MaterialCommunityIcons name="clipboard-text-play-outline" size={72} color="#94A3B8" style={{ marginBottom: 16 }} />
                </View>
                <Text style={s.emptyTitle}>Your Day is a Blank Canvas</Text>
                <Text style={s.emptySubtitle}>
                  Great routines are built one habit at a time. Start small, stay consistent.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('TaskList')}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.emptyButton}
                  >
                    <Text style={s.emptyButtonText}>+ Build My Routine</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : isDone ? (
              // ★ ALL TASKS COMPLETED FOR TODAY
              <View style={[s.chillZoneCard, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}>
                <Text style={{ fontSize: 56, marginBottom: 16 }}>{completionInfo.icon}</Text>
                <Text style={[s.taskDesc, { marginBottom: 24, paddingHorizontal: 20 }]}>
                  {completionInfo.text}
                </Text>
              </View>
            ) : (
              <>
                {/* ── BACK CARD (NEXT TASK) ── */}
                {nextTask && (
                  <Animated.View style={[
                    s.taskCard,
                    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                    { transform: [{ scale: backCardScale }], opacity: backCardOpacity }
                  ]}>
                    <View style={s.cardContent}>
                      <Text style={{ fontSize: 64, marginBottom: 12 }}>{getTaskEmoji(nextTask.name)}</Text>
                      <Text style={s.taskName}>{nextTask.name}</Text>

                      {/* The Clean Time Badge */}
                      <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>
                          {nextTask.duration || '15 min'}
                        </Text>
                      </View>

                      {/* The Funny / Professional Text (Forced to 1 Line) */}
                      <Text style={s.taskDesc} numberOfLines={1} ellipsizeMode="tail">
                        {playfulMode ? (nextTask.descPlayful || getFallbackDesc(nextTask.name, true)) : (nextTask.descProfessional || getFallbackDesc(nextTask.name, false))}
                      </Text>
                    </View>
                  </Animated.View>
                )}

                {/* ── FRONT CARD (CURRENT TASK) ── */}
                <Animated.View
                  style={[
                    s.taskCard,
                    { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
                    { transform: [{ translateX: position.x }, { translateY: position.y }, { rotate: cardRotation }] }
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Animated.View style={[s.swipeHint, s.swipeHintLeft, { opacity: skipOpacity }]}>
                    <Text style={s.swipeHintTextLeft}>SKIP</Text>
                  </Animated.View>
                  <Animated.View style={[s.swipeHint, s.swipeHintRight, { opacity: doneOpacity }]}>
                    <Text style={s.swipeHintTextRight}>DONE</Text>
                  </Animated.View>

                  {isLocked ? (
                    <View style={s.lockedContent}>
                      <Text style={{ fontSize: 64, marginBottom: 12 }}>💪</Text>
                      <Text style={s.taskName}>Quick Challenge!</Text>
                      <Text style={[s.taskDesc, { marginBottom: 6 }]}>Do 10 push-ups right now.</Text>
                      <Text style={[s.taskDesc, { marginBottom: 20, fontStyle: 'italic' }]}>Be true to your goals.</Text>
                      <View style={s.timerBadge}>
                        <Text style={s.timerText}>⏱ {lockTimer}s</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={s.cardContent}>
                      <Text style={{ fontSize: 64, marginBottom: 12 }}>{getTaskEmoji(task.name)}</Text>
                      <Text style={s.taskName}>{task.name}</Text>

                      {/* The Clean Time Badge */}
                      <View style={{ backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>
                          {task.duration || '15 min'}
                        </Text>
                      </View>

                      {/* The Funny / Professional Text (Forced to 1 Line) */}
                      <Text style={s.taskDesc} numberOfLines={1} ellipsizeMode="tail">
                        {playfulMode ? (task.descPlayful || getFallbackDesc(task.name, true)) : (task.descProfessional || getFallbackDesc(task.name, false))}
                      </Text>
                    </View>
                  )}

                  {!isLocked && (
                    <View style={s.actions}>
                      <TouchableOpacity
                        style={[s.skipBtn, skipPressed && s.skipBtnPressed]}
                        onPress={() => trySwipeLeft()}
                        onPressIn={() => setSkipPressed(true)}
                        onPressOut={() => setSkipPressed(false)}
                        activeOpacity={1}
                      >
                        <Text style={[s.skipIcon, skipPressed && s.skipIconPressed]}>✕</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => trySwipeRight()} activeOpacity={0.85}>
                        <LinearGradient colors={['#00BC7D', '#00D492']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={s.doneBtn}>
                          <Text style={s.doneIcon}>✓</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </Animated.View>
              </>
            )}
          </View>

          <View style={s.bottomSection}>
            <View style={s.filterCard}>
              <View style={s.filterRow}>
                <TouchableOpacity style={s.filterPill} onPress={() => setShowFilter(true)} activeOpacity={0.8}>
                  <CalendarSmIcon />
                  <Text style={s.filterPillText}>{selectedLabel}</Text>
                  <ChevronIcon />
                </TouchableOpacity>
                <TouchableOpacity style={s.shareBtn} activeOpacity={0.8} onPress={() => setShowShare(true)}>
                  <ShareIcon />
                </TouchableOpacity>
              </View>

              {filterPeriod === 'all' && (
                <Text style={s.allTimeLabel}>All Time</Text>
              )}
              <View style={s.statsRow}>
                <View style={s.statBlock}>
                  <View style={s.statNumArea}>
                    <Text style={[s.statBigNum, { color: '#006C49' }]}>{completedCount}</Text>
                    <Text style={s.statUnit}>items</Text>
                  </View>
                  <View style={[s.statPill, { backgroundColor: 'rgba(0,108,73,0.10)' }]}>
                    <Text style={[s.statPillText, { color: '#006C49' }]}>Completed</Text>
                  </View>
                </View>

                <View style={s.statBlock}>
                  <View style={s.statNumArea}>
                    <Text style={[s.statBigNum, { color: '#B91A24' }]}>{skippedCount}</Text>
                    <Text style={s.statUnit}>task</Text>
                  </View>
                  <View style={[s.statPill, { backgroundColor: 'rgba(185,26,36,0.10)' }]}>
                    <Text style={[s.statPillText, { color: '#B91A24' }]}>Skipped</Text>
                  </View>
                </View>

                <View style={s.statBlock}>
                  <View style={s.statNumArea}>
                    <Text style={[s.statBigNum, { color: '#855300' }]}>{remainingCount}</Text>
                    <Text style={s.statUnit}>active</Text>
                  </View>
                  <View style={[s.statPill, { backgroundColor: 'rgba(133,83,0,0.10)' }]}>
                    <Text style={[s.statPillText, { color: '#855300' }]}>Remaining</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <ShareBottomSheet
            visible={showShare}
            onClose={() => setShowShare(false)}
            completedCount={completedCount}
            skippedCount={skippedCount}
            remainingCount={remainingCount}
          />

          <FilterDropdown
            visible={showFilter}
            selected={filterPeriod}
            onSelect={setFilterPeriod}
            onClose={() => setShowFilter(false)}
          />

          <CustomAlertModal
            visible={modalConfig.visible}
            title={modalConfig.title}
            message={modalConfig.message}
            type={modalConfig.type}
            onClose={closeAlert}
            onCancel={closeAlert}
            onWatchAd={() => { closeAlert(); executeSwipeLeft(true); }}
            onPayCoins={() => { closeAlert(); executeSwipeLeft(false); }}
          />


          {/* CONFIRMATION MODAL */}
          <Modal transparent visible={showRestModal} animationType="fade" onRequestClose={() => setShowRestModal(false)}>
            <View style={s.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={s.centerModal}>
                  <View style={[s.sheetIconWrap, { backgroundColor: '#ECFDF5' }]}>
                    <Feather name="moon" size={24} color="#10B981" />
                  </View>
                  <Text style={s.sheetTitle}>Take a Rest Day?</Text>
                  <Text style={s.sheetDesc}>
                    This will freeze your streaks and hide your tasks for the next 24 hours. This action cannot be undone. Are you sure?
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' }}>
                    <TouchableOpacity style={[s.sheetBtn, { flex: 1, backgroundColor: '#F1F5F9', marginTop: 0 }]} onPress={() => setShowRestModal(false)}>
                      <Text style={[s.sheetBtnText, { color: '#64748B' }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.sheetBtn, { flex: 1, backgroundColor: '#10B981', marginTop: 0 }]} onPress={() => {
                      setShowRestModal(false);
                      setRestDays(prev => Math.max(0, prev - 1));
                      setIsRestModeActive(true);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }}>
                      <Text style={s.sheetBtnText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </Modal>

          {/* TOAST NOTIFICATION */}
          {showToast && (
            <Animated.View style={s.toastContainer}>
              <Feather name="check-circle" size={18} color="#10B981" />
              <Text style={s.toastText}>Rest Mode activated for 24 hours.</Text>
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>

      <OutOfSkipsModal
        visible={isSkipModalVisible}
        onClose={() => {
          setSkipModalVisible(false);
          setTaskToSkip(null);
        }}
        currentPoints={coins}
        onWatchAd={() => {
          if (adLoaded) {
            rewarded.show();
          } else {
            Alert.alert('Hold on!', 'The ad is still loading. Try again in a second.');
          }
        }}
        onPayPoints={() => {
          skipTask(taskToSkip, 'coins');
          setSkipModalVisible(false);
          executeSwipeLeft('coins'); // Ensure animation runs
        }}
      />
    </>
  );
};

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  topSection: { paddingHorizontal: 20, paddingTop: 16 },
  bottomSection: { paddingHorizontal: 20, paddingBottom: 24 },
  container: { flex: 1 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, height: 64 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakBadgeWrap: { position: 'relative', alignItems: 'center' },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 79, height: 36, borderWidth: 1, borderColor: '#F59E0B', borderRadius: 100, justifyContent: 'center' },
  streakText: { color: '#2C3E2D', fontWeight: '500', fontSize: 14, lineHeight: 20, letterSpacing: 0.10 },
  floatingPoints: { position: 'absolute', top: -10, fontSize: 18, fontWeight: '900', zIndex: 20 },
  bellWrap: { width: 24, height: 24, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  bellDot: { position: 'absolute', top: 0, right: 0, width: 6, height: 6, borderRadius: 3, backgroundColor: '#E52200', shadowColor: '#E52200', shadowOpacity: 1, shadowRadius: 4, elevation: 4 },

  greeting: { fontSize: 32, fontWeight: '600', color: '#2D2B2E', marginBottom: 4 },
  greetingText: { fontSize: 16, fontWeight: '500', color: '#6B7280' },
  nameText: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5, marginTop: 4 },
  sub: { fontSize: 14.33, color: '#2D2B2E', marginBottom: 0, fontWeight: '500' },

  headerTextRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 20 },
  infoIconWrap: { padding: 8, backgroundColor: '#F1F5F9', borderRadius: 20 },

  quoteContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
  smallQuoteIcon: {
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#4B5563',
    lineHeight: 24,
  },
  quoteAuthor: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
  },

  restHeaderBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  restHeaderBtnActive: { backgroundColor: '#ECFDF5' },
  restHeaderText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  restHeaderTextActive: { color: '#10B981' },

  taskTooltip: { position: 'absolute', top: 120, backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7', width: 280, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, zIndex: 100 },
  taskTooltipText: { fontSize: 13, color: '#B45309', fontWeight: '500', lineHeight: 18, textAlign: 'center', marginBottom: 8 },
  taskTooltipDismiss: { backgroundColor: '#FDE68A', paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  taskTooltipDismissText: { color: '#92400E', fontSize: 13, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, alignItems: 'center' },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 20 },
  sheetIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  sheetDesc: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22, paddingHorizontal: 12, marginBottom: 8 },
  sheetBtn: { width: '100%', backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginTop: 16 },
  sheetBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  centerModal: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center', marginHorizontal: 20, marginBottom: '50%' },

  cardStack: { position: 'relative', marginBottom: 24, marginHorizontal: 20 },
  taskCard: {
    height: '100%',
    backgroundColor: '#EFFFFA',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.10,
    shadowRadius: 50,
    elevation: 6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },

  restStateContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 32,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  restStateIconBg: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#D1FAE5',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  restStateTitle: {
    fontSize: 26, fontWeight: '800', color: '#065F46',
    marginBottom: 16, textAlign: 'center',
  },
  restStateDesc: {
    fontSize: 15, color: '#047857', textAlign: 'center',
    lineHeight: 24, fontWeight: '500',
  },

  chillZoneCard: {
    backgroundColor: '#EFFFFA',
    borderRadius: 32,
    shadowColor: '#00BC7D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  countdownBadge: { backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  countdownText: { color: '#10B981', fontWeight: '800', fontSize: 16 },

  cardContent: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  lockedContent: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  swipeHint: { position: 'absolute', top: 20, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 3, zIndex: 10 },
  swipeHintLeft: { left: 20, borderColor: '#FB2C36' },
  swipeHintRight: { right: 20, borderColor: '#00BC7D' },
  swipeHintTextLeft: { color: '#FB2C36', fontWeight: '900', fontSize: 18 },
  swipeHintTextRight: { color: '#00BC7D', fontWeight: '900', fontSize: 18 },
  taskName: { fontSize: 32, fontWeight: '600', color: '#2D2B2E', textAlign: 'center', marginBottom: 8 },
  taskDesc: { fontSize: 14.33, color: '#2D2B2E', fontWeight: '300', textAlign: 'center', lineHeight: 22 },

  actions: { flexDirection: 'row', gap: 48, alignItems: 'center', justifyContent: 'center', paddingTop: 24 },
  skipBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FFE2E2', alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', shadowOpacity: 0.15, shadowRadius: 15, elevation: 2 },
  skipBtnPressed: { backgroundColor: '#FB2C36', borderColor: '#FB2C36' },
  skipIcon: { fontSize: 24, color: '#FB2C36', fontWeight: '700' },
  skipIconPressed: { color: '#fff' },
  doneBtn: { width: 80.23, height: 80.23, borderRadius: 40.12, alignItems: 'center', justifyContent: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4.83 }, shadowOpacity: 0.34, shadowRadius: 17, elevation: 8 },
  doneIcon: { fontSize: 30, color: '#fff', fontWeight: '800' },

  timerBadge: {
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
  },
  timerText: {
    color: '#E11D48',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#ECFDF5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    gap: 8,
    zIndex: 999,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
  },

  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    gap: 20,
  },

  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F2F4F6',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPillText: {
    color: '#191C1E',
    fontSize: 14,
    fontFamily: 'Roboto',
    fontWeight: '600',
    lineHeight: 20,
    marginRight: 4,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 32,
  },
  statBlock: {
    alignItems: 'flex-start',
    gap: 6,
  },
  statNumArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  statBigNum: {
    fontSize: 30,
    fontFamily: 'Roboto',
    fontWeight: '800',
    lineHeight: 36,
  },
  statUnit: {
    fontSize: 10,
    fontFamily: 'Roboto',
    fontWeight: '400',
    color: '#6C7A71',
    lineHeight: 15,
    marginBottom: 3,
  },
  statPill: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statPillText: {
    fontSize: 9,
    fontFamily: 'Roboto',
    fontWeight: '600',
    textTransform: 'uppercase',
    lineHeight: 13.5,
    letterSpacing: 0.45,
  },
  allTimeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006C49',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end', paddingHorizontal: 20, paddingBottom: 120 },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
  },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  dropdownTitle: { fontSize: 15, fontWeight: '700', color: '#2D2B2E', letterSpacing: 0.2 },
  dropdownDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 20 },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
  },
  dropdownItemSelected: { backgroundColor: '#F0FDF9' },
  dropdownItemText: { fontSize: 15, fontWeight: '500', color: '#374151' },
  dropdownItemTextSelected: { color: '#10B981', fontWeight: '700' },
  dropdownCheck: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center', justifyContent: 'center',
  },
  dropdownBadge: {
    backgroundColor: '#F0FDF9', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#A7F3D0',
  },
  dropdownBadgeText: { fontSize: 11, color: '#10B981', fontWeight: '600' },

  allTimeCard: {
    flex: 1,
    backgroundColor: '#EFFFFA',
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.10,
    shadowRadius: 50,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 8,
  },
  allTimeTitle: { fontSize: 22, fontWeight: '700', color: '#2D2B2E', textAlign: 'center' },
  allTimeSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 8 },
  allTimeRow: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 8 },
  allTimeStat: {
    flex: 1, borderRadius: 20, paddingVertical: 20,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  allTimeStatNum: { fontSize: 32, fontWeight: '800', color: '#fff' },
  allTimeStatLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  allTimeFooter: {
    marginTop: 16, backgroundColor: '#fff',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: '#D1FAE5',
  },
  allTimeFooterText: { fontSize: 13, color: '#10B981', fontWeight: '600', textAlign: 'center' },

  // ★ EMPTY STATE (new user, no tasks yet)
  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  emptyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  emptyButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // --- TIMELINE INFO CARD STYLES ---
  timelineCard: {
    backgroundColor: '#EFF6FF', // Light blue urgent background
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  timelineLeft: { flexDirection: 'row', alignItems: 'center' },
  timelineTextGroup: { marginLeft: 12 },
  timelineTitle: { fontSize: 16, fontWeight: '800', color: '#1E3A8A' },
  timelineTime: { fontSize: 12, fontWeight: '600', color: '#3B82F6', marginTop: 2 },
  timelineRight: { alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  remainingNumber: { fontSize: 18, fontWeight: '900', color: '#F43F5E' },
  remainingText: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF' }
});

const sh = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 20,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#191C1E',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6C7A71',
    textAlign: 'center',
    marginTop: -12,
  },

  snapshotCard: {
    backgroundColor: '#F0FDF9',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  snapshotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#006C49',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  snapshotRow: {
    flexDirection: 'row',
    gap: 28,
  },
  snapStat: { gap: 4 },
  snapNum: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 36,
  },
  snapUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6C7A71',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionItem: {
    alignItems: 'center',
    gap: 8,
  },
  optionIcon: {
    width: 60, height: 60,
    borderRadius: 16,
    backgroundColor: '#F2F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  shareBtn: { borderRadius: 14, overflow: 'hidden' },
  shareBtnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default HomeScreen;