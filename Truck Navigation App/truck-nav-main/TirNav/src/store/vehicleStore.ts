/**
 * Vehicle Store
 * 
 * Araç bilgileri ve boyutları yönetimi
 * - Araç profili yönetimi
 * - Boyut kısıtlamaları
 * - AsyncStorage ile persist
 * 
 * @example
 * ```tsx
 * import { useVehicleStore } from '@store';
 * 
 * const { vehicles, activeVehicle, setActiveVehicle } = useVehicleStore();
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Vehicle, CreateVehicleData, UpdateVehicleData } from '@types';
import { VEHICLE_CONFIG } from '@constants';

/**
 * Vehicle Store State Interface
 */
interface VehicleState {
  // State
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchVehicles: () => Promise<void>;
  addVehicle: (data: CreateVehicleData) => Promise<void>;
  updateVehicle: (data: UpdateVehicleData) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;
  setActiveVehicle: (vehicleId: string) => void;
  updateDimension: (key: keyof Vehicle['dimensions'], value: number) => void;
  updateWeight: (key: keyof Vehicle['weight'], value: number) => void;
  resetVehicle: () => void;
  clearError: () => void;
}

/**
 * Vehicle Store
 * 
 * Persist edilir: vehicles, activeVehicle
 * Persist edilmez: isLoading, error
 */
export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      // Initial State
      vehicles: [],
      activeVehicle: null,
      isLoading: false,
      error: null,

      /**
       * Fetch Vehicles - Araçları getir
       */
      fetchVehicles: async () => {
        set({ isLoading: true, error: null });

        try {
          // TODO: API call
          // const vehicles = await vehicleService.fetchVehicles();
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          const mockVehicles: Vehicle[] = [
            {
              id: '1',
              userId: 'user-1',
              name: 'Kamyonum',
              type: 'truck',
              licensePlate: '34 ABC 123',
              dimensions: {
                height: VEHICLE_CONFIG.defaults.height,
                width: VEHICLE_CONFIG.defaults.width,
                length: VEHICLE_CONFIG.defaults.length,
              },
              weight: {
                empty: 10,
                loaded: VEHICLE_CONFIG.defaults.weight,
                maxLoad: 30,
              },
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          set({
            vehicles: mockVehicles,
            activeVehicle: mockVehicles[0] || null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Araçlar yüklenemedi';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Add Vehicle - Yeni araç ekle
       */
      addVehicle: async (data: CreateVehicleData) => {
        set({ isLoading: true, error: null });

        try {
          // Validation
          if (data.dimensions.height > VEHICLE_CONFIG.limits.height.max) {
            throw new Error(`Maksimum yükseklik ${VEHICLE_CONFIG.limits.height.max}m olabilir`);
          }
          if (data.dimensions.width > VEHICLE_CONFIG.limits.width.max) {
            throw new Error(`Maksimum genişlik ${VEHICLE_CONFIG.limits.width.max}m olabilir`);
          }
          if (data.dimensions.length > VEHICLE_CONFIG.limits.length.max) {
            throw new Error(`Maksimum uzunluk ${VEHICLE_CONFIG.limits.length.max}m olabilir`);
          }
          if (data.weight.loaded > VEHICLE_CONFIG.limits.weight.max) {
            throw new Error(`Maksimum ağırlık ${VEHICLE_CONFIG.limits.weight.max} ton olabilir`);
          }

          // TODO: API call
          // const newVehicle = await vehicleService.createVehicle(data);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          const newVehicle: Vehicle = {
            id: Date.now().toString(),
            userId: 'user-1',
            ...data,
            isActive: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const { vehicles } = get();
          set({
            vehicles: [...vehicles, newVehicle],
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Araç eklenemedi';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Update Vehicle - Araç güncelle
       */
      updateVehicle: async (data: UpdateVehicleData) => {
        set({ isLoading: true, error: null });

        try {
          // Validation
          if (data.dimensions) {
            if (data.dimensions.height && data.dimensions.height > VEHICLE_CONFIG.limits.height.max) {
              throw new Error(`Maksimum yükseklik ${VEHICLE_CONFIG.limits.height.max}m olabilir`);
            }
            if (data.dimensions.width && data.dimensions.width > VEHICLE_CONFIG.limits.width.max) {
              throw new Error(`Maksimum genişlik ${VEHICLE_CONFIG.limits.width.max}m olabilir`);
            }
            if (data.dimensions.length && data.dimensions.length > VEHICLE_CONFIG.limits.length.max) {
              throw new Error(`Maksimum uzunluk ${VEHICLE_CONFIG.limits.length.max}m olabilir`);
            }
          }

          // TODO: API call
          // const updatedVehicle = await vehicleService.updateVehicle(data);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          const { vehicles, activeVehicle } = get();
          const updatedVehicles = vehicles.map(v =>
            v.id === data.id
              ? {
                  ...v,
                  ...data,
                  dimensions: data.dimensions ? { ...v.dimensions, ...data.dimensions } : v.dimensions,
                  weight: data.weight ? { ...v.weight, ...data.weight } : v.weight,
                  updatedAt: new Date(),
                }
              : v
          );

          const updatedActiveVehicle = activeVehicle?.id === data.id
            ? updatedVehicles.find(v => v.id === data.id) || null
            : activeVehicle;

          set({
            vehicles: updatedVehicles,
            activeVehicle: updatedActiveVehicle,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Araç güncellenemedi';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Delete Vehicle - Araç sil
       */
      deleteVehicle: async (vehicleId: string) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: API call
          // await vehicleService.deleteVehicle(vehicleId);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          const { vehicles, activeVehicle } = get();
          const updatedVehicles = vehicles.filter(v => v.id !== vehicleId);

          set({
            vehicles: updatedVehicles,
            activeVehicle: activeVehicle?.id === vehicleId ? null : activeVehicle,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Araç silinemedi';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Set Active Vehicle - Aktif araç seç
       */
      setActiveVehicle: (vehicleId: string) => {
        const { vehicles } = get();
        const vehicle = vehicles.find(v => v.id === vehicleId);

        if (!vehicle) {
          set({ error: 'Araç bulunamadı' });
          return;
        }

        // Tüm araçları inactive yap
        const updatedVehicles = vehicles.map(v => ({
          ...v,
          isActive: v.id === vehicleId,
        }));

        set({
          vehicles: updatedVehicles,
          activeVehicle: { ...vehicle, isActive: true },
          error: null,
        });
      },

      /**
       * Update Dimension - Boyut güncelle
       */
      updateDimension: (key: keyof Vehicle['dimensions'], value: number) => {
        const { activeVehicle } = get();
        if (!activeVehicle) {
          set({ error: 'Aktif araç bulunamadı' });
          return;
        }

        // Validation
        const limits = VEHICLE_CONFIG.limits[key];
        if (value < limits.min || value > limits.max) {
          set({ error: `${key} ${limits.min} ile ${limits.max} arasında olmalıdır` });
          return;
        }

        const updatedVehicle: Vehicle = {
          ...activeVehicle,
          dimensions: {
            ...activeVehicle.dimensions,
            [key]: value,
          },
          updatedAt: new Date(),
        };

        const { vehicles } = get();
        const updatedVehicles = vehicles.map(v =>
          v.id === activeVehicle.id ? updatedVehicle : v
        );

        set({
          vehicles: updatedVehicles,
          activeVehicle: updatedVehicle,
          error: null,
        });
      },

      /**
       * Update Weight - Ağırlık güncelle
       */
      updateWeight: (key: keyof Vehicle['weight'], value: number) => {
        const { activeVehicle } = get();
        if (!activeVehicle) {
          set({ error: 'Aktif araç bulunamadı' });
          return;
        }

        // Validation
        if (value < VEHICLE_CONFIG.limits.weight.min || value > VEHICLE_CONFIG.limits.weight.max) {
          set({
            error: `Ağırlık ${VEHICLE_CONFIG.limits.weight.min} ile ${VEHICLE_CONFIG.limits.weight.max} ton arasında olmalıdır`,
          });
          return;
        }

        const updatedVehicle: Vehicle = {
          ...activeVehicle,
          weight: {
            ...activeVehicle.weight,
            [key]: value,
          },
          updatedAt: new Date(),
        };

        const { vehicles } = get();
        const updatedVehicles = vehicles.map(v =>
          v.id === activeVehicle.id ? updatedVehicle : v
        );

        set({
          vehicles: updatedVehicles,
          activeVehicle: updatedVehicle,
          error: null,
        });
      },

      /**
       * Reset Vehicle - Araç varsayılanlara döndür
       */
      resetVehicle: () => {
        const { activeVehicle } = get();
        if (!activeVehicle) {
          set({ error: 'Aktif araç bulunamadı' });
          return;
        }

        const resetVehicle: Vehicle = {
          ...activeVehicle,
          dimensions: {
            height: VEHICLE_CONFIG.defaults.height,
            width: VEHICLE_CONFIG.defaults.width,
            length: VEHICLE_CONFIG.defaults.length,
          },
          weight: {
            ...activeVehicle.weight,
            loaded: VEHICLE_CONFIG.defaults.weight,
          },
          updatedAt: new Date(),
        };

        const { vehicles } = get();
        const updatedVehicles = vehicles.map(v =>
          v.id === activeVehicle.id ? resetVehicle : v
        );

        set({
          vehicles: updatedVehicles,
          activeVehicle: resetVehicle,
          error: null,
        });
      },

      /**
       * Clear Error - Hata mesajını temizle
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'vehicle-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Sadece gerekli state'leri persist et
      partialize: (state) => ({
        vehicles: state.vehicles,
        activeVehicle: state.activeVehicle,
      }),
    }
  )
);

/**
 * Vehicle Store Selectors
 */
export const selectVehicles = (state: VehicleState) => state.vehicles;
export const selectActiveVehicle = (state: VehicleState) => state.activeVehicle;
export const selectIsLoading = (state: VehicleState) => state.isLoading;
export const selectError = (state: VehicleState) => state.error;
