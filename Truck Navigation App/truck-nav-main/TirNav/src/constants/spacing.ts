/**
 * Spacing constants for consistent layout
 * 
 * 8px base unit system (Material Design standard)
 * Tüm spacing değerleri 8'in katları olarak tanımlanmıştır
 * 
 * @example
 * ```tsx
 * import { SPACING } from '@constants';
 * 
 * <View style={{ 
 *   padding: SPACING.sizes.md,
 *   borderRadius: SPACING.radius.md 
 * }} />
 * ```
 */

export const SPACING = {
  /**
   * Base unit - Tüm spacing değerlerinin temel birimi
   */
  unit: 8,

  /**
   * Common spacing sizes
   * xs (4px) → sm (8px) → md (16px) → lg (24px) → xl (32px) → xxl (40px) → xxxl (48px)
   */
  sizes: {
    xs: 4,    // Extra small - 0.5 unit
    sm: 8,    // Small - 1 unit
    md: 16,   // Medium - 2 units
    lg: 24,   // Large - 3 units
    xl: 32,   // Extra large - 4 units
    xxl: 40,  // 2X large - 5 units
    xxxl: 48, // 3X large - 6 units
  },

  /**
   * Screen padding/margin values
   */
  screen: {
    horizontal: 16,  // Yatay padding
    vertical: 16,    // Dikey padding
    top: 16,         // Üst padding
    bottom: 16,      // Alt padding
  },

  /**
   * Component specific spacing
   */
  component: {
    card: {
      padding: 16,
      margin: 12,
      gap: 12,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    input: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 8,
    },
    listItem: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
  },

  /**
   * Icon sizes
   */
  icon: {
    xs: 16,   // Extra small icon
    sm: 20,   // Small icon
    md: 24,   // Medium icon (default)
    lg: 32,   // Large icon
    xl: 48,   // Extra large icon
    xxl: 64,  // 2X large icon
  },

  /**
   * Border radius values
   */
  radius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,  // Tam yuvarlak
  },

  /**
   * Container padding/margin
   */
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxWidth: 1200,
  },

  /**
   * Map specific spacing
   */
  map: {
    controlSize: 48,      // Harita kontrol buton boyutu
    controlMargin: 16,    // Harita kontrol margin
    markerSize: 40,       // Marker boyutu
    clusterSize: 50,      // Cluster marker boyutu
    padding: {
      top: 100,
      bottom: 100,
      left: 50,
      right: 50,
    },
  },

  /**
   * Bottom tab bar
   */
  tabBar: {
    height: 60,
    iconSize: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  /**
   * Header
   */
  header: {
    height: 56,
    paddingHorizontal: 16,
    iconSize: 24,
  },

  /**
   * Modal/Dialog
   */
  modal: {
    padding: 24,
    borderRadius: 16,
    maxWidth: 400,
  },

  /**
   * Gap values (for flexbox gap)
   */
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
} as const;

/**
 * Type definitions for type-safe spacing usage
 */
export type SpacingSystem = typeof SPACING;
export type SpacingSize = keyof typeof SPACING.sizes;
export type BorderRadius = keyof typeof SPACING.radius;
export type IconSize = keyof typeof SPACING.icon;
