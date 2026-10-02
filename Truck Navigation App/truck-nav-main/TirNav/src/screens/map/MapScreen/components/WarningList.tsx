/**
 * WarningList Component
 * 
 * List of nearby warnings in bottom sheet
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import type { WarningListProps } from '../types';
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

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

export default function WarningList({
  warnings,
  userLocation,
  onWarningPress,
}: WarningListProps) {
  /**
   * Sort warnings by distance
   */
  const sortedWarnings = useMemo(() => {
    if (!userLocation) return warnings;

    return [...warnings].sort((a, b) => {
      const distA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.location.latitude,
        a.location.longitude
      );
      const distB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.location.latitude,
        b.location.longitude
      );
      return distA - distB;
    });
  }, [warnings, userLocation]);

  if (warnings.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateIcon}>✅</Text>
        <Text style={styles.emptyStateText}>
          Yakınınızda uyarı bulunmuyor
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.warningList} showsVerticalScrollIndicator={false}>
      {sortedWarnings.map((warning) => {
        const distance = userLocation
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              warning.location.latitude,
              warning.location.longitude
            )
          : 0;

        return (
          <TouchableOpacity
            key={warning.id}
            style={styles.warningItem}
            onPress={() => onWarningPress(warning)}
            activeOpacity={0.7}
          >
            <View style={styles.warningItemIcon}>
              <Text style={styles.warningItemIconText}>
                {getWarningIcon(warning.type)}
              </Text>
            </View>

            <View style={styles.warningItemContent}>
              <Text style={styles.warningItemTitle}>
                {getWarningTypeLabel(warning.type)}
              </Text>
              <Text style={styles.warningItemDescription} numberOfLines={2}>
                {warning.description}
              </Text>
            </View>

            {userLocation && (
              <Text style={styles.warningItemDistance}>
                {formatDistance(distance)}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
