import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, KeyboardAvoidingView, Platform, Keyboard, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';

const RECENT_REDEMPTIONS = [
  { id: '1', title: '20% Off Pastries', code: 'A1B2C3', time: 'Today, 2:30 PM', theme: 'indigo' },
  { id: '2', title: 'Free Cookie with Coffee', code: 'X9Y2Z4', time: 'Today, 1:15 PM', theme: 'indigo' },
  { id: '3', title: 'Buy 1 Get 1 Muffin', code: 'M3N8P1', time: 'Yesterday, 4:55 PM', theme: 'orange' },
];

export default function BusinessVerifyScreen({ navigation }) {
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [recentList, setRecentList] = useState(RECENT_REDEMPTIONS);
  
  const [claimsToday, setClaimsToday] = useState(12);
  const [totalClaims, setTotalClaims] = useState(128);

  // 👉 NEW: Scanner Modal & Logic States
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [hasRedeemedToday, setHasRedeemedToday] = useState(false); // Simulates a specific user

  const handleVerify = (scannedCode = null) => {
    Keyboard.dismiss();
    const finalCode = scannedCode || code;
    
    if (finalCode.length < 6) {
      showToast("Invalid Code", "Please enter a valid 6-digit code.", "error");
      return;
    }

    // 👉 NEW: 1-Per-Day Business Restriction Logic
    if (hasRedeemedToday) {
      showToast("Limit Reached", "This customer has already redeemed a coupon today.", "error");
      setCode('');
      setScannerOpen(false);
      return;
    }

    showToast("Success!", `Code ${finalCode} verified successfully.`, "success");
    
    const newRedemption = {
      id: Date.now().toString(),
      title: 'Walk-in Redemption',
      code: finalCode,
      time: 'Just now',
      theme: 'indigo'
    };
    
    setRecentList([newRedemption, ...recentList]);
    setCode('');
    setScannerOpen(false);
    setHasRedeemedToday(true); // Lock them out for the rest of the demo
    
    setClaimsToday(prev => prev + 1);
    setTotalClaims(prev => prev + 1);
  };

  // Simulate scanning a code
  const simulateScan = () => {
    handleVerify('Q9R8S7');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BusHome')} activeOpacity={0.7}>
            <Feather name="arrow-left" size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Verify Redemption</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <View style={s.statIconWrap}><Feather name="award" size={18} color="#4F46E5" /></View>
              <View>
                <Text style={s.statValue}>{totalClaims}</Text>
                <Text style={s.statLabel}>Total Claims</Text>
              </View>
            </View>

            <View style={s.statCard}>
              <View style={[s.statIconWrap, { backgroundColor: '#ECFDF5' }]}><Feather name="activity" size={18} color="#10B981" /></View>
              <View>
                <Text style={s.statValue}>{claimsToday}</Text>
                <Text style={s.statLabel}>Today</Text>
              </View>
            </View>
          </View>

          <View style={s.verifyCard}>
            <Text style={s.cardLabel}>CUSTOMER REDEMPTION</Text>
            
            {/* 👉 NEW: Input Wrapper with embedded QR Button */}
            <View style={s.inputWrapper}>
              <TextInput
                style={s.codeInput}
                placeholder="ENTER 6-DIGIT CODE"
                placeholderTextColor="#94A3B8"
                value={code}
                onChangeText={(text) => setCode(text.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity style={s.qrBtn} onPress={() => setScannerOpen(true)}>
                <Feather name="maximize" size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[s.verifyBtn, code.length === 6 && s.verifyBtnActive]} onPress={() => handleVerify()} activeOpacity={0.8}>
              <Text style={s.verifyBtnText}>Verify Code</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.sectionTitle}>Recent Redemptions</Text>

          {recentList.map((item) => (
            <View key={item.id} style={s.listItem}>
              <View style={[s.iconWrap, item.theme === 'orange' ? s.iconWrapOrange : s.iconWrapIndigo]}>
                <Feather name="file-text" size={20} color={item.theme === 'orange' ? '#EA580C' : '#4F46E5'} />
              </View>
              <View style={s.listInfo}>
                <Text style={s.listTitle}>{item.title}</Text>
                <View style={s.listSubRow}>
                  <View style={s.codeBadge}><Text style={s.codeBadgeText}>{item.code}</Text></View>
                  <Text style={s.listTime}>•  {item.time}</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color="#CBD5E1" />
            </View>
          ))}

        </ScrollView>
      </KeyboardAvoidingView>

      {/* 👉 NEW: Fake Camera Scanner Modal */}
      <Modal visible={isScannerOpen} animationType="slide" transparent={true}>
        <View style={s.scannerOverlay}>
          <View style={s.scannerHeader}>
            <TouchableOpacity onPress={() => setScannerOpen(false)} style={s.closeScannerBtn}>
              <Feather name="x" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={s.scannerTitle}>Scan QR Code</Text>
            <View style={{ width: 44 }} />
          </View>
          
          {/* Fake Camera Viewfinder */}
          <View style={s.viewfinder}>
            <View style={s.viewfinderCornerTL} />
            <View style={s.viewfinderCornerTR} />
            <View style={s.viewfinderCornerBL} />
            <View style={s.viewfinderCornerBR} />
            <TouchableOpacity style={s.fakeScanBtn} onPress={simulateScan}>
              <Text style={s.fakeScanText}>Tap to simulate scan</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={s.scannerFooter}>Align the customer's QR code within the frame</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 12 },

  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2 },
  statIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600', color: '#64748B' },

  verifyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 8 },
  cardLabel: { fontSize: 12, fontWeight: '800', color: '#475569', letterSpacing: 1, textAlign: 'center', marginBottom: 16 },
  
  inputWrapper: { position: 'relative', marginBottom: 16 },
  codeInput: { backgroundColor: '#F8FAFC', borderRadius: 16, height: 64, fontSize: 15, fontWeight: '700', color: '#1E293B', textAlign: 'center', letterSpacing: 1, paddingRight: 48 },
  qrBtn: { position: 'absolute', right: 8, top: 8, bottom: 8, width: 48, backgroundColor: '#EEF2FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  verifyBtn: { backgroundColor: '#818CF8', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6 },
  verifyBtnActive: { backgroundColor: '#4338CA' },
  verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  iconWrapIndigo: { backgroundColor: '#EEF2FF' },
  iconWrapOrange: { backgroundColor: '#FFEDD5' },
  listInfo: { flex: 1, marginLeft: 16 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  listSubRow: { flexDirection: 'row', alignItems: 'center' },
  codeBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeBadgeText: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  listTime: { fontSize: 13, color: '#64748B', marginLeft: 8 },

  // Scanner Styles
  scannerOverlay: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  scannerHeader: { position: 'absolute', top: 50, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 },
  closeScannerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scannerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  viewfinder: { width: 250, height: 250, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  viewfinderCornerTL: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderColor: '#4F46E5', borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  viewfinderCornerTR: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderColor: '#4F46E5', borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  viewfinderCornerBL: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderColor: '#4F46E5', borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  viewfinderCornerBR: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderColor: '#4F46E5', borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },
  fakeScanBtn: { backgroundColor: 'rgba(79, 70, 229, 0.9)', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20 },
  fakeScanText: { color: '#FFFFFF', fontWeight: '700' },
  scannerFooter: { position: 'absolute', bottom: 80, color: '#94A3B8', fontSize: 14, fontWeight: '500' }
});