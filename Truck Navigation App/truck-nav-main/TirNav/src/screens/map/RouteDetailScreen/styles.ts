/**
 * RouteDetailScreen Styles
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    paddingBottom: 100, // Space for fixed buttons
  },
  
  // Loading & Error
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sizes.xl,
  },
  
  // Route Summary Card
  summaryCard: {
    backgroundColor: COLORS.surface.elevated,
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sizes.lg,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    marginRight: SPACING.sizes.xl,
  },
  statValue: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.primary.main,
    marginBottom: SPACING.sizes.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border.default,
    marginVertical: SPACING.sizes.md,
  },
  summaryLocations: {
    gap: SPACING.sizes.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
    marginTop: 2,
  },
  locationText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  
  // Map Preview
  mapPreviewContainer: {
    height: 300,
    backgroundColor: COLORS.surface.elevated,
    marginBottom: SPACING.sizes.md,
    overflow: 'hidden',
  },
  mapPreview: {
    flex: 1,
  },
  mapPreviewOverlay: {
    position: 'absolute',
    bottom: SPACING.sizes.md,
    right: SPACING.sizes.md,
    backgroundColor: COLORS.surface.elevated,
    paddingHorizontal: SPACING.sizes.md,
    paddingVertical: SPACING.sizes.sm,
    borderRadius: SPACING.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mapPreviewOverlayText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.primary,
    marginLeft: SPACING.sizes.xs,
  },
  
  // Alternative Routes
  alternativeSection: {
    marginBottom: SPACING.sizes.md,
  },
  alternativeSectionHeader: {
    paddingHorizontal: SPACING.sizes.lg,
    paddingVertical: SPACING.sizes.md,
  },
  alternativeSectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
  },
  alternativeCarousel: {
    paddingLeft: SPACING.sizes.lg,
  },
  alternativeCard: {
    width: 200,
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    padding: SPACING.sizes.md,
    marginRight: SPACING.sizes.md,
    borderWidth: 2,
    borderColor: COLORS.border.default,
  },
  alternativeCardSelected: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light,
  },
  alternativeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sizes.sm,
  },
  alternativeCardBadge: {
    paddingHorizontal: SPACING.sizes.sm,
    paddingVertical: SPACING.sizes.xs,
    borderRadius: SPACING.radius.sm,
    backgroundColor: COLORS.primary.main,
  },
  alternativeCardBadgeText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.grayscale.white,
    fontWeight: '600',
  },
  alternativeCardStats: {
    gap: SPACING.sizes.sm,
  },
  alternativeCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alternativeCardStatIcon: {
    fontSize: 16,
    marginRight: SPACING.sizes.xs,
  },
  alternativeCardStatText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
  },
  alternativeCardDiff: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.semantic.success,
    marginLeft: SPACING.sizes.xs,
  },
  alternativeCardDiffNegative: {
    color: COLORS.semantic.error,
  },
  
  // Warnings Section
  warningsSection: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginBottom: SPACING.sizes.md,
  },
  warningsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sizes.md,
  },
  warningsSectionIcon: {
    fontSize: 24,
    marginRight: SPACING.sizes.sm,
  },
  warningsSectionTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.sizes.md,
    backgroundColor: COLORS.background.default,
    borderRadius: SPACING.radius.md,
    marginBottom: SPACING.sizes.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.semantic.warning,
  },
  warningItemCritical: {
    borderLeftColor: COLORS.semantic.error,
    backgroundColor: COLORS.semantic.errorLight,
  },
  warningItemIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.md,
  },
  warningItemContent: {
    flex: 1,
  },
  warningItemType: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  warningItemMessage: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sizes.xs,
  },
  warningItemDistance: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  
  // Instructions
  instructionsSection: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginBottom: SPACING.sizes.md,
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sizes.sm,
  },
  instructionsTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
  },
  instructionsToggle: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  instructionsList: {
    marginTop: SPACING.sizes.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  instructionItemLast: {
    borderBottomWidth: 0,
  },
  instructionIndex: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sizes.md,
  },
  instructionIndexText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  instructionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sizes.md,
  },
  instructionDistance: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  instructionStreet: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  
  // Action Buttons
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.sizes.xxl : SPACING.sizes.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.dark,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  primaryButton: {
    marginBottom: SPACING.sizes.sm,
  },
  secondaryButtons: {
    flexDirection: 'row',
    gap: SPACING.sizes.sm,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sizes.md,
    borderRadius: SPACING.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.surface.default,
  },
  iconButtonIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.xs,
  },
  iconButtonText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sizes.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.sizes.lg,
  },
  emptyStateText: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
