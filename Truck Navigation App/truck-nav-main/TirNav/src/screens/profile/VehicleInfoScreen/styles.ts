/**
 * VehicleInfoScreen Styles
 */

import { StyleSheet } from 'react-native';
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
  header: {
    marginBottom: SPACING.sizes.xl,
  },
  title: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: SPACING.sizes.xxl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.md,
  },
  card: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    padding: SPACING.sizes.lg,
    marginBottom: SPACING.sizes.md,
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
  
  // Slider Input
  sliderContainer: {
    marginBottom: SPACING.sizes.xl,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sizes.sm,
  },
  sliderLabel: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
  },
  sliderValue: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.primary.main,
  },
  sliderUnit: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sizes.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sizes.xs,
  },
  sliderRangeText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  
  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sizes.md,
  },
  toggleLabel: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    flex: 1,
  },
  toggleDescription: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    marginTop: SPACING.sizes.xs,
  },
  
  // Picker
  pickerContainer: {
    marginBottom: SPACING.sizes.lg,
  },
  pickerLabel: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.sm,
  },
  picker: {
    backgroundColor: COLORS.surface.default,
    borderRadius: SPACING.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  
  // Buttons
  buttonContainer: {
    gap: SPACING.sizes.md,
    marginTop: SPACING.sizes.lg,
  },
  saveButton: {
    marginBottom: SPACING.sizes.sm,
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
  
  // Warning
  warningBox: {
    backgroundColor: COLORS.semantic.warningLight,
    borderRadius: SPACING.radius.md,
    padding: SPACING.sizes.md,
    marginTop: SPACING.sizes.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
  },
  warningText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.semantic.warning,
    flex: 1,
  },
});
