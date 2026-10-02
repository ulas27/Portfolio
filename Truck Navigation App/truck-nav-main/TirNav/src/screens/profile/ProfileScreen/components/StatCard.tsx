/**
 * StatCard Component
 * 
 * Display user statistics
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import type { StatCardProps } from '../types';

export default function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
