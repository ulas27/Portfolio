/**
 * SearchResultItem Component
 * 
 * Single search result item
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import type { SearchResultItemProps } from '../types';

export default function SearchResultItem({
  item,
  onPress,
  distance,
  isLast = false,
}: SearchResultItemProps & { isLast?: boolean }) {
  /**
   * Format distance
   */
  const formatDistance = (meters?: number): string => {
    if (!meters) return '';
    
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    
    return `${(meters / 1000).toFixed(1)} km`;
  };

  return (
    <TouchableOpacity
      style={[styles.searchResultItem, isLast && styles.searchResultItemLast]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.searchResultIcon}>📍</Text>

      <View style={styles.searchResultContent}>
        <Text style={styles.searchResultAddress} numberOfLines={2}>
          {item.address || `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`}
        </Text>

        {distance !== undefined && (
          <Text style={styles.searchResultDistance}>
            {formatDistance(distance)} uzaklıkta
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
