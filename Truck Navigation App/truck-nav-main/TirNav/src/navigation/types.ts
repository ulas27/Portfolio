/**
 * Navigation Types
 * 
 * Re-export navigation types from @types for convenience
 * 
 * @example
 * ```tsx
 * import type { MapScreenProps } from '@navigation/types';
 * ```
 */

export type {
  // Param Lists
  RootStackParamList,
  AuthStackParamList,
  MainTabParamList,
  MapStackParamList,
  WarningStackParamList,
  ProfileStackParamList,
  
  // Screen Props
  OnboardingScreenProps,
  LoginScreenProps,
  RegisterScreenProps,
  MapScreenProps,
  RouteDetailScreenProps,
  RouteHistoryScreenProps,
  AddWarningScreenProps,
  WarningDetailScreenProps,
  ProfileScreenProps,
  SettingsScreenProps,
  VehicleInfoScreenProps,
  
  // Tab Props
  MapTabScreenProps,
  RoutesTabScreenProps,
  WarningsTabScreenProps,
  ProfileTabScreenProps,
} from '@types';
