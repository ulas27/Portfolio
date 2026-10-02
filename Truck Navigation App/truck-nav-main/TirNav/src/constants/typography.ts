/**
 * Typography constants for consistent text styling
 * 
 * Material Design 3 type scale ile uyumlu
 * System font kullanımı (iOS: San Francisco, Android: Roboto)
 * 
 * @example
 * ```tsx
 * import { TYPOGRAPHY } from '@constants';
 * 
 * <Text style={TYPOGRAPHY.styles.h1}>Başlık</Text>
 * <Text style={{ 
 *   fontSize: TYPOGRAPHY.fontSize.md,
 *   fontWeight: TYPOGRAPHY.fontWeight.bold 
 * }}>Metin</Text>
 * ```
 */

export const TYPOGRAPHY = {
  /**
   * Font families
   * System font kullanımı - platform native fontları
   */
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
    // Custom font eklemek için:
    // custom: 'YourCustomFont-Regular',
  },

  /**
   * Font weights
   * iOS ve Android'de desteklenen standart ağırlıklar
   */
  fontWeight: {
    thin: '100' as const,
    extraLight: '200' as const,
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },

  /**
   * Font sizes
   * 10px → 12px → 14px → 16px → 18px → 20px → 24px → 32px → 40px
   */
  fontSize: {
    xs: 10,         // Extra small
    sm: 12,         // Small
    md: 14,         // Medium (default body)
    lg: 16,         // Large
    xl: 18,         // Extra large
    xxl: 20,        // 2X large
    xxxl: 24,       // 3X large
    display: 32,    // Display
    displayLarge: 40, // Large display
  },

  /**
   * Line heights
   * Okunabilirlik için optimize edilmiş
   */
  lineHeight: {
    tight: 1.2,     // Başlıklar için
    normal: 1.5,    // Normal metin için
    relaxed: 1.75,  // Uzun metinler için
  },

  /**
   * Letter spacing
   * Karakter arası boşluk
   */
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  /**
   * Pre-composed text styles
   * Hazır metin stilleri - direkt kullanıma hazır
   */
  styles: {
    /**
     * Display styles - Büyük başlıklar
     */
    displayLarge: {
      fontSize: 40,
      fontWeight: '700' as const,
      lineHeight: 48,
      letterSpacing: -0.5,
    },
    display: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.25,
    },
    displaySmall: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 36,
    },

    /**
     * Heading styles - Başlıklar
     */
    h1: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h2: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    h4: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    h5: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
    h6: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 18,
    },

    /**
     * Body styles - Gövde metinleri
     */
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },

    /**
     * Label styles - Etiketler
     */
    labelLarge: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
    },

    /**
     * Caption styles - Açıklama metinleri
     */
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    captionSmall: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 14,
    },

    /**
     * Button styles - Buton metinleri
     */
    buttonLarge: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },
    buttonSmall: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
      letterSpacing: 0.5,
      textTransform: 'uppercase' as const,
    },

    /**
     * Overline style - Üst çizgi metni
     */
    overline: {
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 16,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },

    /**
     * Link style - Bağlantı metni
     */
    link: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      textDecorationLine: 'underline' as const,
    },
  },
} as const;

/**
 * Type definitions for type-safe typography usage
 */
export type TypographySystem = typeof TYPOGRAPHY;
export type FontWeight = keyof typeof TYPOGRAPHY.fontWeight;
export type FontSize = keyof typeof TYPOGRAPHY.fontSize;
export type TextStyle = keyof typeof TYPOGRAPHY.styles;
