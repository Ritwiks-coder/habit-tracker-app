import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, KeyboardAvoidingView, Platform, Keyboard 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';

export default function BusinessSupportScreen({ navigation }) {
  const { showToast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = () => {
    Keyboard.dismiss();
    if (!subject || !message) {
      showToast("Missing Fields", "Please enter a subject and message.", "error");
      return;
    }
    showToast("Message Sent", "Our team will reply within 24 hours.", "success");
    setSubject('');
    setMessage('');
    setTimeout(() => navigation.goBack(), 1500);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Merchant Support</Text>
        <View style={{ width: 32 }}></View>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <View style={s.heroSection}>
            <View style={s.iconCircle}>
              <Feather name="life-buoy" size={32} color="#4F46E5" />
            </View>
            <Text style={s.heroTitle}>How can we help?</Text>
            <Text style={s.heroSub}>Reach out to our dedicated merchant success team for assistance.</Text>
          </View>
          <Text style={s.sectionTitle}>QUICK CONTACT</Text>
          <View style={s.contactRow}>
            <TouchableOpacity style={s.contactCard} activeOpacity={0.8}>
              <Feather name="mail" size={20} color="#4F46E5" />
              <Text style={s.contactText}>Email Us</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.contactCard} activeOpacity={0.8}>
              <Feather name="phone-call" size={20} color="#4F46E5" />
              <Text style={s.contactText}>Call Us</Text>
            </TouchableOpacity>
          </View>
          <View style={s.divider}></View>
          <Text style={s.sectionTitle}>SEND A MESSAGE</Text>
          <View style={s.formSection}>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>SUBJECT</Text>
              <TextInput 
                style={s.input} 
                value={subject} 
                onChangeText={setSubject}
                placeholder="e.g., Billing Issue, Feature Request"
                placeholderTextColor="#94A3B8"
              />
            </View>
            <View style={s.inputGroup}>
              <Text style={s.inputLabel}>MESSAGE</Text>
              <TextInput 
                style={[s.input, s.textArea]} 
                value={message} 
                onChangeText={setMessage}
                placeholder="Explain how we can help you..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity style={s.submitBtn} onPress={handleSend} activeOpacity={0.85}>
              <Text style={s.submitText}>Send Message</Text>
              <Feather name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#F8FAFC' },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { paddingBottom: 40 },
  heroSection: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 24, paddingBottom: 32 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  heroSub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginHorizontal: 24, marginBottom: 16 },
  contactRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 16, marginBottom: 32 },
  contactCard: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  contactText: { marginTop: 8, fontSize: 14, fontWeight: '700', color: '#334155' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginHorizontal: 24, marginBottom: 32 },
  formSection: { paddingHorizontal: 24 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, height: 52, paddingHorizontal: 16, fontSize: 15, color: '#1E293B', borderWidth: 1, borderColor: '#E2E8F0' },
  textArea: { height: 120, paddingTop: 16 },
  submitBtn: { flexDirection: 'row', backgroundColor: '#4F46E5', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 12, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});