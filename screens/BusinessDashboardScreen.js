import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext'; 

const ACTIVE_COUPONS = [
  { id: '1', title: 'Free Morning Latte', price: '200 pts', image: 'https://images.unsplash.com/photo-1578374173713-32f6ae6f3971?q=80&w=200&auto=format&fit=crop' },
  { id: '2', title: 'Buy 1 Get 1 Espresso', price: '150 pts', image: 'https://images.unsplash.com/photo-1514432324607-a2c5f56f6c99?q=80&w=200&auto=format&fit=crop' },
  { id: '3', title: 'Pastry & Brew Combo', price: '350 pts', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?q=80&w=200&auto=format&fit=crop' },
];

export default function BusinessDashboardScreen({ navigation }) {
  const { setBusinessSidebarOpen } = useApp();
  const { showToast } = useToast();

  const handleDelete = (title) => {
    Alert.alert(
      "Remove Campaign",
      `Are you sure you want to delete the "${title}" offer?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => showToast("Campaign Removed", `${title} has been deleted.`, "success") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      
      {/* --- HEADER --- */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerLeft} onPress={() => setBusinessSidebarOpen(true)} activeOpacity={0.7}>
          <Image source={{uri: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop'}} style={s.profilePic} />
          <Text style={s.headerTitle}>Bean & Brew</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={s.iconBtn} 
          onPress={() => navigation.navigate('BusinessNotifications')} 
          activeOpacity={0.7}
        >
          <Feather name="bell" size={22} color="#1E293B" />
          <View style={s.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        {/* --- METRIC CARD --- */}
        <LinearGradient colors={['#4F46E5', '#3730A3']} style={s.metricCard}>
          <View style={s.metricHeader}>
            <Text style={s.metricLabel}>TOTAL COINS EARNED</Text>
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveText}>LIVE</Text>
            </View>
          </View>
          <View style={s.metricValueRow}>
            <Text style={s.metricValue}>4,500</Text>
            <Text style={s.metricIcon}>🪙</Text>
          </View>
          <Text style={s.metricSub}>Lifetime earnings</Text>

          {/* 👉 NEW: Divider and Claims Metric Stack */}
          <View style={s.metricDivider} />
          
          <View style={s.claimsRow}>
            <View style={s.claimsLeft}>
              <View style={s.claimsIconWrap}>
                <Feather name="users" size={14} color="#4F46E5" />
              </View>
              <Text style={s.claimsLabel}>COUPONS CLAIMED</Text>
            </View>
            <Text style={s.claimsValue}>128</Text>
          </View>
        </LinearGradient>

        {/* --- ACTIVE CAMPAIGNS HEADER --- */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Active Coupons</Text>
          <TouchableOpacity onPress={() => navigation.navigate('BusCoupons')} activeOpacity={0.7}>
            <Text style={s.viewAllBtn}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* --- COUPON LIST --- */}
        {ACTIVE_COUPONS.map((coupon) => (
          <View key={coupon.id} style={s.couponCard}>
            <Image source={{ uri: coupon.image }} style={s.couponImg} />
            <View style={s.couponInfo}>
              <Text style={s.couponTitle}>{coupon.title}</Text>
              <Text style={s.couponPrice}>{coupon.price}</Text>
            </View>
            <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(coupon.title)}>
              <Feather name="trash-2" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profilePic: { width: 44, height: 44, borderRadius: 22 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  notificationDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  
  scrollContent: { padding: 24, paddingBottom: 120 },
  
  // Metric Card Styles
  metricCard: { borderRadius: 24, padding: 24, marginBottom: 32 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  metricLabel: { fontSize: 13, fontWeight: '700', color: '#C7D2FE', letterSpacing: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFFFFF' },
  liveText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  metricValueRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  metricValue: { fontSize: 56, fontWeight: '800', color: '#FFFFFF', letterSpacing: -2 },
  metricIcon: { fontSize: 32 },
  metricSub: { fontSize: 15, color: '#C7D2FE' },

  // 👉 NEW: Claims Metric Styles
  metricDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 20 },
  claimsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claimsLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  claimsIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  claimsLabel: { fontSize: 13, fontWeight: '700', color: '#E0E7FF', letterSpacing: 0.5 },
  claimsValue: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B' },
  viewAllBtn: { fontSize: 14, fontWeight: '700', color: '#4F46E5', paddingVertical: 4 },

  couponCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  couponImg: { width: 72, height: 72, borderRadius: 16, backgroundColor: '#F1F5F9' },
  couponInfo: { flex: 1, marginLeft: 16 },
  couponTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  couponPrice: { fontSize: 14, fontWeight: '700', color: '#4338CA' },
  deleteBtn: { padding: 12 }
});