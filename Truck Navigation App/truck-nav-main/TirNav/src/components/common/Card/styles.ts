/**
 * Card Component Styles
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING } from '@constants';
import type { CardPadding, CardElevation } from './types';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    overflow: 'hidden',
  },
});

/**
 * Get padding styles
 */
export const getPaddingStyles = (padding: CardPadding) => {
  switch (padding) {
    case 'none':
      return { padding: 0 };
    case 'small':
      return { padding: SPACING.sizes.sm };
    case 'medium':
      return { padding: SPACING.sizes.md };
    case 'large':
      return { padding: SPACING.sizes.lg };
    default:
      return { padding: SPACING.sizes.md };
  }
};

/**
 * Get elevation/shadow styles
 */
export const getElevationStyles = (elevation: CardElevation) => {
  switch (elevation) {
    case 'none':
      return {};
    case 'small':
      return Platform.select({
        ios: {
          shadowColor: COLORS.shadow.light,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      });
    case 'medium':
      return Platform.select({
        ios: {
          shadowColor: COLORS.shadow.medium,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      });
    case 'large':
      return Platform.select({
        ios: {
          shadowColor: COLORS.shadow.dark,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      });
    default:
      return Platform.select({
        ios: {
          shadowColor: COLORS.shadow.light,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      });
  }
};
