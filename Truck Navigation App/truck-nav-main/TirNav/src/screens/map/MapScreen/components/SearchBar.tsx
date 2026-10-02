/**
 * SearchBar Component
 * 
 * Search bar for route search
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { styles } from '../styles';
import type { SearchBarProps } from '../types';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function SearchBar({ onPress }: SearchBarProps) {
  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(300).springify()}
      style={styles.searchBarContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText}>Nereye gitmek istiyorsunuz?</Text>
      </View>
    </AnimatedTouchable>
  );
}
