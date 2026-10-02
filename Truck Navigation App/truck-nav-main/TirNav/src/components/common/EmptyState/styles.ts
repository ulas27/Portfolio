/**
 * EmptyState Component Styles
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sizes.xl,
    backgroundColor: COLORS.background.default,
  },
  iconContainer: {
    marginBottom: SPACING.sizes.lg,
  },
  icon: {
    fontSize: 64,
    opacity: 0.5,
  },
  title: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sizes.sm,
  },
  message: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sizes.xl,
    maxWidth: 300,
  },
  actionButton: {
    minWidth: 150,
  },
});
