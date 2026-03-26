import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, Share, Modal, Pressable, Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DetailedRewardCard({ 
  title = "Free Latte",
  price = 200,
  imageUri = "https://images.unsplash.com/photo-1578374173713-32f6ae6f3971?q=80&w=800&auto=format&fit=crop",
  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,",
  onSuccess // A function you can pass to update points in your global state later
}) {
  
  const [buyModalVisible, setBuyModalVisible] = useState(false);

  // --- NATIVE SHARE LOGIC ---
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this reward: ${title} for only ${price} points on Bas 5 Min! ☕✨`,
      });
    } catch (error) {
      console.log('Error sharing:', error.message);
    }
  };

  // --- PURCHASE CONFIRMATION LOGIC ---
  const confirmPurchase = () => {
    setBuyModalVisible(false);
    
    // Call the success prop if provided, otherwise just show an alert
    if (onSuccess) {
      onSuccess(price); 
    } else {
      Alert.alert("Success!", `You have redeemed a ${title}. Check your history!`);
    }
  };

  return (
    <View style={styles.cardContainer}>
      
      {/* --- TOP IMAGE & SHARE BUTTON --- */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        
        <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
          <Feather name="share-2" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* --- BOTTOM CONTENT --- */}
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>{title}</Text>
        
        <Text style={styles.description}>
          {description} <Text style={styles.readMore}>Read More...</Text>
        </Text>

        {/* This triggers the Modal */}
        <TouchableOpacity 
          style={styles.buyButton} 
          onPress={() => setBuyModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.buyButtonText}>Buy - {price} pts</Text>
        </TouchableOpacity>
      </View>

      {/* --- PURCHASE CONFIRMATION MODAL --- */}
      <Modal transparent visible={buyModalVisible} animationType="slide">
        <View style={styles.buyOverlay}>
          
          {/* Pressing the faded background closes the modal */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBuyModalVisible(false)} />
          
          <View style={styles.buySheet}>
            <View style={styles.buyHandle} />
            
            <View style={styles.buyIconCircle}>
               <Feather name="shopping-cart" size={30} color="#10B981" />
            </View>

            <Text style={styles.buyTitle}>Confirm Redemption</Text>
            <Text style={styles.buyText}>
              Are you sure you want to spend <Text style={{fontWeight: '800', color: '#10B981'}}>{price} points</Text> for a {title}?
            </Text>

            <View style={styles.buyActionRow}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setBuyModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Maybe Later</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={confirmPurchase}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmBtnText}>Confirm Buy</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <Text style={styles.buyNotice}>Points will be deducted instantly from your balance.</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  // --- CARD STYLES ---
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%', 
    maxWidth: 360,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  imageWrapper: { height: 220, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  shareButton: {
    position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  contentWrapper: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 12 },
  description: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  readMore: { fontWeight: '700', color: '#4B5563' },
  buyButton: { backgroundColor: '#10B981', width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  buyButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // --- MODAL STYLES ---
  buyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  buySheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  buyHandle: { width: 40, height: 4, backgroundColor: '#E5E7EB', borderRadius: 2, marginBottom: 24 },
  buyIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  buyTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  buyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
  buyActionRow: { flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center' },
  cancelBtnText: { color: '#6B7280', fontWeight: '700', fontSize: 15 },
  confirmBtn: { flex: 1.5, borderRadius: 16, overflow: 'hidden' },
  confirmGradient: { paddingVertical: 16, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  buyNotice: { fontSize: 11, color: '#9CA3AF', marginTop: 16, fontWeight: '500' }
});