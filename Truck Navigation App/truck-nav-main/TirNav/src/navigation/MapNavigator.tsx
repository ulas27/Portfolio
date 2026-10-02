/**
 * Map Navigator
 * 
 * Harita tab'ının kendi stack navigator'ı
 * - MapScreen (ana harita)
 * - RouteDetail (rota detayı)
 * - AddWarning (uyarı ekle)
 * - WarningDetail (uyarı detayı)
 * - VehicleInfo (araç bilgileri)
 * 
 * @example
 * ```tsx
 * <Tab.Screen name="MapTab" component={MapNavigator} />
 * ```
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@constants';
import type { MapStackParamList } from '@types';

// Import screens (will be created later)
// import MapScreen from '@screens/map/MapScreen';
// import RouteDetailScreen from '@screens/map/RouteDetailScreen';
// import RouteHistoryScreen from '@screens/map/RouteHistoryScreen';

// Temporary placeholder screens
import { View, Text, StyleSheet } from 'react-native';

const MapScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Map Screen</Text>
  </View>
);

const RouteDetailScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Route Detail Screen</Text>
  </View>
);

const RouteHistoryScreen = () => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Route History Screen</Text>
  </View>
);

const Stack = createNativeStackNavigator<MapStackParamList>();

/**
 * Map Navigator Component
 */
export default function MapNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MapScreen"
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.background.default,
        },
        headerTitleStyle: {
          ...TYPOGRAPHY.styles.h3,
          color: COLORS.text.primary,
        },
        headerTintColor: COLORS.primary.main,
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="RouteDetail"
        component={RouteDetailScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Rota Detayı',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>←</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen
        name="RouteHistory"
        component={RouteHistoryScreen}
        options={({ navigation }) => ({
          headerShown: true,
          headerTitle: 'Rota Geçmişi',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Text style={styles.headerButtonText}>←</Text>
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

// Temporary styles
const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
  },
  placeholderText: {
    ...TYPOGRAPHY.styles.h2,
    color: COLORS.text.primary,
  },
  headerButton: {
    padding: SPACING.sizes.sm,
    marginLeft: SPACING.sizes.sm,
  },
  headerButtonText: {
    fontSize: 24,
    color: COLORS.primary.main,
  },
});
