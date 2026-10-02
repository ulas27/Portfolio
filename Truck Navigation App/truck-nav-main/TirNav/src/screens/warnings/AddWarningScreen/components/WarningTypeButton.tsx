/**
 * WarningTypeButton Component
 * 
 * Button for selecting warning type
 */

import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { styles } from '../styles';
import type { WarningTypeButtonProps } from '../types';

export default function WarningTypeButton({
  type,
  isSelected,
  onPress,
}: WarningTypeButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.typeButton, isSelected && styles.typeButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.typeButtonIcon}>{type.icon}</Text>
      <Text
        style={[
          styles.typeButtonLabel,
          isSelected && styles.typeButtonLabelSelected,
        ]}
      >
        {type.label}
      </Text>
    </TouchableOpacity>
  );
}
