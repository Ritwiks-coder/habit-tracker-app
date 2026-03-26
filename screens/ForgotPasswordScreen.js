import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert 
} from 'react-native';
// Note: SafeAreaView is perfectly imported right here!
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  background: '#F8F9FA',
  primary: '#10B981', 
  textDark: '#1E293B',
  textLight: '#64748B',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  iconBg: '#ECFDF5', 
};

export default function ProfileForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) inputs.current[index + 1].focus();
  };

  const handleSave = () => {
    // Basic check to make sure OTP is fully entered
    if (otp.join('').length < 6) {
      Alert.alert("Incomplete", "Please enter the full 6-digit OTP.");
      return;
    }
    // Navigate to the clean NewPassword screen we built earlier
    navigation.navigate('NewPassword');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forget Password</Text>
          </View>

          <View style={styles.content}>
            
            {/* Refresh Icon Badge */}
            <View style={styles.iconContainer}>
              <Feather name="refresh-ccw" size={24} color={COLORS.primary} />
            </View>

            {/* Titles */}
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you an OTP to reset your password.
            </Text>

            {/* Email Input */}
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="name@company.com"
                placeholderTextColor={COLORS.textLight}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* OTP Section Header & Button */}
            <View style={styles.otpHeaderRow}>
              <Text style={styles.label}>OTP</Text>
              <TouchableOpacity style={styles.getOtpBtn} onPress={() => Alert.alert("OTP Sent!")}>
                <Text style={styles.getOtpText}>Get OTP</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Boxes */}
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

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Confirm</Text>
            </TouchableOpacity>

            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backToLoginButton}
              onPress={() => navigation.goBack()} 
            >
              <Feather name="arrow-left" size={16} color={COLORS.textLight} style={styles.backArrow} />
              <Text style={styles.backToLoginText}>Back to Profile</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  getOtpBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  getOtpText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    backgroundColor: COLORS.cardBg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backToLoginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginBottom: 20,
  },
  backArrow: {
    marginRight: 8,
  },
  backToLoginText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});