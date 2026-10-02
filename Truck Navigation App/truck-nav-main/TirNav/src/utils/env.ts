/**
 * Environment Variables Utility
 * 
 * Helper functions to safely access environment variables
 * with fallbacks and type conversion
 */

import {
  GRAPHHOPPER_API_KEY,
  MAPBOX_ACCESS_TOKEN,
  GOOGLE_MAPS_API_KEY,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  APP_VERSION,
  APP_ENV,
  API_TIMEOUT,
  MAX_IMAGE_SIZE,
  DEBUG_MODE,
  API_BASE_URL,
  GRAPHHOPPER_BASE_URL,
  ENABLE_OFFLINE_MAPS,
  ENABLE_VOICE_NAVIGATION,
  ENABLE_TRAFFIC_UPDATES,
  ENABLE_COMMUNITY_WARNINGS,
  GOOGLE_ANALYTICS_ID,
  SENTRY_DSN,
} from '@env';

/**
 * Environment configuration object
 */
export const ENV = {
  // API Keys
  GRAPHHOPPER_API_KEY: GRAPHHOPPER_API_KEY || '',
  MAPBOX_ACCESS_TOKEN: MAPBOX_ACCESS_TOKEN || '',
  GOOGLE_MAPS_API_KEY: GOOGLE_MAPS_API_KEY || '',

  // Firebase
  FIREBASE: {
    API_KEY: FIREBASE_API_KEY || '',
    AUTH_DOMAIN: FIREBASE_AUTH_DOMAIN || '',
    PROJECT_ID: FIREBASE_PROJECT_ID || '',
    STORAGE_BUCKET: FIREBASE_STORAGE_BUCKET || '',
    MESSAGING_SENDER_ID: FIREBASE_MESSAGING_SENDER_ID || '',
    APP_ID: FIREBASE_APP_ID || '',
  },

  // App Config
  APP_VERSION: APP_VERSION || '1.0.0',
  APP_ENV: APP_ENV || 'development',
  API_TIMEOUT: parseInt(API_TIMEOUT || '30000', 10),
  MAX_IMAGE_SIZE: parseInt(MAX_IMAGE_SIZE || '5242880', 10),
  DEBUG_MODE: DEBUG_MODE === 'true',

  // API Endpoints
  API_BASE_URL: API_BASE_URL || 'https://api.tirnav.com',
  GRAPHHOPPER_BASE_URL: GRAPHHOPPER_BASE_URL || 'https://graphhopper.com/api/1',

  // Feature Flags
  FEATURES: {
    OFFLINE_MAPS: ENABLE_OFFLINE_MAPS === 'true',
    VOICE_NAVIGATION: ENABLE_VOICE_NAVIGATION === 'true',
    TRAFFIC_UPDATES: ENABLE_TRAFFIC_UPDATES === 'true',
    COMMUNITY_WARNINGS: ENABLE_COMMUNITY_WARNINGS === 'true',
  },

  // Analytics
  ANALYTICS: {
    GOOGLE_ANALYTICS_ID: GOOGLE_ANALYTICS_ID || '',
    SENTRY_DSN: SENTRY_DSN || '',
  },
} as const;

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return ENV.APP_ENV === 'development';
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return ENV.APP_ENV === 'production';
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
  return ENV.DEBUG_MODE;
};

/**
 * Get API timeout in milliseconds
 */
export const getApiTimeout = (): number => {
  return ENV.API_TIMEOUT;
};

/**
 * Get max image size in bytes
 */
export const getMaxImageSize = (): number => {
  return ENV.MAX_IMAGE_SIZE;
};

/**
 * Get max image size in MB
 */
export const getMaxImageSizeMB = (): number => {
  return ENV.MAX_IMAGE_SIZE / (1024 * 1024);
};

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (
  feature: keyof typeof ENV.FEATURES
): boolean => {
  return ENV.FEATURES[feature];
};

/**
 * Get GraphHopper API key
 * Throws error if not set
 */
export const getGraphHopperApiKey = (): string => {
  if (!ENV.GRAPHHOPPER_API_KEY) {
    throw new Error(
      'GRAPHHOPPER_API_KEY is not set in environment variables'
    );
  }
  return ENV.GRAPHHOPPER_API_KEY;
};

/**
 * Get Google Maps API key
 * Throws error if not set
 */
export const getGoogleMapsApiKey = (): string => {
  if (!ENV.GOOGLE_MAPS_API_KEY) {
    throw new Error(
      'GOOGLE_MAPS_API_KEY is not set in environment variables'
    );
  }
  return ENV.GOOGLE_MAPS_API_KEY;
};

/**
 * Validate required environment variables
 * Call this on app startup
 */
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const required = [
    'GRAPHHOPPER_API_KEY',
    // Add other required vars here
  ];

  const missing: string[] = [];

  required.forEach((key) => {
    if (!ENV[key as keyof typeof ENV]) {
      missing.push(key);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Log environment configuration (for debugging)
 * Masks sensitive values
 */
export const logEnvConfig = (): void => {
  if (!isDebugMode()) return;

  console.log('🔧 Environment Configuration:');
  console.log('  APP_VERSION:', ENV.APP_VERSION);
  console.log('  APP_ENV:', ENV.APP_ENV);
  console.log('  DEBUG_MODE:', ENV.DEBUG_MODE);
  console.log('  API_TIMEOUT:', ENV.API_TIMEOUT);
  console.log('  MAX_IMAGE_SIZE:', getMaxImageSizeMB(), 'MB');
  console.log('  GRAPHHOPPER_API_KEY:', ENV.GRAPHHOPPER_API_KEY ? '***' : 'NOT SET');
  console.log('  GOOGLE_MAPS_API_KEY:', ENV.GOOGLE_MAPS_API_KEY ? '***' : 'NOT SET');
  console.log('  Features:', ENV.FEATURES);
};

/**
 * Export default
 */
export default ENV;
