/**
 * VehicleInfoScreen Component
 * 
 * Screen for managing vehicle dimensions and properties
 * - Height, width, length, weight sliders
 * - Dangerous goods toggle
 * - Axle count picker
 * - Save to store and AsyncStorage
 * - Validation
 * - Haptic feedback
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
 * ```
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button } from '@components/common';
import { useVehicleStore } from '@store';
import { DEFAULT_TRUCK_DIMENSIONS, VEHICLE_CONFIG } from '@constants';
import { styles } from './styles';
import SliderInput from './components/SliderInput';
import type { VehicleInfoScreenProps, VehicleFormData, ValidationResult } from './types';

/**
 * VehicleInfoScreen Component
 */
export default function VehicleInfoScreen({ navigation }: VehicleInfoScreenProps) {
  const activeVehicle = useVehicleStore((state) => state.activeVehicle);
  const updateVehicle = useVehicleStore((state) => state.updateVehicle);
  const updateDimension = useVehicleStore((state) => state.updateDimension);

  // Form state
  const [formData, setFormData] = useState<VehicleFormData>({
    height: activeVehicle?.dimensions.height || DEFAULT_TRUCK_DIMENSIONS.height,
    width: activeVehicle?.dimensions.width || DEFAULT_TRUCK_DIMENSIONS.width,
    length: activeVehicle?.dimensions.length || DEFAULT_TRUCK_DIMENSIONS.length,
    weight: activeVehicle?.dimensions.weight || DEFAULT_TRUCK_DIMENSIONS.weight,
    hasDangerousGoods: activeVehicle?.dimensions.hasDangerousGoods || false,
    axleCount: activeVehicle?.dimensions.axleCount,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Check if form has changes
   */
  useEffect(() => {
    const initialData = {
      height: activeVehicle?.dimensions.height || DEFAULT_TRUCK_DIMENSIONS.height,
      width: activeVehicle?.dimensions.width || DEFAULT_TRUCK_DIMENSIONS.width,
      length: activeVehicle?.dimensions.length || DEFAULT_TRUCK_DIMENSIONS.length,
      weight: activeVehicle?.dimensions.weight || DEFAULT_TRUCK_DIMENSIONS.weight,
      hasDangerousGoods: activeVehicle?.dimensions.hasDangerousGoods || false,
      axleCount: activeVehicle?.dimensions.axleCount,
    };

    const changed =
      formData.height !== initialData.height ||
      formData.width !== initialData.width ||
      formData.length !== initialData.length ||
      formData.weight !== initialData.weight ||
      formData.hasDangerousGoods !== initialData.hasDangerousGoods ||
      formData.axleCount !== initialData.axleCount;

    setHasChanges(changed);
  }, [formData, activeVehicle]);

  /**
   * Update form field
   */
  const updateField = useCallback((field: keyof VehicleFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Validate form data
   */
  const validateForm = (): ValidationResult => {
    const errors: string[] = [];

    // Check minimum/maximum values
    if (formData.height < VEHICLE_CONFIG.limits.minHeight) {
      errors.push(`Yükseklik en az ${VEHICLE_CONFIG.limits.minHeight}m olmalıdır`);
    }
    if (formData.height > VEHICLE_CONFIG.limits.maxHeight) {
      errors.push(`Yükseklik en fazla ${VEHICLE_CONFIG.limits.maxHeight}m olabilir`);
    }

    if (formData.width < VEHICLE_CONFIG.limits.minWidth) {
      errors.push(`Genişlik en az ${VEHICLE_CONFIG.limits.minWidth}m olmalıdır`);
    }
    if (formData.width > VEHICLE_CONFIG.limits.maxWidth) {
      errors.push(`Genişlik en fazla ${VEHICLE_CONFIG.limits.maxWidth}m olabilir`);
    }

    if (formData.length < VEHICLE_CONFIG.limits.minLength) {
      errors.push(`Uzunluk en az ${VEHICLE_CONFIG.limits.minLength}m olmalıdır`);
    }
    if (formData.length > VEHICLE_CONFIG.limits.maxLength) {
      errors.push(`Uzunluk en fazla ${VEHICLE_CONFIG.limits.maxLength}m olabilir`);
    }

    if (formData.weight < VEHICLE_CONFIG.limits.minWeight) {
      errors.push(`Ağırlık en az ${VEHICLE_CONFIG.limits.minWeight} ton olmalıdır`);
    }
    if (formData.weight > VEHICLE_CONFIG.limits.maxWeight) {
      errors.push(`Ağırlık en fazla ${VEHICLE_CONFIG.limits.maxWeight} ton olabilir`);
    }

    // Logical validation
    if (formData.width > formData.length) {
      errors.push('Genişlik uzunluktan büyük olamaz');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    // Validate
    const validation = validateForm();
    if (!validation.isValid) {
      Alert.alert('Geçersiz Değerler', validation.errors.join('\n'));
      return;
    }

    setIsSaving(true);

    try {
      // Update vehicle in store
      if (activeVehicle) {
        await updateVehicle(activeVehicle.id, {
          dimensions: {
            height: formData.height,
            width: formData.width,
            length: formData.length,
            weight: formData.weight,
            hasDangerousGoods: formData.hasDangerousGoods,
            axleCount: formData.axleCount,
          },
        });
      } else {
        // Update dimensions directly if no active vehicle
        await updateDimension('height', formData.height);
        await updateDimension('width', formData.width);
        await updateDimension('length', formData.length);
        await updateDimension('weight', formData.weight);
      }

      // Show success message
      Alert.alert(
        'Başarılı',
        'Araç bilgileri kaydedildi',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Save vehicle info error:', error);
      Alert.alert('Hata', 'Araç bilgileri kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle reset to defaults
   */
  const handleReset = () => {
    Alert.alert(
      'Varsayılanlara Dön',
      'Tüm değerler varsayılan değerlere sıfırlanacak. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            setFormData({
              height: DEFAULT_TRUCK_DIMENSIONS.height,
              width: DEFAULT_TRUCK_DIMENSIONS.width,
              length: DEFAULT_TRUCK_DIMENSIONS.length,
              weight: DEFAULT_TRUCK_DIMENSIONS.weight,
              hasDangerousGoods: DEFAULT_TRUCK_DIMENSIONS.hasDangerousGoods,
              axleCount: DEFAULT_TRUCK_DIMENSIONS.axleCount,
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Araç Bilgileri</Text>
          <Text style={styles.subtitle}>
            Aracınızın boyutlarını girerek size özel rotalar oluşturun
          </Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Girdiğiniz değerler rota hesaplamalarında kullanılacaktır. Doğru değerler
            girmeniz güvenli seyahat için önemlidir.
          </Text>
        </View>

        {/* Dimensions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Boyutlar</Text>

          <View style={styles.card}>
            <SliderInput
              label="Yükseklik"
              value={formData.height}
              onChange={(value) => updateField('height', value)}
              min={VEHICLE_CONFIG.limits.minHeight}
              max={VEHICLE_CONFIG.limits.maxHeight}
              step={0.1}
              unit="m"
            />

            <SliderInput
              label="Genişlik"
              value={formData.width}
              onChange={(value) => updateField('width', value)}
              min={VEHICLE_CONFIG.limits.minWidth}
              max={VEHICLE_CONFIG.limits.maxWidth}
              step={0.1}
              unit="m"
            />

            <SliderInput
              label="Uzunluk"
              value={formData.length}
              onChange={(value) => updateField('length', value)}
              min={VEHICLE_CONFIG.limits.minLength}
              max={VEHICLE_CONFIG.limits.maxLength}
              step={0.5}
              unit="m"
            />

            <SliderInput
              label="Ağırlık"
              value={formData.weight}
              onChange={(value) => updateField('weight', value)}
              min={VEHICLE_CONFIG.limits.minWeight}
              max={VEHICLE_CONFIG.limits.maxWeight}
              step={1}
              unit="ton"
            />
          </View>
        </View>

        {/* Properties Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özellikler</Text>

          <View style={styles.card}>
            {/* Dangerous Goods Toggle */}
            <View style={styles.toggleContainer}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleLabel}>Tehlikeli Madde</Text>
                <Text style={styles.toggleDescription}>
                  Tehlikeli madde taşıyorsanız işaretleyin
                </Text>
              </View>
              <Switch
                value={formData.hasDangerousGoods}
                onValueChange={(value) => updateField('hasDangerousGoods', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={formData.hasDangerousGoods ? '#1E88E5' : '#f4f3f4'}
              />
            </View>

            {/* Axle Count Picker */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Dingil Sayısı (Opsiyonel)</Text>
              <Picker
                selectedValue={formData.axleCount}
                onValueChange={(value) => updateField('axleCount', value)}
                style={styles.picker}
              >
                <Picker.Item label="Seçiniz" value={undefined} />
                <Picker.Item label="2 Dingil" value={2} />
                <Picker.Item label="3 Dingil" value={3} />
                <Picker.Item label="4 Dingil" value={4} />
                <Picker.Item label="5 Dingil" value={5} />
                <Picker.Item label="6+ Dingil" value={6} />
              </Picker>
            </View>
          </View>
        </View>

        {/* Warning for dangerous goods */}
        {formData.hasDangerousGoods && (
          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              Tehlikeli madde taşıyan araçlar için özel güzergahlar hesaplanacaktır.
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title="Kaydet"
            onPress={handleSave}
            variant="primary"
            size="large"
            fullWidth
            disabled={!hasChanges}
            isLoading={isSaving}
            style={styles.saveButton}
          />

          <Button
            title="Varsayılanlara Dön"
            onPress={handleReset}
            variant="outline"
            size="large"
            fullWidth
            disabled={isSaving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
