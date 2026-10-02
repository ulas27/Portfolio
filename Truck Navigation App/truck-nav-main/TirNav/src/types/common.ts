/**
 * Common type definitions used across the application
 */

// Geographic coordinates
export interface LatLng {
  latitude: number;
  longitude: number;
}

// Geographic region/bounds
export interface Region extends LatLng {
  latitudeDelta: number;
  longitudeDelta: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// API Error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Form validation
export interface ValidationError {
  field: string;
  message: string;
}

// File upload
export interface UploadedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

// Location permission status
export type LocationPermissionStatus = 
  | 'granted'
  | 'denied'
  | 'restricted'
  | 'undetermined';

// Network status
export type NetworkStatus = 'online' | 'offline';

// POI (Point of Interest) types
export type POIType = 
  | 'gas_station'
  | 'rest_area'
  | 'truck_parking'
  | 'service_center'
  | 'weigh_station'
  | 'border_crossing'
  | 'toll_booth'
  | 'restaurant'
  | 'hotel'
  | 'other';

// POI interface
export interface POI {
  id: string;
  type: POIType;
  name: string;
  location: LatLng;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  amenities: string[];
  isOpen24Hours: boolean;
  openingHours?: OpeningHours;
}

// Opening hours
export interface OpeningHours {
  monday?: TimeRange;
  tuesday?: TimeRange;
  wednesday?: TimeRange;
  thursday?: TimeRange;
  friday?: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
}

export interface TimeRange {
  open: string; // HH:mm format
  close: string; // HH:mm format
}

// Generic ID type
export type ID = string;

// Timestamp
export type Timestamp = Date | number;

/**
 * Simplified Coordinates alias
 * Alias for LatLng for backward compatibility
 */
export type Coordinates = LatLng;

/**
 * Utility Types
 */

// Make all properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make all properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Nullable type
export type Nullable<T> = T | null;

// Optional type
export type Optional<T> = T | undefined;

// Maybe type (nullable or undefined)
export type Maybe<T> = T | null | undefined;
