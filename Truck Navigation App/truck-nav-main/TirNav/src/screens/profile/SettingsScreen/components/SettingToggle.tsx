/**
 * SettingToggle Component
 * 
 * Toggle switch setting item
 */

import React from 'react';
import { View, Text, Switch } from 'react-native';
import { COLORS } from '@constants';
import { styles } from '../styles';
import type { SettingToggleProps } from '../types';

export default function SettingToggle({
  label,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingToggleProps) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingItemContent}>
        <Text style={styles.settingItemLabel}>{label}</Text>
        {description && (
          <Text style={styles.settingItemDescription}>{description}</Text>
        )}
      </View>
      <Switch
        style={styles.toggle}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#767577', true: '#81b0ff' }}
        thumbColor={value ? COLORS.primary.main : '#f4f3f4'}
      />
    </View>
  );
}
