/**
 * RouteOptions Component
 * 
 * Route calculation options (tolls, highways, route type)
 */

import React from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { COLORS } from '@constants';
import { styles } from '../styles';
import type { RouteOptionsProps } from '../types';

export default function RouteOptions({
  avoidTolls,
  onAvoidTollsChange,
  avoidHighways,
  onAvoidHighwaysChange,
  routeType,
  onRouteTypeChange,
}: RouteOptionsProps) {
  return (
    <View style={styles.optionsSection}>
      <Text style={styles.optionsTitle}>Rota Seçenekleri</Text>

      <View style={styles.optionsCard}>
        {/* Avoid Tolls */}
        <View style={styles.optionItem}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Paralı Yollardan Kaçın</Text>
            <Text style={styles.optionDescription}>
              Ücretli geçişleri rotadan çıkar
            </Text>
          </View>
          <Switch
            value={avoidTolls}
            onValueChange={onAvoidTollsChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={avoidTolls ? COLORS.primary.main : '#f4f3f4'}
          />
        </View>

        {/* Avoid Highways */}
        <View style={[styles.optionItem, styles.optionItemLast]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Otoyollardan Kaçın</Text>
            <Text style={styles.optionDescription}>
              Otoyol kullanmadan rota hesapla
            </Text>
          </View>
          <Switch
            value={avoidHighways}
            onValueChange={onAvoidHighwaysChange}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={avoidHighways ? COLORS.primary.main : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Route Type Selector */}
      <View style={styles.routeTypeContainer}>
        <TouchableOpacity
          style={[
            styles.routeTypeButton,
            routeType === 'fastest' && styles.routeTypeButtonActive,
          ]}
          onPress={() => onRouteTypeChange('fastest')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.routeTypeButtonText,
              routeType === 'fastest' && styles.routeTypeButtonTextActive,
            ]}
          >
            ⚡ En Hızlı
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.routeTypeButton,
            routeType === 'shortest' && styles.routeTypeButtonActive,
          ]}
          onPress={() => onRouteTypeChange('shortest')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.routeTypeButtonText,
              routeType === 'shortest' && styles.routeTypeButtonTextActive,
            ]}
          >
            📏 En Kısa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
