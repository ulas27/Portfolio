/**
 * Loading Component Types
 */

export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingType = 'spinner' | 'dots' | 'skeleton';

export interface LoadingProps {
  /**
   * Loading size
   * @default 'medium'
   */
  size?: LoadingSize;

  /**
   * Loading type
   * @default 'spinner'
   */
  type?: LoadingType;

  /**
   * Custom color
   */
  color?: string;

  /**
   * Loading message
   */
  message?: string;

  /**
   * Full screen overlay
   * @default false
   */
  fullScreen?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}

export interface SkeletonProps {
  /**
   * Skeleton width
   */
  width?: number | string;

  /**
   * Skeleton height
   */
  height?: number | string;

  /**
   * Border radius
   */
  borderRadius?: number;

  /**
   * Custom style
   */
  style?: any;
}
