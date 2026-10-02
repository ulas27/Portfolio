/**
 * GraphHopper Routing Service
 * 
 * Truck-specific route calculation service
 * - Calculate routes with vehicle restrictions
 * - Geocoding (address to coordinates)
 * - Reverse geocoding (coordinates to address)
 * - Alternative routes
 * - Turn-by-turn instructions
 * 
 * @example
 * ```tsx
 * import { graphHopperService } from '@services/routing/graphhopper';
 * 
 * const routes = await graphHopperService.calculateRoute({
 *   start: { latitude: 39.9334, longitude: 32.8597 },
 *   end: { latitude: 41.0082, longitude: 28.9784 },
 *   vehicleProfile: { ... },
 * });
 * ```
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { ENV } from '@utils/env';
import type { 
  RouteRequest, 
  Route, 
  RouteStep,
  RouteWarning,
} from '@types/route';
import type { Coordinates } from '@types/common';

/**
 * GraphHopper API base URL
 */
const BASE_URL = ENV.GRAPHHOPPER_BASE_URL;

/**
 * GraphHopper API key from environment
 */
const API_KEY = ENV.GRAPHHOPPER_API_KEY;

/**
 * Request timeout
 */
const REQUEST_TIMEOUT = ENV.API_TIMEOUT;

/**
 * Max retry attempts
 */
const MAX_RETRIES = 3;

/**
 * Retry delay (milliseconds)
 */
const RETRY_DELAY = 1000;

/**
 * GraphHopper API response types
 */
interface GraphHopperPath {
  distance: number;
  time: number;
  points: {
    coordinates: number[][];
  };
  instructions: GraphHopperInstruction[];
  ascend?: number;
  descend?: number;
  points_encoded?: boolean;
}

interface GraphHopperInstruction {
  distance: number;
  time: number;
  text: string;
  street_name?: string;
  sign?: number;
  interval?: number[];
  exit_number?: number;
  turn_angle?: number;
}

interface GraphHopperRouteResponse {
  paths: GraphHopperPath[];
  info?: {
    copyrights?: string[];
    took?: number;
  };
}

interface GraphHopperGeocodingHit {
  point: {
    lat: number;
    lng: number;
  };
  name: string;
  country?: string;
  city?: string;
  state?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
}

interface GraphHopperGeocodingResponse {
  hits: GraphHopperGeocodingHit[];
  locale?: string;
}

/**
 * GraphHopper Routing Service
 */
export const graphHopperService = {
  /**
   * Calculate truck route with vehicle restrictions
   * 
   * @param request - Route request with start, end, and vehicle profile
   * @returns Array of routes (main + alternatives)
   * @throws Error if route calculation fails
   */
  async calculateRoute(request: RouteRequest): Promise<Route[]> {
    if (!API_KEY) {
      throw new Error('GraphHopper API key bulunamadı. Lütfen .env dosyasını kontrol edin.');
    }

    try {
      const params: any = {
        key: API_KEY,
        point: [
          `${request.start.latitude},${request.start.longitude}`,
          `${request.end.latitude},${request.end.longitude}`,
        ],
        vehicle: 'truck',
        locale: 'tr',
        points_encoded: false,
        instructions: true,
        elevation: false,
        // Alternative routes
        'alternative_route.max_paths': 3,
        'alternative_route.max_weight_factor': 1.4,
        'alternative_route.max_share_factor': 0.6,
      };

      // Add vehicle restrictions
      if (request.vehicleProfile) {
        const { dimensions } = request.vehicleProfile;
        
        // Disable Contraction Hierarchies for custom vehicle
        params['ch.disable'] = true;
        
        if (dimensions.height) {
          params.height = dimensions.height;
        }
        if (dimensions.width) {
          params.width = dimensions.width;
        }
        if (dimensions.length) {
          params.length = dimensions.length;
        }
        if (dimensions.weight) {
          params.weight = dimensions.weight;
        }
        if (dimensions.hasDangerousGoods) {
          params.hazmat = true;
        }
      }

      // Add route preferences
      if (request.avoidHighways) {
        params['avoid'] = 'motorway';
      }
      if (request.avoidTolls) {
        params['avoid'] = params['avoid'] 
          ? `${params['avoid']}|toll` 
          : 'toll';
      }
      if (request.avoidFerries) {
        params['avoid'] = params['avoid'] 
          ? `${params['avoid']}|ferry` 
          : 'ferry';
      }

      const response = await makeRequestWithRetry<GraphHopperRouteResponse>(
        `${BASE_URL}/route`,
        { params }
      );

      if (!response.data.paths || response.data.paths.length === 0) {
        throw new Error('Rota bulunamadı');
      }

      return response.data.paths.map((path, index) => 
        mapGraphHopperPathToRoute(path, request, index)
      );
    } catch (error) {
      throw handleGraphHopperError(error, 'Rota hesaplanamadı');
    }
  },

  /**
   * Geocoding - Convert address to coordinates
   * 
   * @param address - Address string to search
   * @param limit - Maximum number of results (default: 5)
   * @returns Array of coordinates with addresses
   * @throws Error if geocoding fails
   */
  async geocode(
    address: string, 
    limit: number = 5
  ): Promise<Array<Coordinates & { address?: string }>> {
    if (!API_KEY) {
      throw new Error('GraphHopper API key bulunamadı');
    }

    if (!address || address.trim().length === 0) {
      throw new Error('Adres boş olamaz');
    }

    try {
      const response = await makeRequestWithRetry<GraphHopperGeocodingResponse>(
        `${BASE_URL}/geocode`,
        {
          params: {
            key: API_KEY,
            q: address.trim(),
            locale: 'tr',
            limit: Math.min(limit, 10),
          },
        }
      );

      if (!response.data.hits || response.data.hits.length === 0) {
        throw new Error('Adres bulunamadı');
      }

      return response.data.hits.map((hit) => ({
        latitude: hit.point.lat,
        longitude: hit.point.lng,
        address: formatAddress(hit),
      }));
    } catch (error) {
      throw handleGraphHopperError(error, 'Adres bulunamadı');
    }
  },

  /**
   * Reverse geocoding - Convert coordinates to address
   * 
   * @param coords - Coordinates to reverse geocode
   * @returns Address string
   * @throws Error if reverse geocoding fails
   */
  async reverseGeocode(coords: Coordinates): Promise<string> {
    if (!API_KEY) {
      throw new Error('GraphHopper API key bulunamadı');
    }

    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') {
      throw new Error('Geçersiz koordinatlar');
    }

    try {
      const response = await makeRequestWithRetry<GraphHopperGeocodingResponse>(
        `${BASE_URL}/geocode`,
        {
          params: {
            key: API_KEY,
            reverse: true,
            point: `${coords.latitude},${coords.longitude}`,
            locale: 'tr',
          },
        }
      );

      if (!response.data.hits || response.data.hits.length === 0) {
        return 'Bilinmeyen konum';
      }

      return formatAddress(response.data.hits[0]);
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Bilinmeyen konum';
    }
  },

  /**
   * Check if API key is configured
   * 
   * @returns true if API key is set
   */
  isConfigured(): boolean {
    return !!API_KEY && API_KEY.length > 0;
  },
};

/**
 * Map GraphHopper path to Route object
 */
function mapGraphHopperPathToRoute(
  path: GraphHopperPath,
  request: RouteRequest,
  index: number
): Route {
  return {
    id: `route_${Date.now()}_${index}`,
    startPoint: {
      ...request.start,
      address: undefined, // Will be filled by reverse geocoding if needed
    },
    endPoint: {
      ...request.end,
      address: undefined,
    },
    distance: Math.round(path.distance), // meters
    duration: Math.round(path.time / 1000), // convert ms to seconds
    geometry: path.points.coordinates.map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    })),
    steps: path.instructions.map((instruction) => ({
      distance: Math.round(instruction.distance),
      duration: Math.round(instruction.time / 1000),
      instruction: instruction.text,
      streetName: instruction.street_name,
      maneuver: getManeuverType(instruction.sign),
    })),
    warnings: [], // Warnings will be added by warning detection service
    createdAt: new Date(),
  };
}

/**
 * Get maneuver type from GraphHopper sign
 */
function getManeuverType(sign?: number): string {
  if (!sign) return 'continue';
  
  const maneuvers: Record<number, string> = {
    0: 'continue',
    1: 'turn_slight_right',
    2: 'turn_right',
    3: 'turn_sharp_right',
    '-1': 'turn_slight_left',
    '-2': 'turn_left',
    '-3': 'turn_sharp_left',
    4: 'finish',
    5: 'via',
    6: 'roundabout',
  };

  return maneuvers[sign] || 'continue';
}

/**
 * Format address from GraphHopper hit
 */
function formatAddress(hit: GraphHopperGeocodingHit): string {
  const parts: string[] = [];

  if (hit.street) {
    parts.push(hit.street);
    if (hit.housenumber) {
      parts[parts.length - 1] += ` ${hit.housenumber}`;
    }
  }

  if (hit.city) {
    parts.push(hit.city);
  }

  if (hit.state && hit.state !== hit.city) {
    parts.push(hit.state);
  }

  if (hit.country) {
    parts.push(hit.country);
  }

  return parts.length > 0 ? parts.join(', ') : hit.name;
}

/**
 * Make HTTP request with retry logic
 */
async function makeRequestWithRetry<T>(
  url: string,
  config: AxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<{ data: T }> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get<T>(url, {
        ...config,
        timeout: REQUEST_TIMEOUT,
      });

      return response;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(error) && error.response?.status) {
        const status = error.response.status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < retries - 1) {
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Handle GraphHopper API errors
 */
function handleGraphHopperError(error: unknown, defaultMessage: string): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // Network error
    if (!axiosError.response) {
      return new Error('İnternet bağlantısı hatası. Lütfen bağlantınızı kontrol edin.');
    }

    // API error
    const status = axiosError.response.status;
    const data = axiosError.response.data as any;

    switch (status) {
      case 400:
        return new Error(data?.message || 'Geçersiz istek parametreleri');
      case 401:
        return new Error('API anahtarı geçersiz');
      case 403:
        return new Error('API erişim izni yok');
      case 404:
        return new Error('Rota bulunamadı');
      case 429:
        return new Error('Çok fazla istek. Lütfen daha sonra tekrar deneyin.');
      case 500:
      case 502:
      case 503:
        return new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      default:
        return new Error(data?.message || defaultMessage);
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error(defaultMessage);
}

export default graphHopperService;
