/**
 * Application configuration constants
 * 
 * Uygulama genelinde kullanılan yapılandırma sabitleri
 * Environment-specific değerler .env dosyasından yüklenir
 * 
 * @example
 * ```tsx
 * import { API_CONFIG, MAP_CONFIG } from '@constants';
 * 
 * const apiKey = API_CONFIG.keys.mapbox;
 * const center = MAP_CONFIG.defaultRegion;
 * ```
 */

/**
 * API Configuration
 * API anahtarları ve endpoint'ler
 */
export const API_CONFIG = {
  /**
   * API Keys
   */
  keys: {
    mapbox: process.env.MAPBOX_API_KEY || '',
    graphhopper: process.env.GRAPHHOPPER_API_KEY || '',
  },

  /**
   * Base URLs
   */
  baseUrls: {
    api: process.env.API_BASE_URL || 'https://api.tirnav.com',
    graphhopper: 'https://graphhopper.com/api/1',
    mapbox: 'https://api.mapbox.com',
  },

  /**
   * Endpoints
   */
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    routes: {
      calculate: '/routes/calculate',
      save: '/routes/save',
      history: '/routes/history',
    },
    warnings: {
      list: '/warnings',
      create: '/warnings/create',
      verify: '/warnings/verify',
      report: '/warnings/report',
    },
    vehicles: {
      list: '/vehicles',
      create: '/vehicles/create',
      update: '/vehicles/update',
      delete: '/vehicles/delete',
    },
  },

  /**
   * Timeouts (milliseconds)
   */
  timeouts: {
    request: 30000,      // 30 saniye
    location: 10000,     // 10 saniye
    upload: 60000,       // 60 saniye
  },
} as const;

/**
 * Map Configuration
 * Harita ayarları ve varsayılan değerler
 */
export const MAP_CONFIG = {
  /**
   * Default map region (Ankara, Turkey)
   */
  defaultRegion: {
    latitude: 39.9334,
    longitude: 32.8597,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },

  /**
   * Zoom levels
   */
  zoom: {
    default: 12,
    min: 5,
    max: 18,
    street: 15,
    city: 10,
    country: 5,
  },

  /**
   * Map styles
   */
  styles: {
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-v9',
    outdoors: 'mapbox://styles/mapbox/outdoors-v12',
    navigation: 'mapbox://styles/mapbox/navigation-day-v1',
  },

  /**
   * Location tracking settings
   */
  location: {
    updateInterval: 5000,        // 5 saniye
    distanceFilter: 10,          // 10 metre
    accuracy: 'high' as const,
    enableBackground: true,
  },

  /**
   * Route rendering
   */
  route: {
    lineWidth: 5,
    alternativeLineWidth: 3,
    lineCap: 'round' as const,
    lineJoin: 'round' as const,
  },

  /**
   * Marker settings
   */
  marker: {
    size: 40,
    clusterRadius: 50,
    clusterMaxZoom: 14,
  },

  /**
   * Map padding
   */
  padding: {
    top: 100,
    bottom: 100,
    left: 50,
    right: 50,
  },
} as const;

/**
 * Vehicle Configuration
 * Araç boyutları ve kısıtlamalar
 */
export const VEHICLE_CONFIG = {
  /**
   * Default truck dimensions (meters)
   */
  defaults: {
    height: 4.0,      // metre
    width: 2.5,       // metre
    length: 16.5,     // metre
    weight: 40,       // ton
    axles: 5,         // aks sayısı
  },

  /**
   * Maximum limits
   */
  limits: {
    minHeight: 2.0,
    maxHeight: 4.5,
    minWidth: 2.0,
    maxWidth: 3.0,
    minLength: 6.0,
    maxLength: 20.0,
    minWeight: 10,
    maxWeight: 50,
    minAxles: 2,
    maxAxles: 7,
  },

  /**
   * Vehicle types
   */
  types: {
    truck: 'truck',
    semiTrailer: 'semi_trailer',
    trailer: 'trailer',
    tanker: 'tanker',
    refrigerated: 'refrigerated',
  },

  /**
   * Speed limits (km/h)
   */
  speedLimits: {
    highway: 90,
    rural: 80,
    urban: 50,
  },
} as const;

/**
 * Route Configuration
 * Rota hesaplama ayarları
 */
export const ROUTE_CONFIG = {
  /**
   * Maximum values
   */
  maxAlternatives: 3,
  maxWaypoints: 10,

  /**
   * Default preferences
   */
  defaults: {
    avoidHighways: false,
    avoidTolls: false,
    avoidFerries: false,
    preferFastest: true,
  },

  /**
   * Route profiles
   */
  profiles: {
    truck: 'truck',
    car: 'car',
    motorcycle: 'motorcycle',
  },

  /**
   * Calculation settings
   */
  calculation: {
    algorithm: 'dijkstra' as const,
    optimize: true,
    instructions: true,
    locale: 'tr',
  },
} as const;

/**
 * Warning Configuration
 * Uyarı sistemi ayarları
 */
export const WARNING_CONFIG = {
  /**
   * Warning types
   */
  types: {
    lowBridge: 'low_bridge',
    weightLimit: 'weight_limit',
    widthRestriction: 'width_restriction',
    heightRestriction: 'height_restriction',
    noTrucks: 'no_trucks',
    roadClosure: 'road_closure',
    accident: 'accident',
    traffic: 'traffic',
    construction: 'construction',
    weather: 'weather',
    other: 'other',
  },

  /**
   * Warning severity levels
   */
  severity: {
    low: 'low',
    medium: 'medium',
    high: 'high',
    critical: 'critical',
  },

  /**
   * Warning settings
   */
  settings: {
    proximityRadius: 500,        // metre
    expirationDays: 7,           // gün
    minVerifications: 3,         // minimum doğrulama
    maxReports: 5,               // maximum şikayet
  },
} as const;

/**
 * Storage Keys
 * AsyncStorage anahtarları
 */
export const STORAGE_KEYS = {
  auth: {
    token: '@tirnav:auth:token',
    refreshToken: '@tirnav:auth:refresh_token',
    user: '@tirnav:auth:user',
  },
  vehicle: {
    active: '@tirnav:vehicle:active',
    list: '@tirnav:vehicle:list',
  },
  route: {
    history: '@tirnav:route:history',
    favorites: '@tirnav:route:favorites',
    searchHistory: '@tirnav:route:search_history',
  },
  ROUTE_SEARCH_HISTORY: '@tirnav:route:search_history',
  settings: {
    preferences: '@tirnav:settings:preferences',
    theme: '@tirnav:settings:theme',
    language: '@tirnav:settings:language',
  },
  cache: {
    maps: '@tirnav:cache:maps',
    pois: '@tirnav:cache:pois',
  },
  ONBOARDING_COMPLETED: '@tirnav:onboarding:completed',
} as const;

/**
 * App Configuration
 * Uygulama genel ayarları
 */
export const APP_CONFIG = {
  /**
   * App info
   */
  info: {
    name: 'TirNav',
    version: '1.0.0',
    build: '1',
    bundleId: 'com.tirnav.app',
  },

  /**
   * Feature flags
   */
  features: {
    offlineMaps: true,
    voiceNavigation: true,
    trafficUpdates: true,
    communityWarnings: true,
    darkMode: false,
    multiLanguage: false,
  },

  /**
   * Pagination
   */
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  /**
   * Cache settings
   */
  cache: {
    duration: 3600000,           // 1 saat (milliseconds)
    maxSize: 50 * 1024 * 1024,   // 50 MB
  },

  /**
   * Analytics
   */
  analytics: {
    enabled: true,
    trackScreenViews: true,
    trackEvents: true,
  },
} as const;

/**
 * Firebase Configuration
 * Firebase ayarları (.env'den yüklenir)
 */
export const FIREBASE_CONFIG = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || '',
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || '',
} as const;

/**
 * Error Messages (Turkish)
 * Kullanıcıya gösterilecek hata mesajları
 */
export const ERROR_MESSAGES = {
  // Network errors
  network: {
    offline: 'İnternet bağlantınızı kontrol edin',
    timeout: 'İstek zaman aşımına uğradı',
    serverError: 'Sunucu hatası, lütfen tekrar deneyin',
  },

  // Auth errors
  auth: {
    invalidCredentials: 'Geçersiz kullanıcı adı veya şifre',
    userNotFound: 'Kullanıcı bulunamadı',
    emailInUse: 'Bu e-posta adresi zaten kullanımda',
    weakPassword: 'Şifre çok zayıf',
    sessionExpired: 'Oturumunuz sona erdi, lütfen tekrar giriş yapın',
  },

  // Location errors
  location: {
    permissionDenied: 'Konum izni gerekli',
    unavailable: 'Konum bilgisi alınamadı',
    timeout: 'Konum tespiti zaman aşımına uğradı',
  },

  // Route errors
  route: {
    calculationFailed: 'Rota hesaplanamadı',
    noRouteFound: 'Rota bulunamadı',
    invalidWaypoints: 'Geçersiz ara noktalar',
  },

  // Vehicle errors
  vehicle: {
    notFound: 'Araç bulunamadı',
    invalidDimensions: 'Geçersiz araç boyutları',
    saveFailed: 'Araç kaydedilemedi',
  },

  // Warning errors
  warning: {
    createFailed: 'Uyarı oluşturulamadı',
    notFound: 'Uyarı bulunamadı',
    alreadyVerified: 'Bu uyarıyı zaten doğruladınız',
  },

  // Generic errors
  generic: {
    unknown: 'Bilinmeyen bir hata oluştu',
    tryAgain: 'Lütfen tekrar deneyin',
    contactSupport: 'Sorun devam ederse destek ekibiyle iletişime geçin',
  },
} as const;

/**
 * Success Messages (Turkish)
 * Başarılı işlem mesajları
 */
export const SUCCESS_MESSAGES = {
  auth: {
    loginSuccess: 'Giriş başarılı',
    registerSuccess: 'Kayıt başarılı',
    logoutSuccess: 'Çıkış yapıldı',
  },
  vehicle: {
    created: 'Araç başarıyla eklendi',
    updated: 'Araç bilgileri güncellendi',
    deleted: 'Araç silindi',
  },
  route: {
    saved: 'Rota kaydedildi',
    deleted: 'Rota silindi',
  },
  warning: {
    created: 'Uyarı oluşturuldu',
    verified: 'Uyarı doğrulandı',
    reported: 'Uyarı raporlandı',
  },
} as const;

/**
 * Type definitions
 */
export type ApiConfig = typeof API_CONFIG;
export type MapConfig = typeof MAP_CONFIG;
export type VehicleConfig = typeof VEHICLE_CONFIG;
export type RouteConfig = typeof ROUTE_CONFIG;
export type WarningConfig = typeof WARNING_CONFIG;
