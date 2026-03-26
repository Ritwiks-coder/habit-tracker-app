import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import AuthLayout from '../components/AuthLayout';
import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import Svg, { Path } from 'react-native-svg';
import { useToast } from '../context/ToastContext';

const GoogleIcon = () => ( <Svg width="24" height="24" viewBox="0 0 24 24"><Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></Svg> );
const AppleIcon = () => ( <Svg width="24" height="24" viewBox="0 0 24 24"><Path fill="#000" d="M16.36 10.42c-.03-2.61 2.13-3.88 2.23-3.94-1.22-1.78-3.11-2.03-3.78-2.06-1.6-.16-3.13.94-3.95.94-.82 0-2.08-1-3.41-.97-1.73.03-3.32 1.01-4.2 2.56-1.79 3.1-.46 7.68 1.28 10.18.85 1.23 1.86 2.62 3.19 2.57 1.27-.06 1.77-.83 3.31-.83 1.54 0 2.01.83 3.33.8.1.01 2.21-2.48 3.06-3.71-.98-.56-2.06-1.63-2.06-3.34zM13.67 4.54c.71-.85 1.19-2.03 1.06-3.21-1.01.04-2.24.67-2.97 1.53-.65.76-1.2 1.97-1.04 3.12 1.12.08 2.24-.59 2.95-1.44z"/></Svg> );
const FacebookIcon = () => ( <Svg width="24" height="24" viewBox="0 0 24 24"><Path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.03 1.81-4.7 4.58-4.7 1.31 0 2.69.24 2.69.24v2.96h-1.5c-1.5 0-1.96.93-1.96 1.89v2.27h3.32l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/><Path fill="#FFF" d="M15.53 15.56l.53-3.49h-3.32V9.8c0-.96.47-1.89 1.96-1.89h1.5V4.95s-1.37-.24-2.69-.24c-2.77 0-4.58 1.67-4.58 4.7v2.72H7.08v3.49h3.04V24c.61.1 1.24.15 1.88.15s1.27-.05 1.88-.15v-8.44h3.65z"/></Svg> );

export default function AuthForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);
  const { showToast } = useToast();

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1].focus();
  };

  return (
    <AuthLayout
      title="Forget Password?"
      subtitle="No worries! Enter your email and we'll send a reset link."
      character={require('../assets/reset-char.png')} 
    >
      <AppInput label="Gmail" placeholder="e.g. Taskmaster69@gmail.com" value={email} onChangeText={setEmail} />

      <TouchableOpacity style={styles.getOtpBtn} onPress={() => showToast("OTP Sent!", "Check your email inbox.", "info")}>
        <Text style={styles.getOtpText}>Get OTP</Text>
      </TouchableOpacity>

      <Text style={styles.otpLabel}>OTP</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            ref={(ref) => inputs.current[index] = ref}
          />
        ))}
      </View>

      <View style={{ marginTop: 24 }}>
        <AppButton 
          title="Confirm" 
          onPress={() => {
            if (otp.join('').length === 6) {
              // NO TOAST HERE! Just instantly navigate!
              navigation.navigate('AuthResetPassword');
            } else {
              showToast("Required", "Please enter the full 6-digit OTP.", "warning");
            }
          }} 
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.line} /><Text style={styles.or}>Or continue with</Text><View style={styles.line} />
      </View>

      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialBtn}><GoogleIcon /></TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}><AppleIcon /></TouchableOpacity>
        <TouchableOpacity style={styles.socialBtn}><FacebookIcon /></TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  getOtpBtn: { alignSelf: 'flex-end', backgroundColor: '#10B981', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 12, marginTop: 4, marginBottom: 16 },
  getOtpText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  otpLabel: { fontSize: 14, color: '#374151', fontWeight: '500', marginBottom: 8 },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  otpBox: { width: 48, height: 56, borderWidth: 1, borderColor: '#A7F3D0', borderRadius: 12, textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#1F2937', backgroundColor: '#F9FAFB' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#D1FAE5' },
  or: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  socialContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 20 },
  socialBtn: { width: 60, height: 48, backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#D1FAE5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});