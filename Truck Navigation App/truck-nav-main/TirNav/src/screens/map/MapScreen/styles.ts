/**
 * MapScreen Styles
 */

import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
  },
  
  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sizes.md,
    paddingTop: SPACING.sizes.xl,
    paddingBottom: SPACING.sizes.md,
    backgroundColor: COLORS.background.default,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  topBarButton: {
    width: 40,
    height: 40,
    borderRadius: SPACING.radius.md,
    backgroundColor: COLORS.surface.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.primary.main,
  },
  
  // Search Bar
  searchBarContainer: {
    position: 'absolute',
    top: 100,
    left: SPACING.sizes.md,
    right: SPACING.sizes.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderRadius: SPACING.radius.lg,
    paddingHorizontal: SPACING.sizes.md,
    paddingVertical: SPACING.sizes.md,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sizes.sm,
  },
  searchText: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
    flex: 1,
  },
  
  // Floating Action Buttons
  fabContainer: {
    position: 'absolute',
    right: SPACING.sizes.md,
    bottom: 200,
    gap: SPACING.sizes.sm,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  fabPrimary: {
    backgroundColor: COLORS.primary.main,
  },
  fabIcon: {
    fontSize: 24,
  },
  
  // Warning Marker
  markerContainer: {
    alignItems: 'center',
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface.elevated,
    borderWidth: 2,
    borderColor: COLORS.semantic.error,
  },
  markerIconText: {
    fontSize: 20,
  },
  markerCallout: {
    width: 200,
    padding: SPACING.sizes.sm,
  },
  markerCalloutTitle: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  markerCalloutDescription: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  
  // Bottom Sheet
  bottomSheetContainer: {
    backgroundColor: COLORS.surface.elevated,
    borderTopLeftRadius: SPACING.radius.xl,
    borderTopRightRadius: SPACING.radius.xl,
  },
  bottomSheetHandle: {
    backgroundColor: COLORS.grayscale.gray300,
  },
  bottomSheetContent: {
    padding: SPACING.sizes.md,
  },
  bottomSheetTitle: {
    ...TYPOGRAPHY.styles.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.md,
  },
  
  // Warning List
  warningList: {
    gap: SPACING.sizes.sm,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
    borderRadius: SPACING.radius.md,
    padding: SPACING.sizes.md,
    gap: SPACING.sizes.md,
  },
  warningItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.semantic.errorLight,
  },
  warningItemIconText: {
    fontSize: 20,
  },
  warningItemContent: {
    flex: 1,
  },
  warningItemTitle: {
    ...TYPOGRAPHY.styles.label,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  warningItemDescription: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
  },
  warningItemDistance: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.sizes.xxl,
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
