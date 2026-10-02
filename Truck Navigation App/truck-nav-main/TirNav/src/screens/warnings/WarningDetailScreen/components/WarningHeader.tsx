/**
 * WarningHeader Component
 * 
 * Display warning type with icon
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import type { WarningHeaderProps } from '../types';
import type { WarningType } from '@types';

export default function WarningHeader({ type }: WarningHeaderProps) {
  /**
   * Get warning type label
   */
  const getWarningLabel = (warningType: WarningType): string => {
    const labels: Record<WarningType, string> = {
      narrow_road: 'Dar Yol',
      low_bridge: 'Alçak Köprü',
      traffic: 'Trafik',
      police: 'Polis Kontrolü',
      accident: 'Kaza',
      road_closed: 'Yol Kapalı',
      other: 'Diğer Uyarı',
    };
    
    return labels[warningType] || 'Uyarı';
  };

  /**
   * Get warning icon
   */
  const getWarningIcon = (warningType: WarningType): string => {
    const icons: Record<WarningType, string> = {
      narrow_road: '↔️',
      low_bridge: '🌉',
      traffic: '🚦',
      police: '👮',
      accident: '🚨',
      road_closed: '🚧',
      other: '⚠️',
    };
    
    return icons[warningType] || '⚠️';
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerIcon}>{getWarningIcon(type)}</Text>
      <Text style={styles.headerLabel}>{getWarningLabel(type)}</Text>
    </View>
  );
}
