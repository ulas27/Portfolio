/**
 * ProfileScreen Styles
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
  
  // Header
  header: {
    backgroundColor: COLORS.surface.elevated,
    alignItems: 'center',
    paddingVertical: SPACING.sizes.xxl,
    paddingHorizontal: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  avatarPlaceholder: {
    fontSize: 40,
  },
  name: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.primary,
    marginBottom: SPACING.sizes.xs,
  },
  email: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.secondary,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.elevated,
    padding: SPACING.sizes.lg,
    marginTop: SPACING.sizes.md,
    gap: SPACING.sizes.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.sizes.md,
    backgroundColor: COLORS.background.default,
    borderRadius: SPACING.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: SPACING.sizes.xs,
  },
  statValue: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.primary.main,
    marginBottom: SPACING.sizes.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  
  // Menu Section
  menuSection: {
    backgroundColor: COLORS.surface.elevated,
    marginTop: SPACING.sizes.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sizes.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: SPACING.sizes.md,
    width: 32,
    textAlign: 'center',
  },
  menuItemLabel: {
    ...TYPOGRAPHY.styles.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  menuItemDestructive: {
    color: COLORS.semantic.error,
  },
  menuItemChevron: {
    fontSize: 20,
    color: COLORS.text.secondary,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sizes.xl,
  },
});
