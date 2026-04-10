import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import theme from '../src/theme/theme';

const { width, height } = Dimensions.get('window');

const PAGES = [
  {
    image: require('../assets/onboard1.png'),
    title: 'Hey there! 👋',
    subtitle: 'Let’s make your day a little more productive.',
  },
  {
    image: require('../assets/onboard2.png'),
    title: 'Focus mode: ON 🎯',
    subtitle: 'Add tasks, stay focused, and crush them one by one.',
  },
  {
    image: require('../assets/onboard3.png'),
    title: 'Winning feels good! 🏆',
    subtitle: 'Finish tasks, earn points, and enjoy being on top.',
  },
];

const IntroScreen = () => {
  const { completeIntro } = useApp();
  const [activePage, setActivePage] = useState(0);
  const pagerRef = useRef(null);

  const handleNext = () => {
    if (activePage < PAGES.length - 1) {
      pagerRef.current?.setPage(activePage + 1);
    } else {
      completeIntro();
    }
  };

  const handleSkip = () => {
    completeIntro();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. Main Swipe Area */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={(e) => setActivePage(e.nativeEvent.position)}
      >
        {PAGES.map((page, index) => (
          <View key={index} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Image source={page.image} style={styles.image} resizeMode="contain" />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{page.title}</Text>
              <Text style={styles.subtitle}>{page.subtitle}</Text>
            </View>
          </View>
        ))}
      </PagerView>

      {/* 2. Footer Section */}
      <View style={styles.footer}>
        {/* The dots are now wrapped in an absolute container to force true center */}
        <View style={styles.dotsWrapper} pointerEvents="none">
          {PAGES.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                activePage === index && styles.activeDot
              ]} 
            />
          ))}
        </View>

        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={completeIntro}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Feather name="arrow-right" size={20} color={theme.colors.textInverse} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default IntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing['2xl'],
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: theme.spacing['4xl'],
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: theme.spacing['2xl'],
  },
  title: {
    ...theme.typography.h1, // Reduced from display (40) to h1 (32) to fit in one line
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.bodyLg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
    paddingTop: theme.spacing.lg,
    height: 100,
  },
  dotsWrapper: {
    ...StyleSheet.absoluteFillObject, // Stretches this invisible box across the whole footer
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',         // Forces true dead-center alignment
    gap: theme.spacing.sm,
    zIndex: -1,                       // Puts it visually behind the buttons
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.palette.gray300, // Default inactive color
  },
  activeDot: {
    backgroundColor: theme.colors.success,
    width: 24, // Expanded dot for active state
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  skipText: {
    ...theme.typography.label,
    color: theme.colors.textTertiary,
  },
  nextButton: {
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...theme.shadow.sm,
  },
  nextButtonText: {
    ...theme.typography.label,
    color: theme.colors.textInverse,
    fontSize: 16,
    fontWeight: '800',
  },
});
