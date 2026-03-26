import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const BUSINESSES = [
  { id: '1', name: 'Bean & Brew', type: 'Cafe', color: '#E2B887', icon: 'coffee' },
  { id: '2', name: 'The Book Nook', type: 'Library', color: '#8A9A7A', icon: 'book' },
  { id: '3', name: 'Artisan Kitchen', type: 'cloud kitchen', color: '#F8E8C8', icon: 'box' },
];

export default function BusinessSelectAccountScreen({ navigation }) {
  
  const handleSelectBusiness = (business) => {
    // Go to the dashboard for this specific business
    navigation.navigate('BusinessTabs', { 
      screen: 'BusHome', 
      params: { businessId: business.id } 
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="chevron-left" size={28} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Select Account</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        
        <Text style={s.sectionTitle}>YOUR BUSINESSES</Text>
        <Text style={s.subtitle}>Choose an account to start managing your transactions.</Text>

        {/* BUSINESS LIST */}
        {BUSINESSES.map((bus) => (
          <TouchableOpacity 
            key={bus.id} 
            style={s.businessCard}
            onPress={() => handleSelectBusiness(bus)}
            activeOpacity={0.7}
          >
            <View style={[s.iconCircle, { backgroundColor: bus.color }]}>
              <Feather name={bus.icon} size={20} color={bus.id === '3' ? '#D4A373' : '#FFFFFF'} />
            </View>
            <View style={s.textWrap}>
              <Text style={s.busName}>{bus.name}</Text>
              <Text style={s.busType}>{bus.type}</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ))}

        {/* ADD NEW BUSINESS BUTTON */}
        <TouchableOpacity 
          style={s.addBtn} 
          onPress={() => navigation.navigate('AddNewBusiness')} // <--- CHANGE THIS LINE
          activeOpacity={0.7}
        >
          <Feather name="plus-circle" size={20} color="#4338CA" />
          <Text style={s.addBtnText}>Add New Business</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#475569', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  subtitle: { fontSize: 15, color: '#64748B', lineHeight: 22, marginBottom: 24 },

  businessCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  textWrap: { flex: 1 },
  busName: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  busType: { fontSize: 13, color: '#94A3B8' },

  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 60, borderRadius: 16, borderWidth: 1.5, borderColor: '#C7D2FE', borderStyle: 'dashed', marginTop: 8, backgroundColor: '#F5F8FF' },
  addBtnText: { fontSize: 16, fontWeight: '700', color: '#4338CA' }
});