import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

const SkipDialog = ({ visible, onClose, taskId }) => {
  const { skipTask, strikes, points } = useApp();

  const handle = (method) => {
    skipTask(taskId, method);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.overlay}>
        <View style={s.box}>
          <Text style={s.title}>Skip this task?</Text>
          <Text style={s.sub}>Choose how you want to skip</Text>

          <View style={s.strikeRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[s.strikeDot, i <= strikes && s.strikeActive]} />
            ))}
            <Text style={s.strikeText}>{strikes}/3 strikes</Text>
          </View>

          <TouchableOpacity style={s.optionBtn} onPress={() => handle('ad')}>
            <Text style={s.optionText}>📺  Watch Ad to Skip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[s.optionBtn, points < 50 && s.disabled]} onPress={() => points >= 50 && handle('coins')}>
            <Text style={s.optionText}>🔥  Spend 50 Coins to Skip</Text>
            {points < 50 && <Text style={s.notEnough}>Not enough coins</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[s.optionBtn, s.strikeBtn]} onPress={() => handle('strike')}>
            <Text style={[s.optionText, { color: '#EF4444' }]}>⚡  Take a Strike</Text>
            <Text style={s.strikeWarning}>3 strikes = -25 points</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '85%' },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', marginBottom: 4 },
  sub: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  strikeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
  strikeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#E5E7EB' },
  strikeActive: { backgroundColor: '#EF4444' },
  strikeText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  optionBtn: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14, padding: 16, marginBottom: 12 },
  strikeBtn: { borderColor: '#FEE2E2', backgroundColor: '#FFF5F5' },
  disabled: { opacity: 0.5 },
  optionText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  notEnough: { fontSize: 11, color: '#EF4444', marginTop: 2 },
  strikeWarning: { fontSize: 11, color: '#EF4444', marginTop: 2 },
  cancelBtn: { alignItems: 'center', paddingTop: 8 },
  cancelText: { fontSize: 15, color: '#6B7280' },
});

export default SkipDialog;