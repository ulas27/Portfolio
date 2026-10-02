/**
 * ErrorView Component
 * 
 * Error state display component
 * - Error icon/illustration
 * - Error message
 * - Retry button
 * - Customizable
 * 
 * @example
 * ```tsx
 * <ErrorView
 *   message="Bir hata oluştu. Lütfen tekrar deneyin."
 *   onRetry={handleRetry}
 * />
 * ```
 */

import React from 'react';
import { View, Text } from 'react-native';
import Button from '../Button';
import { styles } from './styles';
import type { ErrorViewProps } from './types';

/**
 * ErrorView Component
 */
export default function ErrorView({
  message,
  onRetry,
  illustration,
  retryButtonText = 'Tekrar Dene',
  showIcon = true,
  testID,
}: ErrorViewProps) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Illustration or Icon */}
      {illustration ? (
        <View style={styles.iconContainer}>{illustration}</View>
      ) : showIcon ? (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
      ) : null}

      {/* Error Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Retry Button */}
      {onRetry && (
        <Button
          title={retryButtonText}
          onPress={onRetry}
          variant="primary"
          style={styles.retryButton}
        />
      )}
    </View>
  );
}
