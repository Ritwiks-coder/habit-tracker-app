import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5, AntDesign } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function BusinessResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation Logic
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  const handleConfirm = () => {
    if (hasMinLength && hasUppercase && hasNumber) {
      // Success! Send them to login or dashboard
      navigation.navigate('BusinessLogin');
    }
  };

  const CheckItem = ({ text, isValid }) => (
    <View style={s.checkRow}>
      <Feather name="check" size={18} color={isValid ? '#4338CA' : '#CBD5E1'} />
      <Text style={[s.checkText, isValid && s.checkTextValid]}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="chevron-left" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Reset Password</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={s.content}>
          
          {/* New Password Input */}
          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>New Password</Text>
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

          {/* Validation Checklist */}
          <View style={s.checklist}>
            <CheckItem text="At least 8 characters" isValid={hasMinLength} />
            <CheckItem text="1 Uppercase letter" isValid={hasUppercase} />
            <CheckItem text="1 Number" isValid={hasNumber} />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            style={[s.confirmBtn, !(hasMinLength && hasUppercase && hasNumber) && s.confirmBtnDisabled]} 
            onPress={handleConfirm} 
            activeOpacity={0.85}
          >
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
  
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 15, color: '#1E293B', height: '100%' },
  eyeIcon: { padding: 8, marginRight: -8 },

  checklist: { marginBottom: 40, gap: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  checkTextValid: { color: '#1E293B' }, // Darkens when valid

  confirmBtn: { backgroundColor: '#4338CA', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 40 },
  confirmBtnDisabled: { backgroundColor: '#94A3B8', shadowOpacity: 0 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { marginHorizontal: 12, fontSize: 13, color: '#94A3B8', fontWeight: '500' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialBtn: { width: 64, height: 56, borderRadius: 16, backgroundColor: '#E0E7FF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#C7D2FE' }
});