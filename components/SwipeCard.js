import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120; // How far to swipe before action triggers

const SwipeCard = forwardRef(({ task, onSwipeRight, onSwipeLeft, isTop, animatedStyle, onDrag }, ref) => {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (!isTop) return;
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
        if (onDrag) onDrag(gestureState.dx);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!isTop) return;
        
        if (gestureState.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    forceSwipeRight: () => forceSwipe('right'),
    forceSwipeLeft: () => forceSwipe('left')
  }));

  const forceSwipe = (direction) => {
    if (direction === 'left') {
      onSwipeLeft(task);
    } else {
      onSwipeRight(task);
    }

    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: false
    }).start();
  };

  const onSwipeComplete = (direction) => {
    if (direction === 'right') {
      onSwipeRight(task);
    } else {
      onSwipeLeft(task);
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      tension: 80,
      useNativeDriver: false
    }).start(() => {
       if (onDrag) onDrag(0); // Reset rear card scale
    });
  };

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-12deg', '0deg', '12deg'],
      extrapolate: 'clamp',
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const skipOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.cardContainer, 
        isTop ? getCardStyle() : animatedStyle
      ]} 
      {...panResponder.panHandlers}
    >

      {/* DONE Badge */}
      {isTop && (
        <Animated.View style={[styles.badgeContainer, styles.doneBadge, { opacity: likeOpacity }]}>
          <Text style={styles.doneText}>DONE</Text>
        </Animated.View>
      )}

      {/* SKIP Badge */}
      {isTop && (
        <Animated.View style={[styles.badgeContainer, styles.skipBadge, { opacity: skipOpacity }]}>
          <Text style={styles.skipText}>SKIP</Text>
        </Animated.View>
      )}

      <Text style={styles.taskIcon}>{task.icon}</Text>
      <Text style={styles.taskName}>{task.name}</Text>
      <Text style={styles.taskDesc}>{task.desc}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EFFFFA',
    borderRadius: 32,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    overflow: 'hidden'
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20
  },
  taskIcon: {
    fontSize: 84,
    marginBottom: 24,
  },
  taskName: {
    fontSize: 32,
    fontWeight: '600',
    color: '#2D2B2E',
    textAlign: 'center',
    marginBottom: 10,
  },
  taskDesc: {
    fontSize: 14.33,
    color: '#2D2B2E',
    fontWeight: '300',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
    paddingHorizontal: 16,
  },
  badgeContainer: {
    position: 'absolute',
    top: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 3,
  },
  doneBadge: {
    left: 40,
    borderColor: '#10B981',
    transform: [{ rotate: '-15deg' }]
  },
  doneText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 2
  },
  skipBadge: {
    right: 40,
    borderColor: '#FB2C36',
    transform: [{ rotate: '15deg' }]
  },
  skipText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FB2C36',
    letterSpacing: 2
  }
});

export default SwipeCard;
