/**
 * ErrorView Component Styles
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
  },
  message: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sizes.xl,
    maxWidth: 300,
  },
  retryButton: {
    minWidth: 150,
  },
});
