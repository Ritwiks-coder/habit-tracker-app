import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Dimensions, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5, AntDesign } from '@expo/vector-icons';
import { GoogleIcon, AppleIcon, FacebookIcon } from '../components/SocialButtons';
import { auth } from '../services/firebaseSetup';

const { width } = Dimensions.get('window');

export default function BusinessLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log('User UID:', userCredential.user.uid);
      navigation.navigate('BusinessSelectAccount');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      console.log('User UID:', userCredential.user.uid);
      Alert.alert("Success", "Account created!");
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.container}
      >
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="chevron-left" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Log-in</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={s.content}>

          {/* Email Input */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Gmail</Text>
            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                placeholder="e.g. Taskmaster@123gmail.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>Password</Text>
            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                placeholder="At least 8 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeIcon}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity style={s.forgotWrap} onPress={() => navigation.navigate('BusinessForgotPassword')}>
            <Text style={s.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* LOGIN BUTTON */}
          <TouchableOpacity style={s.loginBtn} onPress={handleSignIn} activeOpacity={0.85}>
            <Text style={s.loginBtnText}>Log-in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignUp} style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ fontSize: 14, color: '#64748B' }}>
              Don't have an account? <Text style={{ color: '#4338CA', fontWeight: '700' }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>Or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Social Login Row - Business Theme */}
          <View style={s.socialContainer}>
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
              <GoogleIcon width={24} height={24} />
            </TouchableOpacity>
            
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
              <AppleIcon width={24} height={24} />
            </TouchableOpacity>
            
            <TouchableOpacity style={s.socialBtn} activeOpacity={0.7}>
              <FacebookIcon width={24} height={24} />
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B' },

  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', height: '100%' },
  eyeIcon: { padding: 8, marginRight: -8 },

  forgotWrap: { alignSelf: 'flex-end', marginBottom: 32 },
  forgotText: { fontSize: 14, fontWeight: '700', color: '#334155' },

  loginBtn: { backgroundColor: '#4338CA', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 40 },
  loginBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#94A3B8', fontWeight: '500' },

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  }
});