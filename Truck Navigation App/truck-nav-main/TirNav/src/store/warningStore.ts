/**
 * Warning Store
 * 
 * Topluluk uyarıları yönetimi
 * - Uyarı listesi
 * - Uyarı ekleme/doğrulama/raporlama
 * - Yakındaki uyarılar
 * - Filtreleme
 * 
 * @example
 * ```tsx
 * import { useWarningStore } from '@store';
 * 
 * const { warnings, addWarning, verifyWarning } = useWarningStore();
 * ```
 */

import { create } from 'zustand';
import type {
  Warning,
  CreateWarningData,
  UpdateWarningData,
  WarningVerification,
  WarningReport,
  WarningFilter,
  LatLng,
} from '@types';
import { WARNING_CONFIG } from '@constants';

/**
 * Warning Store State Interface
 */
interface WarningState {
  // State
  warnings: Warning[];
  userWarnings: Warning[];
  nearbyWarnings: Warning[];
  selectedWarning: Warning | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWarnings: (filter?: WarningFilter) => Promise<void>;
  fetchNearbyWarnings: (location: LatLng, radius?: number) => Promise<void>;
  addWarning: (data: CreateWarningData) => Promise<void>;
  updateWarning: (data: UpdateWarningData) => Promise<void>;
  deleteWarning: (warningId: string) => Promise<void>;
  verifyWarning: (warningId: string, isValid: boolean, comment?: string) => Promise<void>;
  reportWarning: (warningId: string, reason: string, comment?: string) => Promise<void>;
  selectWarning: (warningId: string) => void;
  clearSelectedWarning: () => void;
  clearError: () => void;
}

/**
 * Warning Store
 * 
 * Persist edilmez - her zaman API'den fresh data
 */
export const useWarningStore = create<WarningState>((set, get) => ({
  // Initial State
  warnings: [],
  userWarnings: [],
  nearbyWarnings: [],
  selectedWarning: null,
  isLoading: false,
  error: null,

  /**
   * Fetch Warnings - Uyarıları getir
   */
  fetchWarnings: async (filter?: WarningFilter) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: API call
      // const warnings = await warningService.fetchWarnings(filter);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockWarnings: Warning[] = [
        {
          id: '1',
          userId: 'user-1',
          type: 'low_bridge',
          severity: 'high',
          location: {
            latitude: 39.9334,
            longitude: 32.8597,
          },
          address: 'Ankara, Çankaya',
          title: 'Alçak Köprü - 3.8m',
          description: 'Dikkat! Köprü yüksekliği 3.8 metre. TIR geçişi tehlikeli.',
          images: [],
          isVerified: true,
          verificationCount: 5,
          reportCount: 0,
          createdAt: new Date(Date.now() - 86400000), // 1 gün önce
          updatedAt: new Date(Date.now() - 86400000),
        },
        {
          id: '2',
          userId: 'user-2',
          type: 'traffic',
          severity: 'medium',
          location: {
            latitude: 39.9434,
            longitude: 32.8697,
          },
          address: 'Ankara, Yenimahalle',
          title: 'Yoğun Trafik',
          description: 'Kavşakta yoğun trafik var. 15-20 dakika gecikme bekleniyor.',
          images: [],
          isVerified: false,
          verificationCount: 2,
          reportCount: 0,
          expiresAt: new Date(Date.now() + 3600000), // 1 saat sonra
          createdAt: new Date(Date.now() - 1800000), // 30 dakika önce
          updatedAt: new Date(Date.now() - 1800000),
        },
        {
          id: '3',
          userId: 'user-1',
          type: 'road_closure',
          severity: 'critical',
          location: {
            latitude: 39.9234,
            longitude: 32.8497,
          },
          address: 'Ankara, Keçiören',
          title: 'Yol Kapalı',
          description: 'Kaza nedeniyle yol trafiğe kapatıldı. Alternatif güzergah kullanın.',
          images: [],
          isVerified: true,
          verificationCount: 8,
          reportCount: 0,
          expiresAt: new Date(Date.now() + 7200000), // 2 saat sonra
          createdAt: new Date(Date.now() - 600000), // 10 dakika önce
          updatedAt: new Date(Date.now() - 600000),
        },
      ];

      // Apply filters
      let filteredWarnings = mockWarnings;

      if (filter?.types && filter.types.length > 0) {
        filteredWarnings = filteredWarnings.filter(w => filter.types!.includes(w.type));
      }

      if (filter?.severities && filter.severities.length > 0) {
        filteredWarnings = filteredWarnings.filter(w => filter.severities!.includes(w.severity));
      }

      if (filter?.onlyVerified) {
        filteredWarnings = filteredWarnings.filter(w => w.isVerified);
      }

      set({
        warnings: filteredWarnings,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uyarılar yüklenemedi';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Fetch Nearby Warnings - Yakındaki uyarıları getir
   */
  fetchNearbyWarnings: async (location: LatLng, radius = WARNING_CONFIG.settings.proximityRadius) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: API call with geospatial query
      // const nearbyWarnings = await warningService.fetchNearby(location, radius);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const { warnings } = get();

      // Basit mesafe hesaplama (haversine formula kullanılmalı)
      const nearbyWarnings = warnings.filter(w => {
        const latDiff = Math.abs(w.location.latitude - location.latitude);
        const lngDiff = Math.abs(w.location.longitude - location.longitude);
        const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // Yaklaşık metre
        return distance <= radius;
      });

      set({
        nearbyWarnings,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Yakındaki uyarılar yüklenemedi';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Add Warning - Yeni uyarı ekle
   */
  addWarning: async (data: CreateWarningData) => {
    set({ isLoading: true, error: null });

    try {
      // Validation
      if (!data.title || data.title.trim().length === 0) {
        throw new Error('Uyarı başlığı gerekli');
      }
      if (!data.description || data.description.trim().length === 0) {
        throw new Error('Uyarı açıklaması gerekli');
      }

      // TODO: API call
      // const newWarning = await warningService.createWarning(data);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newWarning: Warning = {
        id: Date.now().toString(),
        userId: 'user-1',
        ...data,
        isVerified: false,
        verificationCount: 0,
        reportCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { warnings, userWarnings } = get();
      set({
        warnings: [newWarning, ...warnings],
        userWarnings: [newWarning, ...userWarnings],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uyarı eklenemedi';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Update Warning - Uyarı güncelle
   */
  updateWarning: async (data: UpdateWarningData) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: API call
      // const updatedWarning = await warningService.updateWarning(data);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const { warnings, userWarnings } = get();
      const updatedWarnings = warnings.map(w =>
        w.id === data.id
          ? {
              ...w,
              ...data,
              updatedAt: new Date(),
            }
          : w
      );

      const updatedUserWarnings = userWarnings.map(w =>
        w.id === data.id
          ? {
              ...w,
              ...data,
              updatedAt: new Date(),
            }
          : w
      );

      set({
        warnings: updatedWarnings,
        userWarnings: updatedUserWarnings,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uyarı güncellenemedi';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Delete Warning - Uyarı sil
   */
  deleteWarning: async (warningId: string) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: API call
      // await warningService.deleteWarning(warningId);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const { warnings, userWarnings } = get();
      set({
        warnings: warnings.filter(w => w.id !== warningId),
        userWarnings: userWarnings.filter(w => w.id !== warningId),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uyarı silinemedi';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Verify Warning - Uyarıyı doğrula
   */
  verifyWarning: async (warningId: string, isValid: boolean, comment?: string) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: API call
      // await warningService.verifyWarning(warningId, isValid, comment);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const { warnings } = get();
      const updatedWarnings = warnings.map(w =>
        w.id === warningId
          ? {
              ...w,
              verificationCount: w.verificationCount + (isValid ? 1 : 0),
              isVerified: w.verificationCount + 1 >= WARNING_CONFIG.settings.minVerifications,
              updatedAt: new Date(),
            }
          : w
      );

      set({
        warnings: updatedWarnings,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uyarı doğrulanamadı';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Report Warning - Uyarıyı raporla
   */
  reportWarning: async (warningId: string, reason: string, comment?: string) => {
    set({ isLoading: true, error: null });

    try {
      // TODO: API call
      // await warningService.reportWarning(warningId, reason, comment);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));

      const { warnings } = get();
      const updatedWarnings = warnings.map(w =>
        w.id === warningId
          ? {
              ...w,
              reportCount: w.reportCount + 1,
              updatedAt: new Date(),
            }
          : w
      );

      // Eğer rapor sayısı limite ulaştıysa, uyarıyı kaldır
      const filteredWarnings = updatedWarnings.filter(
        w => w.id !== warningId || w.reportCount < WARNING_CONFIG.settings.maxReports
      );

      set({
        warnings: filteredWarnings,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Uyarı raporlanamadı';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  /**
   * Select Warning - Uyarı seç (detay için)
   */
  selectWarning: (warningId: string) => {
    const { warnings } = get();
    const warning = warnings.find(w => w.id === warningId);

    if (!warning) {
      set({ error: 'Uyarı bulunamadı' });
      return;
    }

    set({ selectedWarning: warning, error: null });
  },

  /**
   * Clear Selected Warning - Seçili uyarıyı temizle
   */
  clearSelectedWarning: () => {
    set({ selectedWarning: null });
  },

  /**
   * Clear Error - Hata mesajını temizle
   */
  clearError: () => {
    set({ error: null });
  },
}));

/**
 * Warning Store Selectors
 */
export const selectWarnings = (state: WarningState) => state.warnings;
export const selectUserWarnings = (state: WarningState) => state.userWarnings;
export const selectNearbyWarnings = (state: WarningState) => state.nearbyWarnings;
export const selectSelectedWarning = (state: WarningState) => state.selectedWarning;
export const selectIsLoading = (state: WarningState) => state.isLoading;
export const selectError = (state: WarningState) => state.error;
