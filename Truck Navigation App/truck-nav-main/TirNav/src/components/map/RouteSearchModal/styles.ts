/**
 * RouteSearchModal Styles
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

export const styles = StyleSheet.create({
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sizes.lg,
    paddingVertical: SPACING.sizes.md,
    backgroundColor: COLORS.surface.elevated,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.sizes.sm,
  },
  closeButtonText: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.secondary,
  },
  
  // Content
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.sizes.lg,
  },
  
  // Search Inputs Section
  searchSection: {
    marginBottom: SPACING.sizes.xl,
  },
  inputsContainer: {
    position: 'relative',
  },
  swapButton: {
    position: 'absolute',
    right: -SPACING.sizes.sm,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  swapButtonText: {
    fontSize: 20,
    color: COLORS.grayscale.white,
  },
  
  // Search Input
  searchInputContainer: {
    marginBottom: SPACING.sizes.md,
  },
  searchInputLabel: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sizes.xs,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: SPACING.sizes.md,
    minHeight: 50,
  },
  searchInputWrapperFocused: {
    borderColor: COLORS.primary.main,
    borderWidth: 2,
  },
  searchInputIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
    color: COLORS.text.secondary,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    paddingVertical: SPACING.sizes.sm,
  },
  currentLocationButton: {
    paddingHorizontal: SPACING.sizes.sm,
    paddingVertical: SPACING.sizes.xs,
    backgroundColor: COLORS.primary.light,
    borderRadius: SPACING.radius.sm,
    marginLeft: SPACING.sizes.sm,
  },
  currentLocationButtonText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  clearButton: {
    padding: SPACING.sizes.xs,
    marginLeft: SPACING.sizes.xs,
  },
  clearButtonText: {
    fontSize: 18,
    color: COLORS.text.secondary,
  },
  
  // Search Results
  searchResultsContainer: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.md,
    marginTop: SPACING.sizes.xs,
    maxHeight: 250,
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
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sizes.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.md,
    color: COLORS.text.secondary,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultAddress: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  searchResultDistance: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  searchResultLoading: {
    padding: SPACING.sizes.lg,
    alignItems: 'center',
  },
  searchResultEmpty: {
    padding: SPACING.sizes.lg,
    alignItems: 'center',
  },
  searchResultEmptyText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
  },
  
  // Recent Searches
  recentSection: {
    marginBottom: SPACING.sizes.xl,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sizes.md,
  },
  recentTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
  },
  clearAllButton: {
    padding: SPACING.sizes.xs,
  },
  clearAllButtonText: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.md,
    padding: SPACING.sizes.md,
    marginBottom: SPACING.sizes.sm,
  },
  recentItemIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.md,
    color: COLORS.text.secondary,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemRoute: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  recentItemTime: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  recentItemArrow: {
    fontSize: 16,
    color: COLORS.text.secondary,
    marginHorizontal: SPACING.sizes.xs,
  },
  
  // Route Options
  optionsSection: {
    marginBottom: SPACING.sizes.xl,
  },
  optionsTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.md,
  },
  optionsCard: {
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.md,
    padding: SPACING.sizes.md,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sizes.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionLabel: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  optionDescription: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    marginTop: SPACING.sizes.xs,
  },
  
  // Route Type Selector
  routeTypeContainer: {
    flexDirection: 'row',
    gap: SPACING.sizes.sm,
    marginTop: SPACING.sizes.md,
  },
  routeTypeButton: {
    flex: 1,
    paddingVertical: SPACING.sizes.sm,
    paddingHorizontal: SPACING.sizes.md,
    borderRadius: SPACING.radius.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.surface.default,
    alignItems: 'center',
  },
  routeTypeButtonActive: {
    backgroundColor: COLORS.primary.main,
    borderColor: COLORS.primary.main,
  },
  routeTypeButtonText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  routeTypeButtonTextActive: {
    color: COLORS.grayscale.white,
  },
  
  // Calculate Button
  calculateButtonContainer: {
    padding: SPACING.sizes.lg,
    paddingBottom: Platform.OS === 'ios' ? SPACING.sizes.xxl : SPACING.sizes.lg,
    backgroundColor: COLORS.surface.elevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sizes.xxxl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.sizes.md,
  },
  emptyStateText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
