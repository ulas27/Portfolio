/**
 * Input Component Types
 */

import type { TextInputProps, ViewStyle } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Input label
   */
  label?: string;

  /**
   * Input value
   */
  value: string;

  /**
   * Change handler
   */
  onChangeText: (text: string) => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Error message
   */
  error?: string;

  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;

  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;

  /**
   * Secure text entry (password)
   * @default false
   */
  secureTextEntry?: boolean;

  /**
   * Multiline input
   * @default false
   */
  multiline?: boolean;

  /**
   * Maximum character length
   */
  maxLength?: number;

  /**
   * Show character counter
   * @default false
   */
  showCharacterCount?: boolean;

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom input style
   */
  inputStyle?: ViewStyle;

  /**
   * Test ID for testing
   */
  testID?: string;
}
