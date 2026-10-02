/**
 * useLocation Hook
 * 
 * Custom hook for managing device location
 * - Request location permissions
 * - Get current location
 * - Watch location changes
 * - Handle errors
 * 
 * @example
 * ```tsx
 * const { location, error, requestPermission } = useLocation();
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS, PermissionStatus } from 'react-native-permissions';
import type { Coordinates } from '@types/common';

interface UseLocationResult {
  location: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<void>;
  watchLocation: () => void;
  clearWatch: () => void;
}

/**
 * useLocation Hook
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  /**
   * Get location permission based on platform
   */
  const getLocationPermission = useCallback(() => {
    return Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      default: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    });
  }, []);

  /**
   * Check if location permission is granted
   */
  const checkPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = getLocationPermission();
      const result = await check(permission);
      const granted = result === RESULTS.GRANTED;
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  }, [getLocationPermission]);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = getLocationPermission();
      const result = await request(permission);

      switch (result) {
        case RESULTS.GRANTED:
          setHasPermission(true);
          setError(null);
          return true;

        case RESULTS.DENIED:
          setError('Konum izni reddedildi');
          Alert.alert(
            'Konum İzni Gerekli',
            'Harita özelliklerini kullanabilmek için konum iznine ihtiyacımız var.',
            [{ text: 'Tamam' }]
          );
          return false;

        case RESULTS.BLOCKED:
          setError('Konum izni engellendi');
          Alert.alert(
            'Konum İzni Engellendi',
            'Konum iznini ayarlardan açmanız gerekiyor.',
            [
              { text: 'İptal', style: 'cancel' },
              { text: 'Ayarları Aç', onPress: () => Linking.openSettings() },
            ]
          );
          return false;

        default:
          setError('Konum izni alınamadı');
          return false;
      }
    } catch (error) {
      console.error('Request permission error:', error);
      setError('Konum izni alınırken hata oluştu');
      return false;
    }
  }, [getLocationPermission]);

  /**
   * Get current location
   */
  const getCurrentLocation = useCallback(async (): Promise<void> => {
    const permitted = hasPermission || (await checkPermission());
    if (!permitted) {
      const granted = await requestPermission();
      if (!granted) return;
    }

    setIsLoading(true);
    setError(null);

    Geolocation.getCurrentPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setIsLoading(false);
      },
      (error) => {
        console.error('Get location error:', error);
        setError(getLocationErrorMessage(error.code));
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }, [hasPermission, checkPermission, requestPermission]);

  /**
   * Watch location changes
   */
  const watchLocation = useCallback(() => {
    if (watchId !== null) {
      return; // Already watching
    }

    const id = Geolocation.watchPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setError(null);
      },
      (error) => {
        console.error('Watch location error:', error);
        setError(getLocationErrorMessage(error.code));
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 2000,
      }
    );

    setWatchId(id);
  }, [watchId]);

  /**
   * Clear location watch
   */
  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  /**
   * Check permission on mount
   */
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearWatch();
    };
  }, [clearWatch]);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    clearWatch,
  };
}

/**
 * Get user-friendly error message for location errors
 */
function getLocationErrorMessage(code: number): string {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return 'Konum izni reddedildi';
    case 2: // POSITION_UNAVAILABLE
      return 'Konum bilgisi alınamadı';
    case 3: // TIMEOUT
      return 'Konum alınırken zaman aşımı';
    case 4: // PLAY_SERVICES_NOT_AVAILABLE
      return 'Google Play Services mevcut değil';
    case 5: // SETTINGS_NOT_SATISFIED
      return 'Konum ayarları uygun değil';
    default:
      return 'Konum alınırken hata oluştu';
  }
}

export default useLocation;
