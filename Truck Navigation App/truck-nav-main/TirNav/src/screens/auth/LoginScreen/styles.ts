/**
 * LoginScreen Styles
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.sizes.xl,
    paddingVertical: SPACING.sizes.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.sizes.xxl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.sizes.md,
  },
  title: {
    ...TYPOGRAPHY.styles.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.sizes.xl,
  },
  inputContainer: {
    marginBottom: SPACING.sizes.lg,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginTop: -SPACING.sizes.sm,
    marginBottom: SPACING.sizes.lg,
  },
  forgotPasswordText: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.primary.main,
  },
  loginButton: {
    marginBottom: SPACING.sizes.md,
  },
  errorContainer: {
    backgroundColor: COLORS.semantic.errorLight,
    borderRadius: SPACING.radius.md,
    padding: SPACING.sizes.md,
    marginBottom: SPACING.sizes.lg,
  },
  errorText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.semantic.error,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.sizes.xl,
  },
  footerText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
  },
  footerLink: {
    ...TYPOGRAPHY.styles.button,
    color: COLORS.primary.main,
    marginLeft: SPACING.sizes.xs,
  },
});
