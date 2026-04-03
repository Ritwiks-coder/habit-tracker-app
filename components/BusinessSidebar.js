import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Switch, Animated, Easing, Dimensions, Image, ScrollView, Alert
} from 'react-native';
import Svg, { Path, Circle, Polyline, Line } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { navigationRef } from '../services/NavigationService';
import { auth } from '../services/firebaseSetup';
import LogoutModal from './LogoutModal';

const { width } = Dimensions.get('window');

// ─── Icons ────────────────────────────────────────────────────────
const EditIcon = ({ color = "#475569" }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

const SmileIcon = ({ color = "#475569" }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <Line x1="9" y1="9" x2="9.01" y2="9" />
    <Line x1="15" y1="9" x2="15.01" y2="9" />
  </Svg>
);

const HistoryIcon = ({ color = "#475569" }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

const SupportIcon = ({ color = "#475569" }) => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <Path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </Svg>
);

const StoreIcon = ({ color = "#4F46E5" }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </Svg>
);

const PersonOutlineIcon = ({ color = "#475569" }) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </Svg>
);

const LogoutIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <Polyline points="16 17 21 12 16 7" />
    <Line x1="21" y1="12" x2="9" y2="12" />
  </Svg>
);

const SunIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="5" />
    <Line x1="12" y1="1" x2="12" y2="3" />
    <Line x1="12" y1="21" x2="12" y2="23" />
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <Line x1="1" y1="12" x2="3" y2="12" />
    <Line x1="21" y1="12" x2="23" y2="12" />
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </Svg>
);

const MoonIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </Svg>
);

// ─── Rows ───────────────────────────────────────────────────────────
const PressRow = ({ icon, title, onPress }) => (
  <TouchableOpacity style={s.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={s.menuIcon}>{icon}</View>
    <Text style={s.menuTitle}>{title}</Text>
  </TouchableOpacity> 
);

const ToggleRow = ({ icon, title, value, onToggle }) => (
  <View style={s.menuItem}>
    <View style={s.menuIcon}>{icon}</View>
    <Text style={s.menuTitle}>{title}</Text>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
      thumbColor={value ? '#10B981' : '#FFFFFF'}
      style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
    />
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────
export default function BusinessSidebar({ visible, onClose }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

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
        await auth.signOut();
        navigationRef.current?.navigate('Login');
      } catch (e) {
        console.error('Logout error:', e);
      }
    }, 300);
  };

  return (
    <View style={s.overlay} pointerEvents="box-none">
      <Animated.View style={[s.backdrop, { opacity: backdropAnim }]} pointerEvents={visible ? 'auto' : 'none'}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[s.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Text style={s.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Profile Header */}
          <View style={s.profile}>
            <Image source={{uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop'}} style={s.avatar} />
            <Text style={s.name}>Business Name</Text>
            <View style={s.pointsBadge}>
              <Text style={s.pointsText}>🔥 850 PTS</Text>
            </View>
          </View>

          {/* ACCOUNT */}
          <Text style={s.sectionTitle}>ACCOUNT</Text>
          <PressRow icon={<EditIcon />} title="Store Management" onPress={() => goTo('BusinessStore')} />
          <ToggleRow icon={<SmileIcon />} title="Notifications" value={notifications} onToggle={setNotifications} />
          <PressRow icon={<HistoryIcon />} title="Transaction History" onPress={() => goTo('BusinessTransaction')} />

          {/* HELP */}
          <Text style={s.sectionTitle}>HELP</Text>
          <PressRow icon={<SupportIcon />} title="Merchant Support" onPress={() => goTo('BusinessSupport')} />

          {/* BUSINESS / APP SWITCHER */}
          <Text style={s.sectionTitle}>BUSINESS</Text>
          <View style={s.modeCards}>
            <TouchableOpacity style={s.modeCardActive} onPress={() => goTo('BusinessSelectAccount')} activeOpacity={0.8}>
              <StoreIcon />
              <Text style={s.modeCardTextActive}>OTHER STORE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.modeCardInactive} onPress={() => goTo('Main')} activeOpacity={0.8}>
              <PersonOutlineIcon />
              <Text style={s.modeCardTextInactive}>PERSONAL</Text>
            </TouchableOpacity>
          </View>

          <View style={s.divider} />

          {/* LOGOUT */}
          <TouchableOpacity 
            style={s.logoutBtn} 
            onPress={() => setLogoutModalVisible(true)}
          >
            <LogoutIcon />
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={s.divider} />

          {/* THEME TOGGLE */}
          <View style={s.themeRow}>
            <TouchableOpacity style={[s.themeBtn, !darkMode && s.themeBtnActive]} onPress={() => setDarkMode(false)}>
              <SunIcon />
              <Text style={[s.themeBtnText, !darkMode && s.themeBtnTextActive]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.themeBtn, darkMode && s.themeBtnActiveDark]} onPress={() => setDarkMode(true)}>
              <MoonIcon />
              <Text style={[s.themeBtnText, darkMode && { color: '#1E293B' }]}>Dark</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </Animated.View>

      <LogoutModal
        visible={isLogoutModalVisible}
        onClose={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Log Out?"
        message="Are you sure you want to log out of your merchant account?"
      />
    </View>
  );
}

const s = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 9999 },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
  sidebar: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 320, backgroundColor: '#FFFFFF', borderTopRightRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 24, paddingTop: 56, elevation: 9999 },
  
  closeBtn: { position: 'absolute', top: 16, right: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  closeBtnText: { fontSize: 14, color: '#64748B', fontWeight: '700' },
  
  profile: { marginBottom: 32, marginTop: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F1F5F9', marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8, letterSpacing: -0.5 },
  pointsBadge: { alignSelf: 'flex-start', backgroundColor: '#4F46E5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  pointsText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginTop: 24, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  menuIcon: { width: 32 },
  menuTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#334155' },
  
  modeCards: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modeCardActive: { flex: 1, height: 100, backgroundColor: '#EEF2FF', borderRadius: 16, borderWidth: 1, borderColor: '#C7D2FE', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modeCardTextActive: { fontSize: 11, fontWeight: '800', color: '#4F46E5' },
  modeCardInactive: { flex: 1, height: 100, backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center', gap: 8 },
  modeCardTextInactive: { fontSize: 11, fontWeight: '700', color: '#475569' },

  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 24 },
  
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutText: { fontSize: 16, fontWeight: '800', color: '#EF4444' },
  
  themeRow: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4, gap: 4 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  themeBtnActive: { backgroundColor: '#4F46E5', shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  themeBtnActiveDark: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  themeBtnText: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  themeBtnTextActive: { color: '#FFFFFF' },
});