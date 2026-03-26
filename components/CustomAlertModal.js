import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const CustomAlertModal = ({ visible, title, message, type, onClose, onWatchAd, onPayCoins, onCancel }) => {
  const isFreebies = type === 'freebies';
  const isSpeedTrap = type === 'speedtrap';

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={s.overlay}>
        <View style={s.card}>
          <Text style={s.emoji}>😑</Text>
          <Text style={s.title}>{title}</Text>
          <Text style={s.message}>{message}</Text>

          {isFreebies ? (
            <>
              <View style={s.row}>
                <TouchableOpacity onPress={onWatchAd} style={s.watchAdBtn}>
                  <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.watchAdGradient}>
                    <Text style={s.watchAdText}>Watch Ad (Free)</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={onPayCoins} style={s.payBtn}>
                  <Text style={s.payBtnText}>Pay -50 Points</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={onCancel} style={s.cancelLink}>
                <Text style={s.cancelLinkText}>Cancel, I'll do it</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
              <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.gotItBtn}>
                <Text style={s.gotItText}>Got It!</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  card: { backgroundColor: '#fff', borderRadius: 28, padding: 28, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', textAlign: 'center', marginBottom: 12 },
  message: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16, width: '100%' },
  watchAdBtn: { flex: 1, borderRadius: 30 },
  watchAdGradient: { borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  watchAdText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  payBtn: { flex: 1, borderRadius: 30, borderWidth: 1.5, borderColor: '#F59E0B', paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { color: '#F59E0B', fontWeight: '700', fontSize: 15 },
  cancelLink: { paddingVertical: 8 },
  cancelLinkText: { color: '#9CA3AF', fontSize: 15 },
  gotItBtn: { borderRadius: 30, paddingVertical: 16, paddingHorizontal: 48, alignItems: 'center' },
  gotItText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default CustomAlertModal;