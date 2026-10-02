/**
 * SettingButton Component
 * 
 * Button setting item
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import type { SettingButtonProps } from '../types';

export default function SettingButton({
  label,
  description,
  onPress,
  isDestructive = false,
}: SettingButtonProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemContent}>
        <Text
          style={[
            styles.settingItemLabel,
            isDestructive && styles.settingItemDestructive,
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text style={styles.settingItemDescription}>{description}</Text>
        )}
      </View>
      <Text style={styles.settingButtonIcon}>›</Text>
    </TouchableOpacity>
  );
}
