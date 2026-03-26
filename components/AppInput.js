import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppInput = ({ label, placeholder, secure, value, onChangeText, keyboardType }) => {
  const [show, setShow] = useState(false);
  return (
    <View style={s.wrapper}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        <TextInput
          style={s.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secure && !show}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          autoCapitalize="none"
        />
        {secure && (
          <TouchableOpacity onPress={() => setShow(v => !v)}>
            <Ionicons
              name={show ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color="#94A3B8"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 14, paddingHorizontal: 16 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, color: '#1C1C1E' },
});

export default AppInput;