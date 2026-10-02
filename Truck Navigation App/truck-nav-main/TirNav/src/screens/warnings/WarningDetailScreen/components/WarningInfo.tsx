/**
 * WarningInfo Component
 * 
 * Display warning metadata (user, time, location)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { styles } from '../styles';
import type { WarningInfoProps } from '../types';

export default function WarningInfo({
  createdBy,
  createdAt,
  location,
  address,
}: WarningInfoProps) {
  /**
   * Format timestamp
   */
  const formatTime = (date: Date): string => {
    try {
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: tr,
      });
    } catch (error) {
      return '';
    }
  };

  /**
   * Format coordinates
   */
  const formatCoordinates = (): string => {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <View style={styles.infoContainer}>
      {/* Created By */}
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>👤</Text>
        <Text style={styles.infoText}>{createdBy}</Text>
      </View>

      {/* Created At */}
      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>🕐</Text>
        <Text style={styles.infoText}>{formatTime(createdAt)}</Text>
      </View>

      {/* Location */}
      <View style={[styles.infoRow, styles.infoRowLast]}>
        <Text style={styles.infoIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          {address ? (
            <Text style={styles.infoText}>{address}</Text>
          ) : (
            <Text style={[styles.infoText, styles.infoTextSecondary]}>
              Adres alınıyor...
            </Text>
          )}
          <Text style={[styles.infoText, styles.infoTextSecondary]}>
            {formatCoordinates()}
          </Text>
        </View>
      </View>
    </View>
  );
}
