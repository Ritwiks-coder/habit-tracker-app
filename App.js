import 'react-native-gesture-handler';
import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';

import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import { navigationRef } from './services/NavigationService';

// -- Personal App screens --
import OnboardingScreen from './OnboardingScreen';
import LoginScreen from './LoginScreen';
import AuthForgotPasswordScreen from './screens/AuthForgotPasswordScreen';
import AuthResetPasswordScreen from './screens/ResetPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import TaskListScreen from './screens/TaskListScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import ProfileForgotPasswordScreen from './screens/ForgotPasswordScreen';
import NewPasswordScreen from './screens/NewPasswordScreen';
import DiscountCenterScreen from './screens/DiscountCenterScreen';
import NotificationsScreen from './screens/NotificationsScreen';

// -- Business App screens --
import BusinessRegisterScreen from './screens/BusinessRegisterScreen';
import BusinessLoginScreen from './screens/BusinessLoginScreen';
import AddNewBusinessScreen from './screens/AddNewBusinessScreen';
import BusinessSelectAccountScreen from './screens/BusinessSelectAccountScreen';
import BusinessForgotPasswordScreen from './screens/BusinessForgotPasswordScreen';
import BusinessResetPasswordScreen from './screens/BusinessResetPasswordScreen';
import BusinessDashboardScreen from './screens/BusinessDashboardScreen';
import BusinessCouponsScreen from './screens/BusinessCouponsScreen'; 
import BusinessVerifyScreen from './screens/BusinessVerifyScreen';   
import BusinessSidebar from './components/BusinessSidebar';
import BusinessNotificationsScreen from './screens/BusinessNotificationsScreen';
import BusinessStoreScreen from './screens/BusinessStoreScreen';
import BusinessTransactionScreen from './screens/BusinessTransactionScreen';
import BusinessSupportScreen from './screens/BusinessSupportScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// 1. PERSONAL TAB NAVIGATOR (Green)
// ==========================================
const HomeIcon = ({ color }) => <Svg width="24" height="24" viewBox="0 0 24 24"><Path fill={color} d="M6 19h3v-5q0-.425.288-.712T10 13h4q.425 0 .713.288T15 14v5h3v-9l-6-4.5L6 10zm-2 0v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-4q-.425 0-.712-.288T13 20v-5h-2v5q0 .425-.288.713T10 21H6q-.825 0-1.412-.587T4 19m8-6.75" /></Svg>;
const TaskIcon = ({ color }) => <Svg width="26" height="26" viewBox="0 0 32 32"><Path fill={color} d="M31 24h-4v-4h-2v4h-4v2h4v4h2v-4h4z" /><Path fill={color} d="M25 5h-3V4a2.006 2.006 0 0 0-2-2h-8a2.006 2.006 0 0 0-2 2v1H7a2.006 2.006 0 0 0-2 2v21a2.006 2.006 0 0 0 2 2h10v-2H7V7h3v3h12V7h3v9h2V7a2.006 2.006 0 0 0-2-2m-5 3h-8V4h8Z" /></Svg>;
const LeaderboardIcon = ({ color }) => <Svg width="24" height="24" viewBox="0 0 24 24"><Path fill={color} fillRule="evenodd" d="M7.802 4.821c-.041.038-.052.075-.052.102v5.538c0 1.4.386 2.6 1.083 3.437c.683.818 1.715 1.352 3.167 1.352s2.484-.534 3.167-1.352c.697-.836 1.083-2.037 1.083-3.437V4.923c0-.027-.01-.064-.052-.102A.3.3 0 0 0 16 4.75H8a.3.3 0 0 0-.198.071m-1.552.102c0-.98.841-1.673 1.75-1.673h8c.909 0 1.75.694 1.75 1.673v.327H19c.966 0 1.75.784 1.75 1.75v2c0 1.908-1.527 3.421-3.307 3.703a6 6 0 0 1-1.124 2.155c-.853 1.022-2.06 1.688-3.569 1.852v2.54H15a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5h2.25v-2.54c-1.509-.165-2.716-.83-3.569-1.852a6 6 0 0 1-1.124-2.155C4.777 12.42 3.25 10.908 3.25 9V7c0-.966.784-1.75 1.75-1.75h1.25zm0 1.827H5a.25.25 0 0 0-.25.25v2c0 .91.644 1.738 1.522 2.082a9 9 0 0 1-.022-.62zm11.478 4.332C18.606 10.738 19.25 9.91 19.25 9V7a.25.25 0 0 0-.25-.25h-1.25v3.711q0 .313-.022.621" clipRule="evenodd" /></Svg>;
const ICONS = [HomeIcon, TaskIcon, LeaderboardIcon];

const TabIcon = ({ IconComponent, isFocused, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start(); onPress(); };
  return (
    <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={tb.tabItem}>
      <Animated.View style={[tb.iconWrap, isFocused && tb.iconWrapActive, { transform: [{ scale }] }]}>
        <IconComponent color={isFocused ? '#fff' : '#9CA3AF'} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({ state, navigation }) => {
  const tabs = [{ name: 'Home' }, { name: 'TaskList' }, { name: 'Leaderboard' }];
  return (
    <View style={tb.wrapper}>
      <View style={tb.bar}>
        {tabs.map((tab, i) => <TabIcon key={tab.name} IconComponent={ICONS[i]} isFocused={state.index === i} onPress={() => navigation.navigate(tab.name)} />)}
      </View>
    </View>
  );
};

const TabNavigator = () => (
  <Tab.Navigator tabBar={props => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="TaskList" component={TaskListScreen} />
    <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
  </Tab.Navigator>
);

// ==========================================
// 2. BUSINESS TAB NAVIGATOR (Indigo)
// ==========================================
const BusHomeIcon = ({ color }) => <Feather name="home" size={24} color={color} />;
const BusCouponIcon = ({ color }) => <Feather name="tag" size={24} color={color} />;
const BusVerifyIcon = ({ color }) => <Feather name="clock" size={24} color={color} />;
const BUS_ICONS = [BusHomeIcon, BusCouponIcon, BusVerifyIcon];

const BusTabIcon = ({ IconComponent, isFocused, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => Animated.spring(scale, { toValue: 1.2, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => { Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start(); onPress(); };
  
  return (
    <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={tb.busTabItem}>
      <Animated.View style={[tb.busIconWrap, isFocused && tb.busIconWrapActive, { transform: [{ scale }] }]}>
        <IconComponent color={isFocused ? '#FFFFFF' : '#475569'} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const BusinessTabBar = ({ state, navigation }) => {
  const tabs = [{ name: 'BusHome' }, { name: 'BusCoupons' }, { name: 'BusVerify' }];
  return (
    <View style={tb.wrapper}>
      <View style={tb.busBar}>
        {tabs.map((tab, i) => <BusTabIcon key={tab.name} IconComponent={BUS_ICONS[i]} isFocused={state.index === i} onPress={() => navigation.navigate(tab.name)} />)}
      </View>
    </View>
  );
};

const BusinessTabNavigator = () => (
  <Tab.Navigator tabBar={props => <BusinessTabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="BusHome" component={BusinessDashboardScreen} />
    <Tab.Screen name="BusCoupons" component={BusinessCouponsScreen} />
    <Tab.Screen name="BusVerify" component={BusinessVerifyScreen} />
  </Tab.Navigator>
);


// ==========================================
// 3. MAIN APP STACK (Roots)
// ==========================================
const MainApp = () => {
  const { sidebarOpen, setSidebarOpen, businessSidebarOpen, setBusinessSidebarOpen } = useApp();
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="AuthForgotPassword" component={AuthForgotPasswordScreen} />
          <Stack.Screen name="AuthResetPassword" component={AuthResetPasswordScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
          <Stack.Screen name="ProfileForgotPassword" component={ProfileForgotPasswordScreen} />
          <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
          <Stack.Screen name="DiscountCenter" component={DiscountCenterScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="BusinessRegister" component={BusinessRegisterScreen} />
          <Stack.Screen name="BusinessLogin" component={BusinessLoginScreen} />
          <Stack.Screen name="BusinessForgotPassword" component={BusinessForgotPasswordScreen} />
          <Stack.Screen name="BusinessResetPassword" component={BusinessResetPasswordScreen} />
          <Stack.Screen name="BusinessSelectAccount" component={BusinessSelectAccountScreen} />
          <Stack.Screen name="AddNewBusiness" component={AddNewBusinessScreen} />
          <Stack.Screen name="BusinessNotifications" component={BusinessNotificationsScreen} />
          <Stack.Screen name="BusinessStore" component={BusinessStoreScreen} />
          <Stack.Screen name="BusinessTransaction" component={BusinessTransactionScreen} />
          <Stack.Screen name="BusinessTabs" component={BusinessTabNavigator} />
          <Stack.Screen name="BusinessSupport" component={BusinessSupportScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <BusinessSidebar visible={businessSidebarOpen} onClose={() => setBusinessSidebarOpen(false)} />
    </View>
  );
};

export default function App() {
  return <AppProvider><ToastProvider><MainApp /></ToastProvider></AppProvider>;
}

// ==========================================
// 4. STYLES
// ==========================================
const tb = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center', zIndex: 10, elevation: 10 },
  
  // Personal Tab Styles (Green)
  bar: { flexDirection: 'row', backgroundColor: '#EFFFFA', borderRadius: 40, paddingVertical: 10, paddingHorizontal: 16, gap: 8, shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12, alignItems: 'center' },
  tabItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  iconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  iconWrapActive: { backgroundColor: '#10B981', shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  
  // Business Tab Styles (Indigo)
  busBar: { flexDirection: 'row', backgroundColor: '#EEF2FF', borderRadius: 40, paddingVertical: 8, paddingHorizontal: 16, gap: 16, alignItems: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 },
  busTabItem: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  busIconWrap: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  busIconWrapActive: { backgroundColor: '#4338CA', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
});