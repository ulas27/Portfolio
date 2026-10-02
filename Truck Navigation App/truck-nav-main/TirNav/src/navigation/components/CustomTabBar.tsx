/**
 * Custom Tab Bar
 * 
 * Özelleştirilmiş bottom tab bar
 * - Güzel animasyonlar
 * - Icon + Label
 * - Active state gösterimi
 * - Safe area support
 * 
 * @example
 * ```tsx
 * <Tab.Navigator tabBar={(props) => <CustomTabBar {...props} />}>
 * ```
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

// Icon mapping (using text icons for now, will use react-native-vector-icons later)
const ICON_MAP: Record<string, string> = {
  map: '🗺️',
  history: '📋',
  warning: '⚠️',
  person: '👤',
};

/**
 * Custom Tab Bar Component
 */
export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom || SPACING.sizes.sm,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const icon = options.tabBarIcon as string;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            {/* Icon Container */}
            <View
              style={[
                styles.iconContainer,
                isFocused && styles.iconContainerActive,
              ]}
            >
              <Text style={styles.icon}>
                {ICON_MAP[icon] || '📍'}
              </Text>
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                isFocused && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {label as string}
            </Text>

            {/* Active Indicator */}
            {isFocused && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.elevated,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingTop: SPACING.sizes.sm,
    paddingHorizontal: SPACING.sizes.xs,
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
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sizes.xs,
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: SPACING.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sizes.xs,
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary.container,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    ...TYPOGRAPHY.styles.captionSmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  labelActive: {
    ...TYPOGRAPHY.styles.labelSmall,
    color: COLORS.primary.main,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: SPACING.radius.full,
    backgroundColor: COLORS.primary.main,
  },
});
