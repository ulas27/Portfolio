/**
 * Card Component Types
 */

import type { ViewStyle } from 'react-native';

export type CardPadding = 'none' | 'small' | 'medium' | 'large';
export type CardElevation = 'none' | 'small' | 'medium' | 'large';

export interface CardProps {
  /**
   * Card content
   */
  children: React.ReactNode;

  /**
   * Padding variant
   * @default 'medium'
   */
  padding?: CardPadding;

  /**
   * Shadow/elevation level
   * @default 'small'
   */
  elevation?: CardElevation;

  /**
   * Enable press feedback
   * @default false
   */
  pressable?: boolean;

  /**
   * Press handler (only if pressable)
   */
  onPress?: () => void;

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}
