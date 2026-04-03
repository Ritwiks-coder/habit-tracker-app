import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AppButton = ({ title, onPress, disabled, loading }) => {
  const isFormIncomplete = disabled && !loading; // Keep it gray only if the form is incomplete
  const isButtonLocked = disabled || loading;

  const gradientColors = isFormIncomplete 
    ? ['#9CA3AF', '#9CA3AF'] // Dead gray
    : loading 
      ? ['#6EE7B7', '#6EE7B7'] // Faded brand green 
      : ['#10B981', '#34D399']; // Vibrant brand green default

  return (
    <TouchableOpacity 
      onPress={isButtonLocked ? null : onPress} 
      activeOpacity={0.7} 
      disabled={isButtonLocked}
    >
      <LinearGradient 
        colors={gradientColors} 
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
        style={[s.btn, isFormIncomplete && { opacity: 0.5 }]}
      >
        {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={s.text}>{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default AppButton;