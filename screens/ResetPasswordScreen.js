import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AuthLayout from '../components/AuthLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';

// 1. Import your Toast Hook
import { useToast } from '../context/ToastContext';

export default function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  
  // 2. Initialize the Toast
  const { showToast } = useToast();

  // Dynamic validation checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const CheckRow = ({ label, isMet }) => (
    <View style={s.checkRow}>
      <Text style={[s.tick, { color: isMet ? '#10B981' : '#D1D5DB' }]}>✓</Text>
      <Text style={[s.checkText, { color: isMet ? '#10B981' : '#4B5563' }]}>{label}</Text>
    </View>
  );

  return (
    <AuthLayout
      title="Reset Password?"
      subtitle="Use at least 8 characters—longer is stronger!"
      character={require('../assets/forgot-char.png')} 
    >
      <AppInput
        label="New Password"
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

      <View style={{ marginTop: 24 }}>
        <AppButton
          title="Update Password"
          onPress={() => {
            if (hasMinLength && hasUppercase && hasNumber) {
              
              // YOUR NEW TEXT IS HERE!
              showToast("Password Updated!", "Your password has been changed.", "success");
              
              navigation.navigate('Main'); 
            } else {
              showToast("Almost there", "Please meet all password requirements.", "warning");
            }
          }}
        />
      </View>

      <View style={s.divider}>
        <View style={s.line} />
        <Text style={s.or}>Or</Text>
        <View style={s.line} />
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Main')} 
        style={s.skipButtonWrap}
      >
        <Text style={s.skipText}>I'll do it later</Text>
      </TouchableOpacity>
    </AuthLayout>
  );
}

const s = StyleSheet.create({
  checks: { marginTop: 8, gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center' },
  tick: { fontSize: 16, fontWeight: '700', marginRight: 10 },
  checkText: { fontSize: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#D1FAE5' },
  or: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  skipButtonWrap: { paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 16, color: '#4B5563', fontWeight: '600' },
});