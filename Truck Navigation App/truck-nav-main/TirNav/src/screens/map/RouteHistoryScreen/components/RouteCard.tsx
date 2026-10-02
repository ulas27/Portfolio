/**
 * RouteCard Component
 * 
 * Display route information card
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { styles } from '../styles';
import type { RouteCardProps } from '../types';

export default function RouteCard({
  route,
  onPress,
  onReuse,
}: RouteCardProps) {
  /**
   * Format distance
   */
  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return `${km.toFixed(1)} km`;
  };

  /**
   * Format duration
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes} dk`;
    }

    return `${hours} sa ${minutes} dk`;
  };

  /**
   * Format time
   */
  const formatTime = (date: Date): string => {
    return format(date, 'HH:mm', { locale: tr });
  };

  /**
   * Shorten address
   */
  const shortenAddress = (address?: string): string => {
    if (!address) return 'Bilinmeyen';

    const parts = address.split(',');
    if (parts.length > 2) {
      return `${parts[0]}, ${parts[1]}`;
    }

    return address;
  };

  return (
    <TouchableOpacity
      style={styles.routeCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.routeCardHeader}>
        <Text style={styles.routeCardIcon}>🗺️</Text>
        <View style={styles.routeCardLocations}>
          <Text style={styles.routeCardLocation} numberOfLines={1}>
            {shortenAddress(route.startPoint.address)}
            <Text style={styles.routeCardArrow}> → </Text>
            {shortenAddress(route.endPoint.address)}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.routeCardStats}>
        <View style={styles.routeCardStat}>
          <Text style={styles.routeCardStatIcon}>📏</Text>
          <Text style={styles.routeCardStatText}>
            {formatDistance(route.distance)}
          </Text>
        </View>

        <View style={styles.routeCardStat}>
          <Text style={styles.routeCardStatIcon}>⏱️</Text>
          <Text style={styles.routeCardStatText}>
            {formatDuration(route.duration)}
          </Text>
        </View>

        {route.warnings.length > 0 && (
          <View style={styles.routeCardStat}>
            <Text style={styles.routeCardStatIcon}>⚠️</Text>
            <Text style={styles.routeCardStatText}>
              {route.warnings.length} uyarı
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.routeCardFooter}>
        <Text style={styles.routeCardTime}>{formatTime(route.createdAt)}</Text>

        {onReuse && (
          <TouchableOpacity
            style={styles.reuseButton}
            onPress={(e) => {
              e.stopPropagation();
              onReuse();
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.reuseButtonText}>Tekrar Kullan</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
