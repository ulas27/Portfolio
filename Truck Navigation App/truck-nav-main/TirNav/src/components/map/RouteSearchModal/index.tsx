/**
 * RouteSearchModal Component
 * 
 * Modal for searching and calculating truck routes
 * - Start/end point search with autocomplete
 * - Recent searches
 * - Route options (tolls, highways, route type)
 * - GraphHopper integration
 * - AsyncStorage for history
 * 
 * @example
 * ```tsx
 * <RouteSearchModal
 *   isVisible={showModal}
 *   onClose={() => setShowModal(false)}
 *   onRouteCalculated={(routes) => handleRoutes(routes)}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '@components/common';
import { useLocation } from '@hooks';
import { useVehicleStore } from '@store';
import { graphHopperService } from '@services/routing';
import { STORAGE_KEYS } from '@constants';
import { styles } from './styles';
import SearchInput from './components/SearchInput';
import RecentSearches from './components/RecentSearches';
import RouteOptions from './components/RouteOptions';
import type {
  RouteSearchModalProps,
  RouteSearchState,
  RecentSearch,
} from './types';
import type { RoutePoint } from '@types/route';

const RECENT_SEARCHES_KEY = STORAGE_KEYS.ROUTE_SEARCH_HISTORY || '@tirnav:route:search_history';
const MAX_RECENT_SEARCHES = 10;

/**
 * RouteSearchModal Component
 */
export default function RouteSearchModal({
  isVisible,
  onClose,
  onRouteCalculated,
}: RouteSearchModalProps) {
  const { location } = useLocation();
  const activeVehicle = useVehicleStore((state) => state.activeVehicle);

  // State
  const [state, setState] = useState<RouteSearchState>({
    startPoint: null,
    endPoint: null,
    startQuery: '',
    endQuery: '',
    startSearchResults: [],
    endSearchResults: [],
    isSearchingStart: false,
    isSearchingEnd: false,
    isCalculating: false,
    avoidTolls: false,
    avoidHighways: false,
    routeType: 'fastest',
    recentSearches: [],
    activeInput: null,
  });

  /**
   * Load recent searches on mount
   */
  useEffect(() => {
    if (isVisible) {
      loadRecentSearches();
    }
  }, [isVisible]);

  /**
   * Load recent searches from AsyncStorage
   */
  const loadRecentSearches = async () => {
    try {
      const data = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (data) {
        const searches: RecentSearch[] = JSON.parse(data);
        setState((prev) => ({ ...prev, recentSearches: searches }));
      }
    } catch (error) {
      console.error('Load recent searches error:', error);
    }
  };

  /**
   * Save search to history
   */
  const saveSearchHistory = async (start: RoutePoint, end: RoutePoint) => {
    try {
      const newSearch: RecentSearch = {
        id: `${Date.now()}`,
        startPoint: start,
        endPoint: end,
        timestamp: Date.now(),
      };

      const updatedSearches = [
        newSearch,
        ...state.recentSearches.filter(
          (s) =>
            !(
              s.startPoint.latitude === start.latitude &&
              s.startPoint.longitude === start.longitude &&
              s.endPoint.latitude === end.latitude &&
              s.endPoint.longitude === end.longitude
            )
        ),
      ].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(
        RECENT_SEARCHES_KEY,
        JSON.stringify(updatedSearches)
      );

      setState((prev) => ({ ...prev, recentSearches: updatedSearches }));
    } catch (error) {
      console.error('Save search history error:', error);
    }
  };

  /**
   * Clear all recent searches
   */
  const clearRecentSearches = async () => {
    Alert.alert(
      'Geçmişi Temizle',
      'Tüm arama geçmişi silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
              setState((prev) => ({ ...prev, recentSearches: [] }));
            } catch (error) {
              console.error('Clear recent searches error:', error);
            }
          },
        },
      ]
    );
  };

  /**
   * Search locations (debounced)
   */
  const searchLocations = useDebouncedCallback(
    async (query: string, type: 'start' | 'end') => {
      if (query.length < 3) {
        if (type === 'start') {
          setState((prev) => ({ ...prev, startSearchResults: [] }));
        } else {
          setState((prev) => ({ ...prev, endSearchResults: [] }));
        }
        return;
      }

      // Set loading
      if (type === 'start') {
        setState((prev) => ({ ...prev, isSearchingStart: true }));
      } else {
        setState((prev) => ({ ...prev, isSearchingEnd: true }));
      }

      try {
        const results = await graphHopperService.geocode(query);

        if (type === 'start') {
          setState((prev) => ({
            ...prev,
            startSearchResults: results,
            isSearchingStart: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            endSearchResults: results,
            isSearchingEnd: false,
          }));
        }
      } catch (error) {
        console.error('Search error:', error);

        if (type === 'start') {
          setState((prev) => ({
            ...prev,
            startSearchResults: [],
            isSearchingStart: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            endSearchResults: [],
            isSearchingEnd: false,
          }));
        }
      }
    },
    300
  );

  /**
   * Handle start query change
   */
  const handleStartQueryChange = (text: string) => {
    setState((prev) => ({ ...prev, startQuery: text, startPoint: null }));
    searchLocations(text, 'start');
  };

  /**
   * Handle end query change
   */
  const handleEndQueryChange = (text: string) => {
    setState((prev) => ({ ...prev, endQuery: text, endPoint: null }));
    searchLocations(text, 'end');
  };

  /**
   * Handle start result selection
   */
  const handleSelectStartResult = (result: RoutePoint) => {
    setState((prev) => ({
      ...prev,
      startPoint: result,
      startQuery: result.address || `${result.latitude}, ${result.longitude}`,
      startSearchResults: [],
    }));
  };

  /**
   * Handle end result selection
   */
  const handleSelectEndResult = (result: RoutePoint) => {
    setState((prev) => ({
      ...prev,
      endPoint: result,
      endQuery: result.address || `${result.latitude}, ${result.longitude}`,
      endSearchResults: [],
    }));
  };

  /**
   * Use current location as start point
   */
  const useCurrentLocation = async () => {
    if (!location) {
      Alert.alert('Konum Bulunamadı', 'Lütfen konum izni verin ve tekrar deneyin.');
      return;
    }

    try {
      const address = await graphHopperService.reverseGeocode(location);
      const point: RoutePoint = {
        ...location,
        address,
      };

      setState((prev) => ({
        ...prev,
        startPoint: point,
        startQuery: address,
      }));
    } catch (error) {
      console.error('Reverse geocode error:', error);
      Alert.alert('Hata', 'Adres bilgisi alınamadı');
    }
  };

  /**
   * Swap start and end points
   */
  const swapPoints = () => {
    setState((prev) => ({
      ...prev,
      startPoint: prev.endPoint,
      endPoint: prev.startPoint,
      startQuery: prev.endQuery,
      endQuery: prev.startQuery,
    }));
  };

  /**
   * Handle recent search selection
   */
  const handleSelectRecentSearch = (search: RecentSearch) => {
    setState((prev) => ({
      ...prev,
      startPoint: search.startPoint,
      endPoint: search.endPoint,
      startQuery:
        search.startPoint.address ||
        `${search.startPoint.latitude}, ${search.startPoint.longitude}`,
      endQuery:
        search.endPoint.address ||
        `${search.endPoint.latitude}, ${search.endPoint.longitude}`,
    }));
  };

  /**
   * Calculate route
   */
  const handleCalculateRoute = async () => {
    if (!state.startPoint || !state.endPoint) {
      Alert.alert('Eksik Bilgi', 'Lütfen başlangıç ve bitiş noktalarını girin');
      return;
    }

    if (!activeVehicle) {
      Alert.alert(
        'Araç Bilgisi Yok',
        'Lütfen önce araç bilgilerinizi girin',
        [
          {
            text: 'Tamam',
            onPress: () => onClose(),
          },
        ]
      );
      return;
    }

    setState((prev) => ({ ...prev, isCalculating: true }));

    try {
      const routes = await graphHopperService.calculateRoute({
        start: state.startPoint,
        end: state.endPoint,
        vehicleProfile: {
          vehicle: 'truck',
          dimensions: activeVehicle.dimensions,
        },
        avoidTolls: state.avoidTolls,
        avoidHighways: state.avoidHighways,
      });

      // Save to history
      await saveSearchHistory(state.startPoint, state.endPoint);

      // Call callback
      onRouteCalculated(routes);

      // Close modal
      onClose();

      // Reset state
      setState((prev) => ({
        ...prev,
        isCalculating: false,
        startPoint: null,
        endPoint: null,
        startQuery: '',
        endQuery: '',
      }));
    } catch (error: any) {
      console.error('Calculate route error:', error);
      Alert.alert('Rota Hesaplanamadı', error.message || 'Lütfen tekrar deneyin');
      setState((prev) => ({ ...prev, isCalculating: false }));
    }
  };

  /**
   * Handle close
   */
  const handleClose = () => {
    // Reset search results
    setState((prev) => ({
      ...prev,
      startSearchResults: [],
      endSearchResults: [],
    }));
    onClose();
  };

  const canCalculate = state.startPoint && state.endPoint && !state.isCalculating;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rota Ara</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Search Inputs */}
          <View style={styles.searchSection}>
            <View style={styles.inputsContainer}>
              {/* Start Input */}
              <SearchInput
                label="Nereden"
                placeholder="Başlangıç noktası"
                value={state.startQuery}
                onChangeText={handleStartQueryChange}
                results={state.startSearchResults}
                onSelectResult={handleSelectStartResult}
                isLoading={state.isSearchingStart}
                showCurrentLocation
                onUseCurrentLocation={useCurrentLocation}
                autoFocus
              />

              {/* End Input */}
              <SearchInput
                label="Nereye"
                placeholder="Varış noktası"
                value={state.endQuery}
                onChangeText={handleEndQueryChange}
                results={state.endSearchResults}
                onSelectResult={handleSelectEndResult}
                isLoading={state.isSearchingEnd}
              />

              {/* Swap Button */}
              {state.startPoint && state.endPoint && (
                <TouchableOpacity style={styles.swapButton} onPress={swapPoints}>
                  <Text style={styles.swapButtonText}>⇅</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Recent Searches */}
          {!state.startQuery && !state.endQuery && (
            <RecentSearches
              searches={state.recentSearches}
              onSelectSearch={handleSelectRecentSearch}
              onClearAll={clearRecentSearches}
            />
          )}

          {/* Route Options */}
          <RouteOptions
            avoidTolls={state.avoidTolls}
            onAvoidTollsChange={(value) =>
              setState((prev) => ({ ...prev, avoidTolls: value }))
            }
            avoidHighways={state.avoidHighways}
            onAvoidHighwaysChange={(value) =>
              setState((prev) => ({ ...prev, avoidHighways: value }))
            }
            routeType={state.routeType}
            onRouteTypeChange={(value) =>
              setState((prev) => ({ ...prev, routeType: value }))
            }
          />
        </ScrollView>

        {/* Calculate Button */}
        <View style={styles.calculateButtonContainer}>
          <Button
            title="Rota Hesapla"
            onPress={handleCalculateRoute}
            variant="primary"
            size="large"
            fullWidth
            disabled={!canCalculate}
            isLoading={state.isCalculating}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
