import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Image, KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';
import { useApp } from '../context/AppContext';

export default function BusinessStoreScreen({ navigation }) {
  const { showToast } = useToast();
  const { businessProfile, setBusinessProfile } = useApp();

  const [storeName, setStoreName] = useState(businessProfile?.name || '');
  const [category, setCategory] = useState(businessProfile?.category || '');
  const [phone, setPhone] = useState(businessProfile?.phone || '');
  const [address, setAddress] = useState(businessProfile?.address || '');
  const [description, setDescription] = useState(businessProfile?.description || '');
  const [website, setWebsite] = useState(businessProfile?.website || '');
  
  useEffect(() => {
    if (businessProfile) {
      setStoreName(businessProfile.name || '');
      setCategory(businessProfile.category || '');
      setPhone(businessProfile.phone || '');
      setAddress(businessProfile.address || '');
      setDescription(businessProfile.description || '');
      setWebsite(businessProfile.website || '');
    }
  }, [businessProfile]);

  const handleSave = () => {
    Keyboard.dismiss();
    
    if (!storeName || !address) {
      showToast("Missing Info", "Store Name and Address are required.", "error");
      return;
    }

    setBusinessProfile(prev => ({
      ...prev,
      name: storeName,
      category,
      phone,
      address,
      description,
      website
    }));
    showToast("Profile Updated", "Your store details have been saved successfully.", "success");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Store Profile</Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Text style={s.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.imageSection}>
            <View style={s.coverPhotoWrap}>
              <Image 
                source={{ uri: businessProfile?.coverPhoto || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop' }} 
                style={s.coverPhoto} 
              />
              <TouchableOpacity style={s.editCoverBtn} activeOpacity={0.8}>
                <Feather name="camera" size={16} color="#1E293B" />
                <Text style={s.editCoverText}>Edit Cover</Text>
              </TouchableOpacity>
            </View>
            <View style={s.logoWrap}>
              <Image 
                source={{ uri: businessProfile?.logo || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop' }} 
                style={s.logoImage} 
              />
              <TouchableOpacity style={s.editLogoBtn} activeOpacity={0.9}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={s.formSection}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>STORE NAME</Text>
              <TextInput 
                style={s.input} 
                value={storeName} 
                onChangeText={setStoreName}
                placeholder="Enter store name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>CATEGORY</Text>
              <TextInput 
                style={s.input} 
                value={category} 
                onChangeText={setCategory}
                placeholder="e.g. Cafe, Retail, Fitness"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>DESCRIPTION</Text>
              <TextInput 
                style={[s.input, s.textArea]} 
                value={description} 
                onChangeText={setDescription}
                placeholder="Tell customers about your business..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <View style={s.divider} />
            <Text style={s.sectionSubtitle}>Contact & Location</Text>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>ADDRESS</Text>
              <View style={s.iconInputWrap}>
                <Feather name="map-pin" size={18} color="#64748B" style={s.inputIcon} />
                <TextInput 
                  style={s.iconInput} 
                  value={address} 
                  onChangeText={setAddress}
                  placeholder="Street address"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>
            <View style={s.rowInputs}>
              <View style={[s.inputGroup, { flex: 1 }]}>
                <Text style={s.inputLabel}>PHONE</Text>
                <View style={s.iconInputWrap}>
                  <Feather name="phone" size={18} color="#64748B" style={s.inputIcon} />
                  <TextInput 
                    style={s.iconInput} 
                    value={phone} 
                    onChangeText={setPhone}
                    placeholder="Phone number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>WEBSITE</Text>
              <View style={s.iconInputWrap}>
                <Feather name="globe" size={18} color="#64748B" style={s.inputIcon} />
                <TextInput 
                  style={s.iconInput} 
                  value={website} 
                  onChangeText={setWebsite}
                  placeholder="www.yourstore.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>
          <TouchableOpacity style={s.bottomSaveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={s.bottomSaveText}>Save Changes</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#FFFFFF', zIndex: 10 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#4F46E5' },
  scrollContent: { paddingBottom: 40 },
  imageSection: { marginBottom: 40 },
  coverPhotoWrap: { width: '100%', height: 160, position: 'relative' },
  coverPhoto: { width: '100%', height: '100%', backgroundColor: '#E2E8F0' },
  editCoverBtn: { position: 'absolute', bottom: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  editCoverText: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginLeft: 6 },
  logoWrap: { position: 'absolute', bottom: -30, left: 24, width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFFFFF', padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  logoImage: { width: '100%', height: '100%', borderRadius: 40 },
  editLogoBtn: { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: '#4F46E5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  formSection: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#F1F5F9' },
  textArea: { height: 100, paddingTop: 16 },
  rowInputs: { flexDirection: 'row', gap: 16 },
  iconInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, height: 52, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  inputIcon: { marginRight: 12 },
  iconInput: { flex: 1, fontSize: 15, color: '#1E293B' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8, marginBottom: 24 },
  sectionSubtitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 20 },
  bottomSaveBtn: { marginHorizontal: 24, marginTop: 12, backgroundColor: '#4F46E5', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  bottomSaveText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});