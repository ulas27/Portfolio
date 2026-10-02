/**
 * Color palette for TirNav application
 * 
 * Türkiye için özel tasarlanmış profesyonel renk paleti
 * - Mavi tonlar: Güven, navigasyon, profesyonellik
 * - Turuncu/Kırmızı tonlar: Dikkat, uyarı, aciliyet
 * - Yeşil tonlar: Başarı, güvenli bölgeler
 * 
 * Material Design 3 prensipleri ile uyumlu
 * 
 * @example
 * ```tsx
 * import { COLORS } from '@constants';
 * 
 * <View style={{ backgroundColor: COLORS.primary.main }} />
 * <Text style={{ color: COLORS.text.primary }}>Merhaba</Text>
 * ```
 */

export const COLORS = {
  /**
   * Primary colors - Mavi tonlar (Güven, Navigasyon)
   * Türk bayrağı mavisi esinli, profesyonel ton
   */
  primary: {
    main: '#1E88E5',      // Ana mavi
    light: '#42A5F5',     // Açık mavi
    dark: '#1565C0',      // Koyu mavi
    container: '#E3F2FD', // Arka plan mavi
  },

  /**
   * Secondary colors - Turuncu tonlar (Dikkat, Enerji)
   * TIR/kamyon teması için sıcak, dikkat çekici tonlar
   */
  secondary: {
    main: '#FF6F00',      // Ana turuncu
    light: '#FF8F00',     // Açık turuncu
    dark: '#E65100',      // Koyu turuncu
    container: '#FFE0B2', // Arka plan turuncu
  },

  /**
   * Accent colors - Yeşil tonlar (Vurgu, Başarı)
   */
  accent: {
    main: '#00C853',      // Ana yeşil
    light: '#69F0AE',     // Açık yeşil
    dark: '#00A843',      // Koyu yeşil
  },

  /**
   * Grayscale - Gri tonları
   */
  grayscale: {
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#FAFAFA',
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
    gray700: '#616161',
    gray800: '#424242',
    gray900: '#212121',
  },

  /**
   * Background colors
   */
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
    elevated: '#FFFFFF',
  },

  /**
   * Surface colors
   */
  surface: {
    default: '#F5F5F5',
    variant: '#E0E0E0',
    elevated: '#FFFFFF',
  },

  /**
   * Text colors
   */
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#212121',
    onSurface: '#212121',
  },

  /**
   * Semantic colors - Durum bildirimleri
   */
  semantic: {
    success: '#4CAF50',   // Başarı (yeşil)
    successLight: '#E8F5E9',  // Açık yeşil (arka plan)
    warning: '#FF9800',   // Uyarı (turuncu)
    warningLight: '#FFF3E0',  // Açık turuncu (arka plan)
    error: '#F44336',     // Hata (kırmızı)
    errorLight: '#FFEBEE',    // Açık kırmızı (arka plan)
    info: '#2196F3',      // Bilgi (mavi)
    infoLight: '#E3F2FD',     // Açık mavi (arka plan)
  },

  /**
   * Map specific colors - Harita özel renkleri
   */
  map: {
    // Route colors
    routeActive: '#1E88E5',       // Aktif rota (mavi)
    routeAlternative: '#9E9E9E',  // Alternatif rota (gri)
    routeCompleted: '#4CAF50',    // Tamamlanan rota (yeşil)
    routeHighway: '#FF6F00',      // Otoyol (turuncu)
    
    // Marker colors
    markerTruck: '#FF6F00',       // TIR marker (turuncu)
    markerOrigin: '#4CAF50',      // Başlangıç (yeşil)
    markerDestination: '#F44336', // Varış (kırmızı)
    markerPOI: '#1E88E5',         // İlgi noktası (mavi)
    markerWarning: '#F44336',     // Uyarı (kırmızı)
    markerGasStation: '#4CAF50',  // Benzinlik (yeşil)
    markerRestArea: '#2196F3',    // Dinlenme (mavi)
    markerParking: '#FF9800',     // Park (turuncu)
    
    // Zone colors
    zoneRestricted: 'rgba(244, 67, 54, 0.2)',  // Yasak bölge
    zoneSafe: 'rgba(76, 175, 80, 0.2)',        // Güvenli bölge
    zoneWarning: 'rgba(255, 152, 0, 0.2)',     // Dikkat bölgesi
  },

  /**
   * Border and divider colors
   */
  border: {
    default: '#E0E0E0',
    light: '#F5F5F5',
    dark: '#BDBDBD',
  },

  /**
   * Divider colors
   */
  divider: {
    default: '#BDBDBD',
    light: '#E0E0E0',
  },

  /**
   * Overlay colors
   */
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',
    medium: 'rgba(0, 0, 0, 0.3)',
    light: 'rgba(0, 0, 0, 0.1)',
  },

  /**
   * Shadow colors
   */
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(0, 0, 0, 0.3)',
  },

  /**
   * Transparent
   */
  transparent: 'transparent',

  /**
   * Dark mode colors (future implementation)
   */
  dark: {
    background: {
      default: '#121212',
      paper: '#1E1E1E',
      elevated: '#2C2C2C',
    },
    surface: {
      default: '#1E1E1E',
      variant: '#2C2C2C',
      elevated: '#3C3C3C',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      disabled: '#757575',
    },
    border: {
      default: '#3C3C3C',
      light: '#2C2C2C',
    },
  },
} as const;

/**
 * Type definitions for type-safe color usage
 */
export type ColorPalette = typeof COLORS;
export type PrimaryColor = keyof typeof COLORS.primary;
export type SecondaryColor = keyof typeof COLORS.secondary;
export type GrayscaleColor = keyof typeof COLORS.grayscale;
export type SemanticColor = keyof typeof COLORS.semantic;
export type MapColor = keyof typeof COLORS.map;
