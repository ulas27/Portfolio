/**
 * Button Component Styles
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import type { ButtonVariant, ButtonSize } from './types';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SPACING.radius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: SPACING.sizes.sm,
  },
  iconRight: {
    marginLeft: SPACING.sizes.sm,
  },
  text: {
    ...TYPOGRAPHY.styles.button,
  },
});

/**
 * Get variant-specific styles
 */
export const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: COLORS.primary.main,
        },
        text: {
          color: COLORS.text.onPrimary,
        },
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: COLORS.secondary.main,
        },
        text: {
          color: COLORS.text.onSecondary,
        },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: COLORS.primary.main,
        },
        text: {
          color: COLORS.primary.main,
        },
      };
    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
        },
        text: {
          color: COLORS.primary.main,
        },
      };
    default:
      return {
        container: {
          backgroundColor: COLORS.primary.main,
        },
        text: {
          color: COLORS.text.onPrimary,
        },
      };
  }
};

/**
 * Get size-specific styles
 */
export const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingHorizontal: SPACING.sizes.md,
          paddingVertical: SPACING.sizes.sm,
          minHeight: 36,
        },
        text: {
          fontSize: TYPOGRAPHY.fontSize.sm,
        },
      };
    case 'medium':
      return {
        container: {
          paddingHorizontal: SPACING.sizes.lg,
          paddingVertical: SPACING.sizes.md,
          minHeight: 48,
        },
        text: {
          fontSize: TYPOGRAPHY.fontSize.md,
        },
      };
    case 'large':
      return {
        container: {
          paddingHorizontal: SPACING.sizes.xl,
          paddingVertical: SPACING.sizes.lg,
          minHeight: 56,
        },
        text: {
          fontSize: TYPOGRAPHY.fontSize.lg,
        },
      };
    default:
      return {
        container: {
          paddingHorizontal: SPACING.sizes.lg,
          paddingVertical: SPACING.sizes.md,
          minHeight: 48,
        },
        text: {
          fontSize: TYPOGRAPHY.fontSize.md,
        },
      };
  }
};
