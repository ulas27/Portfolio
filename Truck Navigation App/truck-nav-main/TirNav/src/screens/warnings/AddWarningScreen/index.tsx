/**
 * AddWarningScreen Component
 * 
 * Screen for adding new route warnings
 * - Warning type selection (grid)
 * - Location display
 * - Description input
 * - Photo upload (optional)
 * - Submit to Firebase
 * 
 * @example
 * ```tsx
 * navigation.navigate('AddWarning', { location: currentLocation });
 * ```
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActionSheetIOS,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import Toast from 'react-native-toast-message';
import { Button } from '@components/common';
import { useAuthStore, useWarningStore } from '@store';
import { graphHopperService } from '@services/routing';
import { storageService } from '@services/firebase';
import { styles } from './styles';
import WarningTypeButton from './components/WarningTypeButton';
import LocationDisplay from './components/LocationDisplay';
import type { AddWarningScreenProps, WarningTypeOption } from './types';
import type { WarningType } from '@types';

/**
 * Warning type options
 */
const WARNING_TYPES: WarningTypeOption[] = [
  {
    value: 'narrow_road',
    label: 'Dar Yol',
    icon: '↔️',
    description: 'Dar geçit veya yol',
  },
  {
    value: 'low_bridge',
    label: 'Alçak Köprü',
    icon: '🌉',
    description: 'Yükseklik sınırı',
  },
  {
    value: 'traffic',
    label: 'Trafik',
    icon: '🚦',
    description: 'Yoğun trafik',
  },
  {
    value: 'police',
    label: 'Polis',
    icon: '👮',
    description: 'Polis kontrolü',
  },
  {
    value: 'accident',
    label: 'Kaza',
    icon: '🚨',
    description: 'Trafik kazası',
  },
  {
    value: 'road_closed',
    label: 'Yol Kapalı',
    icon: '🚧',
    description: 'Kapalı yol',
  },
  {
    value: 'other',
    label: 'Diğer',
    icon: '⚠️',
    description: 'Diğer uyarılar',
  },
];

const MAX_DESCRIPTION_LENGTH = 500;
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB

/**
 * AddWarningScreen Component
 */
export default function AddWarningScreen({
  route,
  navigation,
}: AddWarningScreenProps) {
  const { location } = route.params;

  // Store
  const user = useAuthStore((state) => state.user);
  const addWarning = useWarningStore((state) => state.addWarning);

  // State
  const [selectedType, setSelectedType] = useState<WarningType | null>(null);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Load address on mount
   */
  useEffect(() => {
    loadAddress();
  }, [location]);

  /**
   * Load address from coordinates
   */
  const loadAddress = async () => {
    try {
      const addr = await graphHopperService.reverseGeocode(location);
      setAddress(addr);
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setAddress('Adres alınamadı');
    }
  };

  /**
   * Request camera permission (Android)
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      return true; // iOS handles permissions automatically
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Kamera İzni',
          message: 'TırNav fotoğraf çekmek için kamera iznine ihtiyaç duyuyor.',
          buttonNeutral: 'Sonra Sor',
          buttonNegative: 'İptal',
          buttonPositive: 'İzin Ver',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Camera permission error:', err);
      return false;
    }
  };

  /**
   * Show image picker options
   */
  const showImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['İptal', 'Fotoğraf Çek', 'Galeriden Seç'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleTakePhoto();
          } else if (buttonIndex === 2) {
            handleSelectFromGallery();
          }
        }
      );
    } else {
      Alert.alert('Fotoğraf Ekle', 'Fotoğraf nereden eklensin?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Fotoğraf Çek', onPress: handleTakePhoto },
        { text: 'Galeriden Seç', onPress: handleSelectFromGallery },
      ]);
    }
  };

  /**
   * Handle take photo
   */
  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('İzin Gerekli', 'Kamera iznine ihtiyaç var');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      },
      handleImageResponse
    );
  };

  /**
   * Handle select from gallery
   */
  const handleSelectFromGallery = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1920,
      },
      handleImageResponse
    );
  };

  /**
   * Handle image picker response
   */
  const handleImageResponse = async (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Hata', response.errorMessage || 'Fotoğraf seçilemedi');
      return;
    }

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      return;
    }

    try {
      // Compress image if needed
      let finalUri = asset.uri;
      const fileSize = asset.fileSize || 0;

      if (fileSize > MAX_IMAGE_SIZE) {
        const resized = await ImageResizer.createResizedImage(
          asset.uri,
          1920,
          1920,
          'JPEG',
          80,
          0
        );
        finalUri = resized.uri;
      }

      setImageUri(finalUri);
    } catch (error) {
      console.error('Image resize error:', error);
      Alert.alert('Hata', 'Fotoğraf işlenemedi');
    }
  };

  /**
   * Upload image to Firebase Storage
   */
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const fileName = `warning_${Date.now()}.jpg`;
      const uploadResult = await storageService.uploadWarningImage(
        uri,
        fileName,
        (progress) => {
          // Optional: Show upload progress
          console.log('Upload progress:', progress);
        }
      );
      return uploadResult.downloadUrl;
    } catch (error) {
      console.error('Upload image error:', error);
      throw new Error('Fotoğraf yüklenemedi');
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    if (!selectedType) {
      Alert.alert('Eksik Bilgi', 'Lütfen uyarı tipi seçin');
      return false;
    }

    if (!description.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen açıklama girin');
      return false;
    }

    if (description.trim().length < 10) {
      Alert.alert('Eksik Bilgi', 'Açıklama en az 10 karakter olmalıdır');
      return false;
    }

    return true;
  };

  /**
   * Handle submit
   */
  const handleSubmit = async () => {
    if (!validateForm() || !user) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload image if exists
      let imageUrl: string | undefined;
      if (imageUri) {
        imageUrl = await uploadImage(imageUri);
      }

      // Create warning
      await addWarning(
        {
          type: selectedType!,
          location,
          description: description.trim(),
          imageUrl,
        },
        user.id
      );

      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'Uyarı eklendi',
      });

      // Navigate back
      navigation.goBack();
    } catch (error: any) {
      console.error('Submit warning error:', error);
      Alert.alert('Hata', error.message || 'Uyarı eklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Check if form is valid
   */
  const isFormValid = selectedType && description.trim().length >= 10;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Eklediğiniz uyarılar diğer sürücüler tarafından görülecektir. Lütfen doğru
            ve güncel bilgi paylaşın.
          </Text>
        </View>

        {/* Warning Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Uyarı Tipi <Text style={styles.sectionRequired}>*</Text>
          </Text>
          <View style={styles.typeGrid}>
            {WARNING_TYPES.map((type) => (
              <WarningTypeButton
                key={type.value}
                type={type}
                isSelected={selectedType === type.value}
                onPress={() => setSelectedType(type.value)}
              />
            ))}
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Konum</Text>
          <LocationDisplay location={location} address={address} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Açıklama <Text style={styles.sectionRequired}>*</Text>
          </Text>
          <TextInput
            style={[
              styles.descriptionInput,
              isFocused && styles.descriptionInputFocused,
            ]}
            placeholder="Detaylı açıklama yazın... (min 10 karakter)"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            maxLength={MAX_DESCRIPTION_LENGTH}
            multiline
            numberOfLines={5}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <Text
            style={[
              styles.charCounter,
              description.length >= MAX_DESCRIPTION_LENGTH &&
                styles.charCounterLimit,
            ]}
          >
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </Text>
        </View>

        {/* Photo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Fotoğraf (Opsiyonel)</Text>

          {imageUri ? (
            <View style={styles.imageContainer}>
              <View style={styles.imagePreview}>
                <Image source={{ uri: imageUri }} style={styles.image} />
              </View>
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeImageIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={showImagePicker}
              activeOpacity={0.7}
            >
              <Text style={styles.addImageIcon}>📷</Text>
              <Text style={styles.addImageText}>Fotoğraf Ekle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <Button
          title="Gönder"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          fullWidth
          disabled={!isFormValid}
          isLoading={isSubmitting}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
