/**
 * AddWarningScreen Styles
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    padding: SPACING.sizes.lg,
    paddingBottom: SPACING.sizes.xxxl,
  },
  
  // Section
  section: {
    marginBottom: SPACING.sizes.xl,
  },
  sectionLabel: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.md,
  },
  sectionRequired: {
    color: COLORS.semantic.error,
  },
  
  // Warning Type Grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sizes.md,
    marginBottom: SPACING.sizes.md,
  },
  typeButton: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    padding: SPACING.sizes.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  typeButtonSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light,
    borderWidth: 3,
  },
  typeButtonIcon: {
    fontSize: 40,
    marginBottom: SPACING.sizes.sm,
  },
  typeButtonLabel: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  typeButtonLabelSelected: {
    color: COLORS.primary.main,
  },
  typeButtonDescription: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.sizes.xs,
  },
  
  // Location Display
  locationCard: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    padding: SPACING.sizes.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sizes.sm,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
  },
  locationTitle: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    flex: 1,
  },
  locationAddress: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  locationCoordinates: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  changeLocationButton: {
    marginTop: SPACING.sizes.sm,
  },
  
  // Description Input
  descriptionInput: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: SPACING.sizes.md,
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  descriptionInputFocused: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
  },
  charCounter: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: SPACING.sizes.xs,
  },
  charCounterLimit: {
    color: COLORS.semantic.error,
  },
  
  // Image Section
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: SPACING.radius.lg,
    backgroundColor: COLORS.surface.elevated,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: SPACING.sizes.sm,
    right: SPACING.sizes.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  removeImageIcon: {
    fontSize: 20,
    color: COLORS.grayscale.white,
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    borderStyle: 'dashed',
    padding: SPACING.sizes.lg,
  },
  addImageIcon: {
    fontSize: 24,
    marginRight: SPACING.sizes.sm,
  },
  addImageText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  
  // Info Box
  infoBox: {
    backgroundColor: COLORS.semantic.infoLight,
    borderRadius: SPACING.radius.md,
    padding: SPACING.sizes.md,
    marginBottom: SPACING.sizes.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
  },
  infoText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    flex: 1,
  },
  
  // Submit Button
  submitButton: {
    marginTop: SPACING.sizes.xl,
  },
  
  // Action Sheet (for image picker)
  actionSheetContainer: {
    backgroundColor: COLORS.surface.elevated,
    borderTopLeftRadius: SPACING.radius.xl,
    borderTopRightRadius: SPACING.radius.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.sizes.xxl : SPACING.sizes.lg,
  },
  actionSheetHeader: {
    padding: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  actionSheetTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  actionSheetOptionLast: {
    borderBottomWidth: 0,
  },
  actionSheetOptionIcon: {
    fontSize: 24,
    marginRight: SPACING.sizes.md,
  },
  actionSheetOptionText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  actionSheetCancel: {
    padding: SPACING.sizes.lg,
    alignItems: 'center',
    marginTop: SPACING.sizes.sm,
  },
  actionSheetCancelText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.semantic.error,
    fontWeight: '600',
  },
});
