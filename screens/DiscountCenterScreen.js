import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Dimensions, Alert, Modal, Pressable, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons'; 
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext'; 
import MerchantProfileModal from '../components/MerchantProfileModal';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2;

const MOCK_MERCHANT_1 = {
  name: 'Bean & Brew',
  category: 'Cafe & Bakery',
  phone: '+1 (555) 123-4567',
  address: '123 Coffee Lane, Tech District',
  description: 'Artisanal coffee, fresh daily pastries, and a cozy atmosphere for remote workers and coffee lovers alike.',
  website: 'www.beanandbrew.local',
  logo: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop'
};

const MOCK_MERCHANT_2 = {
  name: 'Burger Joint',
  category: 'Restaurant',
  phone: '+1 (555) 987-6543',
  address: '456 Burger Blvd',
  description: 'The best burgers and fries in the whole neighborhood.',
  website: 'www.burgerjoint.local',
  logo: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=200&auto=format&fit=crop',
  coverPhoto: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop'
};

const REWARDS = [
  { id: '1', title: 'Free Latte', desc: 'On medium size hot coffee', expText: 'Exp: 12 Dec 2023', code: 'Q9R8S7', state: 'available', price: 200, image: 'https://images.unsplash.com/photo-1578374173713-32f6ae6f3971?q=80&w=800&auto=format&fit=crop', merchant: MOCK_MERCHANT_1 },
  { id: '2', title: 'Buy 1 Get 1', desc: 'On all pastry items', expText: 'Expired', expColor: '#EF4444', code: 'LATTE24', state: 'expired', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop', merchant: MOCK_MERCHANT_1 },
  { id: '3', title: 'Free Cookie', desc: 'With any large drink', expText: 'Exp: 12 Dec 2023', code: 'COOKIE99', state: 'active', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop', merchant: MOCK_MERCHANT_2 },
];

const LONG_DUMMY_DESC = "Enjoy a complimentary item, crafted with care. This exclusive offer is valid at all participating locations. Limit one redemption per customer. Cannot be combined with any other offers or discounts. Please present this digital coupon to the barista before placing your order to claim your reward. Valid for dine-in or takeaway!";

const HISTORY = [
  {
    month: 'SEPTEMBER 2023',
    items: [
      { id: 'h1', title: 'Daily Check-in', date: 'Sep 24, 2023 • 09:15 AM', points: '+50', type: 'earn', icon: 'calendar' },
      { id: 'h2', title: 'Coffee Coupon', date: 'Sep 22, 2023 • 02:30 PM', points: '-150', type: 'spend', icon: 'shopping-bag' },
      { id: 'h3', title: 'Promo Bonus', date: 'Sep 20, 2023 • 11:00 AM', points: '+200', type: 'earn', icon: 'tag' },
    ]
  }
];

export default function DiscountCenterScreen({ navigation }) {
  const { points } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('All');
  
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeRewardId, setActiveRewardId] = useState(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false); 
  const [selectedToBuy, setSelectedToBuy] = useState(null);

  // 👉 NEW: Track Purchases & QR Modal
  const [purchasedCoupons, setPurchasedCoupons] = useState(['3']); // Mocking that ID 3 is already purchased
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrReward, setSelectedQrReward] = useState(null);

  // 👉 NEW: Merchant Profile Modal State
  const [merchantModalVisible, setMerchantModalVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const openMerchantProfile = (merchant) => {
    setSelectedMerchant(merchant);
    setMerchantModalVisible(true);
  };

  const toggleTooltip = (id) => {
    if (activeRewardId === id) {
      setTooltipVisible(false);
      setActiveRewardId(null);
    } else {
      setActiveRewardId(id);
      setTooltipVisible(true);
    }
  };

  const handleCopyCode = (code, isPurchased) => {
    if (!isPurchased) {
      showToast("Locked", "Buy this coupon to reveal the code.", "error");
      return;
    }
    Alert.alert('Code Copied!', `${code} has been copied to your clipboard.`);
  };

  const handleRewardClick = (reward) => {
    setSelectedToBuy(reward);
    setIsDescExpanded(false);
    setDetailModalVisible(true);
  };

  const confirmPurchase = () => {
    setDetailModalVisible(false);
    
    // 👉 NEW: Add to purchased list to lock out duplicates
    setPurchasedCoupons(prev => [...prev, selectedToBuy.id]);
    showToast("Reward Claimed!", `You can now use your ${selectedToBuy.title}`, "success");
  };

  const openQrScanner = (reward) => {
    setSelectedQrReward(reward);
    setQrModalVisible(true);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this reward: ${selectedToBuy?.title} for only ${selectedToBuy?.price} points on HabitTracker! ☕✨`,
      });
    } catch (error) {}
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Feather name="chevron-left" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Discount Center</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={s.scrollContent}
        onScrollBeginDrag={() => setTooltipVisible(false)} 
      >
        
        <LinearGradient colors={['#22C55E', '#10B981']} style={s.balanceCard}>
          <Text style={s.balanceLabel}>MY BALANCE</Text>
          <View style={s.balanceAmountRow}>
            <Text style={s.balancePoints}>{points.toLocaleString()}</Text>
            <Text style={s.balanceUnit}>pts</Text>
          </View>
        </LinearGradient>

        <View style={s.tabContainer}>
          {['All', 'History'].map(tab => (
            <TouchableOpacity 
              key={tab}
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => {setActiveTab(tab); setTooltipVisible(false);}}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'All' ? (
          <View style={s.allSection}>
            <Text style={s.sectionTitle}>Available Rewards</Text>
            <Text style={s.sectionSubtitle}>Redeem your points for exclusive discounts</Text>

            <View style={s.gridContainer}>
              {REWARDS.map((reward) => {
                
                // 👉 NEW: Check if user owns this specific coupon
                const isPurchased = purchasedCoupons.includes(reward.id) || reward.state === 'active';

                return (
                  <View key={reward.id} style={s.rewardCard}>
                    <Image source={{ uri: reward.image }} style={s.rewardImg} />
                    
                    <View style={s.rewardContent}>
                      
                      {/* Merchant Trigger */}
                      {reward.merchant && (
                        <TouchableOpacity 
                          style={s.merchantRow} 
                          onPress={() => openMerchantProfile(reward.merchant)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: Math.random() < 0.5 ? reward.merchant.logo : reward.merchant.logo }} style={s.merchantLogoSmall} />
                          <Text style={s.merchantNameSmall} numberOfLines={1}>{reward.merchant.name}</Text>
                        </TouchableOpacity>
                      )}

                      <Text style={s.rTitle}>{reward.title}</Text>
                      
                      <View style={s.rDescRow}>
                        <Text style={s.rDesc} numberOfLines={1}>{reward.desc}</Text>
                        <TouchableOpacity onPress={() => toggleTooltip(reward.id)}>
                          <Feather name="info" size={14} color="#10B981" />
                        </TouchableOpacity>
                      </View>

                      {tooltipVisible && activeRewardId === reward.id && (
                        <View style={s.tooltipBubble}>
                          <Text style={s.tooltipText}>Limit 1 per user per day. Redeem at counter.</Text>
                          <View style={s.tooltipArrow} />
                        </View>
                      )}

                      <Text style={[s.rExp, reward.expColor && { color: reward.expColor }]}>
                        {reward.expText}
                      </Text>

                      {/* 👉 NEW: Hide code with asterisks if not purchased yet */}
                      <TouchableOpacity 
                        onPress={() => handleCopyCode(reward.code, isPurchased)}
                        style={[s.codeBox, reward.state === 'expired' ? s.codeBoxExpired : s.codeBoxActive]}
                      >
                        <Text style={[s.codeText, reward.state === 'expired' ? s.codeTextExpired : s.codeTextActive]}>
                          {isPurchased ? reward.code : '******'}
                        </Text>
                        {isPurchased && reward.state !== 'expired' && <Feather name="copy" size={12} color="#10B981" style={{marginLeft: 4}} />}
                      </TouchableOpacity>

                      {/* 👉 NEW: Swap Buy Button for QR Button if purchased */}
                      <TouchableOpacity 
                        style={[
                          s.actionBtn, 
                          reward.state === 'expired' ? s.actionBtnExpired : s.actionBtnActive,
                          isPurchased && reward.state !== 'expired' && s.actionBtnPurchased
                        ]}
                        onPress={() => {
                          if (reward.state === 'expired') return;
                          if (isPurchased) {
                            openQrScanner(reward);
                          } else {
                            handleRewardClick(reward);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        {isPurchased && reward.state !== 'expired' ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather name="maximize" size={14} color="#FFFFFF" />
                            <Text style={s.actionBtnText}>Show QR</Text>
                          </View>
                        ) : (
                          <Text style={[s.actionBtnText, reward.state === 'expired' && s.actionBtnTextExpired]}>
                            {reward.state === 'expired' ? 'Expired' : `Buy - ${reward.price} pts`}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
           <View style={s.historySection}>
            {HISTORY.map((group, gIdx) => (
              <View key={gIdx} style={s.historyGroup}>
                <Text style={s.historyMonthLabel}>{group.month}</Text>
                {group.items.map((item) => {
                  const isEarn = item.type === 'earn';
                  return (
                    <View key={item.id} style={s.historyRow}>
                      <View style={[s.historyIconBox, { backgroundColor: isEarn ? '#E8F8F2' : '#FEE2E2' }]}>
                        <Feather name={item.icon} size={18} color={isEarn ? '#10B981' : '#EF4444'} />
                      </View>
                      <View style={s.historyTextWrap}>
                        <Text style={s.historyTitle}>{item.title}</Text>
                        <Text style={s.historyDate}>{item.date}</Text>
                      </View>
                      <Text style={[s.historyPoints, { color: isEarn ? '#10B981' : '#EF4444' }]}>
                        {item.points}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* --- BIG DETAILED CARD MODAL --- */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDetailModalVisible(false)} />
          <View style={s.detailCard}>
            
            <View style={s.detailImageWrap}>
              <Image source={{ uri: selectedToBuy?.image }} style={s.detailImage} />
              <TouchableOpacity style={s.shareBtnTop} onPress={handleShare} activeOpacity={0.8}>
                <Feather name="share-2" size={20} color="#10B981" />
              </TouchableOpacity>
              <TouchableOpacity style={s.closeBtnTop} onPress={() => setDetailModalVisible(false)} activeOpacity={0.8}>
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={s.detailContent}>
              <Text style={s.detailTitle}>{selectedToBuy?.title}</Text>
              <ScrollView style={{ maxHeight: isDescExpanded ? 180 : 65 }} showsVerticalScrollIndicator={false}>
                <Text style={s.detailDesc} numberOfLines={isDescExpanded ? undefined : 3}>
                  {LONG_DUMMY_DESC}
                </Text>
              </ScrollView>
              <TouchableOpacity style={s.readMoreBtn} onPress={() => setIsDescExpanded(!isDescExpanded)} activeOpacity={0.7}>
                <Text style={s.readMoreText}>{isDescExpanded ? 'Show Less' : 'Read More...'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.detailBuyBtn} onPress={confirmPurchase} activeOpacity={0.85}>
                <Text style={s.detailBuyText}>Buy - {selectedToBuy?.price} pts</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

      {/* 👉 NEW: QR CODE MODAL */}
      <Modal transparent visible={qrModalVisible} animationType="fade" statusBarTranslucent>
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQrModalVisible(false)} />
          <View style={s.qrCard}>
            
            <View style={s.qrHeader}>
              <View style={s.qrIconWrap}>
                <Feather name="check-circle" size={24} color="#10B981" />
              </View>
              <Text style={s.qrTitle}>Ready to Redeem</Text>
              <Text style={s.qrSub}>Show this code to the cashier</Text>
            </View>

            {/* Generates a real QR Code using a free public API! */}
            <View style={s.qrImageWrap}>
              <Image 
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedQrReward?.code}` }} 
                style={s.qrImage} 
              />
            </View>

            <View style={s.qrCodeBox}>
              <Text style={s.qrCodeLabel}>OR PROVIDE CODE</Text>
              <Text style={s.qrCodeValue}>{selectedQrReward?.code}</Text>
            </View>

            <TouchableOpacity style={s.qrCloseBtn} onPress={() => setQrModalVisible(false)}>
              <Text style={s.qrCloseBtnText}>Close</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </Modal>

      {/* 👉 NEW: MERCHANT PROFILE MODAL */}
      <MerchantProfileModal 
        visible={merchantModalVisible} 
        onClose={() => setMerchantModalVisible(false)} 
        merchant={selectedMerchant} 
      />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, height: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  scrollContent: { paddingVertical: 20 },
  balanceCard: { marginHorizontal: 24, borderRadius: 16, padding: 24, marginBottom: 24 },
  balanceLabel: { fontSize: 11, fontWeight: '700', color: '#FFFFFF', opacity: 0.8, letterSpacing: 1 },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4 },
  balancePoints: { fontSize: 38, fontWeight: '800', color: '#FFFFFF' },
  balanceUnit: { fontSize: 16, color: '#FFFFFF', marginLeft: 4, fontWeight: '600' },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  tabBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  tabText: { fontWeight: '600', color: '#6B7280', fontSize: 14 },
  tabTextActive: { color: '#FFFFFF' },
  
  allSection: { paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  sectionSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  rewardCard: { width: CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 16, elevation: 3, zIndex: 1 },
  rewardImg: { width: '100%', height: 110, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  rewardContent: { padding: 12, position: 'relative' },
  
  merchantRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  merchantLogoSmall: { width: 16, height: 16, borderRadius: 8, marginRight: 6, backgroundColor: '#E2E8F0' },
  merchantNameSmall: { fontSize: 11, fontWeight: '700', color: '#6B7280', flex: 1 },

  rTitle: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  rDescRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 },
  rDesc: { fontSize: 10, color: '#6B7280', flex: 1 },
  rExp: { fontSize: 10, color: '#9CA3AF', marginBottom: 8, fontWeight: '500' },
  
  tooltipBubble: { position: 'absolute', top: -45, right: 0, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 12, width: 150, zIndex: 999, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  tooltipText: { color: '#4B5563', fontSize: 10, lineHeight: 14, fontWeight: '500' },
  tooltipArrow: { position: 'absolute', bottom: -6, right: 12, width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFFFFF' },

  codeBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, marginBottom: 8 },
  codeBoxActive: { backgroundColor: '#F0FDF4', borderColor: '#10B981' },
  codeBoxExpired: { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
  codeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  codeTextActive: { color: '#10B981' },
  codeTextExpired: { color: '#9CA3AF' },
  
  actionBtn: { paddingVertical: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionBtnActive: { backgroundColor: '#10B981' },
  actionBtnPurchased: { backgroundColor: '#059669' }, // Darker green to show it's owned
  actionBtnExpired: { backgroundColor: '#E5E7EB' },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 12 },
  actionBtnTextExpired: { color: '#9CA3AF' },

  historySection: { paddingHorizontal: 24 },
  historyGroup: { marginBottom: 24 },
  historyMonthLabel: { fontSize: 11, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1, marginBottom: 16 },
  historyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  historyIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  historyTextWrap: { flex: 1, justifyContent: 'center' },
  historyTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  historyDate: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  historyPoints: { fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  
  detailCard: { width: '100%', maxWidth: 380, backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10, maxHeight: height * 0.85 },
  detailImageWrap: { height: 220, position: 'relative' },
  detailImage: { width: '100%', height: '100%' },
  shareBtnTop: { position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  closeBtnTop: { position: 'absolute', top: 16, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', elevation: 5 },
  detailContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  detailTitle: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  detailDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },
  readMoreBtn: { marginTop: 4, marginBottom: 24, paddingVertical: 4 },
  readMoreText: { fontWeight: '700', color: '#10B981', fontSize: 14 },
  detailBuyBtn: { backgroundColor: '#10B981', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  detailBuyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // 👉 NEW: QR MODAL STYLES
  qrCard: { width: '100%', maxWidth: 320, backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, alignItems: 'center', elevation: 10 },
  qrHeader: { alignItems: 'center', marginBottom: 24 },
  qrIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  qrTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  qrSub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  qrImageWrap: { width: 200, height: 200, padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, marginBottom: 24 },
  qrImage: { width: '100%', height: '100%' },
  qrCodeBox: { backgroundColor: '#F9FAFB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, alignItems: 'center', marginBottom: 24, width: '100%' },
  qrCodeLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', letterSpacing: 1, marginBottom: 4 },
  qrCodeValue: { fontSize: 20, fontWeight: '800', color: '#10B981', letterSpacing: 2 },
  qrCloseBtn: { width: '100%', paddingVertical: 14, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center' },
  qrCloseBtnText: { fontSize: 15, fontWeight: '700', color: '#4B5563' }
});