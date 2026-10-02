/**
 * AlternativeRoutesCarousel Component
 * 
 * Horizontal scrollable list of alternative routes
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import type { AlternativeRoutesCarouselProps, AlternativeRouteCardProps } from '../types';

/**
 * Alternative Route Card
 */
function AlternativeRouteCard({
  route,
  isSelected,
  onPress,
  comparisonRoute,
}: AlternativeRouteCardProps) {
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
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  /**
   * Calculate difference
   */
  const getDifference = (value: number, comparisonValue: number): string => {
    const diff = value - comparisonValue;
    const percentage = ((diff / comparisonValue) * 100).toFixed(0);
    
    if (diff > 0) {
      return `+${percentage}%`;
    } else if (diff < 0) {
      return `${percentage}%`;
    }
    
    return '';
  };

  const distanceDiff = comparisonRoute
    ? getDifference(route.distance, comparisonRoute.distance)
    : '';
  const durationDiff = comparisonRoute
    ? getDifference(route.duration, comparisonRoute.duration)
    : '';

  return (
    <TouchableOpacity
      style={[
        styles.alternativeCard,
        isSelected && styles.alternativeCardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.alternativeCardHeader}>
        {isSelected && (
          <View style={styles.alternativeCardBadge}>
            <Text style={styles.alternativeCardBadgeText}>Seçili</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.alternativeCardStats}>
        {/* Distance */}
        <View style={styles.alternativeCardStat}>
          <Text style={styles.alternativeCardStatIcon}>📏</Text>
          <Text style={styles.alternativeCardStatText}>
            {formatDistance(route.distance)}
          </Text>
          {distanceDiff && (
            <Text
              style={[
                styles.alternativeCardDiff,
                route.distance > (comparisonRoute?.distance || 0) &&
                  styles.alternativeCardDiffNegative,
              ]}
            >
              {distanceDiff}
            </Text>
          )}
        </View>

        {/* Duration */}
        <View style={styles.alternativeCardStat}>
          <Text style={styles.alternativeCardStatIcon}>⏱️</Text>
          <Text style={styles.alternativeCardStatText}>
            {formatDuration(route.duration)}
          </Text>
          {durationDiff && (
            <Text
              style={[
                styles.alternativeCardDiff,
                route.duration > (comparisonRoute?.duration || 0) &&
                  styles.alternativeCardDiffNegative,
              ]}
            >
              {durationDiff}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/**
 * AlternativeRoutesCarousel Component
 */
export default function AlternativeRoutesCarousel({
  routes,
  selectedId,
  onSelect,
}: AlternativeRoutesCarouselProps) {
  if (routes.length <= 1) {
    return null;
  }

  // Use first route as comparison baseline
  const comparisonRoute = routes[0];

  return (
    <View style={styles.alternativeSection}>
      {/* Header */}
      <View style={styles.alternativeSectionHeader}>
        <Text style={styles.alternativeSectionTitle}>Alternatif Rotalar</Text>
      </View>

      {/* Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.alternativeCarousel}
      >
        {routes.map((route) => (
          <AlternativeRouteCard
            key={route.id}
            route={route}
            isSelected={route.id === selectedId}
            onPress={() => onSelect(route.id)}
            comparisonRoute={route.id !== comparisonRoute.id ? comparisonRoute : undefined}
          />
        ))}
      </ScrollView>
    </View>
  );
}
