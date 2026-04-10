import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, 
  Platform, ScrollView, StatusBar, Image, ActivityIndicator, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppInput from '../components/AppInput';
import AppButton from '../components/AppButton';
import { useToast } from '../context/ToastContext';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export default function ProfileSettingsScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
  
  // New State for Demographic Data
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { showToast } = useToast();

  const genderOptions = ['Male', 'Female', 'Other'];
  const ageOptions = ['Under 18', '18-29', '30-49', '50+'];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          setEmail(currentUser.email); 
          
          const userDoc = await firestore().collection('users').doc(currentUser.uid).get();
          
          if (userDoc.exists) {
            const data = userDoc.data() || {};
            setName(data.displayName || currentUser.email.split('@')[0]);
            if (data.avatar) setAvatarUrl(data.avatar);
            
            // Fetch demographic data if it exists
            if (data.gender) setGender(data.gender);
            if (data.age) setAge(data.age);
          } else {
            setName(currentUser.email.split('@')[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        showToast("Error", "Could not load profile data.", "error");
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      showToast("Required", "Please enter a valid name.", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore().collection('users').doc(currentUser.uid).set({
          displayName: name,
          email: currentUser.email.toLowerCase(),
          role: 'personal',
          needsProfileUpdate: false,
          // Save demographic data to trigger accurate Sassy Mode roasts
          gender: gender,
          age: age,
        }, { merge: true });
        
        showToast("Success", "Profile updated successfully!", "success");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Error", "Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert(
      "Coming Soon", 
      "Image uploading requires Firebase Storage integration. We will set this up later!"
    );
  };

  if (isFetching) {
    return (
      <View style={[styles.rootContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
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
                source={{ uri: avatarUrl }} 
                style={styles.avatarImage} 
                resizeMode="cover"
              />
              <View style={styles.editBadge}>
                <Feather name="edit-2" size={12} color="#FFFFFF" />
              </View>
            </View>

            <Text style={styles.profileName}>{name}</Text>
            <Text style={styles.profileSubtitle}>Personal Account</Text>

            <TouchableOpacity style={styles.changePhotoBtn} onPress={handleChangePhoto}>
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
              icon="user" 
            />
          </View>
          
          <View style={styles.inputWrapper}>
            <AppInput 
              label="Email Address" 
              placeholder="Enter your email"
              value={email} 
              editable={false} 
              style={{ opacity: 0.6 }} 
              icon="mail"
            />
          </View>

          {/* Demographic Section (For Sassy Mode) */}
          <Text style={[styles.sectionLabel, { marginTop: 12 }]}>DEMOGRAPHICS</Text>
          
          {/* Gender Selection */}
          <Text style={styles.subLabel}>Gender</Text>
          <View style={styles.optionRow}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionPill, gender === option && styles.optionPillActive]}
                onPress={() => setGender(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, gender === option && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Age Selection */}
          <Text style={styles.subLabel}>Age Group</Text>
          <View style={styles.optionRow}>
            {ageOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionPill, age === option && styles.optionPillActive]}
                onPress={() => setAge(option)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, age === option && styles.optionTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Security Section */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>SECURITY</Text>
          
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
              title={isSaving ? "Saving..." : "Save Changes"} 
              onPress={handleSave} 
              disabled={isSaving}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#F8F9FA' },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  bodyContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#E5E7EB', marginBottom: 16, borderWidth: 2, borderColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  avatarImage: { width: '100%', height: '100%', borderRadius: 55 },
  editBadge: { position: 'absolute', bottom: 0, right: 4, backgroundColor: '#10B981', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  profileSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 16 },
  changePhotoBtn: { backgroundColor: '#10B981', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  changePhotoText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  subLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8, marginTop: 12 },
  inputWrapper: { marginBottom: 20 },
  
  // New Styles for Gender & Age Pills
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  optionPill: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  optionPillActive: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  optionTextActive: { color: '#10B981' },
  
  securityBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, height: 56, paddingHorizontal: 16 },
  securityLeft: { flexDirection: 'row', alignItems: 'center' },
  securityIcon: { marginRight: 12 },
  securityText: { fontSize: 16, color: '#1F2937', fontWeight: '500' },
});