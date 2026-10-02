/**
 * Input Component Styles
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sizes.md,
  },
  label: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.default,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: SPACING.radius.md,
    paddingHorizontal: SPACING.sizes.md,
    minHeight: 48,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: COLORS.semantic.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    backgroundColor: COLORS.grayscale.gray100,
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: SPACING.sizes.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sizes.sm,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sizes.sm,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.sizes.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sizes.xs,
  },
  errorText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.semantic.error,
    flex: 1,
  },
  characterCount: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    marginTop: SPACING.sizes.xs,
    textAlign: 'right',
  },
  characterCountError: {
    color: COLORS.semantic.error,
  },
});
