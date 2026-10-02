/**
 * ErrorView Component Types
 */

export interface ErrorViewProps {
  /**
   * Error message
   */
  message: string;

  /**
   * Retry handler
   */
  onRetry?: () => void;

  /**
   * Custom illustration/icon
   */
  illustration?: React.ReactNode;

  /**
   * Custom retry button text
   * @default 'Tekrar Dene'
   */
  retryButtonText?: string;

  /**
   * Show default error icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}
