/**
 * EmptyState Component
 * 
 * Empty state display component
 * - Empty icon/illustration
 * - Title and message
 * - Optional action button
 * - Customizable
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   title="Henüz Rota Yok"
 *   message="Yeni bir rota oluşturmak için başlayın."
 *   actionButtonText="Rota Oluştur"
 *   onAction={handleCreateRoute}
 * />
 * ```
 */

import React from 'react';
import { View, Text } from 'react-native';
import Button from '../Button';
import { styles } from './styles';
import type { EmptyStateProps } from './types';

/**
 * EmptyState Component
 */
export default function EmptyState({
  title,
  message,
  illustration,
  actionButtonText,
  onAction,
  showIcon = true,
  testID,
}: EmptyStateProps) {
  return (
    <View style={styles.container} testID={testID}>
      {/* Illustration or Icon */}
      {illustration ? (
        <View style={styles.iconContainer}>{illustration}</View>
      ) : showIcon ? (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📭</Text>
        </View>
      ) : null}

      {/* Title */}
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Action Button */}
      {actionButtonText && onAction && (
        <Button
          title={actionButtonText}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </View>
  );
}
