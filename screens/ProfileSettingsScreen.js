import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useToast } from '../context/ToastContext';

export default function ProfileSettingsScreen({ navigation }) {
  const [name, setName] = useState('Ritik Gaikwad');
  const [email, setEmail] = useState('ritik.gaikwad@example.com');

  const { showToast } = useToast();

  const handleSave = () => {
    showToast("Profile Updated", "Your changes have been saved.", "success");
    navigation.goBack();
  };

  return (
    // Changed background to #F8F9FA to perfectly match ChangePasswordScreen
    <SafeAreaView style={styles.rootContainer} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.bodyContainer} contentContainerStyle={styles.scrollContent}>
          
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image 
                source={require('../assets/profile-icon.png')} 
                style={styles.avatarImage} 
                resizeMode="cover"
              />
              <View style={styles.editBadge}>
                <Feather name="edit-2" size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.profileName}>Ritik Gaikwad</Text>
            <Text style={styles.profileSubtitle}>Personal Account</Text>

            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Personal Information Section */}
          <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>
          
          <View style={styles.inputWrapper}>
            <AppInput 
              label="Full Name" 
              placeholder="Enter your name"
              value={name} 
              onChangeText={setName} 
              icon="user" // Added in case your AppInput supports left icons!
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <AppInput 
              label="Email Address" 
              placeholder="Enter your email"
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address"
              icon="mail"
            />
          </View>

          {/* Security Section */}
          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>SECURITY</Text>
          
          <TouchableOpacity 
            style={styles.securityBox}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.7}
          >
            <View style={styles.securityLeft}>
              <Feather name="lock" size={20} color="#9CA3AF" style={styles.securityIcon} />
              <Text style={styles.securityText}>Change Password</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Save Button */}
          <View style={{ marginTop: 40, marginBottom: 30 }}>
            <AppButton 
              title="Save Changes" 
              onPress={handleSave} 
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // BOTH containers are now #F8F9FA so the AppInputs blend perfectly just like the other screens
  rootContainer: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  backButton: { 
    marginRight: 12,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1F2937' 
  },
  bodyContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA', 
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 40, 
  },
  
  // --- Avatar Styles ---
  avatarSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E5E7EB', 
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 4,
    backgroundColor: '#10B981',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 16,
  },
  changePhotoBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // --- Form Styles ---
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  inputWrapper: {
    marginBottom: 20, 
  },
  
  // --- Security Box (Matches AppInput Style) ---
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A7F3D0', // Updated border to match AppInput active styling slightly better
    borderRadius: 12,       
    height: 56,             
    paddingHorizontal: 16,
  },
  securityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIcon: {
    marginRight: 12,
  },
  securityText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});