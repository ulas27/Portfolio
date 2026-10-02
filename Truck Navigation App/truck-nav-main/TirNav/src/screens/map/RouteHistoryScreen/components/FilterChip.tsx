/**
 * FilterChip Component
 * 
 * Filter chip button
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';
import type { FilterChipProps } from '../types';

export default function FilterChip({ label, isActive, onPress }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[styles.filterChip, isActive && styles.filterChipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.filterChipLabel,
          isActive && styles.filterChipLabelActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
