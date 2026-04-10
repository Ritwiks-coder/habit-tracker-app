import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable } from 'react-native';
import theme from '../src/theme/theme';

const OutOfSkipsModal = ({ 
  visible, 
  onClose, 
  onWatchAd, 
  onPayPoints, 
  currentPoints = 0 
}) => {
  const skipCost = 50;
  const canAfford = currentPoints >= skipCost;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={s.overlay}>
        <Pressable style={s.backdrop} onPress={onClose} />
        
        <View style={s.card}>
          
          <Text style={s.emoji}>😒</Text>

          <Text style={s.title}>No More Freebies.</Text>
          <Text style={s.subtitle}>
            You've used up your 3 free skips today. To get out of this one, you either need to watch an ad or bribe me.
          </Text>

          <View style={s.buttonRow}>
            <TouchableOpacity 
              style={[s.btn, s.adBtn]} 
              onPress={onWatchAd} 
              activeOpacity={0.8}
            >
              <Text style={s.adBtnText}>Watch Ad (Free)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.btn, s.payBtn, !canAfford && s.payBtnDisabled]} 
              onPress={() => canAfford && onPayPoints()} 
              activeOpacity={0.8}
              disabled={!canAfford}
            >
              <Text style={[s.payBtnText, !canAfford && s.payBtnTextDisabled]}>
                🪙 Pay -{skipCost} Coins
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
            <Text style={s.cancelText}>Cancel, I'll do it</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backdrop: { 
    position: 'absolute', 
    top: 0, left: 0, right: 0, bottom: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.4)' 
  },
  card: { 
    backgroundColor: theme.colors.surface, 
    borderRadius: theme.radius.lg, 
    padding: theme.spacing.xl, 
    width: theme.components.modal.widthPercent, 
    maxWidth: theme.components.modal.maxWidth, 
    alignItems: 'center',
    ...theme.shadow.md
  },
  emoji: { 
    fontSize: 56, 
    marginBottom: theme.spacing.md 
  },
  title: { 
    ...theme.typography.h2,
    color: theme.colors.textPrimary, 
    marginBottom: theme.spacing.sm,
    textAlign: 'center'
  },
  subtitle: { 
    ...theme.typography.body,
    color: theme.colors.textSecondary, 
    textAlign: 'center', 
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: theme.spacing.sm, 
    width: '100%', 
    marginBottom: theme.spacing.lg 
  },
  btn: { 
    flex: 1, 
    height: 52, // Standardizing on theme.input.height equivalent or 56
    borderRadius: theme.radius.pill, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  adBtn: { 
    backgroundColor: theme.colors.success,
    ...theme.shadow.sm,
    shadowColor: theme.colors.success,
  },
  adBtnText: { 
    color: theme.colors.textInverse, 
    ...theme.typography.label,
    fontWeight: '800',
  },
  payBtn: { 
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary, 
  },
  payBtnText: { 
    color: theme.colors.primary, 
    ...theme.typography.label,
    fontWeight: '800',
  },
  payBtnDisabled: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background
  },
  payBtnTextDisabled: {
    color: theme.colors.textTertiary
  },
  cancelBtn: { 
    paddingVertical: theme.spacing.sm 
  },
  cancelText: { 
    color: theme.colors.textTertiary, 
    ...theme.typography.label,
    fontWeight: '800',
  }
});

export default OutOfSkipsModal;
