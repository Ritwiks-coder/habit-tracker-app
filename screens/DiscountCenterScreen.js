import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Dimensions, Alert, Modal, Pressable, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext'; 
import MerchantProfileModal from '../components/MerchantProfileModal';
import theme from '../src/theme/theme';

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
  const { coins, spendCoins, playfulMode } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('Coupons');
  const tabs = ['Coupons', 'History'];
  
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activeRewardId, setActiveRewardId] = useState(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false); 
  const [selectedToBuy, setSelectedToBuy] = useState(null);

  const [purchasedCoupons, setPurchasedCoupons] = useState(['3']);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrReward, setSelectedQrReward] = useState(null);

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
    if (coins < selectedToBuy.price) {
      showToast("Insufficient Balance", "You need more coins to buy this reward.", "error");
      return;
    }
    
    spendCoins(selectedToBuy.price);
    
    setDetailModalVisible(false);
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
        message: `Check out this reward: ${selectedToBuy?.title} for only ${selectedToBuy?.price} coins on HabitTracker! ☕✨`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      
      <View style={s.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Feather name="chevron-left" size={28} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Rewards Hub</Text>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
          <LinearGradient 
            colors={[theme.palette.green500, theme.palette.green600]} 
            style={s.balanceCard}
          >
            <Text style={s.balanceLabel}>MY COIN BALANCE</Text>
            <View style={s.balanceAmountRow}>
              <Text style={s.balancePoints}>🪙 {coins.toLocaleString()}</Text>
            </View>
          </LinearGradient>

          <View style={s.vaultContainer}>
            <Text style={s.vaultIcon}>🏦</Text>
            <Text style={s.vaultTitle}>The Vault is Closed.</Text>
            <Text style={s.vaultSubtitle}>
              We're partnering with local spots. Keep hoarding those coins for real-world rewards!
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* --- MODALS --- */}
      <Modal transparent visible={detailModalVisible} animationType="fade">
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDetailModalVisible(false)} />
          <View style={s.detailCard}>
            <View style={s.detailImageWrap}>
              <Image source={{ uri: selectedToBuy?.image }} style={s.detailImage} />
              <TouchableOpacity style={s.shareBtnTop} onPress={handleShare} activeOpacity={0.8}>
                <Feather name="share-2" size={20} color={theme.palette.green500} />
              </TouchableOpacity>
              <TouchableOpacity style={s.closeBtnTop} onPress={() => setDetailModalVisible(false)} activeOpacity={0.8}>
                <Feather name="x" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={s.detailContent}>
              <Text style={s.detailTitle}>{selectedToBuy?.title}</Text>
              <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                <Text style={s.detailDesc}>{LONG_DUMMY_DESC}</Text>
              </ScrollView>
              <TouchableOpacity style={s.detailBuyBtn} onPress={confirmPurchase} activeOpacity={0.85}>
                <Text style={s.detailBuyText}>🪙 Spend {selectedToBuy?.price} Coins</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={qrModalVisible} animationType="fade" statusBarTranslucent>
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setQrModalVisible(false)} />
          <View style={s.qrCard}>
            <View style={s.qrHeader}>
              <View style={s.qrIconWrap}>
                <Feather name="check-circle" size={24} color={theme.palette.green500} />
              </View>
              <Text style={s.qrTitle}>Ready to Redeem</Text>
              <Text style={s.qrSub}>Show this code to the cashier</Text>
            </View>
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
      <MerchantProfileModal visible={merchantModalVisible} onClose={() => setMerchantModalVisible(false)} merchant={selectedMerchant} />

    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: theme.spacing.md, 
    height: 70, 
    backgroundColor: theme.colors.surface 
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { ...theme.typography.h1, color: theme.colors.textPrimary },
  
  scrollContent: { paddingBottom: theme.spacing.xxl },
  balanceCard: { 
    marginHorizontal: theme.spacing.lg, 
    borderRadius: theme.radius.md, 
    padding: theme.spacing.lg, 
    marginBottom: theme.spacing.lg, 
    ...theme.shadow.md,
    shadowColor: theme.colors.success 
  },
  balanceLabel: { 
    ...theme.typography.caption, 
    fontWeight: '800', 
    color: theme.colors.textOnDark, 
    opacity: 0.9, 
    letterSpacing: 1 
  },
  balanceAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 6 },
  balancePoints: { fontSize: 42, fontWeight: '900', color: '#FFFFFF' },

  vaultContainer: { 
    flex: 1, 
    paddingHorizontal: theme.spacing.xxl, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingTop: 80 
  },
  vaultIcon: { fontSize: 64, marginBottom: theme.spacing.lg },
  vaultTitle: { ...theme.typography.h2, color: theme.colors.textPrimary, textAlign: 'center', marginBottom: theme.spacing.sm },
  vaultSubtitle: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: 10 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  detailCard: { width: '100%', maxWidth: 400, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, overflow: 'hidden' },
  detailImageWrap: { height: 260, position: 'relative' },
  detailImage: { width: '100%', height: '100%' },
  shareBtnTop: { position: 'absolute', top: 20, right: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm },
  closeBtnTop: { position: 'absolute', top: 20, left: 20, width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm },
  detailContent: { padding: 28, alignItems: 'center' },
  detailTitle: { ...theme.typography.h2, color: theme.colors.textPrimary, marginBottom: 16, textAlign: 'center' },
  detailDesc: { ...theme.typography.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: 28 },
  detailBuyBtn: { backgroundColor: theme.palette.green600, width: '100%', paddingVertical: 18, borderRadius: theme.radius.md, alignItems: 'center', ...theme.shadow.sm },
  detailBuyText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  qrCard: { width: '100%', maxWidth: 340, backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 32, alignItems: 'center' },
  qrHeader: { alignItems: 'center', marginBottom: 28 },
  qrIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.successLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  qrTitle: { ...theme.typography.h2, color: theme.colors.textPrimary },
  qrSub: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  qrImageWrap: { width: 220, height: 220, padding: 12, backgroundColor: '#FFFFFF', borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow.sm, marginBottom: 28 },
  qrImage: { width: '100%', height: '100%' },
  qrCodeBox: { backgroundColor: theme.colors.background, paddingVertical: 16, borderRadius: theme.radius.md, alignItems: 'center', marginBottom: 28, width: '100%' },
  qrCodeLabel: { ...theme.typography.caption, fontWeight: '900', color: theme.colors.textTertiary, letterSpacing: 2, marginBottom: 6 },
  qrCodeValue: { fontSize: 22, fontWeight: '900', color: theme.palette.green600, letterSpacing: 3 },
  qrCloseBtn: { width: '100%', paddingVertical: 16, borderRadius: theme.radius.md, backgroundColor: theme.colors.background, alignItems: 'center' },
  qrCloseBtnText: { ...theme.typography.label, color: theme.colors.textSecondary }
});