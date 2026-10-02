/**
 * Button Component
 * 
 * Reusable button component with multiple variants and sizes
 * - Primary, secondary, outline, ghost variants
 * - Small, medium, large sizes
 * - Loading and disabled states
 * - Icon support (left and right)
 * - Press animation with Reanimated
 * 
 * @example
 * ```tsx
 * <Button
 *   title="Giriş Yap"
 *   onPress={handleLogin}
 *   variant="primary"
 *   size="large"
 *   isLoading={isLoading}
 * />
 * ```
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '@constants';
import { styles, getVariantStyles, getSizeStyles } from './styles';
import type { ButtonProps } from './types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Button Component
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = false,
  backgroundColor,
  textColor,
  style,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  // Press animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
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

  const handlePress = () => {
    if (!disabled && !isLoading) {
      onPress();
    }
  };

  const isDisabled = disabled || isLoading;

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        backgroundColor && { backgroundColor },
        animatedStyle,
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.content}>
        {/* Left Icon */}
        {icon && !isLoading && (
          <View style={styles.icon}>{icon}</View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={textColor || variantStyles.text.color}
            style={styles.icon}
          />
        )}

        {/* Title */}
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
            textColor && { color: textColor },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Right Icon */}
        {iconRight && !isLoading && (
          <View style={styles.iconRight}>{iconRight}</View>
        )}
      </View>
    </AnimatedTouchable>
  );
}
