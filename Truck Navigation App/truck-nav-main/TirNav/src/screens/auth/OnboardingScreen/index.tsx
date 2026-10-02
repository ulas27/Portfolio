/**
 * OnboardingScreen Component
 * 
 * First-time user onboarding experience
 * - 3-page carousel with swipe gestures
 * - Skip button
 * - Next/Start button
 * - Page indicators (dots)
 * - Smooth animations with Reanimated
 * - Saves completion status to AsyncStorage
 * 
 * @example
 * Navigation automatically shows this screen on first launch
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@components/common';
import { COLORS, ROUTES, STORAGE_KEYS } from '@constants';
import { styles } from './styles';
import type { OnboardingSlide, OnboardingScreenProps } from './types';

const { width } = Dimensions.get('window');

/**
 * Onboarding slides data
 */
const SLIDES: OnboardingSlide[] = [
  {
    key: '1',
    title: 'Tırınıza Özel Navigasyon',
    description: 'Aracınızın boyutlarına göre güvenli rotalar oluşturun. Yükseklik, genişlik ve ağırlık sınırlamalarını otomatik hesaplayın.',
    illustration: '🚛',
    backgroundColor: COLORS.primary.light,
  },
  {
    key: '2',
    title: 'Topluluk Uyarıları',
    description: 'Şoförlerden gerçek zamanlı yol bilgileri alın. Trafik, polis, kaza ve diğer önemli uyarıları görün.',
    illustration: '👥',
    backgroundColor: COLORS.secondary.light,
  },
  {
    key: '3',
    title: 'Güvenli Yolculuk',
    description: 'Alçak köprü, dar sokak endişesi yok. Tır geçişine uygun yollardan güvenle ilerleyin.',
    illustration: '✅',
    backgroundColor: COLORS.accent.light,
  },
];

/**
 * Pagination Dot Component
 */
function PaginationDot({
  index,
  currentIndex,
}: {
  index: number;
  currentIndex: number;
}) {
  const isActive = index === currentIndex;

  return (
    <Animated.View
      style={[
        styles.dot,
        isActive && styles.dotActive,
        {
          backgroundColor: isActive
            ? COLORS.primary.main
            : COLORS.grayscale.gray300,
        },
      ]}
    />
  );
}

/**
 * OnboardingScreen Component
 */
export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  /**
   * Mark onboarding as completed and navigate to login
   */
  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      navigation.replace(ROUTES.AUTH.LOGIN);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      // Navigate anyway
      navigation.replace(ROUTES.AUTH.LOGIN);
    }
  };

  /**
   * Handle skip button press
   */
  const handleSkip = () => {
    completeOnboarding();
  };

  /**
   * Handle next button press
   */
  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
    } else {
      carouselRef.current?.next();
    }
  };

  /**
   * Render single slide
   */
  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slideContainer}>
      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Text style={styles.illustration}>{item.illustration}</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background.default} />

      {/* Header with Skip Button */}
      <View style={styles.header}>
        {!isLastSlide && (
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Atla</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <Carousel
          ref={carouselRef}
          width={width}
          height={500}
          data={SLIDES}
          renderItem={renderSlide}
          onSnapToItem={setCurrentIndex}
          loop={false}
          enabled={true}
          panGestureHandlerProps={{
            activeOffsetX: [-10, 10],
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((slide, index) => (
            <PaginationDot
              key={slide.key}
              index={index}
              currentIndex={currentIndex}
            />
          ))}
        </View>

        {/* Next/Start Button */}
        <View style={styles.buttonContainer}>
          <Button
            title={isLastSlide ? 'Başla' : 'İleri'}
            onPress={handleNext}
            variant="primary"
            size="large"
            fullWidth
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}
