import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import AddTaskModal from '../components/AddTaskModal';

// --- TIME TABS ICONS ---
const MorningIcon = ({ active }) => (
  <Feather name="sunrise" size={20} color={active ? '#fff' : '#F3CD50'} />
);

const EveningIcon = ({ active }) => (
  <Feather name="moon" size={20} color={active ? '#fff' : '#5C6BC0'} />
);

const AfternoonIcon = ({ active }) => (
  <Feather name="sun" size={20} color={active ? '#fff' : '#F57C00'} />
);

const AddIcon = () => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <Path d="M12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4ZM12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM17 11H13V7H11V11H7V13H11V17H13V13H17V11Z" fill="white"/>
  </Svg>
);

const StartIcon = () => (
  <Svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <Path d="M15.8125 11.6875L17.3456 14.6575L20.625 15.125L18.2188 17.3023L19.25 20.625L15.8125 18.7055L12.375 20.625L13.4062 17.3023L11 15.125L14.3687 14.6575L15.8125 11.6875Z" fill="white"/>
    <Path d="M17.1875 3.4375H15.125V2.75C15.1239 2.38566 14.9787 2.03656 14.7211 1.77893C14.4634 1.5213 14.1143 1.37609 13.75 1.375H8.25C7.88566 1.37609 7.53656 1.5213 7.27893 1.77893C7.0213 2.03656 6.87609 2.38566 6.875 2.75V3.4375H4.8125C4.44816 3.43859 4.09906 3.5838 3.84143 3.84143C3.5838 4.09906 3.43859 4.44816 3.4375 4.8125V19.25C3.43859 19.6143 3.5838 19.9634 3.84143 20.2211C4.09906 20.4787 4.44816 20.6239 4.8125 20.625H9.625V19.25H4.8125V4.8125H6.875V6.875H15.125V4.8125H17.1875V9.625H18.5625V4.8125C18.5614 4.44816 18.4162 4.09906 18.1586 3.84143C17.9009 3.5838 17.5518 3.43859 17.1875 3.4375ZM13.75 5.5H8.25V2.75H13.75V5.5Z" fill="white"/>
  </Svg>
);

const DeleteIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z" fill="#EF4444"/>
  </Svg>
);

const TIME_TABS = [
  { label: 'Morning', Icon: MorningIcon },
  { label: 'Afternoon', Icon: AfternoonIcon },
  { label: 'Evening', Icon: EveningIcon },
];

const DURATIONS = ['3 Days', '7 Days', '21 Days'];

const getTaskIcon = (time) => {
  const t = time?.toLowerCase();
  if (t === 'morning') return 'sunrise';
  if (t === 'afternoon') return 'sun';
  if (t === 'evening' || t === 'night') return 'moon';
  return 'check-circle';
};

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
  const { tasks, removeTask, saveRoutine, routineSaved, routineDays } = useApp();
  const [activeTab, setActiveTab] = useState('Morning');
  const [selectedDuration, setSelectedDuration] = useState('7 Days');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNote, setShowNote] = useState(true);

  const filteredTasks = tasks.filter(t => t.time === activeTab);

  const handleSave = () => {
    if (filteredTasks.length === 0) {
      Alert.alert('No Tasks', 'Add at least one task before saving!');
      return;
    }
    Alert.alert(
      '🔒 Lock Routine?',
      `You're about to lock your ${selectedDuration} routine.\n\nOnce saved, you cannot change your tasks until the ${selectedDuration} ends.\n\nAre you sure?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Yes, Lock for ${selectedDuration}`,
          style: 'destructive',
          onPress: () => {
            const days = parseInt(selectedDuration);
            saveRoutine(days);
            Alert.alert(
              '✅ Routine Locked!',
              `Your ${selectedDuration} habit routine starts now. Stay consistent! 🔥`,
              [{ text: "Let's Go! 💪" }]
            );
          },
        },
      ]
    );
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

        {/* Add New Button */}
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

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View style={s.emptyState}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyText}>No {activeTab} tasks yet!</Text>
            <Text style={s.emptySubtext}>Tap "Add New" to get started</Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <View key={task.id} style={s.taskRow}>
              <View style={s.taskIconWrap}>
                <Text style={{ fontSize: 24 }}>{task.icon}</Text>
              </View>
              <Text style={s.taskName}>{task.name}</Text>
              <TouchableOpacity
                onPress={() => removeTask(task.id)}
                activeOpacity={0.7}
                style={s.deleteBtnWrap}
              >
                <DeleteIcon />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Set Routine Card */}
        <View style={s.routineCard}>
          <Text style={s.routineTitle}>Set Routine 🎯</Text>
          <Text style={s.routineSub}>
            Once you Save this, you cannot change it until the date ends.
          </Text>
          <View style={s.durations}>
            {DURATIONS.map(d => (
              <TouchableOpacity
                key={d}
                style={[s.durBtn, selectedDuration === d && s.durBtnActive]}
                onPress={() => !routineSaved && setSelectedDuration(d)}
                activeOpacity={routineSaved ? 1 : 0.7}
              >
                <Text style={[s.durText, selectedDuration === d && s.durTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleSave} disabled={routineSaved} activeOpacity={0.85}>
            <LinearGradient
              colors={routineSaved ? ['#9CA3AF', '#9CA3AF'] : ['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.saveBtn}
            >
              {!routineSaved && <StartIcon />}
              <Text style={s.saveBtnText}>
                {routineSaved ? `✅ ${routineDays} Day Routine Active` : 'Save & Start'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AddTaskModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </SafeAreaView>
  );
};

// ── Banner StyleSheet ─────────────────────────────────────────────────────────
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
  text:  { fontSize: 12, color: '#065F46', lineHeight: 18, fontWeight: '500' },
  close: { padding: 4 },
  closeText: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
});

// ── Main StyleSheet ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingHorizontal: 20, paddingTop: 48, paddingBottom: 120 },

  tabs:        { flexDirection: 'row', gap: 10, marginBottom: 14, justifyContent: 'center' },
  tab:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  tabActive:   { backgroundColor: '#10B981', borderColor: '#10B981' },
  tabText:     { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#fff' },

  addBtn:         { alignSelf: 'flex-end', borderRadius: 24, marginBottom: 20, overflow: 'hidden' },
  addBtnGradient: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },

  emptyState:  { alignItems: 'center', paddingVertical: 48 },
  emptyIcon:   { fontSize: 48, marginBottom: 12 },
  emptyText:   { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 6 },
  emptySubtext:{ fontSize: 14, color: '#9CA3AF' },

  taskRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, borderWidth: 1.5, borderColor: '#D1FAE5', padding: 14, marginBottom: 12 },
  taskIconWrap:{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  taskName:    { flex: 1, fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  deleteBtnWrap: { padding: 4 },

  routineCard:  { backgroundColor: '#E8F8F2', borderRadius: 24, padding: 24, marginTop: 8, alignItems: 'center' },
  routineTitle: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', marginBottom: 8 },
  routineSub:   { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  durations:    { flexDirection: 'row', gap: 10, marginBottom: 20 },
  durBtn:       { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, borderColor: '#10B981', backgroundColor: '#fff' },
  durBtnActive: { backgroundColor: '#10B981' },
  durText:      { color: '#10B981', fontWeight: '600', fontSize: 14 },
  durTextActive:{ color: '#fff' },
  saveBtn:      { borderRadius: 24, paddingHorizontal: 32, paddingVertical: 14, width: 280, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default TaskListScreen;