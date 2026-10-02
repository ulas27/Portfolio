/**
 * RecentSearches Component
 * 
 * Display recent route searches
 */

import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { styles } from '../styles';
import type { RecentSearchesProps, RecentSearch } from '../types';

export default function RecentSearches({
  searches,
  onSelectSearch,
  onClearAll,
}: RecentSearchesProps) {
  if (searches.length === 0) {
    return null;
  }

  /**
   * Format timestamp
   */
  const formatTime = (timestamp: number): string => {
    try {
      return formatDistanceToNow(timestamp, {
        addSuffix: true,
        locale: tr,
      });
    } catch (error) {
      return '';
    }
  };

  /**
   * Render recent search item
   */
  const renderItem = ({ item }: { item: RecentSearch }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => onSelectSearch(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.recentItemIcon}>🕐</Text>

      <View style={styles.recentItemContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
          <Text style={styles.recentItemRoute} numberOfLines={1}>
            {item.startPoint.address || 'Başlangıç'}
          </Text>
          <Text style={styles.recentItemArrow}>→</Text>
          <Text style={styles.recentItemRoute} numberOfLines={1}>
            {item.endPoint.address || 'Bitiş'}
          </Text>
        </View>

        <Text style={styles.recentItemTime}>{formatTime(item.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.recentSection}>
      {/* Header */}
      <View style={styles.recentHeader}>
        <Text style={styles.recentTitle}>Son Aramalar</Text>
        <TouchableOpacity style={styles.clearAllButton} onPress={onClearAll}>
          <Text style={styles.clearAllButtonText}>Tümünü Temizle</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={searches}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
}
