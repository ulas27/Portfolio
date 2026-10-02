/**
 * Root Navigator
 * 
 * Ana navigation container
 * - Auth durumuna göre AuthNavigator veya MainNavigator gösterir
 * - Smooth transition
 * - Deep linking support (future)
 * 
 * @example
 * ```tsx
 * import RootNavigator from './navigation/RootNavigator';
 * 
 * export default function App() {
 *   return <RootNavigator />;
 * }
 * ```
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore, selectIsAuthenticated } from '@store';
import { COLORS } from '@constants';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import type { RootStackParamList } from '@types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 */
export default function RootNavigator() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    // Set status bar style based on auth state
    StatusBar.setBarStyle('dark-content');
    StatusBar.setBackgroundColor(COLORS.background.default);
  }, [isAuthenticated]);

  return (
    <NavigationContainer
      // Deep linking configuration (future)
      // linking={linking}
      
      // Theme configuration
      theme={{
        dark: false,
        colors: {
          primary: COLORS.primary.main,
          background: COLORS.background.default,
          card: COLORS.surface.default,
          text: COLORS.text.primary,
          border: COLORS.border.default,
          notification: COLORS.semantic.error,
        },
      }}
      
      // Fallback component while loading
      fallback={null}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={MainNavigator}
            options={{
              animation: 'slide_from_right',
            }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              animation: 'slide_from_left',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
