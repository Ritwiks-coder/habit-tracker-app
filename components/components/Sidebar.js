import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Animated, Dimensions, Image, Alert
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
// 1. IMPORT USE NAVIGATION
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// --- ICONS ---
const PersonIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path fill="#9CA3AF" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4S7.2 4.5 7.2 7.2S9.3 12 12 12m0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8"/>
  </Svg>
);
const GhostIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path fill="#9CA3AF" d="M12 2a8 8 0 0 0-8 8v12l3-3l2.5 2.5L12 19l2.5 2.5L17 19l3 3V10A8 8 0 0 0 12 2m-3 9a1.5 1.5 0 0 1 0-3a1.5 1.5 0 0 1 0 3m6 0a1.5 1.5 0 0 1 0-3a1.5 1.5 0 0 1 0 3"/>
  </Svg>
);
const SmileIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" stroke="#9CA3AF" strokeWidth="2" fill="none"/>
    <Path fill="#9CA3AF" d="M8 14s1.5 2 4 2s4-2 4-2"/>
    <Circle cx="9" cy="10" r="1" fill="#9CA3AF"/>
    <Circle cx="15" cy="10" r="1" fill="#9CA3AF"/>
  </Svg>
);
const BagIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path fill="#9CA3AF" d="M19 6h-2c0-2.8-2.2-5-5-5S7 3.2 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2m-7-3c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3m0 10c-1.7 0-3-1.3-3-3h2c0 .6.4 1 1 1s1-.4 1-1h2c0 1.7-1.3 3-3 3"/>
  </Svg>
);
const HomeIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path fill="#9CA3AF" d="M6 19h3v-5h6v5h3v-9l-6-4.5L6 10zm-2 0v-9l8-6l8 6v9h-5v-5h-6v5z"/>
  </Svg>
);
const LogoutIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path fill="#EF4444" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"/>
  </Svg>
);
const SunIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path fill="white" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41zm1.06-12.37a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41M6.34 17.66a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41z"/>
  </Svg>
);
const MoonIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path fill="#6B7280" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26a5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1"/>
  </Svg>
);

const Sidebar = ({ visible, onClose }) => {
  const { points, playfulMode, setPlayfulMode } = useApp();
  const navigation = useNavigation(); // 2. HOOK INITIALIZED
  
  const [ghostMode, setGhostMode] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-width)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, friction: 8, tension: 65 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: -width, useNativeDriver: true, friction: 8 }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // 3. NAVIGATION HELPER (Closes sidebar, then navigates)
  const handleNavigation = (screenName) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(screenName);
    }, 200); // Slight delay so the sidebar animates out smoothly first
  };

  if (!visible) return null;

  const Section = ({ title }) => (
    <Text style={s.sectionTitle}>{title}</Text>
  );

  const MenuItem = ({ icon, title, subtitle, toggle, value, onToggle, onPress, green }) => (
    <TouchableOpacity style={[s.menuItem, green && s.menuItemGreen]} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={s.menuIcon}>{icon}</View>
      <View style={s.menuText}>
        <Text style={s.menuTitle}>{title}</Text>
        {subtitle && <Text style={s.menuSubtitle}>{subtitle}</Text>}
      </View>
      {toggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
          thumbColor={value ? '#10B981' : '#fff'}
          ios_backgroundColor="#E5E7EB"
        />
      )}
      {green && <Text style={s.chevron}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={s.overlay}>
      <Animated.View style={[s.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[s.sidebar, { transform: [{ translateX: slideAnim }] }]}>

        <TouchableOpacity style={s.closeBtn} onPress={onClose}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>

        {/* Profile */}
        <View style={s.profile}>
          <View style={s.avatarWrap}>
            <Image source={require('../assets/profile-icon.png')} style={s.avatar} />
          </View>
          <Text style={s.name}>Rohan</Text>
          <View style={s.pointsBadge}>
            <Text style={s.pointsText}>🔥 {points} PTS</Text>
          </View>
        </View>

        {/* Account Section */}
        <Section title="ACCOUNT" />
        <MenuItem 
          icon={<PersonIcon />} 
          title="Profile Settings" 
          onPress={() => handleNavigation('ProfileSettings')} 
        />
        <MenuItem 
          icon={<GhostIcon />} 
          title="Ghost Mode" 
          subtitle="Browse privately" 
          toggle 
          value={ghostMode} 
          onToggle={setGhostMode} 
        />

        {/* Notifications Section */}
        <Section title="NOTIFICATIONS" />
        <MenuItem 
          icon={<SmileIcon />} 
          title="Playful Nudges" 
          subtitle="Fun, casual reminders" 
          toggle 
          value={playfulMode} 
          onToggle={setPlayfulMode} 
        />

        {/* Rewards Section */}
        <Section title="REWARDS" />
        <MenuItem 
          icon={<BagIcon />} 
          title="Discount Center" 
          onPress={() => handleNavigation('DiscountCenter')} 
        />

        {/* Business Section */}
        <Section title="BUSINESS" />
        <MenuItem 
          icon={<HomeIcon />} 
          title="Switch To Business" 
          subtitle="Manage your store offers" 
          green 
          onPress={() => handleNavigation('BusinessRegister')} 
        />

        <View style={s.divider} />

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={() => Alert.alert('Log Out', 'Are you sure?')}>
          <LogoutIcon />
          <Text style={s.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Theme Toggle */}
        <View style={s.themeRow}>
          <TouchableOpacity
            style={[s.themeBtn, !darkMode && s.themeBtnActive]}
            onPress={() => setDarkMode(false)}
          >
            <SunIcon />
            <Text style={[s.themeBtnText, !darkMode && s.themeBtnTextActive]}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.themeBtn, darkMode && s.themeBtnActiveDark]}
            onPress={() => setDarkMode(true)}
          >
            <MoonIcon />
            <Text style={[s.themeBtnText, darkMode && { color: '#1C1C1E' }]}>Dark</Text>
          </TouchableOpacity>
        </View>

      </Animated.View>
    </View>
  );
};

const s = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: width * 0.82, backgroundColor: '#fff', borderTopRightRadius: 24, borderBottomRightRadius: 24, padding: 24, paddingTop: 56 },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '700' },

  profile: { marginBottom: 28 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', overflow: 'hidden', marginBottom: 12 },
  avatar: { width: '100%', height: '100%' },
  name: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  pointsBadge: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5 },
  pointsText: { color: '#F59E0B', fontWeight: '700', fontSize: 14 },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginTop: 20, marginBottom: 8 },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  menuItemGreen: { backgroundColor: '#E8F8F2', borderRadius: 14, paddingHorizontal: 14, marginTop: 4 },
  menuIcon: { width: 28, alignItems: 'center' },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  menuSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 20, color: '#9CA3AF' },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  themeRow: { flexDirection: 'row', marginTop: 24, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, gap: 4 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  themeBtnActive: { backgroundColor: '#10B981' },
  themeBtnActiveDark: { backgroundColor: '#fff' },
  themeBtnText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  themeBtnTextActive: { color: '#fff' },
});

export default Sidebar;