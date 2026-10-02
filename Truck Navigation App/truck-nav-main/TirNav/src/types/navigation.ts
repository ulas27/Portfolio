/**
 * React Navigation type definitions
 * Type-safe navigation throughout the app
 */

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Root Stack (Auth + Main)
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  MapTab: NavigatorScreenParams<MapStackParamList>;
  RoutesTab: undefined;
  WarningsTab: NavigatorScreenParams<WarningStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Map Stack
export type MapStackParamList = {
  MapScreen: undefined;
  RouteDetail: {
    routeId: string;
  };
  RouteHistory: undefined;
};

// Warning Stack
export type WarningStackParamList = {
  AddWarning: {
    latitude?: number;
    longitude?: number;
  };
  WarningDetail: {
    warningId: string;
  };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  Settings: undefined;
  VehicleInfo: {
    vehicleId?: string;
  };
};

// Screen Props Types

// Auth Screen Props
export type OnboardingScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Onboarding'
>;
export type LoginScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Login'
>;
export type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

// Map Screen Props
export type MapScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MapStackParamList, 'MapScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type RouteDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MapStackParamList, 'RouteDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type RouteHistoryScreenProps = CompositeScreenProps<
  NativeStackScreenProps<MapStackParamList, 'RouteHistory'>,
  BottomTabScreenProps<MainTabParamList>
>;

// Warning Screen Props
export type AddWarningScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WarningStackParamList, 'AddWarning'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type WarningDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<WarningStackParamList, 'WarningDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;

// Profile Screen Props
export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ProfileScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type SettingsScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'Settings'>,
  BottomTabScreenProps<MainTabParamList>
>;
export type VehicleInfoScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'VehicleInfo'>,
  BottomTabScreenProps<MainTabParamList>
>;

// Tab Screen Props
export type MapTabScreenProps = BottomTabScreenProps<MainTabParamList, 'MapTab'>;
export type RoutesTabScreenProps = BottomTabScreenProps<MainTabParamList, 'RoutesTab'>;
export type WarningsTabScreenProps = BottomTabScreenProps<MainTabParamList, 'WarningsTab'>;
export type ProfileTabScreenProps = BottomTabScreenProps<MainTabParamList, 'ProfileTab'>;

// Navigation prop types for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
