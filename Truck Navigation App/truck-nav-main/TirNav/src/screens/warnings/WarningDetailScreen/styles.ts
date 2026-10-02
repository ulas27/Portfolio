/**
 * WarningDetailScreen Styles
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  scrollContent: {
    paddingBottom: SPACING.sizes.xl,
  },
  
  // Loading & Error
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sizes.xl,
  },
  
  // Warning Header
  headerContainer: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: SPACING.sizes.md,
  },
  headerLabel: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.primary,
  },
  
  // Image
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: COLORS.surface.elevated,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: SPACING.sizes.sm,
    right: SPACING.sizes.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sizes.sm,
    paddingVertical: SPACING.sizes.xs,
    borderRadius: SPACING.radius.sm,
  },
  imageOverlayText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.grayscale.white,
  },
  
  // Description
  descriptionContainer: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginTop: SPACING.sizes.md,
  },
  descriptionLabel: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sizes.sm,
  },
  descriptionText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  
  // Warning Info
  infoContainer: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginTop: SPACING.sizes.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sizes.md,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  infoTextSecondary: {
    color: COLORS.text.secondary,
  },
  
  // Mini Map
  miniMapContainer: {
    height: 200,
    backgroundColor: COLORS.surface.elevated,
    marginTop: SPACING.sizes.md,
    overflow: 'hidden',
  },
  miniMap: {
    flex: 1,
  },
  miniMapOverlay: {
    position: 'absolute',
    bottom: SPACING.sizes.md,
    left: SPACING.sizes.md,
    right: SPACING.sizes.md,
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.md,
    borderRadius: SPACING.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  miniMapOverlayText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  miniMapOverlayIcon: {
    fontSize: 20,
    marginLeft: SPACING.sizes.sm,
  },
  
  // Vote Container
  voteContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginTop: SPACING.sizes.md,
    gap: SPACING.sizes.md,
  },
  voteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sizes.md,
    borderRadius: SPACING.radius.lg,
    borderWidth: 2,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.surface.default,
  },
  voteButtonActive: {
    borderColor: COLORS.primary.main,
    backgroundColor: COLORS.primary.light,
  },
  voteButtonUp: {
    // Can add specific styling
  },
  voteButtonUpActive: {
    borderColor: COLORS.semantic.success,
    backgroundColor: COLORS.semantic.successLight || COLORS.semantic.success + '20',
  },
  voteButtonDown: {
    // Can add specific styling
  },
  voteButtonDownActive: {
    borderColor: COLORS.semantic.error,
    backgroundColor: COLORS.semantic.errorLight,
  },
  voteIcon: {
    fontSize: 24,
    marginRight: SPACING.sizes.sm,
  },
  voteCount: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
  },
  voteCountActive: {
    color: COLORS.primary.main,
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    padding: SPACING.sizes.lg,
    gap: SPACING.sizes.md,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: COLORS.semantic.error,
  },
  
  // Stats
  statsContainer: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginTop: SPACING.sizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
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
  
  // Empty State
  emptyState: {
    alignItems: 'center',
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
    marginBottom: SPACING.sizes.lg,
  },
});
