/**
 * WarningsSection Component
 * 
 * Display route warnings with severity indicators
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import type { WarningsSectionProps, WarningItemProps } from '../types';

/**
 * Warning Item Component
 */
function WarningItem({ warning, onPress }: WarningItemProps) {
  /**
   * Get warning type label
   */
  const getWarningLabel = (type: string): string => {
    const labels: Record<string, string> = {
      low_bridge: 'Alçak Köprü',
      narrow_road: 'Dar Yol',
      weight_limit: 'Ağırlık Sınırı',
      height_limit: 'Yükseklik Sınırı',
      traffic: 'Trafik',
      police: 'Polis Kontrolü',
      accident: 'Kaza',
      road_closed: 'Yol Kapalı',
      other: 'Diğer',
    };
    
    return labels[type] || 'Uyarı';
  };

  /**
   * Get warning icon
   */
  const getWarningIcon = (type: string): string => {
    const icons: Record<string, string> = {
      low_bridge: '🌉',
      narrow_road: '↔️',
      weight_limit: '⚖️',
      height_limit: '📏',
      traffic: '🚦',
      police: '👮',
      accident: '🚨',
      road_closed: '🚧',
      other: '⚠️',
    };
    
    return icons[type] || '⚠️';
  };

  /**
   * Check if warning is critical
   */
  const isCritical = (type: string): boolean => {
    const criticalTypes = ['low_bridge', 'height_limit', 'weight_limit', 'road_closed'];
    return criticalTypes.includes(type);
  };

  const critical = isCritical(warning.type);

  return (
    <TouchableOpacity
      style={[styles.warningItem, critical && styles.warningItemCritical]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <Text style={styles.warningItemIcon}>{getWarningIcon(warning.type)}</Text>

      <View style={styles.warningItemContent}>
        <Text style={styles.warningItemType}>{getWarningLabel(warning.type)}</Text>
        <Text style={styles.warningItemMessage} numberOfLines={2}>
          {warning.message}
        </Text>
        {/* Distance info could be added here if available */}
      </View>
    </TouchableOpacity>
  );
}

/**
 * WarningsSection Component
 */
export default function WarningsSection({
  warnings,
  onWarningPress,
}: WarningsSectionProps) {
  if (warnings.length === 0) {
    return null;
  }

  // Sort warnings by criticality
  const sortedWarnings = [...warnings].sort((a, b) => {
    const criticalTypes = ['low_bridge', 'height_limit', 'weight_limit', 'road_closed'];
    const aIsCritical = criticalTypes.includes(a.type);
    const bIsCritical = criticalTypes.includes(b.type);
    
    if (aIsCritical && !bIsCritical) return -1;
    if (!aIsCritical && bIsCritical) return 1;
    return 0;
  });

  return (
    <View style={styles.warningsSection}>
      {/* Header */}
      <View style={styles.warningsSectionHeader}>
        <Text style={styles.warningsSectionIcon}>⚠️</Text>
        <Text style={styles.warningsSectionTitle}>
          Rota Uyarıları ({warnings.length})
        </Text>
      </View>

      {/* Warnings List */}
      {sortedWarnings.map((warning, index) => (
        <WarningItem
          key={index}
          warning={warning}
          onPress={onWarningPress ? () => onWarningPress(warning) : undefined}
        />
      ))}
    </View>
  );
}
