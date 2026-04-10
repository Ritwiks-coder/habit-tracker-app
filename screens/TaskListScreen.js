import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useApp } from '../context/AppContext';
import AddTaskModal from '../components/AddTaskModal';
import { analyzeTask, getTaskEmoji } from '../utils/smartTaskEngine';

const getSafeDuration = (durationInMinutes) => {
  // 1. If it's missing, null, or Not a Number, return null so we can fallback to timeCategory
  if (!durationInMinutes || isNaN(durationInMinutes)) {
    return null;
  }

  // 2. If it is a real number, safely calculate the math
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

const getRemainingLockTime = (lockedUntilDate) => {
  if (!lockedUntilDate) return null;
  const total = new Date(lockedUntilDate) - new Date();
  if (total <= 0) return null; // Lock is over
  
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  return `${days}d ${hours}hr`;
};

// --- TIME TABS ICONS (Your Original Colors) ---
const MorningIcon = ({ active }) => (
  <Feather name="sunrise" size={20} color={active ? '#fff' : '#F3CD50'} />
);

const AfternoonIcon = ({ active }) => (
  <Feather name="sun" size={20} color={active ? '#fff' : '#F57C00'} />
);

const EveningIcon = ({ active }) => (
  <Feather name="moon" size={20} color={active ? '#fff' : '#5C6BC0'} />
);


// --- SVG ICONS ---
const AddIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM17 11H13V7H11V11H7V13H11V17H13V13H17V11Z" fill="white" />
  </Svg>
);

const StartIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path d="M15.8125 11.6875L17.3456 14.6575L20.625 15.125L18.2188 17.3023L19.25 20.625L15.8125 18.7055L12.375 20.625L13.4062 17.3023L11 15.125L14.3687 14.6575L15.8125 11.6875Z" fill="white" />
    <Path d="M17.1875 3.4375H15.125V2.75C15.1239 2.38566 14.9787 2.03656 14.7211 1.77893C14.4634 1.5213 14.1143 1.37609 13.75 1.375H8.25C7.88566 1.37609 7.53656 1.5213 7.27893 1.77893C7.0213 2.03656 6.87609 2.38566 6.875 2.75V3.4375H4.8125C4.44816 3.43859 4.09906 3.5838 3.84143 3.84143C3.5838 4.09906 3.43859 4.44816 3.4375 4.8125V19.25C3.43859 19.6143 3.5838 19.9634 3.84143 20.2211C4.09906 20.4787 4.44816 20.6239 4.8125 20.625H9.625V19.25H4.8125V4.8125H6.875V6.875H15.125V4.8125H17.1875V9.625H18.5625V4.8125C18.5614 4.44816 18.4162 4.09906 18.1586 3.84143C17.9009 3.5838 17.5518 3.43859 17.1875 3.4375ZM13.75 5.5H8.25V2.75H13.75V5.5Z" fill="white" />
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" fill="#EF4444" />
  </Svg>
);

// ── NEW BALANCED SVG ICON ──
const LockDocIcon = ({ size = 22, color = "#10B981" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      fill={color}
      d="M18 13C16.6 13 15.2 14.1 15.2 15.5V17C14.6 17 14 17.6 14 18.2V21.7C14 22.4 14.6 23 15.2 23H20.7C21.4 23 22 22.4 22 21.8V18.3C22 17.6 21.4 17 20.8 17V15.5C20.8 14.1 19.4 13 18 13ZM18 14.2C18.8 14.2 19.5 14.7 19.5 15.5V17H16.5V15.5C16.5 14.7 17.2 14.2 18 14.2ZM6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H12V20H6V4H13V9H18V11C18.7 11 19.4 11.2 20 11.4V8L14 2H6Z"
    />
  </Svg>
);

const TIME_TABS = [
  { label: 'Morning', Icon: MorningIcon },
  { label: 'Afternoon', Icon: AfternoonIcon },
  { label: 'Evening', Icon: EveningIcon },
];

const DURATIONS = ['3 Days', '7 Days', '21 Days'];


// ── Dismissible Info Note ─────────────────────────────────────────────────────
const InfoNote = ({ onDismiss }) => (
  <View style={banner.wrap}>
    <View style={banner.textWrap}>
      <Text style={banner.text}>
        💡 Tasks appear on home by time block. Switch tabs to manage each.
      </Text>
    </View>
    <TouchableOpacity onPress={onDismiss} activeOpacity={0.7} style={banner.close}>
      <Text style={banner.closeText}>✕</Text>
    </TouchableOpacity>
  </View>
);

const TaskListScreen = () => {
  const navigation = useNavigation();
  const { tasks, draftTasks, setDraftTasks, removeTask, startRoutine, isRoutineLocked, routineLockedUntil, saveBulkTasks, userProfile } = useApp();
  
  // ── LOCK LOGIC (Clean Data) ──
  const lockRemaining = getRemainingLockTime(routineLockedUntil || userProfile?.routineLockedUntil);
  const isLocked = lockRemaining !== null;
  const [activeTab, setActiveTab] = useState('Morning');
  const [selectedDuration, setSelectedDuration] = useState('7 Days');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNote, setShowNote] = useState(true);

  // State for our new custom modal
  const [showLockModal, setShowLockModal] = useState(false);

  const isDraftMode = tasks.length === 0;
  const displayTasks = isDraftMode ? draftTasks : tasks;

  // Filter using timeCategory
  const filteredTasks = displayTasks.filter(t => (t.timeCategory || t.time) === activeTab);

  const handleSaveClick = () => {
    if (filteredTasks.length === 0) {
      Alert.alert('No Tasks', 'Add at least one task before saving!');
      return;
    }

    if (isRoutineLocked) {
      Alert.alert('🔒 Routine Already Active', 'You already have an active routine. Wait for it to expire before starting a new one.');
      return;
    }

    // Open the custom modal instead of the system alert
    setShowLockModal(true);
  };

  const confirmLock = async () => {
    setShowLockModal(false);
    const days = parseInt(selectedDuration);
    
    // Start the routine lock timer in Firebase first
    await startRoutine(days);
    
    if (isDraftMode) {
      // Actually save the draft tasks to Firebase
      const success = await saveBulkTasks(draftTasks);
      
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Routine Locked In 🚀',
          text2: 'Your tasks are saved and ready to go.',
          props: { uuid: Math.random() }
        });
        navigation.navigate('Home');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Save Failed',
          text2: 'Could not lock your routine.',
          props: { uuid: Math.random() }
        });
      }
    } else {
      // If just locking an existing routine, navigate home manually
      Toast.show({
        type: 'success',
        text1: 'Routine Locked In 🚀',
        text2: 'Your routine lock timer has been updated.',
        props: { uuid: Math.random() }
      });
      navigation.navigate('Home');
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Time Tabs */}
        <View style={s.tabs}>
          {TIME_TABS.map(({ label, Icon }) => (
            <TouchableOpacity
              key={label}
              style={[s.tab, activeTab === label && s.tabActive]}
              onPress={() => setActiveTab(label)}
            >
              <Icon active={activeTab === label} />
              <Text style={[s.tabText, activeTab === label && s.tabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Dismissible Info Note ── */}
        {showNote && <InfoNote onDismiss={() => setShowNote(false)} />}

        {/* Add New Button - Hides when locked */}
        {!isRoutineLocked && (
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.addBtnGradient}
            >
              <AddIcon />
              <Text style={s.addBtnText}>Add New</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Task List Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937' }}>{activeTab} Tasks</Text>
          <Text style={{ color: '#9CA3AF', fontWeight: '600' }}>{filteredTasks.length}/6</Text>
        </View>

        {filteredTasks.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyText}>No {activeTab} tasks yet!</Text>
            <Text style={s.emptySubtext}>Tap "Add New" to get started</Text>
          </View>
        ) : (
          filteredTasks.map((task, index) => (
            <View key={task.id || `draft-${index}`} style={s.taskRow}>

              <View style={s.taskIconWrap}>
                <Text style={{ fontSize: 22 }}>{getTaskEmoji(task.name)}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.taskName}>{task.name}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {task.duration || '15 min'}
                </Text>
              </View>

              {!isRoutineLocked && (
                <TouchableOpacity
                  onPress={() => {
                    if (isDraftMode) {
                      setDraftTasks(draftTasks.filter(dt => dt.name !== task.name));
                    } else {
                      removeTask(task.id);
                    }
                  }}
                  activeOpacity={0.7}
                  style={s.deleteBtnWrap}
                >
                  <DeleteIcon />
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        {/* Set Routine Card */}
        <View style={s.routineCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <LockDocIcon size={24} color="#1C1C1E" />
            <Text style={[s.routineTitle, { marginBottom: 0 }]}>Set Routine</Text>
          </View>
          <Text style={s.routineSub}>
            Once you Save this, you cannot change it until the date ends.
          </Text>
          <View style={s.durations}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[s.durBtn, selectedDuration === d && s.durBtnActive]}
                onPress={() => !isRoutineLocked && setSelectedDuration(d)}
                activeOpacity={isRoutineLocked ? 1 : 0.7}
              >
                <Text style={[s.durText, selectedDuration === d && s.durTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {(!isDraftMode || (isDraftMode && draftTasks.length > 0)) && (
            <TouchableOpacity 
              onPress={handleSaveClick} 
              disabled={isLocked} 
              activeOpacity={0.8}
              style={[s.saveBtnStyle, isLocked && { backgroundColor: '#F3F4F6' }]}
            >
              <LinearGradient
                colors={isLocked ? ['#F3F4F6', '#F3F4F6'] : ['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.saveBtn}
              >
                {!isLocked && <StartIcon />}
                <Text style={[s.saveBtnText, isLocked && { color: '#9CA3AF' }]}>
                  {isLocked ? lockRemaining : "Lock Routine"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>



      </ScrollView>

      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        activeTab={activeTab}
      />

      {/* ── PREMIUM LOCK ROUTINE MODAL ── */}
      <Modal visible={showLockModal} transparent={true} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>

            <View style={s.modalIconRing}>
              <LockDocIcon size={34} color="#10B981" />
            </View>

            <Text style={s.modalTitle}>Commit to {selectedDuration}?</Text>
            <Text style={s.modalText}>
              You are about to lock in your habits. You won't be able to edit or delete these tasks until the time expires. Are you ready to crush your goals?
            </Text>

            <View style={s.modalActions}>
              <TouchableOpacity style={{ width: '100%' }} onPress={confirmLock} activeOpacity={0.8}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.modalPrimaryBtn}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <LockDocIcon size={20} color="#ffffff" />
                    <Text style={s.modalPrimaryBtnText}>Yes, Lock It In</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={s.modalCancelBtn} onPress={() => setShowLockModal(false)}>
                <Text style={s.modalCancelText}>I need to make changes</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// ── Banner StyleSheet (Restored) ──────────────────────────────────────────────
const banner = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF9',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  textWrap: { flex: 1 },
  text: { fontSize: 12, color: '#065F46', lineHeight: 18, fontWeight: '500' },
  close: { padding: 4 },
  closeText: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
});

// ── Main StyleSheet (Your Original Styles + Modal Styles) ─────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 120 },

  tabs: { flexDirection: 'row', gap: 10, marginBottom: 14, justifyContent: 'center' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  tabActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  addBtn: { alignSelf: 'flex-end', borderRadius: 24, marginBottom: 20, overflow: 'hidden' },
  addBtnGradient: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF' },

  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: '#D1FAE5', padding: 14, marginBottom: 12 },
  taskIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  taskName: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  deleteBtnWrap: { padding: 4 },

  routineCard: { backgroundColor: '#E8F8F2', borderRadius: 24, padding: 24, marginTop: 8, alignItems: 'center' },
  routineTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  routineSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  durations: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  durBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: '#10B981', backgroundColor: '#fff' },
  durBtnActive: { backgroundColor: '#10B981' },
  durText: { color: '#10B981', fontWeight: '600', fontSize: 14 },
  durTextActive: { color: '#fff' },
  saveBtn: { borderRadius: 24, paddingHorizontal: 32, paddingVertical: 14, width: 280, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // ── MODAL STYLES ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 8,
    borderColor: '#D1FAE5',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  modalActions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  modalPrimaryBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalPrimaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalCancelBtn: {
    paddingVertical: 12,
  },
  modalCancelText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default TaskListScreen;