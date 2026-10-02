/**
 * SearchInput Component
 * 
 * Autocomplete search input with results dropdown
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '@constants';
import { styles } from '../styles';
import SearchResultItem from './SearchResultItem';
import type { SearchInputProps } from '../types';

export default function SearchInput({
  label,
  placeholder,
  value,
  onChangeText,
  results,
  onSelectResult,
  isLoading = false,
  showCurrentLocation = false,
  onUseCurrentLocation,
  autoFocus = false,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Handle result selection
   */
  const handleSelectResult = (result: any) => {
    onSelectResult(result);
    setIsFocused(false);
  };

  /**
   * Handle clear
   */
  const handleClear = () => {
    onChangeText('');
  };

  const showResults = isFocused && (results.length > 0 || isLoading);

  return (
    <View style={styles.searchInputContainer}>
      {/* Label */}
      <Text style={styles.searchInputLabel}>{label}</Text>

      {/* Input */}
      <View
        style={[
          styles.searchInputWrapper,
          isFocused && styles.searchInputWrapperFocused,
        ]}
      >
        <Text style={styles.searchInputIcon}>📍</Text>

        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Current Location Button */}
        {showCurrentLocation && !value && (
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={onUseCurrentLocation}
          >
            <Text style={styles.currentLocationButtonText}>Konumum</Text>
          </TouchableOpacity>
        )}

        {/* Clear Button */}
        {value.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {showResults && (
        <View style={styles.searchResultsContainer}>
          {isLoading ? (
            <View style={styles.searchResultLoading}>
              <ActivityIndicator size="small" color={COLORS.primary.main} />
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
              renderItem={({ item, index }) => (
                <SearchResultItem
                  item={item}
                  onPress={handleSelectResult}
                  isLast={index === results.length - 1}
                />
              )}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            />
          ) : (
            <View style={styles.searchResultEmpty}>
              <Text style={styles.searchResultEmptyText}>Sonuç bulunamadı</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
