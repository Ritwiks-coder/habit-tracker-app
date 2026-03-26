import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'; 

import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useToast } from '../context/ToastContext';

export default function NewPasswordScreen({ navigation }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { showToast } = useToast();

  // Dynamic validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);

  const handleSave = () => {
    // 1. Check if empty
    if (!newPassword || !confirmPassword) {
      showToast("Missing Info", "Please fill out all fields.", "error");
      return;
    }
    // 2. Check if they match
    if (newPassword !== confirmPassword) {
      showToast("Mismatch", "Your passwords do not match.", "error");
      return;
    }
    // 3. Check if all requirements are met
    if (!hasMinLength || !hasUppercase || !hasNumber) {
      showToast("Requirement", "Please meet all password requirements.", "warning");
      return;
    }

    // Success!
    showToast("Success!", "Your new password has been set.", "success");
    navigation.navigate('ProfileSettings'); 
  };

  // Reusable component for the checklist rows
  const CheckRow = ({ label, isMet }) => (
    <View style={styles.checkRow}>
      <Text style={[styles.tick, { color: isMet ? '#10B981' : '#D1D5DB' }]}>✓</Text>
      <Text style={[styles.checkText, { color: isMet ? '#10B981' : '#4B5563' }]}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Password</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Form Content */}
          <View style={styles.content}>
            
            <Text style={styles.subtitle}>
              Your new password must be different from previous used passwords.
            </Text>
            
            <View style={styles.inputWrapper}>
              <AppInput 
                label="New Password" 
                placeholder="At least 8 characters" 
                secure={true}
                value={newPassword} 
                onChangeText={setNewPassword}
                icon="lock"
              />
            </View>

            <View style={styles.inputWrapper}>
              <AppInput 
                label="Confirm Password" 
                placeholder="Type new password again" 
                secure={true}
                value={confirmPassword} 
                onChangeText={setConfirmPassword}
                icon="lock"
              />
            </View>

            {/* --- THE DYNAMIC CHECKLIST --- */}
            <View style={styles.checksContainer}>
              <CheckRow label="At least 8 characters" isMet={hasMinLength} />
              <CheckRow label="1 Uppercase letter" isMet={hasUppercase} />
              <CheckRow label="1 Number" isMet={hasNumber} />
            </View>

            <View style={styles.btnWrapper}>
              <AppButton 
                title="Update Password" 
                onPress={handleSave} 
              />
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF'
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: { 
    padding: 4, 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  content: { 
    paddingHorizontal: 24, 
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputWrapper: {
    marginBottom: 16, // Slightly reduced to fit the checklist nicely
  },
  // --- Checklist Styles ---
  checksContainer: { 
    marginTop: 8, 
    marginBottom: 16,
    gap: 10 
  },
  checkRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  tick: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginRight: 10 
  },
  checkText: { 
    fontSize: 15,
    fontWeight: '500'
  },
  // -------------------------
  btnWrapper: {
    marginTop: 16, 
    marginBottom: 40 
  }
});