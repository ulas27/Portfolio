/**
 * MapPreview Component
 * 
 * Small map preview showing route polyline
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { COLORS } from '@constants';
import { styles } from '../styles';
import type { MapPreviewProps } from '../types';

export default function MapPreview({ route, onPress }: MapPreviewProps) {
  /**
   * Calculate map region to fit route
   */
  const getMapRegion = () => {
    const coordinates = route.geometry;
    
    if (coordinates.length === 0) {
      return {
        latitude: route.startPoint.latitude,
        longitude: route.startPoint.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const latitudes = coordinates.map((c) => c.latitude);
    const longitudes = coordinates.map((c) => c.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) * 1.5; // Add padding
    const lngDelta = (maxLng - minLng) * 1.5;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  };

  return (
    <TouchableOpacity
      style={styles.mapPreviewContainer}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <MapView
        style={styles.mapPreview}
        initialRegion={getMapRegion()}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {/* Route Polyline */}
        {route.geometry.length > 0 && (
          <Polyline
            coordinates={route.geometry}
            strokeColor={COLORS.primary.main}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Start Marker */}
        <Marker
          coordinate={route.startPoint}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: COLORS.semantic.success,
              borderWidth: 3,
              borderColor: COLORS.grayscale.white,
            }}
          />
        </Marker>

        {/* End Marker */}
        <Marker
          coordinate={route.endPoint}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: COLORS.semantic.error,
              borderWidth: 3,
              borderColor: COLORS.grayscale.white,
            }}
          />
        </Marker>
      </MapView>

      {/* Overlay */}
      {onPress && (
        <View style={styles.mapPreviewOverlay}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <Text style={styles.mapPreviewOverlayText}>Haritayı Büyüt</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
