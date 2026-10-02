/**
 * SliderInput Component
 * 
 * Reusable slider with label and value display
 */

import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { COLORS } from '@constants';
import { styles } from '../styles';
import type { SliderInputProps } from '../types';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  disabled = false,
}: SliderInputProps) {
  /**
   * Handle slider value change with haptic feedback
   */
  const handleValueChange = (newValue: number) => {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    
    // Round to step precision
    const rounded = Math.round(newValue / step) * step;
    const fixed = parseFloat(rounded.toFixed(2));
    
    onChange(fixed);
  };

  return (
    <View style={styles.sliderContainer}>
      {/* Header with label and value */}
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.sliderValue}>{value.toFixed(step < 1 ? 1 : 0)}</Text>
          <Text style={styles.sliderUnit}>{unit}</Text>
        </View>
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        value={value}
        onValueChange={handleValueChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={COLORS.primary.main}
        maximumTrackTintColor={COLORS.grayscale.gray300}
        thumbTintColor={COLORS.primary.main}
        disabled={disabled}
      />

      {/* Range labels */}
      <View style={styles.sliderRange}>
        <Text style={styles.sliderRangeText}>
          {min} {unit}
        </Text>
        <Text style={styles.sliderRangeText}>
          {max} {unit}
        </Text>
      </View>
    </View>
  );
}
