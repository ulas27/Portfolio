/**
 * useLocation Hook (Simple Version)
 * 
 * Custom hook for managing device location with native permissions
 * - Request location permissions (iOS/Android)
 * - Get current location
 * - Watch location changes
 * - Handle errors with Turkish messages
 * 
 * @example
 * ```tsx
 * const { location, isLoading, error, requestPermission, getCurrentLocation } = useLocation();
 * 
 * // Request permission
 * const granted = await requestPermission();
 * 
 * // Get current location
 * const coords = await getCurrentLocation();
 * 
 * // Watch location changes
 * watchLocation();
 * ```
 */

import { useState, useEffect } from 'react';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import type { Coordinates } from '@types/common';

/**
 * Hook return type
 */
interface UseLocationReturn {
  /**
   * Current location coordinates
   */
  location: Coordinates | null;

  /**
   * Loading state
   */
  isLoading: boolean;

  /**
   * Error message (Turkish)
   */
  error: string | null;

  /**
   * Request location permission
   * @returns true if permission granted
   */
  requestPermission: () => Promise<boolean>;

  /**
   * Get current location once
   * @returns Coordinates or null if failed
   */
  getCurrentLocation: () => Promise<Coordinates | null>;

  /**
   * Start watching location changes
   */
  watchLocation: () => void;

  /**
   * Stop watching location changes
   */
  clearWatch: () => void;
}

/**
 * useLocation Hook
 * 
 * Manages device location with permission handling
 */
export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  /**
   * Request location permission based on platform
   * 
   * iOS: Uses Geolocation.requestAuthorization
   * Android: Uses PermissionsAndroid.request
   * 
   * @returns Promise<boolean> - true if permission granted
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        // iOS permission request
        const status = await Geolocation.requestAuthorization('whenInUse');
        
        if (status === 'granted') {
          return true;
        } else if (status === 'denied') {
          Alert.alert(
            'Konum İzni Gerekli',
            'Harita özelliklerini kullanabilmek için konum iznine ihtiyacımız var.',
            [{ text: 'Tamam' }]
          );
          return false;
        } else if (status === 'disabled') {
          Alert.alert(
            'Konum Servisi Kapalı',
            'Lütfen cihaz ayarlarından konum servisini açın.',
            [{ text: 'Tamam' }]
          );
          return false;
        }
        
        return false;
      }

      if (Platform.OS === 'android') {
        // Android permission request
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Konum İzni',
            message: 'TırNav konumunuzu kullanarak size en iyi rotayı gösterebilir ve yakındaki uyarıları bulabilir.',
            buttonNeutral: 'Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'İzin Ver',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.DENIED) {
          Alert.alert(
            'Konum İzni Gerekli',
            'Harita özelliklerini kullanabilmek için konum iznine ihtiyacımız var.',
            [{ text: 'Tamam' }]
          );
          return false;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Konum İzni Engellendi',
            'Konum iznini ayarlardan açmanız gerekiyor.',
            [{ text: 'Tamam' }]
          );
          return false;
        }

        return false;
      }

      return false;
    } catch (err) {
      console.error('Permission request error:', err);
      setError('İzin isteği başarısız oldu');
      return false;
    }
  };

  /**
   * Get current location once
   * 
   * Requests permission if not granted
   * Uses high accuracy mode
   * 
   * @returns Promise<Coordinates | null> - Location coordinates or null if failed
   */
  const getCurrentLocation = async (): Promise<Coordinates | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check/request permission
      const hasPermission = await requestPermission();
      
      if (!hasPermission) {
        setError('Konum izni verilmedi');
        setIsLoading(false);
        return null;
      }

      // Get location
      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const coords: Coordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };
            setLocation(coords);
            setError(null);
            setIsLoading(false);
            resolve(coords);
          },
          (err) => {
            console.error('Get location error:', err);
            const errorMessage = getLocationErrorMessage(err.code);
            setError(errorMessage);
            setIsLoading(false);
            resolve(null);
          },
          {
            enableHighAccuracy: true,  // Use GPS
            timeout: 15000,             // 15 seconds timeout
            maximumAge: 10000,          // Accept cached location up to 10 seconds old
          }
        );
      });
    } catch (err) {
      console.error('Get current location error:', err);
      setError('Konum alınırken bir hata oluştu');
      setIsLoading(false);
      return null;
    }
  };

  /**
   * Watch location continuously
   * 
   * Updates location every 10 meters or 5 seconds
   * Requests permission if not granted
   */
  const watchLocation = async () => {
    // Check/request permission
    const hasPermission = await requestPermission();
    
    if (!hasPermission) {
      setError('Konum izni verilmedi');
      return;
    }

    // Clear existing watch
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
    }

    // Start watching
    const id = Geolocation.watchPosition(
      (position) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setError(null);
      },
      (err) => {
        console.error('Watch location error:', err);
        const errorMessage = getLocationErrorMessage(err.code);
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,   // Use GPS
        distanceFilter: 10,         // Update every 10 meters
        interval: 5000,             // Update every 5 seconds (Android)
        fastestInterval: 2000,      // Fastest update: 2 seconds (Android)
      }
    );

    setWatchId(id);
  };

  /**
   * Stop watching location
   * 
   * Clears the location watch
   */
  const clearWatch = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearWatch();
    };
  }, []);

  return {
    location,
    isLoading,
    error,
    requestPermission,
    getCurrentLocation,
    watchLocation,
    clearWatch,
  };
}

/**
 * Get user-friendly error message for location errors
 * 
 * @param code - Geolocation error code
 * @returns Turkish error message
 */
function getLocationErrorMessage(code: number): string {
  switch (code) {
    case 1: // PERMISSION_DENIED
      return 'Konum izni reddedildi';
    case 2: // POSITION_UNAVAILABLE
      return 'Konum bilgisi alınamadı. GPS sinyali zayıf olabilir.';
    case 3: // TIMEOUT
      return 'Konum alınırken zaman aşımı. Lütfen tekrar deneyin.';
    case 4: // PLAY_SERVICES_NOT_AVAILABLE (Android)
      return 'Google Play Services mevcut değil';
    case 5: // SETTINGS_NOT_SATISFIED
      return 'Konum ayarları uygun değil. Lütfen konum servisini açın.';
    default:
      return 'Konum alınırken bir hata oluştu';
  }
}

export default useLocation;
