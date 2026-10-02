/**
 * FloatingButtons Component
 * 
 * Floating action buttons for map controls
 */

import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { styles } from '../styles';
import type { FloatingButtonsProps } from '../types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function FloatingButtons({
  onLocationPress,
  onZoomIn,
  onZoomOut,
  onAddWarning,
}: FloatingButtonsProps) {
  return (
    <View style={styles.fabContainer}>
      {/* Add Warning Button */}
      <AnimatedTouchable
        entering={FadeInRight.delay(100).springify()}
        style={[styles.fab, styles.fabPrimary]}
        onPress={onAddWarning}
        activeOpacity={0.8}
      >
        <Text style={[styles.fabIcon, { color: '#FFF' }]}>➕</Text>
      </AnimatedTouchable>

      {/* Zoom In Button */}
      <AnimatedTouchable
        entering={FadeInRight.delay(200).springify()}
        style={styles.fab}
        onPress={onZoomIn}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>➕</Text>
      </AnimatedTouchable>

      {/* Zoom Out Button */}
      <AnimatedTouchable
        entering={FadeInRight.delay(300).springify()}
        style={styles.fab}
        onPress={onZoomOut}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>➖</Text>
      </AnimatedTouchable>

      {/* Location Button */}
      <AnimatedTouchable
        entering={FadeInRight.delay(400).springify()}
        style={styles.fab}
        onPress={onLocationPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>📍</Text>
      </AnimatedTouchable>
    </View>
  );
}
