import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform, Dimensions, Modal, Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 1. Added "Custom" to the categories
const CATEGORIES = [
  'Cafe / Coffee Shop',
  'Restaurant / Bar',
  'Cloud Kitchen',
  'Retail / Clothing',
  'Gym / Fitness',
  'Salon / Spa',
  'Library / Bookstore',
  'Custom'
];

export default function BusinessRegisterScreen({ navigation }) {
  const [shopName, setShopName] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [category, setCategory] = useState('');
  
  // 2. Added states for the Custom Category logic
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const handleCreateProfile = () => {
    // Navigate to the dashboard after creating the profile
    navigation.navigate('BusinessTabs');
  };

  // 3. Logic to handle "Custom" selection
  const selectCategory = (cat) => {
    if (cat === 'Custom') {
      setIsCustomCategory(true);
      setCategory(''); // Clear text so they can type
    } else {
      setIsCustomCategory(false);
      setCategory(cat);
    }
    setCategoryModalVisible(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
        
        {/* HEADER */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Feather name="chevron-left" size={28} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Set Up Your Store</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          
          {/* AVATAR UPLOAD */}
          <View style={s.avatarContainer}>
            <View style={s.avatarCircle}>
              <Feather name="home" size={40} color="#CBD5E1" />
              <TouchableOpacity style={s.cameraBadge} activeOpacity={0.8}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={s.avatarText}>Store Logo</Text>
          </View>

          {/* FORM FIELDS */}
          <View style={s.form}>
            
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Shop Name</Text>
              <TextInput
                style={s.standardInput}
                placeholder="e.g. Blue Bottle Coffee"
                placeholderTextColor="#94A3B8"
                value={shopName}
                onChangeText={setShopName}
              />
            </View>

            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Shop Address</Text>
              <TextInput
                style={s.standardInput}
                placeholder="Enter full business address"
                placeholderTextColor="#94A3B8"
                value={shopAddress}
                onChangeText={setShopAddress}
              />
            </View>

            {/* 4. CONDITIONAL CATEGORY INPUT */}
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>Business Category</Text>
              
              {isCustomCategory ? (
                // IF CUSTOM: Show the typing input with an "X" to cancel
                <View style={s.inputWrapper}>
                  <TextInput
                    style={s.flexInput}
                    placeholder="Type your custom category..."
                    placeholderTextColor="#94A3B8"
                    value={category}
                    onChangeText={setCategory}
                    autoFocus={true} // Automatically open keyboard
                  />
                  <TouchableOpacity 
                    onPress={() => {
                      setIsCustomCategory(false);
                      setCategory('');
                    }} 
                    style={s.clearIcon}
                  >
                    <Feather name="x" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
              ) : (
                // IF STANDARD: Show the dropdown button
                <TouchableOpacity style={s.dropdownInput} activeOpacity={0.7} onPress={() => setCategoryModalVisible(true)}>
                  <Text style={[s.dropdownText, !category && s.placeholderText]}>{category || 'Select a category'}</Text>
                  <Feather name="chevron-down" size={20} color="#64748B" />
                </TouchableOpacity>
              )}

            </View>

          </View>

          {/* CREATE BUTTON */}
          <TouchableOpacity style={s.createBtn} onPress={handleCreateProfile} activeOpacity={0.85}>
            <Text style={s.createBtnText}>Create Business Profile</Text>
          </TouchableOpacity>

          {/* LOGIN LINK */}
          <View style={s.footer}>
            <Text style={s.footerText}>Already have a merchant account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('BusinessLogin')}>
              <Text style={s.footerLink}>Log In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* CATEGORY BOTTOM SHEET */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCategoryModalVisible(false)} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Select Category</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat, index) => (
                <TouchableOpacity key={index} style={s.categoryOption} onPress={() => selectCategory(cat)}>
                  <Text style={[
                    s.categoryOptionText, 
                    category === cat && s.categoryOptionSelected,
                    cat === 'Custom' && { color: '#4338CA', fontWeight: '700' } // Highlight "Custom" slightly
                  ]}>
                    {cat}
                  </Text>
                  {category === cat && cat !== 'Custom' && <Feather name="check" size={20} color="#4F46E5" />}
                  {cat === 'Custom' && <Feather name="edit-2" size={16} color="#4338CA" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#F8FAFC' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  
  avatarContainer: { alignItems: 'center', marginBottom: 40 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F1F5F9', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', position: 'relative', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#4F46E5', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#F8FAFC' },
  avatarText: { marginTop: 12, fontSize: 14, color: '#475569', fontWeight: '500' },
  
  form: { marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 8 },
  
  // Standard text input
  standardInput: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 52, fontSize: 15, color: '#1E293B' },
  
  // Custom Text Box Wrapper
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#4F46E5', borderRadius: 12, paddingHorizontal: 16, height: 52 },
  flexInput: { flex: 1, fontSize: 15, color: '#1E293B', height: '100%' },
  clearIcon: { padding: 8, marginRight: -8 },

  // Dropdown Button
  dropdownInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, height: 52 },
  dropdownText: { fontSize: 15, color: '#1E293B' },
  placeholderText: { color: '#94A3B8' },
  
  createBtn: { backgroundColor: '#4338CA', borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 40 },
  createBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 14, color: '#64748B' },
  footerLink: { fontSize: 14, fontWeight: '700', color: '#4338CA' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40, maxHeight: '60%' },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  categoryOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  categoryOptionText: { fontSize: 16, color: '#475569', fontWeight: '500' },
  categoryOptionSelected: { color: '#4F46E5', fontWeight: '700' }
});