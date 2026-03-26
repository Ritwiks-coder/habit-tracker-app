import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TRANSACTIONS = [
  { id: '1', user: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop', action: 'Redeemed "Free Latte"', type: 'redeem', points: 200, date: 'Today, 09:41 AM' },
  { id: '2', user: 'Sarah Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop', action: 'Earned Visit Points', type: 'earn', points: 50, date: 'Today, 08:15 AM' },
  { id: '3', user: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop', action: 'Redeemed "Buy 1 Get 1"', type: 'redeem', points: 400, date: 'Yesterday, 04:30 PM' },
  { id: '4', user: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', action: 'Earned Visit Points', type: 'earn', points: 50, date: 'Yesterday, 02:10 PM' },
  { id: '5', user: 'David Kim', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', action: 'Earned Visit Points', type: 'earn', points: 50, date: 'Sep 24, 11:20 AM' },
];

export default function BusinessTransactionScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('All');

  const filteredData = TRANSACTIONS.filter(t => {
    if (activeTab === 'Redemptions') return t.type === 'redeem';
    if (activeTab === 'Issued') return t.type === 'earn';
    return true;
  });

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Transaction History</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={s.summaryCard}>
          <View style={s.summaryTop}>
            <Text style={s.summaryLabel}>TOTAL REDEMPTIONS (THIS MONTH)</Text>
            <TouchableOpacity>
              <Feather name="calendar" size={16} color="#C7D2FE" />
            </TouchableOpacity>
          </View>
          <Text style={s.summaryValue}>1,240 <Text style={s.summarySubValue}>pts</Text></Text>
          <View style={s.summaryDivider} />
          <View style={s.summaryBottomRow}>
            <View style={s.summaryStat}>
              <Text style={s.statLabel}>Coupons Used</Text>
              <Text style={s.statValue}>48</Text>
            </View>
            <View style={s.summaryStat}>
              <Text style={s.statLabel}>Points Issued</Text>
              <Text style={s.statValue}>650</Text>
            </View>
            <View style={s.summaryStat}>
              <Text style={s.statLabel}>New Customers</Text>
              <Text style={s.statValue}>12</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={s.tabContainer}>
          {['All', 'Redemptions', 'Issued'].map(tab => (
            <TouchableOpacity 
              key={tab}
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.listContainer}>
          {filteredData.map((item, index) => {
            const isRedeem = item.type === 'redeem';
            return (
              <View key={item.id} style={[s.txRow, index !== filteredData.length - 1 && s.txBorder]}>
                <Image source={{ uri: item.avatar }} style={s.avatar} />
                <View style={s.txDetails}>
                  <Text style={s.txUser}>{item.user}</Text>
                  <Text style={s.txAction}>{item.action}</Text>
                  <Text style={s.txDate}>{item.date}</Text>
                </View>
                <View style={s.txValueContainer}>
                  <View style={[s.iconBox, { backgroundColor: isRedeem ? '#EEF2FF' : '#F0FDF4' }]}>
                    <Feather 
                      name={isRedeem ? "shopping-bag" : "plus-circle"} 
                      size={14} 
                      color={isRedeem ? "#4F46E5" : "#10B981"} 
                    />
                  </View>
                  <Text style={[s.txPoints, { color: isRedeem ? '#4F46E5' : '#10B981' }]}>
                    {isRedeem ? '-' : '+'}{item.points}
                  </Text>
                </View>
              </View>
            );
          })}
          {filteredData.length === 0 && (
            <View style={s.emptyState}>
              <Feather name="inbox" size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
              <Text style={s.emptyTitle}>No transactions found</Text>
              <Text style={s.emptySub}>Change your filter to see more history.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16, backgroundColor: '#F8FAFC' },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  scrollContent: { paddingBottom: 40 },
  summaryCard: { marginHorizontal: 24, borderRadius: 20, padding: 24, marginBottom: 24, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 11, fontWeight: '800', color: '#C7D2FE', letterSpacing: 1 },
  summaryValue: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  summarySubValue: { fontSize: 16, fontWeight: '600', color: '#C7D2FE' },
  summaryDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 },
  summaryBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryStat: { flex: 1 },
  statLabel: { fontSize: 11, color: '#C7D2FE', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  tabBtnActive: { backgroundColor: '#1E293B', borderColor: '#1E293B' },
  tabText: { fontWeight: '700', color: '#64748B', fontSize: 13 },
  tabTextActive: { color: '#FFFFFF' },
  listContainer: { backgroundColor: '#FFFFFF', marginHorizontal: 24, borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  txBorder: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F5F9', marginRight: 14 },
  txDetails: { flex: 1, justifyContent: 'center' },
  txUser: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  txAction: { fontSize: 13, color: '#475569', marginBottom: 4 },
  txDate: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  txValueContainer: { alignItems: 'flex-end', justifyContent: 'center' },
  iconBox: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  txPoints: { fontSize: 14, fontWeight: '800' },
  emptyState: { paddingVertical: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569', marginBottom: 8 },
  emptySub: { fontSize: 13, color: '#94A3B8' }
});