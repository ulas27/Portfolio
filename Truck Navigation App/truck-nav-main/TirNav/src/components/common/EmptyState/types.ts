/**
 * EmptyState Component Types
 */

export interface EmptyStateProps {
  /**
   * Empty state title
   */
  title?: string;

  /**
   * Empty state message
   */
  message: string;

  /**
   * Custom illustration/icon
   */
  illustration?: React.ReactNode;

  /**
   * Action button text
   */
  actionButtonText?: string;

  /**
   * Action button handler
   */
  onAction?: () => void;

  /**
   * Show default empty icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}
