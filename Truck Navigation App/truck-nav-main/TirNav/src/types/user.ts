/**
 * User related type definitions
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailVerified: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  language: 'tr' | 'en';
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  map: MapPreferences;
  route: RoutePreferences;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  warningAlerts: boolean;
  trafficAlerts: boolean;
  routeUpdates: boolean;
}

export interface MapPreferences {
  showTraffic: boolean;
  showPOIs: boolean;
  showWarnings: boolean;
  autoZoom: boolean;
  mapStyle: 'standard' | 'satellite' | 'hybrid';
}

export interface RoutePreferences {
  avoidHighways: boolean;
  avoidTolls: boolean;
  avoidFerries: boolean;
  preferFastestRoute: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  displayName: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
