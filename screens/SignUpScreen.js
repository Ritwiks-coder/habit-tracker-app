import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import AuthLayout from '../components/AuthLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import SocialButtons from '../components/SocialButtons';

// ✅ 1. Cleaned up Firebase Imports (Only need these two!)
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// ✅ 2. Leaderboard Time Helpers
const getWeekId = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

const getMonthId = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const CheckRow = ({ label, isMet }) => (
  <View style={s.checkRow}>
    <Text style={[s.tick, { color: isMet ? '#10B981' : '#D1D5DB' }]}>✓</Text>
    <Text style={[s.checkText, { color: isMet ? '#10B981' : '#4B5563' }]}>{label}</Text>
  </View>
);

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleSignUp = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create User in Auth (Using the correct React Native format)
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;
      
      // 2. Extract Name (everything before the @)
      const extractedName = email.split('@')[0];

      // 3. Build the Database Profile
      const defaultProfile = {
        role: 'personal',
        displayName: extractedName,
        email: email.toLowerCase(),
        avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        needsProfileUpdate: true, // Triggers the red dot in your UI
        totalPoints: 0,
        ghostMode: false,
        weeklyTasksCompleted: 0,
        monthlyTasksCompleted: 0,
        currentWeekId: getWeekId(),
        currentMonthId: getMonthId(),
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      // 4. Save to Firestore
      await firestore().collection('users').doc(userId).set(defaultProfile);

      Toast.show({ type: 'success', text1: 'Success', text2: 'Account created successfully!' });
      
      // App.js listener takes over from here and auto-routes the user to the Home screen!

    } catch (error) {
      let friendlyMessage = "An unexpected error occurred. Please try again.";
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyMessage = "Incorrect email or password.";
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = "This email is already registered. Try logging in.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "Please enter a valid email address.";
          break;
        case 'auth/network-request-failed':
          friendlyMessage = "Network error. Check your internet connection.";
          break;
      }
      Toast.show({ type: 'error', text1: 'Error', text2: friendlyMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="join us and start tracking"
      character={require('../assets/login-char.png')}
    >
      <AppInput
        label="Email"
        placeholder="e.g. hello@example.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <AppInput
        label="Password"
        placeholder="At least 8 characters"
        secure
        value={password}
        onChangeText={setPassword}
      />

      <View style={s.checks}>
        <CheckRow label="At least 8 characters" isMet={hasMinLength} />
        <CheckRow label="1 Uppercase letter" isMet={hasUppercase} />
        <CheckRow label="1 Number" isMet={hasNumber} />
      </View>

      <AppButton 
        title={isLoading ? "Creating..." : "Sign Up"} 
        onPress={handleSignUp} 
        disabled={!isPasswordValid || !email || isLoading} 
        loading={isLoading}
      />

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 14, color: '#6B7280' }}>
          Already have an account? <Text style={{ color: '#10B981', fontWeight: '700' }}>Sign In</Text>
        </Text>
      </TouchableOpacity>

      <SocialButtons />
    </AuthLayout>
  );
};

export default SignUpScreen;

const s = StyleSheet.create({
  checks: { marginTop: 8, marginBottom: 20, gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center' },
  tick: { fontSize: 16, fontWeight: '700', marginRight: 10 },
  checkText: { fontSize: 15 },
});