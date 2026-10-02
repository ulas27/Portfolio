/**
 * Environment Variables Type Definitions
 * 
 * Type definitions for environment variables accessed via @env
 * These are loaded from .env file using react-native-dotenv
 */

declare module '@env' {
  // API Keys
  export const GRAPHHOPPER_API_KEY: string;
  export const MAPBOX_ACCESS_TOKEN: string;
  export const GOOGLE_MAPS_API_KEY: string;

  // Firebase Configuration
  export const FIREBASE_API_KEY: string;
  export const FIREBASE_AUTH_DOMAIN: string;
  export const FIREBASE_PROJECT_ID: string;
  export const FIREBASE_STORAGE_BUCKET: string;
  export const FIREBASE_MESSAGING_SENDER_ID: string;
  export const FIREBASE_APP_ID: string;

  // App Configuration
  export const APP_VERSION: string;
  export const APP_ENV: string;
  export const API_TIMEOUT: string;
  export const MAX_IMAGE_SIZE: string;
  export const DEBUG_MODE: string;

  // API Endpoints
  export const API_BASE_URL: string;
  export const GRAPHHOPPER_BASE_URL: string;

  // Feature Flags
  export const ENABLE_OFFLINE_MAPS: string;
  export const ENABLE_VOICE_NAVIGATION: string;
  export const ENABLE_TRAFFIC_UPDATES: string;
  export const ENABLE_COMMUNITY_WARNINGS: string;

  // Analytics (Optional)
  export const GOOGLE_ANALYTICS_ID: string;
  export const SENTRY_DSN: string;
}
