import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ShopItem = ({ icon, title, description, cost, isSassyMode, onBuy }) => (
  <View style={styles.itemCard}>
    <View style={styles.itemInfo}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name={icon} size={24} color="#10B981" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{description}</Text>
      </View>
    </View>
    
    <TouchableOpacity onPress={onBuy} activeOpacity={0.8}>
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.buyBtn}
      >
        <Text style={styles.buyBtnText}>{cost}</Text>
        <MaterialCommunityIcons name="star-four-points" size={14} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const ShopSection = ({ currentCoins, isSassyMode }) => {
  
  const handlePurchase = (itemName, cost) => {
    if (currentCoins < cost) {
      Alert.alert(
        isSassyMode ? "You're Broke." : "Insufficient Coins", 
        isSassyMode 
          ? `You need ${cost} coins. Go do some habits instead of window shopping.` 
          : `You need ${cost} coins to buy this. Keep completing tasks to earn more!`
      );
      return;
    }
    // Here you will eventually trigger your Context function to deduct coins
    Alert.alert("Purchased!", `You successfully bought: ${itemName}`);
  };

  return (
    <View style={styles.container}>
      {/* Header & Coin Bank */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>In-App Shop</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBalance}>{currentCoins}</Text>
          <MaterialCommunityIcons name="star-four-points" size={16} color="#F59E0B" style={{ marginLeft: 4 }} />
        </View>
      </View>

      <Text style={styles.subtitle}>Spend coins to survive your lazy days.</Text>

      {/* Shop Items */}
      <ShopItem 
        icon="debug-step-over" 
        title="Single Skip Pass" 
        description="Skip one task without losing your streak." 
        cost={50} 
        isSassyMode={isSassyMode}
        onBuy={() => handlePurchase("Single Skip Pass", 50)} 
      />

      <ShopItem 
        icon="shield-star-outline" 
        title="Streak Shield (24h)" 
        description="Protects your streak if you miss a whole day." 
        cost={200} 
        isSassyMode={isSassyMode}
        onBuy={() => handlePurchase("Streak Shield", 200)} 
      />

      <ShopItem 
        icon="crown-outline" 
        title="Golden Avatar Frame" 
        description="Flex on your friends in the Leaderboard." 
        cost={500} 
        isSassyMode={isSassyMode}
        onBuy={() => handlePurchase("Golden Avatar Frame", 500)} 
      />
      
    </View>
  );
};

export default ShopSection;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  coinBalance: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F59E0B',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  buyBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  }
});