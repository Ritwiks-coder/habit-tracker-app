import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BusinessForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance to next input
    if (text && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleConfirm = () => {
    // Navigate to the Reset Password screen
    navigation.navigate('BusinessResetPassword');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="chevron-left" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Forget Password</Text>
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

          {/* OTP Section */}
          <View style={s.otpSectionHeader}>
            <Text style={s.inputLabel}>OTP</Text>
            <TouchableOpacity style={s.getOtpBtn}>
              <Text style={s.getOtpText}>Get OTP</Text>
            </TouchableOpacity>
          </View>

          <View style={s.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                style={s.otpBox}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
              />
            ))}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
            <Text style={s.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>Or continue with</Text>
            <View style={s.dividerLine} />
          </View>

          {/* SOCIAL LOGIN BUTTONS */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}><AntDesign name="google" size={22} color="#DB4437" /></TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}><AntDesign name="apple1" size={22} color="#FFFFFF" /></TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}><FontAwesome5 name="facebook" size={22} color="#1877F2" /></TouchableOpacity>
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
  
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', height: '100%' },

  otpSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  getOtpBtn: { backgroundColor: '#4338CA', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  getOtpText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  otpBox: { width: 45, height: 56, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#1E293B' },

  confirmBtn: { backgroundColor: '#4338CA', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 40 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialBtn: { width: 64, height: 56, borderRadius: 16, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C7D2FE' }
});