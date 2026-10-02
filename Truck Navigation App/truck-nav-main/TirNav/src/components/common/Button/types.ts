/**
 * Button Component Types
 */

import type { ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps {
  /**
   * Button text
   */
  title: string;

  /**
   * Press handler
   */
  onPress: () => void;

  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @default 'medium'
   */
  size?: ButtonSize;

  /**
   * Loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Icon element (left side)
   */
  icon?: React.ReactNode;

  /**
   * Icon element (right side)
   */
  iconRight?: React.ReactNode;

  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Custom background color
   */
  backgroundColor?: string;

  /**
   * Custom text color
   */
  textColor?: string;

  /**
   * Custom style
   */
  style?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;

  /**
   * Accessibility label
   */
  accessibilityLabel?: string;
}
