import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const AppButton = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <LinearGradient colors={['#10B981', '#34D399']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btn}>
      <Text style={s.text}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  btn: { borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  text: { color: '#fff', fontSize: 18, fontWeight: '700' },
});

export default AppButton;