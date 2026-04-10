import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet,
  TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../src/theme/theme';

const DURATION_PREDICTIONS = {
  gym: '1 hr',
  workout: '1 hr',
  exercise: '45 min',
  breakfast: '20 min',
  lunch: '30 min',
  dinner: '45 min',
  meal: '30 min',
  read: '20 min',
  study: '1 hr',
  office: '8 hr',
  work: '8 hr',
  notes: '30 min',
  meditate: '10 min',
  meditation: '10 min',
  walk: '20 min',
  shower: '15 min',
  water: '1 min',
  bed: '2 min',
  vitamin: '1 min',
  pill: '1 min',
  stretch: '10 min',
  journal: '10 min',
  skincare: '5 min',
  teeth: '2 min',
  clean: '15 min',
  plan: '10 min',
  gratitude: '5 min',
  hobby: '30 min'
};

const predictDuration = (text) => {
  const lowerText = text.toLowerCase();
  for (const [keyword, defaultTime] of Object.entries(DURATION_PREDICTIONS)) {
    if (lowerText.includes(keyword)) return defaultTime;
  }
  return null;
};
import Svg, { Path } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { PREDEFINED_TASKS, findMatchingTask } from '../constants/tasks';
import { suggestedTasksByCategory } from '../utils/smartTaskEngine';

const MAX_TASKS = 6;

const MorningIcon = ({ active }) => (
  <Feather name="sunrise" size={20} color={active ? theme.colors.textInverse : '#F3CD50'} />
);

const EveningIcon = ({ active }) => (
  <Feather name="moon" size={20} color={active ? theme.colors.textInverse : '#5C6BC0'} />
);

const AfternoonIcon = ({ active }) => (
  <Feather name="sun" size={20} color={active ? theme.colors.textInverse : '#F57C00'} />
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
  const { addTask, removeTask, tasks, draftTasks, setDraftTasks } = useApp();
  
  const isDraftMode = tasks.length === 0;
  const effectiveTasks = isDraftMode ? draftTasks : tasks;
  const [activeTab, setActiveTab] = useState('Morning');
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('suggestions'); 
  const [duration, setDuration] = useState('');
  const [isAutoGuessed, setIsAutoGuessed] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTaskInput(''); 
      setActiveTab('Morning'); 
      setActiveSection('suggestions'); 
      setDuration('');
      setIsAutoGuessed(false);
    }
  }, [visible]);

  const currentTabTasks = useMemo(
    () => effectiveTasks.filter(t => (t.timeCategory || t.time) === activeTab),
    [effectiveTasks, activeTab]
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
      if (existing) {
        if (isDraftMode) {
          setDraftTasks(draftTasks.filter(t => t.name !== existing.name));
        } else {
          removeTask(existing.id);
        }
      }
    } else {
      if (isMaxReached) {
        Alert.alert('Limit Reached', `Max ${MAX_TASKS} tasks per ${activeTab}!`);
        return;
      }
      const taskObj = {
        name: task.name,
        icon: task.icon,
        time: task.time || '', // 🚨 Changed: Don't force activeTab here!
        timeBlock: activeTab, 
        timeCategory: activeTab,
        duration: task.duration || predictDuration(task.name) || '15 min',
        descPlayful: task.descPlayful,
        descProfessional: task.descProfessional,
        order: task.order || 50
      };

      if (isDraftMode) {
        setDraftTasks([...draftTasks, taskObj]);
      } else {
        addTask(taskObj);
      }
    }
  };

  const handleAddManual = async () => {
    const trimmed = taskInput.trim();
    if (!trimmed) return;
    setLoading(true);
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
      const taskObj = { 
        name: match.name, 
        icon: match.icon, 
        time: '', 
        timeBlock: activeTab,
        timeCategory: activeTab,
        duration: duration || predictDuration(match.name) || '15 min', 
        descPlayful: match.descPlayful, 
        descProfessional: match.descProfessional,
        order: match.order || 50 
      };

      if (isDraftMode) {
        setDraftTasks([...draftTasks, taskObj]);
        setTaskInput('');
      } else {
        addTask(taskObj);
      }
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

        const taskObj = { 
          name: trimmed, 
          icon: '⚡', 
          time: '', 
          timeBlock: activeTab,
          timeCategory: activeTab,
          duration: duration || predictDuration(trimmed) || '15 min',
          descPlayful: aiResponse.sassy || "You know what to do 😏", 
          descProfessional: aiResponse.pro || `Time to complete your ${trimmed} habit.`,
          order: aiResponse.order || 50
        };

        if (isDraftMode) {
          setDraftTasks([...draftTasks, taskObj]);
        } else {
          addTask(taskObj);
        }

      } catch (err) {
        console.log("AI parsing error:", err);
        const taskObj = { 
          name: trimmed, 
          icon: '⚡', 
          time: '',
          timeBlock: activeTab,
          timeCategory: activeTab, 
          duration: duration || predictDuration(trimmed) || '15 min',
          descPlayful: "You know what to do 😏", 
          descProfessional: `Time to complete your ${trimmed} habit.`,
          order: 50 
        };

        if (isDraftMode) {
          setDraftTasks([...draftTasks, taskObj]);
        } else {
          addTask(taskObj);
        }
      }
    }
    
    setLoading(false);
    setTaskInput('');
  };

  const handleSaveAndClose = async () => {
    // 1. If there's custom text in the input, add it as a task first
    if (taskInput.trim().length > 0) {
      console.log("📝 Custom task text found - adding before close:", taskInput);
      await handleAddManual();
      // Small delay to let the task save
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 2. Clear all inputs
    setTaskInput('');
    setDuration('');
    setIsAutoGuessed(false);
    setActiveTab('Morning');
    setActiveSection('suggestions');
    
    // 3. Close the modal
    console.log("✅ Save & Close complete - closing modal");
    onClose();
  };

  const currentTaskCount = isDraftMode ? draftTasks.length : tasks.length;

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
              const count = tasks.filter(t => (t.timeCategory || t.time) === label).length;
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
              <Text style={[s.countText, isMaxReached && { color: theme.colors.error }]}>
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
              placeholderTextColor={theme.colors.textTertiary}
              value={taskInput}
              onChangeText={(t) => {
                setTaskInput(t);
                if (activeSection !== 'suggestions') setActiveSection('suggestions');
                
                const predicted = predictDuration(t);
                if (predicted && (!duration || isAutoGuessed)) {
                  setDuration(predicted);
                  setIsAutoGuessed(true);
                } else if (!predicted && isAutoGuessed) {
                  setDuration('');
                  setIsAutoGuessed(false);
                }
              }}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleAddManual}
            />
            {taskInput.length > 0 ? (
              <TouchableOpacity onPress={() => setTaskInput('')}>
                <Text style={{ color: theme.colors.textTertiary, fontSize: 16, paddingLeft: 8 }}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={s.inputRow}>
            <Text style={s.searchIcon}>⏱️</Text>
            <TextInput
              style={s.input}
              placeholder="e.g., 15 min or 1 hr"
              placeholderTextColor={theme.colors.textTertiary}
              value={duration}
              onChangeText={(t) => {
                setDuration(t);
                setIsAutoGuessed(false); // User took manual control
              }}
            />
          </View>

          {taskInput.trim().length > 0 && (
            <TouchableOpacity
              onPress={handleAddManual}
              disabled={loading || isMaxReached}
              activeOpacity={0.85}
              style={{ marginBottom: 10 }}
            >
              <LinearGradient
                colors={loading || isMaxReached ? [theme.colors.disabled, theme.colors.disabled] : [theme.colors.success, theme.palette.green400]}
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
                  {taskInput ? 'Matching Tasks' : 'Quick Suggestions'}
                </Text>
                {isMaxReached && <Text style={s.maxText}>{activeTab} full!</Text>}
              </View>

              {/* ✨ HORIZONTAL SCROLLVIEW: All suggested tasks from suggestedTasksByCategory */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.quickSuggestionsContainer}
                style={s.quickSuggestionsScroll}
              >
                {(suggestedTasksByCategory[activeTab] || []).map((suggestedTask, idx) => {
                  const added = isInList(suggestedTask);
                  return (
                    <TouchableOpacity
                      key={`${activeTab}-${idx}`}
                      style={[s.quickSuggestionBtn, added && s.quickSuggestionBtnAdded]}
                      onPress={() => {
                        console.log("🔘 Quick suggestion clicked:", suggestedTask, "| Time Category:", activeTab);
                        if (isInList(suggestedTask)) {
                          console.log("➖ Removing existing task:", suggestedTask);
                          const existing = getTaskFromList(suggestedTask);
                          if (existing) {
                            if (isDraftMode) {
                              setDraftTasks(draftTasks.filter(t => t.name !== existing.name));
                            } else {
                              removeTask(existing.id);
                            }
                          }
                        } else {
                          if (isMaxReached) {
                            console.log("🛑 Max reached for", activeTab);
                            Alert.alert('Slot Full 🛑', `Max ${MAX_TASKS} tasks in ${activeTab}. Focus on what matters!`);
                            return;
                          }
                          console.log("➕ Adding new task via addTask():", { name: suggestedTask, time: activeTab });
                          const newTaskObj = {
                            name: suggestedTask,
                            icon: '⭐',
                            time: '', // 🚨 Leave blank so duration takes priority
                            timeBlock: activeTab, 
                            timeCategory: activeTab,
                            duration: predictDuration(suggestedTask) || '15 min',
                            descPlayful: `Time for ${suggestedTask} 🎯`,
                            descProfessional: `Complete ${suggestedTask} as part of your ${activeTab} routine.`,
                            order: 50
                          };
                          if (isDraftMode) {
                            setDraftTasks([...draftTasks, newTaskObj]);
                          } else {
                            addTask(newTaskObj);
                          }
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.quickSuggestionText, added && s.quickSuggestionTextAdded]}>
                        {suggestedTask}
                      </Text>
                      <Text style={[s.quickSuggestionBadge, added && s.quickSuggestionBadgeAdded]}>
                        {added ? '✓' : '+'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={s.divider} />

              <View style={s.sectionHeader}>
                <Text style={s.sectionLabel}>More Tasks</Text>
              </View>

              {/* VERTICAL SCROLLVIEW: Detailed predefined tasks */}
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
                        key={task.id || task.name}
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
                  currentTabTasks.map((task, index) => (
                    <View key={task.id || task.name || index} style={s.addedRow}>
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

          <TouchableOpacity onPress={handleSaveAndClose} activeOpacity={0.85} style={{ marginTop: theme.spacing.md }}>
            <LinearGradient
              colors={[theme.colors.success, theme.palette.green600]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.saveBtn}
            >
              <Text style={s.saveBtnText}>
                ✓ Save & Close · {currentTaskCount} task{currentTaskCount !== 1 ? 's' : ''} total
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
  card: { 
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.radius.xl, 
    padding: theme.spacing.lg, 
    width: theme.components.modal.widthPercent, 
    maxWidth: theme.components.modal.maxWidth, 
    maxHeight: '88%', 
    ...theme.shadow.md 
  },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md },
  title: { ...theme.typography.h3, color: theme.colors.textPrimary, marginBottom: 2 },
  subtitle: { ...theme.typography.bodySm, color: theme.colors.textTertiary },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.divider, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  closeBtnText: { ...theme.typography.labelSm, color: theme.colors.textSecondary },

  tabs: { flexDirection: 'row', gap: 10, marginBottom: theme.spacing.md, alignItems: 'center' },
  tab: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.divider, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  tabActive: { backgroundColor: theme.colors.success },
  tabBadge: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: theme.colors.success, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.colors.surface },
  tabBadgeText: { color: theme.colors.textInverse, fontSize: 10, fontWeight: '800' },
  countBadge: { marginLeft: 'auto', backgroundColor: theme.colors.divider, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { ...theme.typography.labelSm, color: theme.colors.textSecondary },

  sectionToggle: { flexDirection: 'row', backgroundColor: theme.colors.divider, borderRadius: 12, padding: 3, marginBottom: theme.spacing.md, gap: 3 },
  sectionBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  sectionBtnActive: { backgroundColor: theme.colors.surface, ...theme.shadow.sm },
  sectionBtnText: { ...theme.typography.labelSm, color: theme.colors.textTertiary },
  sectionBtnTextActive: { color: theme.colors.textPrimary },

  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.divider, borderRadius: theme.radius.md, paddingHorizontal: 14, marginBottom: 10 },
  searchIcon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, ...theme.typography.body, color: theme.colors.textPrimary },

  addManualBtn: { borderRadius: theme.radius.md, paddingVertical: 12, alignItems: 'center' },
  addManualText: { color: theme.colors.textInverse, fontWeight: '700', fontSize: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionLabel: { ...theme.typography.caption, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  maxText: { ...theme.typography.labelSm, color: theme.colors.error },
  emptyHint: { ...theme.typography.bodySm, color: theme.colors.textTertiary },

  list: { maxHeight: 180 },

  // ✨ Quick Suggestions Horizontal ScrollView Styles
  quickSuggestionsScroll: { marginBottom: theme.spacing.md, maxHeight: 110 },
  quickSuggestionsContainer: { paddingHorizontal: 0, paddingRight: 12, gap: 8 },
  quickSuggestionBtn: {
    backgroundColor: theme.colors.divider,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 140,
  },
  quickSuggestionBtnAdded: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  quickSuggestionText: {
    ...theme.typography.label,
    color: theme.palette.gray700,
    flex: 1,
  },
  quickSuggestionTextAdded: {
    color: theme.colors.success,
  },
  quickSuggestionBadge: {
    ...theme.typography.badge,
    color: theme.colors.textTertiary,
    borderRadius: 10,
    width: 20,
    height: 20,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  quickSuggestionBadgeAdded: {
    color: theme.colors.textInverse,
    backgroundColor: theme.colors.success,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 8,
  },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: theme.radius.md, marginBottom: 4, backgroundColor: theme.colors.background },
  rowAdded: { backgroundColor: theme.colors.successLight },
  rowIcon: { fontSize: 20, marginRight: 10 },
  rowText: { flex: 1, ...theme.typography.label, color: theme.colors.textPrimary },
  rowTextAdded: { color: theme.colors.success },
  badge: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.successLight, alignItems: 'center', justifyContent: 'center' },
  badgeAdded: { backgroundColor: theme.colors.success },
  badgeText: { color: theme.colors.success, fontWeight: '800', fontSize: 16 },
  badgeTextAdded: { color: theme.colors.textInverse, fontSize: 13 },

  addedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: theme.radius.md, marginBottom: 4, backgroundColor: theme.colors.successLight, borderWidth: 1, borderColor: theme.colors.successBorder },
  addedRowText: { flex: 1, ...theme.typography.label, color: theme.colors.success },
  removeBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontSize: 22, color: theme.colors.error },

  emptyState: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { ...theme.typography.bodySm, color: theme.colors.textTertiary, textAlign: 'center', marginBottom: 8 },
  emptyLink: { color: theme.colors.success, ...theme.typography.labelSm },

  saveBtn: { borderRadius: theme.radius.md, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: theme.colors.textInverse, fontWeight: '700', fontSize: 15 },

  sectionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 16,
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 7,
  },
  chipText: {
    ...theme.typography.label,
    color: theme.palette.gray700,
    marginRight: 10,
  },
  chipPlus: {
    backgroundColor: theme.colors.border,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipPlusText: {
    ...theme.typography.labelSm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});

export default AddTaskModal;