/**
 * Route and navigation related type definitions
 */

import { LatLng } from './common';

export interface Route {
  id: string;
  userId: string;
  vehicleId: string;
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints: RoutePoint[];
  geometry: RouteGeometry;
  summary: RouteSummary;
  alternatives: Route[];
  isActive: boolean;
  status: RouteStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutePoint {
  coordinates: LatLng;
  address: string;
  name?: string;
  arrivalTime?: Date;
}

export interface RouteGeometry {
  coordinates: LatLng[];
  encodedPolyline?: string;
}

export interface RouteSummary {
  distance: number; // meters
  duration: number; // seconds
  estimatedFuelCost: number; // TL
  tollCost: number; // TL
  warnings: RouteWarning[];
}

export interface RouteWarning {
  id: string;
  type: WarningType;
  severity: WarningSeverity;
  location: LatLng;
  distance: number; // meters from current position
  message: string;
}

export type RouteStatus = 
  | 'planned'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export type WarningType =
  | 'low_bridge'
  | 'weight_limit'
  | 'width_restriction'
  | 'no_trucks'
  | 'road_closure'
  | 'accident'
  | 'traffic'
  | 'other';

export type WarningSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface RouteCalculationParams {
  origin: LatLng;
  destination: LatLng;
  waypoints?: LatLng[];
  vehicleProfile: {
    height: number;
    width: number;
    length: number;
    weight: number;
  };
  preferences: {
    avoidHighways?: boolean;
    avoidTolls?: boolean;
    avoidFerries?: boolean;
  };
  alternatives?: number;
}

export interface RouteProgress {
  routeId: string;
  currentLocation: LatLng;
  distanceTraveled: number; // meters
  distanceRemaining: number; // meters
  timeElapsed: number; // seconds
  timeRemaining: number; // seconds
  averageSpeed: number; // km/h
  currentSpeed: number; // km/h
  nextWaypoint?: RoutePoint;
}

export interface RouteState {
  routes: Route[];
  activeRoute: Route | null;
  routeProgress: RouteProgress | null;
  isCalculating: boolean;
  isNavigating: boolean;
  error: string | null;
}

/**
 * Simplified RouteStep interface
 * For turn-by-turn navigation instructions
 */
export interface RouteStep {
  distance: number;           // meters
  duration: number;           // seconds
  instruction: string;        // Turn-by-turn instruction
  streetName?: string;        // Street name if available
  maneuver?: string;          // turn-left, turn-right, etc.
}

/**
 * Simplified RouteRequest interface
 * For basic route calculation requests
 */
export interface RouteRequest {
  start: LatLng;
  end: LatLng;
  vehicleProfile?: {
    height: number;
    width: number;
    length: number;
    weight: number;
  };
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  avoidFerries?: boolean;
}
