/**
 * MapScreen Component
 * 
 * Main map screen with user location, warnings, and navigation
 * - Google Maps integration
 * - Real-time location tracking
 * - Warning markers
 * - Bottom sheet with nearby warnings
 * - Floating action buttons
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="MapScreen" component={MapScreen} />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useLocation } from '@hooks/useLocation';
import { useWarningStore } from '@store';
import { COLORS, MAP_CONFIG } from '@constants';
import { styles } from './styles';
import SearchBar from './components/SearchBar';
import FloatingButtons from './components/FloatingButtons';
import WarningMarker from './components/WarningMarker';
import WarningList from './components/WarningList';
import type { MapScreenProps } from './types';
import type { Warning } from '@types/warning';

/**
 * MapScreen Component
 */
export default function MapScreen({ navigation }: MapScreenProps) {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Location hook
  const {
    location: userLocation,
    isLoading: locationLoading,
    error: locationError,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    watchLocation,
  } = useLocation();

  // Warning store
  const warnings = useWarningStore((state) => state.nearbyWarnings);
  const fetchNearbyWarnings = useWarningStore((state) => state.fetchNearbyWarnings);
  const isLoadingWarnings = useWarningStore((state) => state.isLoading);

  // Local state
  const [region, setRegion] = useState<Region>({
    latitude: MAP_CONFIG.defaultRegion.latitude,
    longitude: MAP_CONFIG.defaultRegion.longitude,
    latitudeDelta: MAP_CONFIG.defaultRegion.latitudeDelta,
    longitudeDelta: MAP_CONFIG.defaultRegion.longitudeDelta,
  });
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);

  /**
   * Initialize location and warnings
   */
  useEffect(() => {
    initializeMap();
  }, []);

  /**
   * Watch location changes
   */
  useEffect(() => {
    if (hasPermission) {
      watchLocation();
    }
  }, [hasPermission, watchLocation]);

  /**
   * Update region when user location changes
   */
  useEffect(() => {
    if (userLocation && mapRef.current) {
      const newRegion: Region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, [userLocation]);

  /**
   * Fetch warnings when location changes
   */
  useEffect(() => {
    if (userLocation) {
      fetchNearbyWarnings(userLocation, 25); // 25km radius
    }
  }, [userLocation, fetchNearbyWarnings]);

  /**
   * Initialize map
   */
  const initializeMap = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Konum İzni Gerekli',
          'Harita özelliklerini kullanabilmek için konum iznine ihtiyacımız var.'
        );
        return;
      }
    }

    await getCurrentLocation();
  };

  /**
   * Handle region change
   */
  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  /**
   * Handle search bar press
   */
  const handleSearchPress = useCallback(() => {
    // TODO: Navigate to route search screen
    Alert.alert('Rota Arama', 'Rota arama özelliği yakında eklenecek');
  }, []);

  /**
   * Handle location button press
   */
  const handleLocationPress = useCallback(async () => {
    if (!userLocation) {
      await getCurrentLocation();
      return;
    }

    if (mapRef.current) {
      const newRegion: Region = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, [userLocation, getCurrentLocation]);

  /**
   * Handle zoom in
   */
  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      const newRegion: Region = {
        ...region,
        latitudeDelta: region.latitudeDelta / 2,
        longitudeDelta: region.longitudeDelta / 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  }, [region]);

  /**
   * Handle zoom out
   */
  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      const newRegion: Region = {
        ...region,
        latitudeDelta: region.latitudeDelta * 2,
        longitudeDelta: region.longitudeDelta * 2,
      };
      mapRef.current.animateToRegion(newRegion, 300);
    }
  }, [region]);

  /**
   * Handle add warning
   */
  const handleAddWarning = useCallback(() => {
    if (!userLocation) {
      Alert.alert('Konum Gerekli', 'Uyarı eklemek için konumunuza ihtiyacımız var');
      return;
    }

    // TODO: Navigate to add warning screen
    Alert.alert('Uyarı Ekle', 'Uyarı ekleme özelliği yakında eklenecek');
  }, [userLocation]);

  /**
   * Handle warning marker press
   */
  const handleWarningPress = useCallback((warning: Warning) => {
    setSelectedWarning(warning);
    bottomSheetRef.current?.expand();

    // Animate to warning location
    if (mapRef.current) {
      const newRegion: Region = {
        latitude: warning.location.latitude,
        longitude: warning.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, []);

  /**
   * Handle menu button press
   */
  const handleMenuPress = useCallback(() => {
    // TODO: Open drawer navigation
    Alert.alert('Menü', 'Menü özelliği yakında eklenecek');
  }, []);

  /**
   * Handle vehicle info button press
   */
  const handleVehicleInfoPress = useCallback(() => {
    navigation.navigate('VehicleInfo');
  }, [navigation]);

  /**
   * Memoize warning markers
   */
  const warningMarkers = useMemo(() => {
    return warnings.map((warning) => (
      <WarningMarker
        key={warning.id}
        warning={warning}
        onPress={handleWarningPress}
      />
    ));
  }, [warnings, handleWarningPress]);

  /**
   * Show loading state
   */
  if (locationLoading && !userLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
        <Text style={{ marginTop: 16, color: COLORS.text.secondary }}>
          Konum alınıyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        showsTraffic={false}
        loadingEnabled
      >
        {warningMarkers}
      </MapView>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleMenuPress}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>TırNav</Text>

        <TouchableOpacity
          style={styles.topBarButton}
          onPress={handleVehicleInfoPress}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 20 }}>🚛</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <SearchBar onPress={handleSearchPress} />

      {/* Floating Action Buttons */}
      <FloatingButtons
        onLocationPress={handleLocationPress}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onAddWarning={handleAddWarning}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={['15%', '50%', '90%']}
        backgroundStyle={styles.bottomSheetContainer}
        handleIndicatorStyle={styles.bottomSheetHandle}
      >
        <BottomSheetScrollView style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetTitle}>
            Yakındaki Uyarılar ({warnings.length})
          </Text>
          <WarningList
            warnings={warnings}
            userLocation={userLocation}
            onWarningPress={handleWarningPress}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
