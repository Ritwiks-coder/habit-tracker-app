import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Modal, TouchableOpacity, 
  Image, ScrollView, Pressable, Linking
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function MerchantProfileModal({ visible, onClose, merchant }) {
  if (!merchant) return null;

  const handleOpenWebsite = () => {
    if (merchant.website) {
      let url = merchant.website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url).catch(err => console.error("Couldn't open URL", err));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        
        <View style={s.modalSheet}>
          <View style={s.handle} />
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
            
            {/* Cover Photo */}
            <View style={s.coverWrap}>
              <Image 
                source={{ uri: merchant.coverPhoto || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&auto=format&fit=crop' }} 
                style={s.coverPhoto} 
              />
              <TouchableOpacity style={s.closeBtn} onPress={onClose} activeOpacity={0.8}>
                <Feather name="x" size={20} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {/* Overlapping Logo */}
            <View style={s.logoWrap}>
              <Image 
                source={{ uri: merchant.logo || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=200&auto=format&fit=crop' }} 
                style={s.logoImage} 
              />
            </View>

            {/* Content Details */}
            <View style={s.infoSection}>
              <Text style={s.merchantName}>{merchant.name}</Text>
              <View style={s.categoryBadge}>
                <Text style={s.categoryText}>{merchant.category}</Text>
              </View>

              <Text style={s.descriptionText}>
                {merchant.description || "No description provided."}
              </Text>

              <View style={s.divider} />

              {/* Info Rows */}
              <View style={s.infoRow}>
                <View style={s.iconBox}>
                  <Feather name="map-pin" size={18} color="#4F46E5" />
                </View>
                <Text style={s.infoText}>{merchant.address || "Address not provided"}</Text>
              </View>

              <View style={s.infoRow}>
                <View style={s.iconBox}>
                  <Feather name="phone" size={18} color="#4F46E5" />
                </View>
                <Text style={s.infoText}>{merchant.phone || "Phone not provided"}</Text>
              </View>

              {merchant.website && (
                <TouchableOpacity style={s.infoRow} onPress={handleOpenWebsite} activeOpacity={0.7}>
                  <View style={s.iconBox}>
                    <Feather name="globe" size={18} color="#4F46E5" />
                  </View>
                  <Text style={[s.infoText, s.linkText]}>{merchant.website}</Text>
                </TouchableOpacity>
              )}
            </View>
            
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject },
  
  modalSheet: { 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 24, 
    borderTopRightRadius: 24, 
    height: '85%',
    overflow: 'hidden'
  },
  handle: { 
    width: 48, 
    height: 5, 
    backgroundColor: '#CBD5E1', 
    borderRadius: 3, 
    alignSelf: 'center', 
    marginTop: 12, 
    marginBottom: 8,
    position: 'absolute',
    top: 0,
    zIndex: 10
  },
  
  scrollContent: { paddingBottom: 40 },
  
  coverWrap: { width: '100%', height: 180, position: 'relative' },
  coverPhoto: { width: '100%', height: '100%', backgroundColor: '#E2E8F0' },
  closeBtn: { 
    position: 'absolute', 
    top: 24, right: 16, 
    width: 40, height: 40, 
    borderRadius: 20, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4
  },

  logoWrap: { 
    width: 96, height: 96, 
    borderRadius: 48, 
    backgroundColor: '#FFFFFF', 
    padding: 4, 
    marginTop: -48, 
    marginLeft: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5
  },
  logoImage: { width: '100%', height: '100%', borderRadius: 44, backgroundColor: '#F1F5F9' },

  infoSection: { paddingHorizontal: 24, paddingTop: 16 },
  merchantName: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  categoryBadge: { 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 12, 
    alignSelf: 'flex-start',
    marginBottom: 20
  },
  categoryText: { fontSize: 13, fontWeight: '700', color: '#4F46E5' },
  
  descriptionText: { fontSize: 15, color: '#475569', lineHeight: 24, marginBottom: 24 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
  
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  infoText: { flex: 1, fontSize: 15, color: '#334155', fontWeight: '500' },
  linkText: { color: '#4F46E5', textDecorationLine: 'underline' },
});
