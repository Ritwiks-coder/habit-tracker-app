import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import AuthLayout from '../components/AuthLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import SocialButtons from '../components/SocialButtons';
import { useToast } from '../context/ToastContext';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// ✅ Leaderboard Time Helpers
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

// ✅ Code Generator Helper (e.g., RITI8492)
const generateReferralCode = (name) => {
  const prefix = name.substring(0, 4).toUpperCase().padEnd(4, 'X');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${suffix}`;
};

const CheckRow = ({ label, isMet }) => (
  <View style={s.checkRow}>
    <Text style={[s.tick, { color: isMet ? '#10B981' : '#D1D5DB' }]}>✓</Text>
    <Text style={[s.checkText, { color: isMet ? '#10B981' : '#4B5563' }]}>{label}</Text>
  </View>
);

const SignUpScreen = ({ navigation }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enteredReferral, setEnteredReferral] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleSignUp = async () => {
    if (!email || !password) {
      showToast('Error', 'Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create User in Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // 2. Extract Name & Generate Unique Code
      const extractedName = email.split('@')[0];
      const myReferralCode = generateReferralCode(extractedName);

      // 3. Build the Base Database Profile
      const defaultProfile = {
        role: 'personal',
        displayName: extractedName,
        email: email.toLowerCase(),
        avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        needsProfileUpdate: true,
        totalPoints: 0, // Starts at 0, might change to 50 if referral is valid
        ghostMode: false,
        weeklyTasksCompleted: 0,
        monthlyTasksCompleted: 0,
        currentWeekId: getWeekId(),
        currentMonthId: getMonthId(),
        createdAt: firestore.FieldValue.serverTimestamp(),
        // NEW REFERRAL FIELDS:
        referralCode: myReferralCode,
        referredBy: enteredReferral || null,
        friends: [],
      };

      // 4. Initialize Firestore Batch for the "Handshake"
      const batch = firestore().batch();
      const newUserRef = firestore().collection('users').doc(userId);

      let referralSuccessMessage = 'Account created successfully!';

      // 5. If they entered a code, process the Handshake
      if (enteredReferral) {
        const inviterQuery = await firestore().collection('users').where('referralCode', '==', enteredReferral).get();

        if (!inviterQuery.empty) {
          const inviterDoc = inviterQuery.docs[0];
          const inviterRef = inviterDoc.ref;

          // Reward New User: 50 points + connect as friend
          defaultProfile.totalPoints = 50;
          defaultProfile.friends = [inviterDoc.id];

          // Reward Inviter: 100 points + connect as friend
          batch.update(inviterRef, {
            totalPoints: firestore.FieldValue.increment(100),
            friends: firestore.FieldValue.arrayUnion(userId)
          });

          referralSuccessMessage = 'Account created! 50 Bonus Points added! 🚀';
        } else {
          // If code is invalid, just clear it and continue normal signup
          defaultProfile.referredBy = null;
          Toast.show({ type: 'info', text1: 'Note', text2: 'Referral code invalid, but account was created.' });
        }
      }

      // 6. Commit the data (saves new user + updates inviter at the same time)
      batch.set(newUserRef, defaultProfile);
      await batch.commit();

      Toast.show({ type: 'success', text1: 'Success', text2: referralSuccessMessage });

    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        showToast('Account Exists', 'Account already exists. Enter password to login.', 'info', 3000);
        setTimeout(() => {
          navigation.navigate('Login', { prefillEmail: email });
        }, 1500);
      } else {
        let friendlyMessage = "An unexpected error occurred. Please try again.";
        // ... switch or toast remains here
        showToast('Error', friendlyMessage, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    showToast('Coming Soon', `${provider} login will be available in the next update.`, 'info');
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

      {/* ✅ NEW REFERRAL INPUT ADDED HERE */}
      <AppInput
        label="Referral Code (Optional)"
        placeholder="e.g. RITI1234"
        value={enteredReferral}
        onChangeText={(text) => setEnteredReferral(text.toUpperCase())} // Forces uppercase
        autoCapitalize="characters"
        autoCorrect={false}
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

      <SocialButtons 
        onGooglePress={() => handleSocialLogin('Google')}
        onApplePress={() => handleSocialLogin('Apple')}
        onFacebookPress={() => handleSocialLogin('Facebook')}
      />
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