import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context'; 

import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useToast } from '../context/ToastContext';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { showToast } = useToast();

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Missing Info", "Please fill out all fields.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mismatch", "Your new passwords do not match.", "error");
      return;
    }

    showToast("Password Updated!", "Your password has been changed.", "success");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="chevron-left" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 28 }} />
          </View>

          <View style={styles.content}>
            
            <View style={styles.currentPasswordGroup}>
              <AppInput 
                label="Current Password" 
                placeholder="Enter current password" 
                secure={true}
                value={currentPassword} 
                onChangeText={setCurrentPassword} 
              />
              <TouchableOpacity 
                style={styles.forgotBtn}
                onPress={() => navigation.navigate('ProfileForgotPassword')}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputWrapper}>
              <AppInput 
                label="New Password" 
                placeholder="At least 8 characters" 
                secure={true}
                value={newPassword} 
                onChangeText={setNewPassword} 
              />
            </View>

            <View style={styles.inputWrapper}>
              <AppInput 
                label="Confirm New Password" 
                placeholder="Type new password again" 
                secure={true}
                value={confirmPassword} 
                onChangeText={setConfirmPassword} 
              />
            </View>

            <View style={styles.btnWrapper}>
              <AppButton 
                title="Save New Password" 
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
    backgroundColor: '#F8F9FA'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
    paddingTop: 10,
  },
  inputWrapper: {
    marginBottom: 20, 
  },
  currentPasswordGroup: {
    marginBottom: 20,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginTop: 4, 
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981', 
  },
  btnWrapper: {
    marginTop: 12, 
    marginBottom: 40 
  }
});