/**
 * SettingsScreen Styles
 */

import { StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    paddingBottom: SPACING.sizes.xl,
  },
  
  // Section
  section: {
    backgroundColor: COLORS.surface.elevated,
    marginTop: SPACING.sizes.md,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.sizes.lg,
    paddingTop: SPACING.sizes.lg,
    paddingBottom: SPACING.sizes.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemLabel: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  settingItemDescription: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  settingItemDestructive: {
    color: COLORS.semantic.error,
  },
  
  // Toggle
  toggle: {
    marginLeft: SPACING.sizes.md,
  },
  
  // Picker
  pickerContainer: {
    marginLeft: SPACING.sizes.md,
  },
  pickerValue: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.primary.main,
  },
  pickerChevron: {
    fontSize: 20,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sizes.xs,
  },
  
  // Button
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingButtonIcon: {
    fontSize: 20,
    color: COLORS.text.secondary,
  },
  
  // Version
  versionContainer: {
    alignItems: 'center',
    padding: SPACING.sizes.xl,
  },
  versionText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  
  // Modal (for picker)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface.elevated,
    borderTopLeftRadius: SPACING.radius.xl,
    borderTopRightRadius: SPACING.radius.xl,
    paddingBottom: SPACING.sizes.xxl,
  },
  modalHeader: {
    padding: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  modalOptionLast: {
    borderBottomWidth: 0,
  },
  modalOptionLabel: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
  },
  modalOptionSelected: {
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  modalOptionCheck: {
    fontSize: 20,
    color: COLORS.primary.main,
  },
});
