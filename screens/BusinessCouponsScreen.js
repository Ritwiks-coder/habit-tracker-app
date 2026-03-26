import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, 
  TextInput, Modal, KeyboardAvoidingView, Platform, Pressable, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useToast } from '../context/ToastContext';

const INITIAL_COUPONS = [
  { id: '1', title: 'Artisanal Bakery', points: '450', status: 'Active', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=200&auto=format&fit=crop' },
  { id: '2', title: 'Morning Brew', points: '200', status: 'Paused', image: 'https://images.unsplash.com/photo-1514432324607-a2c5f56f6c99?q=80&w=200&auto=format&fit=crop' },
];

const DURATIONS = ['7 Days', '14 Days', '30 Days', 'Until Cancelled', 'Custom Range'];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sat", "Su"];

export default function BusinessCouponsScreen({ navigation }) {
  const { showToast } = useToast();
  
  // App States
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isModalVisible, setModalVisible] = useState(false);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // Custom Range Calendar States
  const [currentViewDate, setCurrentViewDate] = useState(new Date());
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);

  // --- Handlers ---
  const handleDelete = (id, title) => {
    Alert.alert("Delete Coupon", `Are you sure you want to delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          setCoupons(prev => prev.filter(c => c.id !== id));
          showToast("Coupon Deleted", `${title} removed.`, "success");
        } 
      }
    ]);
  };

  const handlePublish = () => {
    if (!newTitle || !newPoints || !newDuration) {
      showToast("Missing Info", "Please fill out all required fields.", "error");
      return;
    }
    const newCoupon = {
      id: Date.now().toString(),
      title: newTitle,
      points: newPoints,
      status: 'Active',
      image: 'https://images.unsplash.com/photo-1481833707121-59ef5ecc7723?q=80&w=200&auto=format&fit=crop'
    };
    setCoupons([newCoupon, ...coupons]);
    setModalVisible(false);
    setNewTitle(''); setNewDescription(''); setNewPoints(''); setNewDuration('');
    showToast("Success!", "Your new coupon is now live.", "success");
  };

  const selectDuration = (val) => {
    setDurationModalVisible(false);
    if (val === 'Custom Range') {
      setTimeout(() => setCalendarVisible(true), 350); 
    } else {
      setNewDuration(val);
    }
  };

  // --- Range Calendar Logic ---
  const changeMonth = (offset) => {
    setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + offset, 1));
  };

  const handleDateSelect = (date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(date);
      setRangeEnd(null);
    } else {
      if (date < rangeStart) {
        setRangeStart(date);
      } else {
        setRangeEnd(date);
      }
    }
  };

  const formatDate = (d) => {
    if (!d) return "Select Date";
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const applyCalendarDate = () => {
    if (rangeStart && rangeEnd) {
      setNewDuration(`${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`);
    } else if (rangeStart) {
      setNewDuration(`Starts: ${formatDate(rangeStart)}`);
    }
    setCalendarVisible(false);
  };

  // Generate Grid Array
  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1; 
  
  const calendarGrid = Array(startOffset).fill(null).concat([...Array(daysInMonth).keys()].map(i => i + 1));

  // Date Limits
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30); 

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      
      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('BusHome')} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>All Coupons</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
        
        {/* SEARCH BAR */}
        <View style={s.searchContainer}>
          <Feather name="search" size={20} color="#94A3B8" />
          <TextInput style={s.searchInput} placeholder="Search coupons by title..." placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* ADD NEW BUTTON */}
        <View style={s.actionRow}>
          <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)} activeOpacity={0.8}>
            <Feather name="plus-circle" size={18} color="#FFFFFF" />
            <Text style={s.addBtnText}>Add New</Text>
          </TouchableOpacity>
        </View>

        {/* COUPON LIST */}
        {coupons.map((coupon) => (
          <View key={coupon.id} style={s.card}>
            <View style={s.cardTop}>
              <Image source={{ uri: coupon.image }} style={s.cardImg} />
              <View style={s.cardInfo}>
                <Text style={s.cardTitle}>{coupon.title}</Text>
                <Text style={s.cardPoints}><Text style={s.pointsNumber}>{coupon.points}</Text> POINTS</Text>
              </View>
            </View>
            <View style={s.cardBottom}>
              <View style={[s.statusBadge, coupon.status === 'Active' ? s.statusActiveBg : s.statusPausedBg]}>
                <View style={[s.statusDot, coupon.status === 'Active' ? s.statusActiveDot : s.statusPausedDot]} />
                <Text style={[s.statusText, coupon.status === 'Active' ? s.statusActiveText : s.statusPausedText]}>{coupon.status}</Text>
              </View>
              <View style={s.cardActions}>
                <TouchableOpacity style={s.actionIconBtn}><Feather name="edit-3" size={18} color="#64748B" /></TouchableOpacity>
                <TouchableOpacity style={s.actionIconBtn} onPress={() => handleDelete(coupon.id, coupon.title)}><Feather name="trash-2" size={18} color="#64748B" /></TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* --------------------------------------------------- */}
      {/* 1. MAIN CREATE COUPON MODAL */}
      {/* --------------------------------------------------- */}
      {/* 👉 FIX: Added statusBarTranslucent={true} to ignore Android bottom bar */}
      <Modal visible={isModalVisible} transparent animationType="slide" statusBarTranslucent={true}>
        <View style={s.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', maxHeight: '90%' }}>
            
            {/* 👉 FIX: Removed paddingBottom from the sheet wrapper so the scroll isn't clipped */}
            <View style={[s.modalSheet, { paddingBottom: 0 }]}>
              
              {/* 👉 FIX: Moved paddingBottom into the ScrollView's contentContainerStyle */}
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                
                <View style={s.modalHeader}>
                  <View>
                    <Text style={s.modalTitle}>Create New Coupon</Text>
                    <Text style={s.modalSub}>Create a special offer for your loyal customers.</Text>
                  </View>
                  <TouchableOpacity onPress={() => setModalVisible(false)} style={s.closeBtn}><Feather name="x" size={24} color="#1E293B" /></TouchableOpacity>
                </View>

                <Text style={s.inputLabel}>COUPON ARTWORK</Text>
                <TouchableOpacity style={s.uploadBox} activeOpacity={0.7}>
                  <View style={s.uploadIconWrap}><Feather name="image" size={24} color="#4F46E5" /></View>
                  <Text style={s.uploadTitle}>Upload Coupon Image</Text>
                  <Text style={s.uploadSub}>Recommended size 1200×525 (PNG, JPG)</Text>
                </TouchableOpacity>

                <Text style={s.inputLabel}>COUPON TITLE</Text>
                <TextInput style={s.input} placeholder="e.g., Free Morning Latte" placeholderTextColor="#94A3B8" value={newTitle} onChangeText={setNewTitle} />

                <Text style={s.inputLabel}>DESCRIPTION</Text>
                <TextInput style={[s.input, s.textArea]} placeholder="Describe the terms..." placeholderTextColor="#94A3B8" multiline numberOfLines={4} value={newDescription} onChangeText={setNewDescription} textAlignVertical="top" />

                <View style={s.rowInputs}>
                  <View style={s.halfInput}>
                    <Text style={s.inputLabel}>PRICE IN POINTS</Text>
                    <View style={s.iconInputWrap}>
                      <Feather name="box" size={18} color="#4F46E5" style={s.inputIcon} />
                      <TextInput style={s.iconInput} placeholder="500" placeholderTextColor="#94A3B8" keyboardType="numeric" value={newPoints} onChangeText={setNewPoints} />
                    </View>
                  </View>
                  
                  <View style={s.halfInput}>
                    <Text style={s.inputLabel}>DURATION / EXPIRY</Text>
                    <TouchableOpacity style={s.iconInputWrap} onPress={() => setDurationModalVisible(true)} activeOpacity={0.7}>
                      <Feather name="calendar" size={18} color="#475569" style={s.inputIcon} />
                      <Text style={[s.iconInput, !newDuration && { color: '#94A3B8' }]} numberOfLines={1}>
                        {newDuration || "Select"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={s.publishBtn} onPress={handlePublish} activeOpacity={0.85}>
                  <Text style={s.publishBtnText}>Publish Coupon</Text>
                  <Feather name="send" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={s.footerNote}>VISIBLE TO ALL ACTIVE SUBSCRIBERS IMMEDIATELY</Text>
                
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* --------------------------------------------------- */}
      {/* 2. DURATION QUICK-PICK BOTTOM SHEET */}
      {/* --------------------------------------------------- */}
      <Modal visible={durationModalVisible} transparent animationType="fade" statusBarTranslucent={true}>
        <View style={s.durationOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDurationModalVisible(false)} />
          <View style={s.durationSheet}>
            <View style={s.modalHandle} />
            <Text style={s.durationTitle}>Select Expiry</Text>
            {DURATIONS.map((dur, index) => (
              <TouchableOpacity key={index} style={s.durationOption} onPress={() => selectDuration(dur)}>
                <Text style={[s.durationOptionText, newDuration === dur && s.durationOptionSelected, dur === 'Custom Range' && { color: '#4338CA', fontWeight: '700' }]}>{dur}</Text>
                {newDuration === dur && dur !== 'Custom Range' && <Feather name="check" size={20} color="#4F46E5" />}
                {dur === 'Custom Range' && <Feather name="calendar" size={18} color="#4338CA" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* --------------------------------------------------- */}
      {/* 3. CUSTOM RANGE CALENDAR MODAL */}
      {/* --------------------------------------------------- */}
      <Modal visible={calendarVisible} transparent animationType="fade" statusBarTranslucent={true}>
        <View style={s.calOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setCalendarVisible(false)} />
          
          <View style={s.calCard}>
            
            <View style={s.calHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={s.calNav}><Feather name="chevron-left" size={24} color="#64748B"/></TouchableOpacity>
              <Text style={s.calMonthText}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity onPress={() => changeMonth(1)} style={s.calNav}><Feather name="chevron-right" size={24} color="#64748B"/></TouchableOpacity>
            </View>

            <View style={s.calRangeBoxes}>
              <View style={s.calRangeBox}>
                <Text style={[s.calRangeBoxText, !rangeStart && { color: '#94A3B8' }]}>{formatDate(rangeStart)}</Text>
              </View>
              <Text style={s.calRangeDash}>–</Text>
              <View style={s.calRangeBox}>
                <Text style={[s.calRangeBoxText, !rangeEnd && { color: '#94A3B8' }]}>{formatDate(rangeEnd)}</Text>
              </View>
            </View>

            <View style={s.calDaysRow}>
              {DAYS.map((d, i) => <Text key={i} style={s.calDayLabel}>{d}</Text>)}
            </View>

            <View style={s.calGrid}>
              {calendarGrid.map((dayNum, i) => {
                if (!dayNum) return <View key={`empty-${i}`} style={s.calCellWrap} />;
                
                const thisDate = new Date(year, month, dayNum);
                const isStart = rangeStart && thisDate.getTime() === rangeStart.getTime();
                const isEnd = rangeEnd && thisDate.getTime() === rangeEnd.getTime();
                const inRange = rangeStart && rangeEnd && thisDate > rangeStart && thisDate < rangeEnd;
                
                const isPast = thisDate < today;
                const isTooFar = thisDate > maxDate;
                const isDisabled = isPast || isTooFar;

                const showRangeBg = rangeStart && rangeEnd && (isStart || isEnd || inRange);
                const isRowStart = i % 7 === 0;
                const isRowEnd = i % 7 === 6;

                const roundLeft = showRangeBg && (isStart || isRowStart);
                const roundRight = showRangeBg && (isEnd || isRowEnd);

                return (
                  <View key={i} style={[
                    s.calCellWrap, 
                    showRangeBg && s.calCellInRange,
                    roundLeft && s.calCellRadiusLeft,
                    roundRight && s.calCellRadiusRight
                  ]}>
                    <TouchableOpacity 
                      style={[s.calCell, (isStart || isEnd) && s.calCellSelected]} 
                      disabled={isDisabled}
                      onPress={() => handleDateSelect(thisDate)}
                    >
                      <Text style={[
                        s.calCellText, 
                        (isStart || isEnd) && s.calCellTextSelected, 
                        isDisabled && s.calCellTextDisabled
                      ]}>
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            <View style={s.calFooter}>
              <TouchableOpacity style={s.calBtnCancel} onPress={() => setCalendarVisible(false)}>
                <Feather name="x" size={18} color="#1E293B" />
                <Text style={s.calBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.calBtnApply} onPress={applyCalendarDate}>
                <Feather name="check" size={18} color="#FFFFFF" />
                <Text style={s.calBtnApplyText}>Apply</Text>
              </TouchableOpacity>
            </View>

          </View>
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
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1E293B' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 24 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#4338CA', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, gap: 8, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  cardTop: { flexDirection: 'row', marginBottom: 16 },
  cardImg: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F1F5F9' },
  cardInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  cardPoints: { fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  pointsNumber: { color: '#4338CA', fontSize: 16 },
  
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  statusActiveBg: { backgroundColor: '#ECFDF5' },
  statusPausedBg: { backgroundColor: '#F1F5F9' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusActiveDot: { backgroundColor: '#10B981' },
  statusPausedDot: { backgroundColor: '#64748B' },
  statusText: { fontSize: 13, fontWeight: '700' },
  statusActiveText: { color: '#059669' },
  statusPausedText: { color: '#64748B' },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionIconBtn: { padding: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  modalTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  modalSub: { fontSize: 14, color: '#64748B' },
  closeBtn: { padding: 4, backgroundColor: '#F8FAFC', borderRadius: 20 },
  
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', letterSpacing: 1, marginBottom: 8, marginTop: 16 },
  uploadBox: { backgroundColor: '#F8FAFC', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingVertical: 32, marginBottom: 8 },
  uploadIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  uploadSub: { fontSize: 12, color: '#94A3B8' },
  input: { backgroundColor: '#F8FAFC', borderRadius: 12, paddingHorizontal: 16, height: 52, fontSize: 15, color: '#1E293B', marginBottom: 8 },
  textArea: { height: 100, paddingTop: 16 },

  rowInputs: { flexDirection: 'row', gap: 16 },
  halfInput: { flex: 1 },
  iconInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, height: 52, paddingHorizontal: 16, marginBottom: 8 },
  inputIcon: { marginRight: 12 },
  iconInput: { flex: 1, fontSize: 14, color: '#1E293B' },

  publishBtn: { backgroundColor: '#4338CA', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, gap: 12, marginTop: 32, shadowColor: '#4338CA', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  publishBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  footerNote: { textAlign: 'center', fontSize: 10, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginTop: 24 },

  durationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  durationSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 24 },
  durationTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16 },
  durationOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  durationOptionText: { fontSize: 16, color: '#475569', fontWeight: '500' },
  durationOptionSelected: { color: '#4F46E5', fontWeight: '700' },

  calOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  calCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calNav: { padding: 4 },
  calMonthText: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  
  calRangeBoxes: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  calRangeBox: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  calRangeBoxText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  calRangeDash: { paddingHorizontal: 12, fontSize: 18, color: '#94A3B8' },

  calDaysRow: { flexDirection: 'row', marginBottom: 8 },
  calDayLabel: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '700', color: '#64748B' },
  
  calGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calCellWrap: { width: '14.28%', height: 44, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  calCellInRange: { backgroundColor: '#EEF2FF' }, 
  calCellRadiusLeft: { borderTopLeftRadius: 22, borderBottomLeftRadius: 22 },
  calCellRadiusRight: { borderTopRightRadius: 22, borderBottomRightRadius: 22 },
  
  calCell: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  calCellSelected: { backgroundColor: '#4338CA', borderRadius: 22 }, 
  calCellText: { fontSize: 15, color: '#1E293B' },
  calCellTextSelected: { color: '#FFFFFF', fontWeight: '700' },
  calCellTextDisabled: { color: '#CBD5E1' }, 
  
  calFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: 12 },
  calBtnCancel: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  calBtnCancelText: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  calBtnApply: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 12, backgroundColor: '#4338CA', gap: 8 },
  calBtnApplyText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});