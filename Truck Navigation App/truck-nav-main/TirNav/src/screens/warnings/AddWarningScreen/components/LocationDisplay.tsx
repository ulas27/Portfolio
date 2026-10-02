/**
 * LocationDisplay Component
 * 
 * Display current location with address
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@components/common';
import { styles } from '../styles';
import type { LocationDisplayProps } from '../types';

export default function LocationDisplay({
  location,
  address,
  onChangeLocation,
}: LocationDisplayProps) {
  /**
   * Format coordinates
   */
  const formatCoordinates = (): string => {
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  return (
    <View style={styles.locationCard}>
      {/* Header */}
      <View style={styles.locationHeader}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationTitle}>Konum</Text>
      </View>

      {/* Address */}
      {address ? (
        <Text style={styles.locationAddress}>{address}</Text>
      ) : (
        <Text style={styles.locationAddress}>Konum alınıyor...</Text>
      )}

      {/* Coordinates */}
      <Text style={styles.locationCoordinates}>{formatCoordinates()}</Text>

      {/* Change Location Button */}
      {onChangeLocation && (
        <Button
          title="Konumu Değiştir"
          variant="outline"
          size="small"
          onPress={onChangeLocation}
          style={styles.changeLocationButton}
        />
      )}
    </View>
  );
}
