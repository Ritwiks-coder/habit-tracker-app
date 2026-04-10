import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import { useApp } from '../context/AppContext';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Make sure this is installed!

const SkipDialog = ({ 
  visible, 
  onClose, 
  taskId, 
  taskName = "this task", 
  freeSkipsRemaining = 0 
}) => {
  const { skipTask, points } = useApp(); // You call them points here

  const skipCost = 50;
  const canAfford = points >= skipCost;
  const hasFreeSkips = freeSkipsRemaining > 0;

  const handle = (method) => {
    skipTask(taskId, method);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        
        <View style={styles.box}>
          <View style={[styles.iconContainer, hasFreeSkips ? styles.iconContainerFree : styles.iconContainerPaid]}>
            <MaterialCommunityIcons 
              name="debug-step-over" 
              size={36} 
              color={hasFreeSkips ? '#10B981' : '#3B82F6'} 
            />
          </View>

          <Text style={styles.title}>Skip {taskName}?</Text>
          
          <Text style={styles.subtitle}>
            {hasFreeSkips 
              ? `You have ${freeSkipsRemaining} free skip${freeSkipsRemaining > 1 ? 's' : ''} left today.`
              : "You're out of free skips! Choose how you want to skip."}
          </Text>

          <View style={styles.buttonContainer}>
            {hasFreeSkips ? (
              // --- FREE SKIP BUTTON ---
              <TouchableOpacity style={[styles.actionBtn, styles.freeBtn]} onPress={() => handle('free')}>
                <Text style={styles.btnText}>🎁 Use Free Skip</Text>
              </TouchableOpacity>
            ) : (
              // --- PAID/AD SKIP BUTTONS ---
              <>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: canAfford ? '#F59E0B' : '#F3F4F6' }]} 
                  onPress={() => canAfford && handle('coins')}
                  disabled={!canAfford}
                >
                  <Text style={[styles.btnText, !canAfford && { color: '#9CA3AF' }]}>
                    {canAfford ? `🪙 Spend 50 Coins` : "Not enough coins"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3B82F6' }]} onPress={() => handle('ad')}>
                  <Text style={styles.btnText}>📺 Watch Ad</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Cancel Button */}
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
  iconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  iconContainerFree: { backgroundColor: '#ECFDF5' },
  iconContainerPaid: { backgroundColor: '#EFF6FF' },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, paddingHorizontal: 10 },
  buttonContainer: { width: '100%', gap: 12 },
  actionBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  freeBtn: { backgroundColor: '#10B981' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  cancelBtn: { alignItems: 'center', paddingTop: 8 },
  cancelText: { fontSize: 15, fontWeight: '600', color: '#9CA3AF' },
});

export default SkipDialog;