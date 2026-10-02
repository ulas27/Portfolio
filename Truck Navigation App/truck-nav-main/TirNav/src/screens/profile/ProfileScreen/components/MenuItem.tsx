/**
 * MenuItem Component
 * 
 * Menu item with icon and label
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { styles } from '../styles';
import type { MenuItemProps } from '../types';

export default function MenuItem({
  icon,
  label,
  onPress,
  isDestructive = false,
  showChevron = true,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.menuItemIcon}>{icon}</Text>
      <Text
        style={[
          styles.menuItemLabel,
          isDestructive && styles.menuItemDestructive,
        ]}
      >
        {label}
      </Text>
      {showChevron && <Text style={styles.menuItemChevron}>›</Text>}
    </TouchableOpacity>
  );
}
