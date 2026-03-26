import React from 'react';
import { View, Text, Image, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const AuthLayout = ({ title, subtitle, character, children }) => (
  <SafeAreaView style={s.safe}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, backgroundColor: '#fff' }}
      >
        <View style={s.top}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
        </View>

        <View style={s.charWrapper}>
          <Image source={character} style={s.char} resizeMode="contain" />
        </View>

        {/* Outer green border container — full screen width */}
        <View style={s.cardOuter}>
          <View style={s.card}>
            {children}
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  top: {
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  charWrapper: {
    alignItems: 'center',
    marginBottom: -80,
    zIndex: 2,
  },
  char: {
    width: 190,
    height: 210,
    zIndex: 2,
  },
  cardOuter: {
    width: width,
    backgroundColor: '#10B981',
    borderTopLeftRadius: 43,
    borderTopRightRadius: 43,
    paddingTop: 10,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 24,
    paddingTop: 90,
    paddingBottom: 48,
    minHeight: height * 0.5,
    flex: 1,
  },
});

export default AuthLayout;