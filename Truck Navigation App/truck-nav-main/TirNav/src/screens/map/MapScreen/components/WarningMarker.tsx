/**
 * WarningMarker Component
 * 
 * Custom marker for warnings on map
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { styles } from '../styles';
import type { WarningMarkerProps } from '../types';
import type { WarningType } from '@types/warning';

/**
 * Get icon for warning type
 */
function getWarningIcon(type: WarningType): string {
  const icons: Record<WarningType, string> = {
    narrow_road: '⚠️',
    low_bridge: '🌉',
    traffic: '🚦',
    police: '🚓',
    accident: '🚗',
    road_closed: '🚧',
    other: '⚠️',
  };
  return icons[type] || '⚠️';
}

/**
 * Get warning type label in Turkish
 */
function getWarningTypeLabel(type: WarningType): string {
  const labels: Record<WarningType, string> = {
    narrow_road: 'Dar Yol',
    low_bridge: 'Alçak Köprü',
    traffic: 'Trafik',
    police: 'Polis',
    accident: 'Kaza',
    road_closed: 'Yol Kapalı',
    other: 'Diğer',
  };
  return labels[type] || 'Uyarı';
}

export default function WarningMarker({ warning, onPress }: WarningMarkerProps) {
  return (
    <Marker
      coordinate={{
        latitude: warning.location.latitude,
        longitude: warning.location.longitude,
      }}
      onPress={() => onPress(warning)}
      tracksViewChanges={false} // Performance optimization
    >
      <View style={styles.markerContainer}>
        <View style={styles.markerIcon}>
          <Text style={styles.markerIconText}>
            {getWarningIcon(warning.type)}
          </Text>
        </View>
      </View>

      <Callout tooltip>
        <View style={styles.markerCallout}>
          <Text style={styles.markerCalloutTitle}>
            {getWarningTypeLabel(warning.type)}
          </Text>
          <Text style={styles.markerCalloutDescription} numberOfLines={2}>
            {warning.description}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
}
