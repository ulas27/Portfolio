/**
 * RouteHistoryScreen Styles
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  
  // Search Bar
  searchContainer: {
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  searchInput: {
    backgroundColor: COLORS.background.default,
    borderRadius: SPACING.radius.lg,
    paddingHorizontal: SPACING.sizes.md,
    paddingVertical: SPACING.sizes.sm,
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
  },
  
  // Filter Chips
  filterContainer: {
    backgroundColor: COLORS.surface.elevated,
    paddingHorizontal: SPACING.sizes.md,
    paddingVertical: SPACING.sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  filterChip: {
    paddingHorizontal: SPACING.sizes.md,
    paddingVertical: SPACING.sizes.sm,
    borderRadius: SPACING.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.surface.default,
    marginRight: SPACING.sizes.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  filterChipLabel: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  filterChipLabelActive: {
    color: COLORS.grayscale.white,
  },
  
  // Section Header
  sectionHeader: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.default,
    paddingHorizontal: SPACING.sizes.lg,
    paddingVertical: SPACING.sizes.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Route Card
  routeCard: {
    backgroundColor: COLORS.surface.elevated,
    marginHorizontal: SPACING.sizes.md,
    marginVertical: SPACING.sizes.xs,
    borderRadius: SPACING.radius.lg,
    padding: SPACING.sizes.md,
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
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sizes.sm,
  },
  routeCardIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
  },
  routeCardLocations: {
    flex: 1,
  },
  routeCardLocation: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
  },
  routeCardArrow: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.sizes.xs,
  },
  routeCardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sizes.sm,
    gap: SPACING.sizes.md,
  },
  routeCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeCardStatIcon: {
    fontSize: 16,
    marginRight: SPACING.sizes.xs,
  },
  routeCardStatText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  routeCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sizes.sm,
    paddingTop: SPACING.sizes.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  routeCardTime: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  reuseButton: {
    paddingHorizontal: SPACING.sizes.sm,
    paddingVertical: SPACING.sizes.xs,
    backgroundColor: COLORS.primary.light,
    borderRadius: SPACING.radius.sm,
  },
  reuseButtonText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  
  // Swipeable Delete
  deleteAction: {
    backgroundColor: COLORS.semantic.error,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.sizes.lg,
    marginVertical: SPACING.sizes.xs,
    borderRadius: SPACING.radius.lg,
    marginRight: SPACING.sizes.md,
  },
  deleteIcon: {
    fontSize: 24,
    color: COLORS.grayscale.white,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sizes.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.sizes.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.sizes.sm,
  },
  emptyDescription: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.sizes.xl,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
