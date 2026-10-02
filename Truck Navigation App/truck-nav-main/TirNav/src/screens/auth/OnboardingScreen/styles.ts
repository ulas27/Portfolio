/**
 * OnboardingScreen Styles
 */

import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.sizes.lg,
    paddingTop: SPACING.sizes.xl,
    paddingBottom: SPACING.sizes.md,
    zIndex: 10,
  },
  skipButton: {
    paddingHorizontal: SPACING.sizes.md,
    paddingVertical: SPACING.sizes.sm,
  },
  skipButtonText: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  carouselContainer: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sizes.xl,
  },
  illustrationContainer: {
    width: width * 0.6,
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sizes.xxl,
  },
  illustration: {
    fontSize: 120,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.sizes.lg,
  },
  title: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sizes.md,
  },
  description: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: SPACING.sizes.xl,
    paddingBottom: SPACING.sizes.xxl,
    paddingTop: SPACING.sizes.lg,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sizes.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    height: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    flex: 1,
  },
});
