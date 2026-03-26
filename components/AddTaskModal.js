import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PREDEFINED_TASKS, findMatchingTask } from '../constants/tasks';

const MAX_TASKS = 6;

const MorningIcon = ({ active }) => (
  <Feather name="sunrise" size={20} color={active ? '#fff' : '#F3CD50'} />
);

const EveningIcon = ({ active }) => (
  <Feather name="moon" size={20} color={active ? '#fff' : '#5C6BC0'} />
);

const AfternoonIcon = ({ active }) => (
  <Feather name="sun" size={20} color={active ? '#fff' : '#F57C00'} />
);

const TIME_TABS = [
  { label: 'Morning', Icon: MorningIcon },
  { label: 'Afternoon', Icon: AfternoonIcon },
  { label: 'Evening', Icon: EveningIcon },
];

const getTaskIcon = (time) => {
  const t = time?.toLowerCase();
  if (t === 'morning') return 'sunrise';
  if (t === 'afternoon') return 'sun';
  if (t === 'evening' || t === 'night') return 'moon';
  return 'check-circle';
};

const AddTaskModal = ({ visible, onClose }) => {
  const { addTask, removeTask, tasks } = useApp();
  const [activeTab, setActiveTab] = useState('Morning');
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('suggestions'); 

  useEffect(() => {
    if (!visible) {
      setTaskInput(''); 
      setActiveTab('Morning'); 
      setActiveSection('suggestions'); 
    }
  }, [visible]);

  const currentTabTasks = useMemo(
    () => tasks.filter(t => t.time === activeTab),
    [tasks, activeTab]
  );

  const isMaxReached = currentTabTasks.length >= MAX_TASKS;
  const isInList = (name) => currentTabTasks.some(t => t.name.toLowerCase() === name.toLowerCase());
  const getTaskFromList = (name) => currentTabTasks.find(t => t.name.toLowerCase() === name.toLowerCase());

  const filteredSuggestions = useMemo(() => {
    const timeFiltered = PREDEFINED_TASKS.filter(t => t.time === activeTab);
    const input = taskInput.toLowerCase().trim();
    if (!input) return timeFiltered;
    return timeFiltered.filter(t =>
      t.name.toLowerCase().includes(input) ||
      t.keywords?.some(k => input.includes(k) || k.includes(input))
    );
  }, [taskInput, activeTab]);

  const handleToggleSuggestion = (task) => {
    if (isInList(task.name)) {
      const existing = getTaskFromList(task.name);
      if (existing) removeTask(existing.id);
    } else {
      if (isMaxReached) {
        Alert.alert('Limit Reached', `Max ${MAX_TASKS} tasks per ${activeTab}!`);
        return;
      }
      addTask({
        name: task.name,
        icon: task.icon,
        time: activeTab,
        descPlayful: task.descPlayful,
        descProfessional: task.descProfessional,
        order: task.order || 50 // ADDED: Pulls order from the predefined task!
      });
    }
  };

  const handleAddManual = async () => {
    const trimmed = taskInput.trim();
    if (!trimmed) return;
    
    if (isMaxReached) {
      Alert.alert('Limit Reached', `Max ${MAX_TASKS} tasks per ${activeTab}!`);
      return;
    }
    if (isInList(trimmed)) {
      Alert.alert('Already Added', `"${trimmed}" is already in your ${activeTab} list!`);
      return;
    }
    
    setLoading(true);
    
    const match = findMatchingTask(trimmed);
    if (match) {
      if (isInList(match.name)) {
        Alert.alert('Already Added', `"${match.name}" is already in your ${activeTab} list!`);
        setLoading(false);
        return;
      }
      addTask({ 
        name: match.name, 
        icon: match.icon, 
        time: activeTab, 
        descPlayful: match.descPlayful, 
        descProfessional: match.descProfessional,
        order: match.order || 50 // ADDED: Pulls order from match
      });
    } else {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307', 
            max_tokens: 100,
            // ADDED: Prompt now strictly demands an "order" number
            messages: [{ 
              role: 'user', 
              content: `You are an app assistant. The user added a habit called "${trimmed}". Write two 1-sentence reminders (max 8 words each). 1: "sassy" (Funny, sarcastic). 2: "pro" (Professional, polite). 3: "order" (A number 1-100 indicating when this is typically done in a time block. 1 is first, 100 is absolute last, e.g., sleeping is 100). Return ONLY a valid JSON object in this exact format, nothing else: {"sassy": "...", "pro": "...", "order": 50}` 
            }]
          })
        });
        
        const data = await res.json();
        
        let rawText = data.content[0].text.trim();
        if (rawText.startsWith('```json')) {
          rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (rawText.startsWith('```')) {
          rawText = rawText.replace(/```/g, '').trim();
        }

        const aiResponse = JSON.parse(rawText);

        addTask({ 
          name: trimmed, 
          icon: '⚡', 
          time: activeTab, 
          descPlayful: aiResponse.sassy || "You know what to do 😏", 
          descProfessional: aiResponse.pro || `Time to complete your ${trimmed} habit.`,
          order: aiResponse.order || 50 // ADDED: Saves the AI's chronologic guess
        });

      } catch (err) {
        console.log("AI parsing error:", err);
        addTask({ 
          name: trimmed, 
          icon: '⚡', 
          time: activeTab, 
          descPlayful: "You know what to do 😏", 
          descProfessional: `Time to complete your ${trimmed} habit.`,
          order: 50
        });
      }
    }
    
    setLoading(false);
    setTaskInput('');
  };

  const totalTasks = tasks.length;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={s.overlay}
      >
        <TouchableOpacity style={s.backdrop} onPress={onClose} activeOpacity={1} />

        <View style={s.card}>

          <View style={s.header}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>Add New Task</Text>
              <Text style={s.subtitle}>Build your full routine across all timelines</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={s.tabs}>
            {TIME_TABS.map(({ label, Icon }) => {
              const count = tasks.filter(t => t.time === label).length;
              return (
                <TouchableOpacity
                  key={label}
                  style={[s.tab, activeTab === label && s.tabActive]}
                  onPress={() => setActiveTab(label)}
                >
                  <Icon active={activeTab === label} />
                  {count > 0 ? (
                    <View style={s.tabBadge}>
                      <Text style={s.tabBadgeText}>{count}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
            <View style={s.countBadge}>
              <Text style={[s.countText, isMaxReached && { color: '#EF4444' }]}>
                {currentTabTasks.length}/{MAX_TASKS}
              </Text>
            </View>
          </View>

          <View style={s.sectionToggle}>
            <TouchableOpacity
              style={[s.sectionBtn, activeSection === 'suggestions' && s.sectionBtnActive]}
              onPress={() => setActiveSection('suggestions')}
            >
              <Text style={[s.sectionBtnText, activeSection === 'suggestions' && s.sectionBtnTextActive]}>
                Suggestions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.sectionBtn, activeSection === 'added' && s.sectionBtnActive]}
              onPress={() => setActiveSection('added')}
            >
              <Text style={[s.sectionBtnText, activeSection === 'added' && s.sectionBtnTextActive]}>
                Added ({currentTabTasks.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.inputRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.input}
              placeholder="Search or type custom task..."
              placeholderTextColor="#9CA3AF"
              value={taskInput}
              onChangeText={(t) => {
                setTaskInput(t);
                if (activeSection !== 'suggestions') setActiveSection('suggestions');
              }}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleAddManual}
            />
            {taskInput.length > 0 ? (
              <TouchableOpacity onPress={() => setTaskInput('')}>
                <Text style={{ color: '#9CA3AF', fontSize: 16, paddingLeft: 8 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {taskInput.trim().length > 0 && (
            <TouchableOpacity
              onPress={handleAddManual}
              disabled={loading || isMaxReached}
              activeOpacity={0.85}
              style={{ marginBottom: 10 }}
            >
              <LinearGradient
                colors={loading || isMaxReached ? ['#9CA3AF', '#9CA3AF'] : ['#10B981', '#34D399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.addManualBtn}
              >
                <Text style={s.addManualText}>
                  {loading ? 'Adding...' : isMaxReached ? `${activeTab} is full` : `+ Add "${taskInput.trim()}"`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {activeSection === 'suggestions' ? (
            <>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>
                  {taskInput ? 'Matching Tasks' : 'Suggested Habits'}
                </Text>
                {isMaxReached && <Text style={s.maxText}>{activeTab} full!</Text>}
              </View>
              <ScrollView
                style={s.list}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled" 
              >
                {filteredSuggestions.length === 0 ? (
                  <View style={s.emptyState}>
                    <Text style={s.emptyText}>No match — tap "+ Add" above to add as custom task</Text>
                  </View>
                ) : (
                  filteredSuggestions.map(task => {
                    const added = isInList(task.name);
                    return (
                      <TouchableOpacity
                        key={task.id}
                        style={[s.row, added && s.rowAdded]}
                        onPress={() => handleToggleSuggestion(task)}
                        activeOpacity={0.7}
                      >
                        <Text style={s.rowIcon}>{task.icon}</Text>
                        <Text style={[s.rowText, added && s.rowTextAdded]}>{task.name}</Text>
                        <View style={[s.badge, added && s.badgeAdded]}>
                          <Text style={[s.badgeText, added && s.badgeTextAdded]}>
                            {added ? '✓' : '+'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>{activeTab} Tasks</Text>
                {currentTabTasks.length === 0 && (
                  <Text style={s.emptyHint}>None added yet</Text>
                )}
              </View>
              <ScrollView
                style={s.list}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {currentTabTasks.length === 0 ? (
                  <View style={s.emptyState}>
                    <Text style={s.emptyText}>No tasks added for {activeTab} yet.</Text>
                    <TouchableOpacity onPress={() => setActiveSection('suggestions')}>
                      <Text style={s.emptyLink}>Browse suggestions →</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  currentTabTasks.map(task => (
                    <View key={task.id} style={s.addedRow}>
                      <Text style={s.rowIcon}>{task.icon}</Text>
                      <Text style={s.addedRowText}>{task.name}</Text>
                      <TouchableOpacity
                        style={s.removeBtn}
                        onPress={() => removeTask(task.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={s.removeBtnText}>⊖</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </>
          )}

          <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={{ marginTop: 12 }}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.saveBtn}
            >
              <Text style={s.saveBtnText}>
                ✓ Save & Close · {totalTasks} task{totalTasks !== 1 ? 's' : ''} total
              </Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '92%', maxWidth: 400, maxHeight: '88%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', color: '#1C1C1E', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#9CA3AF' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  closeBtnText: { fontSize: 13, color: '#6B7280', fontWeight: '700' },

  tabs: { flexDirection: 'row', gap: 10, marginBottom: 14, alignItems: 'center' },
  tab: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabActive: { backgroundColor: '#10B981' },
  tabBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  countBadge: { marginLeft: 'auto', backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },

  sectionToggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 3, marginBottom: 12, gap: 3 },
  sectionBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  sectionBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  sectionBtnText: { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
  sectionBtnTextActive: { color: '#1C1C1E' },

  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 },
  searchIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#1C1C1E' },

  addManualBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  addManualText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.5 },
  maxText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  emptyHint: { fontSize: 12, color: '#9CA3AF' },

  list: { maxHeight: 220 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4, backgroundColor: '#F9FAFB' },
  rowAdded: { backgroundColor: '#F0FDF4' },
  rowIcon: { fontSize: 20, marginRight: 10 },
  rowText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  rowTextAdded: { color: '#10B981' },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center' },
  badgeAdded: { backgroundColor: '#10B981' },
  badgeText: { color: '#10B981', fontWeight: '800', fontSize: 16 },
  badgeTextAdded: { color: '#fff', fontSize: 13 },

  addedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#D1FAE5' },
  addedRowText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#10B981' },
  removeBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 22, color: '#EF4444' },

  emptyState: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  emptyLink: { color: '#10B981', fontSize: 13, fontWeight: '600' },

  saveBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default AddTaskModal;