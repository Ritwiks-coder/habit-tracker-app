import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const NOTIFICATIONS = [
  { id: '1', type: 'success', title: 'New Redemption!', message: 'Code A1B2C3 was just redeemed for 20% Off Pastries.', time: '2m ago', unread: true },
  { id: '2', type: 'alert', title: 'Campaign Expiring Soon', message: 'Your "Free Cookie" campaign expires in 2 days. Renew now?', time: '1h ago', unread: true },
  { id: '3', type: 'info', title: 'Weekly Summary', message: 'You had 45 redemptions this week. Tap to view insights.', time: 'Yesterday', unread: false },
  { id: '4', type: 'success', title: 'New Redemption!', message: 'Code M3N8P1 was redeemed for Buy 1 Get 1 Muffin.', time: 'Yesterday', unread: false },
];

export default function BusinessNotificationsScreen({ navigation }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Text style={s.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        {NOTIFICATIONS.map((note) => (
          <TouchableOpacity key={note.id} style={[s.card, note.unread && s.cardUnread]} activeOpacity={0.7}>
            <View style={s.iconCol}>
              <View style={[
                s.iconWrap, 
                note.type === 'success' && { backgroundColor: '#ECFDF5' },
                note.type === 'alert' && { backgroundColor: '#FFF7ED' },
                note.type === 'info' && { backgroundColor: '#EEF2FF' }
              ]}>
                <Feather 
                  name={note.type === 'success' ? 'check-circle' : note.type === 'alert' ? 'alert-circle' : 'bar-chart-2'} 
                  size={20} 
                  color={note.type === 'success' ? '#10B981' : note.type === 'alert' ? '#EA580C' : '#4F46E5'} 
                />
              </View>
            </View>
            <View style={s.textCol}>
              <Text style={s.title}>{note.title}</Text>
              <Text style={s.message}>{note.message}</Text>
              <Text style={s.time}>{note.time}</Text>
            </View>
            {note.unread && <View style={s.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  markReadText: { fontSize: 14, fontWeight: '700', color: '#4F46E5' },
  
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 12 },
  
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardUnread: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EEF2FF' },
  
  iconCol: { marginRight: 16 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  
  textCol: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  message: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 8 },
  time: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4F46E5', marginTop: 6 },
});