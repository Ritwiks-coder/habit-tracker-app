import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

/**
 * CustomLoader - Premium "Breathing Circle" loading animation
 * Uses React Native's Animated API (no external dependencies)
 * Perfect for Habit Tracker's modern UI
 */
export default function CustomLoader({ size = 60, color = '#10B981' }) {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        // Expand & brighten (breath in)
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        // Contract & dim (breath out)
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, [pulseAnim, opacityAnim]);

  return (
    <View style={styles.wrapper}>
      {/* Outer pulsing circle (dim background) */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: size * 1.4,
            height: size * 1.4,
            borderRadius: (size * 1.4) / 2,
            backgroundColor: color,
            opacity: Animated.divide(opacityAnim, 3),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Inner circle (bright, stable) */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            position: 'absolute',
          },
        ]}
      />

      {/* Checkmark icon inside */}
      <Animated.Text
        style={[
          styles.checkmark,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        ✓
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
  },
  circle: {
    position: 'absolute',
  },
  checkmark: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    zIndex: 10,
  },
});
