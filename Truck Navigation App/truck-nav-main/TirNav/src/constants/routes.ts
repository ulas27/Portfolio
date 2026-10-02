/**
 * Navigation route names
 * 
 * Merkezi route tanımları - type-safe navigation için
 * Typo hatalarını önlemek ve refactoring'i kolaylaştırmak için
 * 
 * @example
 * ```tsx
 * import { ROUTES } from '@constants';
 * 
 * navigation.navigate(ROUTES.AUTH.LOGIN);
 * navigation.navigate(ROUTES.MAP.MAP_SCREEN);
 * ```
 */

export const ROUTES = {
  /**
   * Auth Stack Routes
   * Kimlik doğrulama ekranları
   */
  AUTH: {
    ONBOARDING: 'Onboarding',     // İlk açılış tanıtım ekranı
    LOGIN: 'Login',               // Giriş ekranı
    REGISTER: 'Register',         // Kayıt ekranı
    FORGOT_PASSWORD: 'ForgotPassword', // Şifre sıfırlama
  },

  /**
   * Main Stack Routes
   * Ana uygulama stack'i
   */
  MAIN: {
    TAB_NAVIGATOR: 'TabNavigator', // Ana tab navigator
  },

  /**
   * Tab Navigator Routes
   * Alt menü sekmeleri
   */
  TABS: {
    MAP: 'MapTab',                // Harita sekmesi
    ROUTES: 'RoutesTab',          // Rotalar sekmesi
    WARNINGS: 'WarningsTab',      // Uyarılar sekmesi
    PROFILE: 'ProfileTab',        // Profil sekmesi
  },

  /**
   * Map Stack Routes
   * Harita ile ilgili ekranlar
   */
  MAP: {
    MAP_SCREEN: 'MapScreen',           // Ana harita ekranı
    ROUTE_DETAIL: 'MapRouteDetail',    // Haritadan rota detay
    ROUTE_HISTORY: 'RouteHistory',     // Rota geçmişi
    SEARCH_LOCATION: 'SearchLocation', // Konum arama
    POI_DETAIL: 'POIDetail',           // POI detay ekranı
  },

  /**
   * Routes Stack
   * Rota yönetimi ekranları
   */
  ROUTE: {
    LIST: 'RouteList',                 // Rota listesi
    CREATE: 'RouteCreate',             // Yeni rota oluştur
    DETAIL: 'RouteDetail',             // Rota detayı
    EDIT: 'RouteEdit',                 // Rota düzenle
    FAVORITES: 'RouteFavorites',       // Favori rotalar
  },

  /**
   * Warnings Stack Routes
   * Uyarı sistemi ekranları
   */
  WARNINGS: {
    LIST: 'WarningList',               // Uyarı listesi
    ADD_WARNING: 'AddWarning',         // Yeni uyarı ekle
    WARNING_DETAIL: 'WarningDetail',   // Uyarı detayı
    MAP_VIEW: 'WarningMapView',        // Uyarı harita görünümü
  },

  /**
   * Profile Stack Routes
   * Profil ve ayarlar ekranları
   */
  PROFILE: {
    PROFILE_SCREEN: 'ProfileScreen',   // Profil ana ekranı
    EDIT_PROFILE: 'EditProfile',       // Profil düzenle
    SETTINGS: 'Settings',              // Ayarlar
    VEHICLE_INFO: 'VehicleInfo',       // Araç bilgileri
    VEHICLE_LIST: 'VehicleList',       // Araç listesi
    ADD_VEHICLE: 'AddVehicle',         // Yeni araç ekle
    NOTIFICATIONS: 'Notifications',    // Bildirimler
    PRIVACY: 'Privacy',                // Gizlilik
    TERMS: 'Terms',                    // Kullanım koşulları
    ABOUT: 'About',                    // Hakkında
    HELP: 'Help',                      // Yardım
  },

  /**
   * Modal Routes
   * Modal ekranlar
   */
  MODAL: {
    ROUTE_OPTIONS: 'RouteOptionsModal',     // Rota seçenekleri
    VEHICLE_PICKER: 'VehiclePickerModal',   // Araç seçici
    FILTER: 'FilterModal',                  // Filtre
    SHARE: 'ShareModal',                    // Paylaş
  },
} as const;

/**
 * Screen Titles (Turkish)
 * Ekran başlıkları
 */
export const SCREEN_TITLES = {
  // Auth
  [ROUTES.AUTH.ONBOARDING]: 'Hoş Geldiniz',
  [ROUTES.AUTH.LOGIN]: 'Giriş Yap',
  [ROUTES.AUTH.REGISTER]: 'Kayıt Ol',
  [ROUTES.AUTH.FORGOT_PASSWORD]: 'Şifremi Unuttum',

  // Tabs
  [ROUTES.TABS.MAP]: 'Harita',
  [ROUTES.TABS.ROUTES]: 'Rotalarım',
  [ROUTES.TABS.WARNINGS]: 'Uyarılar',
  [ROUTES.TABS.PROFILE]: 'Profil',

  // Map
  [ROUTES.MAP.MAP_SCREEN]: 'Harita',
  [ROUTES.MAP.ROUTE_DETAIL]: 'Rota Detayı',
  [ROUTES.MAP.ROUTE_HISTORY]: 'Rota Geçmişi',
  [ROUTES.MAP.SEARCH_LOCATION]: 'Konum Ara',
  [ROUTES.MAP.POI_DETAIL]: 'Detay',

  // Routes
  [ROUTES.ROUTE.LIST]: 'Rotalarım',
  [ROUTES.ROUTE.CREATE]: 'Yeni Rota',
  [ROUTES.ROUTE.DETAIL]: 'Rota Detayı',
  [ROUTES.ROUTE.EDIT]: 'Rota Düzenle',
  [ROUTES.ROUTE.FAVORITES]: 'Favori Rotalar',

  // Warnings
  [ROUTES.WARNINGS.LIST]: 'Uyarılar',
  [ROUTES.WARNINGS.ADD_WARNING]: 'Uyarı Ekle',
  [ROUTES.WARNINGS.WARNING_DETAIL]: 'Uyarı Detayı',
  [ROUTES.WARNINGS.MAP_VIEW]: 'Harita Görünümü',

  // Profile
  [ROUTES.PROFILE.PROFILE_SCREEN]: 'Profilim',
  [ROUTES.PROFILE.EDIT_PROFILE]: 'Profili Düzenle',
  [ROUTES.PROFILE.SETTINGS]: 'Ayarlar',
  [ROUTES.PROFILE.VEHICLE_INFO]: 'Araç Bilgileri',
  [ROUTES.PROFILE.VEHICLE_LIST]: 'Araçlarım',
  [ROUTES.PROFILE.ADD_VEHICLE]: 'Araç Ekle',
  [ROUTES.PROFILE.NOTIFICATIONS]: 'Bildirimler',
  [ROUTES.PROFILE.PRIVACY]: 'Gizlilik',
  [ROUTES.PROFILE.TERMS]: 'Kullanım Koşulları',
  [ROUTES.PROFILE.ABOUT]: 'Hakkında',
  [ROUTES.PROFILE.HELP]: 'Yardım',
} as const;

/**
 * Helper types for type-safe route names
 */
export type AuthRoutes = typeof ROUTES.AUTH[keyof typeof ROUTES.AUTH];
export type MainRoutes = typeof ROUTES.MAIN[keyof typeof ROUTES.MAIN];
export type TabRoutes = typeof ROUTES.TABS[keyof typeof ROUTES.TABS];
export type MapRoutes = typeof ROUTES.MAP[keyof typeof ROUTES.MAP];
export type RouteStackRoutes = typeof ROUTES.ROUTE[keyof typeof ROUTES.ROUTE];
export type WarningRoutes = typeof ROUTES.WARNINGS[keyof typeof ROUTES.WARNINGS];
export type ProfileRoutes = typeof ROUTES.PROFILE[keyof typeof ROUTES.PROFILE];
export type ModalRoutes = typeof ROUTES.MODAL[keyof typeof ROUTES.MODAL];

/**
 * All route names combined
 */
export type AllRoutes = 
  | AuthRoutes 
  | MainRoutes 
  | TabRoutes 
  | MapRoutes 
  | RouteStackRoutes
  | WarningRoutes 
  | ProfileRoutes
  | ModalRoutes;
