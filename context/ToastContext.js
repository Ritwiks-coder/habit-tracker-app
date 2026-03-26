import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Get screen width to know how far to slide from the right
const { width } = Dimensions.get('window');

const TOAST_CONFIG = {
  success: { icon: 'check', color: '#10B981' },
  error: { icon: 'alert-circle', color: '#EF4444' },
  warning: { icon: 'alert-triangle', color: '#F59E0B' },
  info: { icon: 'info', color: '#3B82F6' }
};

export const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'success' });
  
  // Start off-screen to the right
  const slideAnim = useRef(new Animated.Value(width)).current; 
  const progressAnim = useRef(new Animated.Value(1)).current; 
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(slideAnim, {
      toValue: width, // Slide back out to the right
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    });
  }, [slideAnim]);

  const showToast = useCallback((title, message, type = 'success', duration = 3000) => {
    setToast({ visible: true, title, message, type });
    slideAnim.setValue(width); // Reset to the right edge
    progressAnim.setValue(1);
    if (timerRef.current) clearTimeout(timerRef.current);

    // Slide in from the right smoothly
    Animated.spring(slideAnim, {
      toValue: 0, // 0 means its normal, centered position
      friction: 8,
      useNativeDriver: true,
    }).start();

    Animated.timing(progressAnim, {
      toValue: 0,
      duration: duration,
      useNativeDriver: false, 
    }).start();

    timerRef.current = setTimeout(hideToast, duration);
  }, [slideAnim, progressAnim, hideToast]);

  const activeConfig = TOAST_CONFIG[toast.type] || TOAST_CONFIG.success;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <Animated.View 
          style={[
            styles.toastContainer, 
            { transform: [{ translateX: slideAnim }] } // Changed from translateY to translateX
          ]} 
          pointerEvents="box-none"
        >
          <View style={styles.toastContent}>
            <View style={[styles.iconBadge, { backgroundColor: activeConfig.color }]}>
              <Feather name={activeConfig.icon} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{toast.title}</Text>
              <Text style={styles.message}>{toast.message}</Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Animated.View 
            style={[
              styles.progressBar, 
              { 
                backgroundColor: activeConfig.color, 
                width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) 
              }
            ]} 
          />
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 40, // Locks it to the top of the screen
    left: 20, 
    right: 20,
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    zIndex: 9999, 
    elevation: 99,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, 
    shadowRadius: 16, 
    overflow: 'hidden', 
  },
  toastContent: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBadge: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  textContainer: { flex: 1, paddingHorizontal: 12 },
  title: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  message: { fontSize: 14, color: '#6B7280', fontWeight: '400' },
  closeBtn: { padding: 4 },
  progressBar: { position: 'absolute', bottom: 0, left: 0, height: 4 },
});