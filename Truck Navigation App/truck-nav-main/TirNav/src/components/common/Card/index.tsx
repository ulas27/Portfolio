/**
 * Card Component
 * 
 * Reusable card container component
 * - Multiple padding variants
 * - Shadow/elevation levels
 * - Optional press feedback
 * - Customizable background
 * 
 * @example
 * ```tsx
 * <Card padding="large" elevation="medium" pressable onPress={handlePress}>
 *   <Text>Card Content</Text>
 * </Card>
 * ```
 */

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { styles, getPaddingStyles, getElevationStyles } from './styles';
import type { CardProps } from './types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.View;

/**
 * Card Component
 */
export default function Card({
  children,
  padding = 'medium',
  elevation = 'small',
  pressable = false,
  onPress,
  backgroundColor,
  style,
  testID,
}: CardProps) {
  const scale = useSharedValue(1);

  const paddingStyles = getPaddingStyles(padding);
  const elevationStyles = getElevationStyles(elevation);

  // Press animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, {
      damping: 15,
      stiffness: 150,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  };

  const containerStyle = [
    styles.container,
    paddingStyles,
    elevationStyles,
    backgroundColor && { backgroundColor },
    style,
  ];

  if (pressable && onPress) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[containerStyle, animatedStyle]}
        testID={testID}
        accessibilityRole="button"
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedView style={containerStyle} testID={testID}>
      {children}
    </AnimatedView>
  );
}
