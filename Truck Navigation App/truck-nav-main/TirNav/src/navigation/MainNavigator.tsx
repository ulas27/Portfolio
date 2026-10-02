/**
 * Main Navigator
 * 
 * Ana uygulama bottom tab navigator'ı
 * - Map tab (harita ve rota)
 * - History tab (rota geçmişi)
 * - Profile tab (profil ve ayarlar)
 * 
 * Custom tab bar ile güzel görünüm
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="Main" component={MainNavigator} />
 * ```
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS, SPACING } from '@constants';
import type { MainTabParamList } from '@types';
import CustomTabBar from './components/CustomTabBar';
import MapNavigator from './MapNavigator';

// Import screens (will be created later)
// import HistoryScreen from '@screens/history/HistoryScreen';
// import ProfileScreen from '@screens/profile/ProfileScreen';

// Temporary placeholder screens
import { View, Text, StyleSheet } from 'react-native';

const HistoryScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>History Screen</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Profile Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Main Navigator Component
 */
export default function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="MapTab"
        component={MapNavigator}
        options={{
          tabBarLabel: 'Harita',
          tabBarIcon: 'map',
        }}
      />

      <Tab.Screen
        name="RoutesTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Rotalar',
          tabBarIcon: 'history',
          headerShown: true,
          headerTitle: 'Rota Geçmişi',
          headerStyle: {
            backgroundColor: COLORS.background.default,
          },
          headerTitleStyle: {
            color: COLORS.text.primary,
          },
        }}
      />

      <Tab.Screen
        name="WarningsTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Uyarılar',
          tabBarIcon: 'warning',
          headerShown: true,
          headerTitle: 'Uyarılar',
          headerStyle: {
            backgroundColor: COLORS.background.default,
          },
          headerTitleStyle: {
            color: COLORS.text.primary,
          },
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: 'person',
          headerShown: true,
          headerTitle: 'Profilim',
          headerStyle: {
            backgroundColor: COLORS.background.default,
          },
          headerTitleStyle: {
            color: COLORS.text.primary,
          },
        }}
      />
    </Tab.Navigator>
  );
}

// Temporary styles for placeholder screens
const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
  },
  placeholderText: {
    fontSize: 18,
    color: COLORS.text.primary,
  },
});
