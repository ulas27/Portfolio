/**
 * RouteSummaryCard Component
 * 
 * Display route summary with distance, duration, and locations
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import type { RouteSummaryCardProps } from '../types';

export default function RouteSummaryCard({
  route,
  showFuelEstimate = false,
}: RouteSummaryCardProps) {
  /**
   * Format distance (meters to km)
   */
  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  };

  /**
   * Format duration (seconds to hours:minutes)
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
   * Estimate fuel consumption (rough estimate)
   */
  const estimateFuel = (distanceKm: number): number => {
    // Average truck consumption: 30 liters per 100km
    const consumptionPer100Km = 30;
    return (distanceKm * consumptionPer100Km) / 100;
  };

  const distanceKm = route.distance / 1000;
  const fuelEstimate = estimateFuel(distanceKm);

  return (
    <View style={styles.summaryCard}>
      {/* Stats */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDistance(route.distance)}</Text>
            <Text style={styles.statLabel}>Mesafe</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(route.duration)}</Text>
            <Text style={styles.statLabel}>Süre</Text>
          </View>

          {showFuelEstimate && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{fuelEstimate.toFixed(1)} L</Text>
              <Text style={styles.statLabel}>Yakıt (tahmini)</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.summaryDivider} />

      {/* Locations */}
      <View style={styles.summaryLocations}>
        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>🟢</Text>
          <Text style={styles.locationText} numberOfLines={2}>
            {route.startPoint.address || 'Başlangıç noktası'}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Text style={styles.locationIcon}>🔴</Text>
          <Text style={styles.locationText} numberOfLines={2}>
            {route.endPoint.address || 'Bitiş noktası'}
          </Text>
        </View>
      </View>
    </View>
  );
}
