/**
 * SearchBar Component
 * 
 * Search input for filtering routes
 */

import React from 'react';
import { View, TextInput } from 'react-native';
import { COLORS } from '@constants';
import { styles } from '../styles';
import type { SearchBarProps } from '../types';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Rota ara...',
}: SearchBarProps) {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.text.secondary}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
