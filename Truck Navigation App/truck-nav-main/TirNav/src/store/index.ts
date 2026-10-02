/**
 * Barrel export for all stores
 * 
 * Zustand stores for global state management
 * 
 * @example
 * ```tsx
 * import { useAuthStore, useVehicleStore } from '@store';
 * 
 * const { user, login } = useAuthStore();
 * const { activeVehicle } = useVehicleStore();
 * ```
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading as selectAuthIsLoading,
  selectError as selectAuthError,
  selectToken,
} from './authStore';

// Vehicle Store
export {
  useVehicleStore,
  selectVehicles,
  selectActiveVehicle,
  selectIsLoading as selectVehicleIsLoading,
  selectError as selectVehicleError,
} from './vehicleStore';

// Route Store
export {
  useRouteStore,
  selectCurrentRoute,
  selectAlternativeRoutes,
  selectRouteHistory,
  selectRouteProgress,
  selectIsCalculating,
  selectIsNavigating,
  selectError as selectRouteError,
} from './routeStore';

// Warning Store
export {
  useWarningStore,
  selectWarnings,
  selectUserWarnings,
  selectNearbyWarnings,
  selectSelectedWarning,
  selectIsLoading as selectWarningIsLoading,
  selectError as selectWarningError,
} from './warningStore';
