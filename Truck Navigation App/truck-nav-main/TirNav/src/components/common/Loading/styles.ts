/**
 * Loading Component Styles
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay.dark,
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    marginTop: SPACING.sizes.md,
    textAlign: 'center',
  },
  messageFullScreen: {
    color: COLORS.text.onPrimary,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  skeleton: {
    backgroundColor: COLORS.grayscale.gray200,
    overflow: 'hidden',
  },
});
