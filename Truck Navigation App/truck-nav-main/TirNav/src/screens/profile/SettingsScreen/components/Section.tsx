/**
 * Section Component
 * 
 * Settings section with title
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import type { SectionProps } from '../types';

export default function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
