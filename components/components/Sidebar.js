import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Animated, Easing, Dimensions, Image, ScrollView
} from 'react-native';
import Svg, { Path, Rect, G, ClipPath, Defs } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { navigationRef } from '../services/NavigationService';
import LogoutModal from './LogoutModal';

// 🚨 THE FIX IS HERE 🚨
// We bring in the default auth module directly from the library.
// NO curly braces, NO named imports, NO firebaseSetup.js
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');
const IC = '#64748B';

// ─── Icons ────────────────────────────────────────────────────────
const PersonIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path d="M18.3334 19.25V17.4167C18.3334 15.393 16.6904 13.75 14.6667 13.75H7.33335C5.30967 13.75 3.66669 15.393 3.66669 17.4167V19.25" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M7.33331 6.41667C7.33331 8.44036 8.97629 10.0833 11 10.0833C13.0237 10.0833 14.6666 8.44036 14.6666 6.41667C14.6666 4.39298 13.0237 2.75 11 2.75C8.97629 2.75 7.33331 4.39298 7.33331 6.41667V6.41667" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const GhostIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path d="M8.25 9.16666H8.25917" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M13.75 9.16666H13.7592" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M11 1.83334C6.95264 1.83334 3.66669 5.1193 3.66669 9.16668V20.1667L6.41669 17.4167L8.70835 19.7083L11 17.4167L13.2917 19.7083L15.5834 17.4167L18.3334 20.1667V9.16668C18.3334 5.1193 15.0474 1.83334 11 1.83334V1.83334" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const SmileIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Defs><ClipPath id="clip0"><Rect width="22" height="22" fill="white" /></ClipPath></Defs>
    <G clipPath="url(#clip0)">
      <Path d="M1.83331 11C1.83331 16.0592 5.94076 20.1666 11 20.1666C16.0592 20.1666 20.1666 16.0592 20.1666 11C20.1666 5.94076 16.0592 1.83331 11 1.83331C5.94076 1.83331 1.83331 5.94076 1.83331 11V11" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.25 8.25H8.25917" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.75 8.25H13.7592" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 13.5C9.51693 17.0474 11.5978 16.987 15.5 13.5" stroke={IC} />
    </G>
  </Svg>
);

const BagIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path d="M5.5 1.83331L2.75 5.49998V18.3333C2.75 19.3452 3.57149 20.1666 4.58333 20.1666H17.4167C18.4285 20.1666 19.25 19.3452 19.25 18.3333V5.49998L16.5 1.83331H5.5" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2.75 5.5H19.25" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M14.6666 9.16669C14.6666 11.1904 13.0237 12.8334 11 12.8334C8.97629 12.8334 7.33331 11.1904 7.33331 9.16669" stroke={IC} strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const HomeIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path d="M2.75 8.24998L11 1.83331L19.25 8.24998V18.3333C19.25 19.3452 18.4285 20.1666 17.4167 20.1666H4.58333C3.57149 20.1666 2.75 19.3452 2.75 18.3333V8.24998" stroke="#475569" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    <Rect x="8.25" y="11" width="5.5" height="9.16667" stroke="#475569" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24">
    <Path fill="#EF4444" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z" />
  </Svg>
);

const SunIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path fill="white" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5M2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1m18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1M11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1m0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1M5.99 4.58a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41zm12.37 12.37a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41zm1.06-12.37a.996.996 0 0 0-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06a.996.996 0 0 0 0-1.41M6.34 17.66a.996.996 0 0 0-1.41 0a.996.996 0 0 0 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 0 0 0-1.41z" />
  </Svg>
);

const MoonIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24">
    <Path fill="#6B7280" d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26a5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1" />
  </Svg>
);

// ─── Row Components ───────────────────────────────────────────────────────────
const ToggleRow = ({ icon, title, subtitle, value, onToggle }) => (
  <View style={s.menuItem}>
    <View style={s.menuIcon}>{icon}</View>
    <View style={s.menuText}>
      <Text style={s.menuTitle}>{title}</Text>
      {subtitle && <Text style={s.menuSubtitle}>{subtitle}</Text>}
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
      thumbColor={value ? '#10B981' : '#fff'}
      ios_backgroundColor="#E5E7EB"
    />
  </View>
);

const PressRow = ({ icon, title, subtitle, onPress, green }) => (
  <TouchableOpacity
    style={[s.menuItem, green && s.menuItemGreen]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={s.menuIcon}>{icon}</View>
    <View style={s.menuText}>
      <Text style={s.menuTitle}>{title}</Text>
      {subtitle && <Text style={s.menuSubtitle}>{subtitle}</Text>}
    </View>
    {green && <Text style={s.chevron}>›</Text>}
  </TouchableOpacity>
);

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar = ({ visible, onClose }) => {
  // ✅ 1. Add `user` to the list of things we pull from useApp!
  const { 
    user, userProfile, points, playfulMode, setPlayfulMode, 
    sidebarOpen, setSidebarOpen, ghostMode, setGhostMode 
  } = useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  // ✅ 2. Bulletproof Fallback! 
  // If userProfile is loading, instantly grab the name from their login email.
  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || "User";
  const avatarUrl = userProfile?.avatar || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';

  const slideAnim = useRef(new Animated.Value(-width)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 180, mass: 0.8, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: -width, damping: 25, stiffness: 200, mass: 0.7, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const goTo = (screen) => {
    onClose();
    setTimeout(() => {
      navigationRef.current?.navigate(screen);
    }, 300);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    onClose();

    setTimeout(async () => {
      try {
        await auth().signOut();
        navigationRef.current?.navigate('Login');
      } catch (e) {
        console.error('Logout error:', e);
      }
    }, 300);
  };

  return (
    <View style={s.overlay} pointerEvents="box-none">
      <Animated.View
        style={[s.backdrop, { opacity: backdropAnim }]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[s.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        >
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Profile */}
          <View style={s.profile}>
            <View style={s.avatarWrap}>
              <Image
                source={require('../assets/profile-icon.png')}
                style={s.avatar}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={s.name}>Ritik Gaikwad</Text>
              <View style={s.pointsBadge}>
                <Text style={s.pointsText}>🔥 {points || 0} PTS</Text>
              </View>
            </View>
          </View>

          {/* ACCOUNT */}
          <Text style={s.sectionTitle}>ACCOUNT</Text>
          <PressRow icon={<PersonIcon />} title="Profile Settings" onPress={() => goTo('ProfileSettings')} />
          <ToggleRow icon={<GhostIcon />} title="Ghost Mode" subtitle="Keep your progress private" value={ghostMode} onToggle={setGhostMode} />

          {/* NOTIFICATIONS */}
          <Text style={s.sectionTitle}>NOTIFICATIONS</Text>
          <ToggleRow icon={<SmileIcon />} title="Sassy Mode" subtitle="Fun & witty task descriptions" value={playfulMode} onToggle={setPlayfulMode} />

          {/* REWARDS */}
          <Text style={s.sectionTitle}>REWARDS</Text>
          <PressRow icon={<BagIcon />} title="Discount Center" onPress={() => goTo('DiscountCenter')} />

          {/* BUSINESS */}
          <Text style={s.sectionTitle}>BUSINESS</Text>
          <PressRow
            icon={<HomeIcon />}
            title="Switch To Business"
            subtitle="Manage your store offers"
            green
            onPress={() => goTo('BusinessRegister')}
          />

          <View style={{ flex: 1, minHeight: 40 }} />
          <View style={s.divider} />

          <TouchableOpacity style={s.logoutBtn} onPress={() => setLogoutModalVisible(true)}>
            <LogoutIcon />
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={s.themeRow}>
            <TouchableOpacity style={[s.themeBtn, !darkMode && s.themeBtnActive]} onPress={() => setDarkMode(false)}>
              <SunIcon />
              <Text style={[s.themeBtnText, !darkMode && s.themeBtnTextActive]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.themeBtn, darkMode && s.themeBtnActiveDark]} onPress={() => setDarkMode(true)}>
              <MoonIcon />
              <Text style={[s.themeBtnText, darkMode && { color: '#1C1C1E' }]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      <LogoutModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
      />
    </View>
  );
};

const s = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 9999 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.25)' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: width * 0.85, backgroundColor: '#fff', borderTopRightRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 24, paddingTop: 56, elevation: 9999 },
  closeBtn: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  closeBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '700' },
  profile: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, marginTop: 8, gap: 15 },
  avatarWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6', overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  avatar: { width: '100%', height: '100%' },
  name: { fontSize: 18, fontWeight: '800', color: '#1C1C1E', marginBottom: 6 },
  pointsBadge: { alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#F59E0B', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  pointsText: { color: '#F59E0B', fontWeight: '700', fontSize: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginTop: 26, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 14 },
  menuItemGreen: { backgroundColor: '#E8F8F2', borderRadius: 14, paddingHorizontal: 14, marginTop: 4 },
  menuIcon: { width: 28, alignItems: 'center' },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  menuSubtitle: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 20, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 16 },
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