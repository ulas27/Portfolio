/**
 * MiniMap Component
 * 
 * Small map showing warning location
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { COLORS } from '@constants';
import { styles } from '../styles';
import type { MiniMapProps } from '../types';

export default function MiniMap({ location, onPress }: MiniMapProps) {
  /**
   * Get map region
   */
  const getMapRegion = () => {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  };

  return (
    <TouchableOpacity
      style={styles.miniMapContainer}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <MapView
        style={styles.miniMap}
        initialRegion={getMapRegion()}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {/* Warning Marker */}
        <Marker
          coordinate={location}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: COLORS.semantic.warning,
              borderWidth: 3,
              borderColor: COLORS.grayscale.white,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>⚠️</Text>
          </View>
        </Marker>
      </MapView>

      {/* Overlay */}
      {onPress && (
        <View style={styles.miniMapOverlay}>
          <Text style={styles.miniMapOverlayText}>Haritada Göster</Text>
          <Text style={styles.miniMapOverlayIcon}>🗺️</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
