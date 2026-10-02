/**
 * Routing Services Barrel Export
 * 
 * @example
 * ```tsx
 * import { graphHopperService } from '@services/routing';
 * 
 * const routes = await graphHopperService.calculateRoute(request);
 * ```
 */

export { graphHopperService, default as graphhopper } from './graphhopper';
// export { routeCalculatorService } from './routeCalculator';

// Re-export types
export type {
  GeocodingResult,
  RouteCalculationOptions,
  ManeuverType,
} from './types';

export {
  RoutingErrorCode,
  RoutingError,
} from './types';
