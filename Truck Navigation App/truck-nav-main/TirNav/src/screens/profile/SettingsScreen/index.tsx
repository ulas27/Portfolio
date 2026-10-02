/**
 * SettingsScreen Component
 * 
 * App settings and preferences
 * - Notifications toggle
 * - Voice alerts toggle
 * - Map style selection
 * - Distance unit selection
 * - Cache management
 * - App version
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="Settings" component={SettingsScreen} />
 * ```
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { APP_CONFIG, STORAGE_KEYS } from '@constants';
import { styles } from './styles';
import Section from './components/Section';
import SettingToggle from './components/SettingToggle';
import SettingPicker from './components/SettingPicker';
import SettingButton from './components/SettingButton';
import type { SettingsScreenProps, AppSettings } from './types';

const SETTINGS_STORAGE_KEY = STORAGE_KEYS.settings.preferences || '@tirnav:settings';

const DEFAULT_SETTINGS: AppSettings = {
  notifications: true,
  voiceAlerts: true,
  mapStyle: 'standard',
  distanceUnit: 'km',
  theme: 'light',
};

/**
 * SettingsScreen Component
 */
export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load settings on mount
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Save settings when changed
   */
  useEffect(() => {
    if (!isLoading) {
      saveSettings();
    }
  }, [settings]);

  /**
   * Load settings from AsyncStorage
   */
  const loadSettings = async () => {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (data) {
        const savedSettings = JSON.parse(data);
        setSettings({ ...DEFAULT_SETTINGS, ...savedSettings });
      }
    } catch (error) {
      console.error('Load settings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save settings to AsyncStorage
   */
  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Save settings error:', error);
    }
  };

  /**
   * Update setting
   */
  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Handle clear cache
   */
  const handleClearCache = () => {
    Alert.alert(
      'Cache Temizle',
      'Önbelleği temizlemek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: performClearCache,
        },
      ]
    );
  };

  /**
   * Perform cache clear
   */
  const performClearCache = async () => {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();

      // Filter out important keys (auth, settings)
      const keysToRemove = keys.filter(
        (key) =>
          !key.includes('auth') &&
          !key.includes('settings') &&
          !key.includes('onboarding')
      );

      // Remove cache keys
      await AsyncStorage.multiRemove(keysToRemove);

      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'Önbellek temizlendi',
      });
    } catch (error) {
      console.error('Clear cache error:', error);
      Alert.alert('Hata', 'Önbellek temizlenemedi');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Notifications Section */}
        <Section title="Bildirimler">
          <SettingToggle
            label="Push Bildirimleri"
            description="Yeni uyarılar ve güncellemeler için bildirim al"
            value={settings.notifications}
            onValueChange={(value) => updateSetting('notifications', value)}
          />
          <SettingToggle
            label="Sesli Uyarılar"
            description="Navigasyon sırasında sesli yönlendirme"
            value={settings.voiceAlerts}
            onValueChange={(value) => updateSetting('voiceAlerts', value)}
          />
        </Section>

        {/* Map Section */}
        <Section title="Harita">
          <SettingPicker
            label="Harita Stili"
            description="Harita görünümü"
            value={settings.mapStyle}
            options={[
              { label: 'Standart', value: 'standard' },
              { label: 'Uydu', value: 'satellite' },
              { label: 'Hibrit', value: 'hybrid' },
            ]}
            onValueChange={(value) =>
              updateSetting('mapStyle', value as AppSettings['mapStyle'])
            }
          />
        </Section>

        {/* Units Section */}
        <Section title="Birimler">
          <SettingPicker
            label="Mesafe Birimi"
            description="Mesafe gösterim birimi"
            value={settings.distanceUnit}
            options={[
              { label: 'Kilometre (km)', value: 'km' },
              { label: 'Mil (mi)', value: 'mi' },
            ]}
            onValueChange={(value) =>
              updateSetting('distanceUnit', value as AppSettings['distanceUnit'])
            }
          />
        </Section>

        {/* Theme Section (V2) */}
        {/* <Section title="Görünüm">
          <SettingPicker
            label="Tema"
            description="Uygulama teması"
            value={settings.theme}
            options={[
              { label: 'Açık', value: 'light' },
              { label: 'Koyu', value: 'dark' },
              { label: 'Otomatik', value: 'auto' },
            ]}
            onValueChange={(value) =>
              updateSetting('theme', value as AppSettings['theme'])
            }
          />
        </Section> */}

        {/* Other Section */}
        <Section title="Diğer">
          <SettingButton
            label="Önbelleği Temizle"
            description="Geçici dosyaları ve cache'i temizle"
            onPress={handleClearCache}
          />
        </Section>

        {/* Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>
            Sürüm {APP_CONFIG.info.version} (Build {APP_CONFIG.info.build})
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
