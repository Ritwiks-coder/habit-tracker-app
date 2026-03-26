import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  FlatList,
  StatusBar,
  Image,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    // FIX: Changed from ../assets to ./assets
    image: require('./assets/onboard1.png'), 
    title: 'Hey there! 👋',
    description: "Let's make your day a little more productive.",
    imageStyle: 'large',
  },
  {
    id: '2',
    // FIX: Changed from ../assets to ./assets
    image: require('./assets/onboard2.png'), 
    title: 'Focus mode: ON 🎯',
    description: 'Add tasks, stay focused, and crush them one by one.',
    imageStyle: 'circle',
  },
  {
    id: '3',
    // FIX: Changed from ../assets to ./assets
    image: require('./assets/onboard3.png'), 
    title: 'Winning feels good! 🏆',
    description: 'Finish tasks, earn points, and enjoy being on top.',
    imageStyle: 'circle',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef(null);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {/* Image Area */}
      <View style={styles.imageContainer}>
        {item.imageStyle === 'large' ? (
          <Image
            source={item.image}
            style={styles.imageLarge}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.circleWrapper}>
            <Image
              source={item.image}
              style={styles.imageCircle}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Text Area */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <FlatList
        data={onboardingData}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ref={slidesRef}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Skip */}
        <TouchableOpacity
          onPress={() => navigation.replace('Login')}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity onPress={scrollTo} activeOpacity={0.85}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextText}>
              {currentIndex === onboardingData.length - 1 ? 'Start' : 'Next'}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  // Image styles
  imageContainer: {
    width,
    height: height * 0.55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageLarge: {
    width: width * 0.95,
    height: height * 0.55,
  },
  circleWrapper: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    overflow: 'hidden',
    backgroundColor: '#F0FDF4',
  },
  imageCircle: {
    width: '100%',
    height: '100%',
  },

  // Text styles
  textContainer: {
    paddingHorizontal: 32,
    alignItems: 'center',
    marginTop: 45,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.8,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '400',
  },

  // Bottom nav
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 36,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  skipBtn: {
    width: 60,
  },
  skipText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#10B981',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },

  // Next button
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingScreen;