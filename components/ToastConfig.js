import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

const CustomToast = ({ type, text1, text2, props }) => {
  const progressAnim = useRef(new Animated.Value(100)).current;

  const isSuccess = type === 'success';
  const mainColor = isSuccess ? '#10B981' : '#EF4444';
  const iconName = isSuccess ? 'check' : 'alert-circle';

  useEffect(() => {
    // This stops any existing animation and resets the bar to 100%
    progressAnim.stopAnimation(() => {
      progressAnim.setValue(100);
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 4000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) Toast.hide();
      });
    });
    // ✅ listening to props?.uuid forces a restart on every click
  }, [text1, text2, props?.uuid]); 

  return (
    <View style={styles.toastContainer}>
      <View style={[styles.iconCircle, { backgroundColor: mainColor }]}>
        <Feather name={iconName} size={20} color="#fff" />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{text1}</Text>
        {text2 ? <Text style={styles.message}>{text2}</Text> : null}
      </View>

      <TouchableOpacity onPress={() => Toast.hide()} style={styles.closeButton}>
        <Feather name="x" size={16} color="#9CA3AF" />
      </TouchableOpacity>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: mainColor,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

export const toastConfig = {
  success: (props) => <CustomToast {...props} type="success" />,
  error: (props) => <CustomToast {...props} type="error" />,
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
  },
});