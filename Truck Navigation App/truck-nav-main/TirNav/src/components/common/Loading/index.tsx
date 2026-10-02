/**
 * Loading Component
 * 
 * Versatile loading indicator component
 * - Spinner (ActivityIndicator)
 * - Animated dots
 * - Skeleton loader
 * - Full screen overlay option
 * - Custom message
 * 
 * @example
 * ```tsx
 * <Loading size="large" message="Yükleniyor..." fullScreen />
 * <Loading type="dots" />
 * <Skeleton width={200} height={20} />
 * ```
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '@constants';
import { styles } from './styles';
import type { LoadingProps, SkeletonProps } from './types';

/**
 * Animated Dot Component
 */
function AnimatedDot({ delay, color }: { delay: number; color: string }) {
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        false
      )
    );

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
}

/**
 * Loading Component
 */
export default function Loading({
  size = 'medium',
  type = 'spinner',
  color = COLORS.primary.main,
  message,
  fullScreen = false,
  testID,
}: LoadingProps) {
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'large';
    }
  };

  const renderLoading = () => {
    if (type === 'dots') {
      return (
        <View style={styles.dotsContainer}>
          <AnimatedDot delay={0} color={color} />
          <AnimatedDot delay={150} color={color} />
          <AnimatedDot delay={300} color={color} />
        </View>
      );
    }

    return (
      <ActivityIndicator
        size={getSizeValue()}
        color={color}
        testID={testID}
      />
    );
  };

  const content = (
    <View style={styles.content}>
      {renderLoading()}
      {message && (
        <Text
          style={[
            styles.message,
            fullScreen && styles.messageFullScreen,
          ]}
        >
          {message}
        </Text>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal
        visible
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={[styles.container, styles.fullScreen]}>
          {content}
        </View>
      </Modal>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

/**
 * Skeleton Loader Component
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// Export Skeleton as named export
Loading.Skeleton = Skeleton;
