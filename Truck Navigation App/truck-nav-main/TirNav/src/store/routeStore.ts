/**
 * Route Store
 * 
 * Rota hesaplama ve yönetimi
 * - Rota hesaplama (GraphHopper API)
 * - Alternatif rotalar
 * - Rota geçmişi
 * - Aktif navigasyon
 * 
 * @example
 * ```tsx
 * import { useRouteStore } from '@store';
 * 
 * const { currentRoute, calculateRoute } = useRouteStore();
 * await calculateRoute(origin, destination, vehicleProfile);
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Route, RouteCalculationParams, RouteProgress, LatLng } from '@types';
import { ROUTE_CONFIG } from '@constants';

/**
 * Route Store State Interface
 */
interface RouteState {
  // State
  currentRoute: Route | null;
  alternativeRoutes: Route[];
  routeHistory: Route[];
  routeProgress: RouteProgress | null;
  isCalculating: boolean;
  isNavigating: boolean;
  error: string | null;

  // Actions
  calculateRoute: (params: RouteCalculationParams) => Promise<void>;
  selectRoute: (routeId: string) => void;
  startNavigation: () => void;
  stopNavigation: () => void;
  updateProgress: (location: LatLng) => void;
  clearRoute: () => void;
  addToHistory: (route: Route) => void;
  removeFromHistory: (routeId: string) => void;
  clearHistory: () => void;
  clearError: () => void;
}

/**
 * Route Store
 * 
 * Persist edilir: routeHistory
 * Persist edilmez: currentRoute, alternativeRoutes, isCalculating, error
 */
export const useRouteStore = create<RouteState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentRoute: null,
      alternativeRoutes: [],
      routeHistory: [],
      routeProgress: null,
      isCalculating: false,
      isNavigating: false,
      error: null,

      /**
       * Calculate Route - Rota hesapla
       */
      calculateRoute: async (params: RouteCalculationParams) => {
        set({ isCalculating: true, error: null });

        try {
          // Validation
          if (!params.origin || !params.destination) {
            throw new Error('Başlangıç ve varış noktası gerekli');
          }

          // TODO: GraphHopper API call
          // const routes = await routeService.calculateRoute(params);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 1500));

          const mockRoute: Route = {
            id: Date.now().toString(),
            userId: 'user-1',
            vehicleId: 'vehicle-1',
            origin: {
              coordinates: params.origin,
              address: 'Başlangıç Noktası',
              name: 'Başlangıç',
            },
            destination: {
              coordinates: params.destination,
              address: 'Varış Noktası',
              name: 'Varış',
            },
            waypoints: params.waypoints?.map((coord, index) => ({
              coordinates: coord,
              address: `Ara Nokta ${index + 1}`,
            })) || [],
            geometry: {
              coordinates: [
                params.origin,
                ...(params.waypoints || []),
                params.destination,
              ],
            },
            summary: {
              distance: 125000, // 125 km
              duration: 7200, // 2 saat
              estimatedFuelCost: 450, // TL
              tollCost: 50, // TL
              warnings: [],
            },
            alternatives: [],
            isActive: true,
            status: 'planned',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Mock alternative routes
          const mockAlternatives: Route[] = params.alternatives
            ? Array.from({ length: Math.min(params.alternatives, ROUTE_CONFIG.maxAlternatives) }, (_, i) => ({
                ...mockRoute,
                id: `${mockRoute.id}-alt-${i + 1}`,
                summary: {
                  ...mockRoute.summary,
                  distance: mockRoute.summary.distance + (i + 1) * 10000,
                  duration: mockRoute.summary.duration + (i + 1) * 600,
                  estimatedFuelCost: mockRoute.summary.estimatedFuelCost + (i + 1) * 30,
                },
                isActive: false,
              }))
            : [];

          set({
            currentRoute: mockRoute,
            alternativeRoutes: mockAlternatives,
            isCalculating: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Rota hesaplanamadı';
          set({
            currentRoute: null,
            alternativeRoutes: [],
            isCalculating: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Select Route - Rota seç (alternatiflerden)
       */
      selectRoute: (routeId: string) => {
        const { currentRoute, alternativeRoutes } = get();

        // Seçilen rota zaten aktif mi?
        if (currentRoute?.id === routeId) {
          return;
        }

        // Alternatifler arasında ara
        const selectedRoute = alternativeRoutes.find(r => r.id === routeId);
        if (!selectedRoute) {
          set({ error: 'Rota bulunamadı' });
          return;
        }

        // Mevcut rotayı alternatiflere ekle
        const newAlternatives = currentRoute
          ? [{ ...currentRoute, isActive: false }, ...alternativeRoutes.filter(r => r.id !== routeId)]
          : alternativeRoutes.filter(r => r.id !== routeId);

        set({
          currentRoute: { ...selectedRoute, isActive: true },
          alternativeRoutes: newAlternatives,
          error: null,
        });
      },

      /**
       * Start Navigation - Navigasyonu başlat
       */
      startNavigation: () => {
        const { currentRoute } = get();
        if (!currentRoute) {
          set({ error: 'Aktif rota bulunamadı' });
          return;
        }

        const updatedRoute: Route = {
          ...currentRoute,
          status: 'active',
        };

        const initialProgress: RouteProgress = {
          routeId: currentRoute.id,
          currentLocation: currentRoute.origin.coordinates,
          distanceTraveled: 0,
          distanceRemaining: currentRoute.summary.distance,
          timeElapsed: 0,
          timeRemaining: currentRoute.summary.duration,
          averageSpeed: 0,
          currentSpeed: 0,
          nextWaypoint: currentRoute.waypoints[0],
        };

        set({
          currentRoute: updatedRoute,
          routeProgress: initialProgress,
          isNavigating: true,
          error: null,
        });
      },

      /**
       * Stop Navigation - Navigasyonu durdur
       */
      stopNavigation: () => {
        const { currentRoute } = get();
        if (!currentRoute) {
          return;
        }

        const updatedRoute: Route = {
          ...currentRoute,
          status: 'paused',
        };

        set({
          currentRoute: updatedRoute,
          isNavigating: false,
        });
      },

      /**
       * Update Progress - Navigasyon ilerlemesini güncelle
       */
      updateProgress: (location: LatLng) => {
        const { currentRoute, routeProgress } = get();
        if (!currentRoute || !routeProgress) {
          return;
        }

        // TODO: Gerçek mesafe ve süre hesaplama
        // Bu mock implementation - gerçekte haversine formula kullanılmalı
        const distanceTraveled = routeProgress.distanceTraveled + 100; // +100m
        const distanceRemaining = currentRoute.summary.distance - distanceTraveled;
        const timeElapsed = routeProgress.timeElapsed + 1; // +1s
        const timeRemaining = currentRoute.summary.duration - timeElapsed;
        const currentSpeed = 80; // km/h (mock)
        const averageSpeed = (distanceTraveled / 1000) / (timeElapsed / 3600); // km/h

        const updatedProgress: RouteProgress = {
          ...routeProgress,
          currentLocation: location,
          distanceTraveled,
          distanceRemaining: Math.max(0, distanceRemaining),
          timeElapsed,
          timeRemaining: Math.max(0, timeRemaining),
          averageSpeed,
          currentSpeed,
        };

        set({ routeProgress: updatedProgress });

        // Rota tamamlandı mı?
        if (distanceRemaining <= 0) {
          const completedRoute: Route = {
            ...currentRoute,
            status: 'completed',
          };

          set({
            currentRoute: completedRoute,
            isNavigating: false,
          });

          // Geçmişe ekle
          get().addToHistory(completedRoute);
        }
      },

      /**
       * Clear Route - Rotayı temizle
       */
      clearRoute: () => {
        set({
          currentRoute: null,
          alternativeRoutes: [],
          routeProgress: null,
          isNavigating: false,
          error: null,
        });
      },

      /**
       * Add to History - Geçmişe ekle
       */
      addToHistory: (route: Route) => {
        const { routeHistory } = get();

        // Aynı rota zaten geçmişte var mı?
        const exists = routeHistory.some(r => r.id === route.id);
        if (exists) {
          return;
        }

        // En fazla 50 rota sakla
        const maxHistory = 50;
        const updatedHistory = [route, ...routeHistory].slice(0, maxHistory);

        set({ routeHistory: updatedHistory });
      },

      /**
       * Remove from History - Geçmişten sil
       */
      removeFromHistory: (routeId: string) => {
        const { routeHistory } = get();
        const updatedHistory = routeHistory.filter(r => r.id !== routeId);
        set({ routeHistory: updatedHistory });
      },

      /**
       * Clear History - Geçmişi temizle
       */
      clearHistory: () => {
        set({ routeHistory: [] });
      },

      /**
       * Clear Error - Hata mesajını temizle
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'route-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Sadece gerekli state'leri persist et
      partialize: (state) => ({
        routeHistory: state.routeHistory,
      }),
    }
  )
);

/**
 * Route Store Selectors
 */
export const selectCurrentRoute = (state: RouteState) => state.currentRoute;
export const selectAlternativeRoutes = (state: RouteState) => state.alternativeRoutes;
export const selectRouteHistory = (state: RouteState) => state.routeHistory;
export const selectRouteProgress = (state: RouteState) => state.routeProgress;
export const selectIsCalculating = (state: RouteState) => state.isCalculating;
export const selectIsNavigating = (state: RouteState) => state.isNavigating;
export const selectError = (state: RouteState) => state.error;
