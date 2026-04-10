import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

export const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 16 16">
    <G fill="none" fillRule="evenodd" clipRule="evenodd">
      <Path fill="#f44336" d="M7.209 1.061c.725-.081 1.154-.081 1.933 0a6.57 6.57 0 0 1 3.65 1.82a100 100 0 0 0-1.986 1.93q-1.876-1.59-4.188-.734q-1.696.78-2.362 2.528a78 78 0 0 1-2.148-1.658a.26.26 0 0 0-.16-.027q1.683-3.245 5.26-3.86" opacity="0.987"/>
      <Path fill="#ffc107" d="M1.946 4.92q.085-.013.161.027a78 78 0 0 0 2.148 1.658A7.6 7.6 0 0 0 4.04 7.99q.037.678.215 1.331L2 11.116Q.527 8.038 1.946 4.92" opacity="0.997"/>
      <Path fill="#448aff" d="M12.685 13.29a26 26 0 0 0-2.202-1.74q1.15-.812 1.396-2.228H8.122V6.713q3.25-.027 6.497.055q.616 3.345-1.423 6.032a7 7 0 0 1-.51.49" opacity="0.999"/>
      <Path fill="#43a047" d="M4.255 9.322q1.23 3.057 4.51 2.854a3.94 3.94 0 0 0 1.718-.626q1.148.812 2.202 1.74a6.62 6.62 0 0 1-4.027 1.684a6.4 6.4 0 0 1-1.02 0Q3.82 14.524 2 11.116z" opacity="0.993"/>
    </G>
  </Svg>
);

export const AppleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path fill="#111111" d="M17.05 20.28c-.98.95-2.05.8-3.08.35c-1.09-.46-2.09-.48-3.24 0c-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8c1.18-.24 2.31-.93 3.57-.84c1.51.12 2.65.72 3.4 1.8c-3.12 1.87-2.38 5.98.48 7.13c-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25c.29 2.58-2.34 4.5-3.74 4.25"/>
  </Svg>
);

export const FacebookIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 256 256">
    <Path fill="#1877f2" d="M256 128C256 57.308 198.692 0 128 0S0 57.308 0 128c0 63.888 46.808 116.843 108 126.445V165H75.5v-37H108V99.8c0-32.08 19.11-49.8 48.348-49.8C170.352 50 185 52.5 185 52.5V84h-16.14C152.959 84 148 93.867 148 103.99V128h35.5l-5.675 37H148v89.445c61.192-9.602 108-62.556 108-126.445"/>
    <Path fill="#fff" d="m177.825 165l5.675-37H148v-24.01C148 93.866 152.959 84 168.86 84H185V52.5S170.352 50 156.347 50C127.11 50 108 67.72 108 99.8V128H75.5v37H108v89.445A129 129 0 0 0 128 256a129 129 0 0 0 20-1.555V165z"/>
  </Svg>
);

const SocialButtons = ({ onGooglePress, onApplePress, onFacebookPress }) => (
  <View>
    <View style={s.divider}>
      <View style={s.line} />
      <Text style={s.or}>Or continue with</Text>
      <View style={s.line} />
    </View>
    <View style={s.row}>
      <TouchableOpacity style={s.btn} onPress={onGooglePress} activeOpacity={0.7}>
        <GoogleIcon />
      </TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={onApplePress} activeOpacity={0.7}>
        <AppleIcon />
      </TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={onFacebookPress} activeOpacity={0.7}>
        <FacebookIcon />
      </TouchableOpacity>
    </View>
  </View>
);

const s = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: '#D1FAE5' },
  or: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  btn: { width: 72, height: 56, borderRadius: 14, backgroundColor: '#E8F8F2', alignItems: 'center', justifyContent: 'center' },
});

export default SocialButtons;
