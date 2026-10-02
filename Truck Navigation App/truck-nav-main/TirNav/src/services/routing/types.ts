/**
 * Routing Service Types
 * 
 * Common types for routing services
 */

import type { Coordinates } from '@types/common';

/**
 * Geocoding result with address
 */
export interface GeocodingResult extends Coordinates {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
}

/**
 * Route calculation options
 */
export interface RouteCalculationOptions {
  /**
   * Avoid highways/motorways
   */
  avoidHighways?: boolean;

  /**
   * Avoid toll roads
   */
  avoidTolls?: boolean;

  /**
   * Avoid ferries
   */
  avoidFerries?: boolean;

  /**
   * Prefer fastest route
   */
  preferFastest?: boolean;

  /**
   * Maximum number of alternative routes
   */
  maxAlternatives?: number;
}

/**
 * Maneuver types for turn-by-turn navigation
 */
export type ManeuverType =
  | 'continue'
  | 'turn_left'
  | 'turn_right'
  | 'turn_slight_left'
  | 'turn_slight_right'
  | 'turn_sharp_left'
  | 'turn_sharp_right'
  | 'roundabout'
  | 'finish'
  | 'via';

/**
 * Routing service error codes
 */
export enum RoutingErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_KEY_INVALID = 'API_KEY_INVALID',
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Routing service error
 */
export class RoutingError extends Error {
  code: RoutingErrorCode;
  originalError?: Error;

  constructor(message: string, code: RoutingErrorCode, originalError?: Error) {
    super(message);
    this.name = 'RoutingError';
    this.code = code;
    this.originalError = originalError;
  }
}
