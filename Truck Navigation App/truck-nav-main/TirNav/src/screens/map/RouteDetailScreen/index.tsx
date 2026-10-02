/**
 * RouteDetailScreen Component
 * 
 * Display detailed route information with:
 * - Route summary (distance, duration, fuel estimate)
 * - Map preview
 * - Alternative routes carousel
 * - Route warnings
 * - Turn-by-turn instructions
 * - Action buttons (start navigation, save, share)
 * 
 * @example
 * ```tsx
 * navigation.navigate('RouteDetail', { routeId: 'route_123' });
 * ```
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Loading, ErrorView } from '@components/common';
import { useRouteStore } from '@store';
import { styles } from './styles';
import RouteSummaryCard from './components/RouteSummaryCard';
import MapPreview from './components/MapPreview';
import AlternativeRoutesCarousel from './components/AlternativeRoutesCarousel';
import WarningsSection from './components/WarningsSection';
import InstructionsList from './components/InstructionsList';
import type { RouteDetailScreenProps } from './types';

/**
 * RouteDetailScreen Component
 */
export default function RouteDetailScreen({
  route,
  navigation,
}: RouteDetailScreenProps) {
  const { routeId } = route.params;

  // Store
  const currentRoute = useRouteStore((state) => state.currentRoute);
  const alternativeRoutes = useRouteStore((state) => state.alternativeRoutes);
  const selectRoute = useRouteStore((state) => state.selectRoute);
  const addToHistory = useRouteStore((state) => state.addToHistory);

  // State
  const [selectedRouteId, setSelectedRouteId] = useState(routeId);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Get all available routes
   */
  const allRoutes = useMemo(() => {
    return [currentRoute, ...alternativeRoutes].filter(Boolean);
  }, [currentRoute, alternativeRoutes]);

  /**
   * Get selected route
   */
  const selectedRoute = useMemo(() => {
    return allRoutes.find((r) => r?.id === selectedRouteId) || null;
  }, [selectedRouteId, allRoutes]);

  /**
   * Handle route selection
   */
  const handleSelectRoute = (newRouteId: string) => {
    setSelectedRouteId(newRouteId);
    setShowInstructions(false); // Collapse instructions when switching routes
  };

  /**
   * Handle start navigation
   */
  const handleStartNavigation = async () => {
    if (!selectedRoute) return;

    try {
      // Select route in store
      await selectRoute(selectedRoute);

      // Add to history
      await addToHistory(selectedRoute);

      // Navigate back to map
      navigation.navigate('MapScreen');

      // TODO: Start turn-by-turn navigation
      // This will be implemented later with voice guidance
    } catch (error) {
      console.error('Start navigation error:', error);
      Alert.alert('Hata', 'Navigasyon başlatılamadı');
    }
  };

  /**
   * Handle save route
   */
  const handleSaveRoute = async () => {
    if (!selectedRoute) return;

    setIsSaving(true);

    try {
      // TODO: Implement save to favorites
      // await saveRouteToFavorites(selectedRoute);

      Alert.alert('Başarılı', 'Rota favorilere eklendi');
    } catch (error) {
      console.error('Save route error:', error);
      Alert.alert('Hata', 'Rota kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle share route
   */
  const handleShareRoute = async () => {
    if (!selectedRoute) return;

    try {
      const message = `
🚛 TırNav Rota Paylaşımı

📍 Başlangıç: ${selectedRoute.startPoint.address || 'Bilinmeyen'}
📍 Varış: ${selectedRoute.endPoint.address || 'Bilinmeyen'}

📏 Mesafe: ${(selectedRoute.distance / 1000).toFixed(1)} km
⏱️ Süre: ${Math.floor(selectedRoute.duration / 3600)} sa ${Math.floor((selectedRoute.duration % 3600) / 60)} dk

${selectedRoute.warnings.length > 0 ? `⚠️ ${selectedRoute.warnings.length} uyarı var` : '✅ Uyarı yok'}
      `.trim();

      await Share.share({
        message,
        title: 'TırNav Rota',
      });
    } catch (error) {
      console.error('Share route error:', error);
    }
  };

  /**
   * Handle map preview press
   */
  const handleMapPreviewPress = () => {
    // Navigate back to map with route visible
    navigation.navigate('MapScreen');
  };

  /**
   * Render loading state
   */
  if (!selectedRoute) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🗺️</Text>
          <Text style={styles.emptyStateText}>Rota bulunamadı</Text>
          <Button
            title="Geri Dön"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Summary */}
        <RouteSummaryCard route={selectedRoute} showFuelEstimate />

        {/* Map Preview */}
        <MapPreview route={selectedRoute} onPress={handleMapPreviewPress} />

        {/* Alternative Routes */}
        {allRoutes.length > 1 && (
          <AlternativeRoutesCarousel
            routes={allRoutes}
            selectedId={selectedRouteId}
            onSelect={handleSelectRoute}
          />
        )}

        {/* Warnings */}
        {selectedRoute.warnings.length > 0 && (
          <WarningsSection warnings={selectedRoute.warnings} />
        )}

        {/* Instructions Toggle */}
        {selectedRoute.steps.length > 0 && (
          <View style={styles.instructionsSection}>
            <TouchableOpacity
              style={styles.instructionsHeader}
              onPress={() => setShowInstructions(!showInstructions)}
              activeOpacity={0.7}
            >
              <Text style={styles.instructionsTitle}>
                Adım Adım Talimatlar ({selectedRoute.steps.length})
              </Text>
              <Text style={styles.instructionsToggle}>
                {showInstructions ? '▲ Gizle' : '▼ Göster'}
              </Text>
            </TouchableOpacity>

            {/* Instructions List */}
            {showInstructions && <InstructionsList steps={selectedRoute.steps} />}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {/* Primary Button */}
        <Button
          title="Navigasyonu Başlat"
          onPress={handleStartNavigation}
          variant="primary"
          size="large"
          fullWidth
          style={styles.primaryButton}
        />

        {/* Secondary Buttons */}
        <View style={styles.secondaryButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSaveRoute}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Text style={styles.iconButtonIcon}>🔖</Text>
            <Text style={styles.iconButtonText}>Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShareRoute}
            activeOpacity={0.7}
          >
            <Text style={styles.iconButtonIcon}>📤</Text>
            <Text style={styles.iconButtonText}>Paylaş</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
