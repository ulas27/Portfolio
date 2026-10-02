/**
 * Auth Navigator
 * 
 * Kimlik doğrulama ekranları için stack navigator
 * - Onboarding (ilk açılış)
 * - Login (giriş)
 * - Register (kayıt)
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="Auth" component={AuthNavigator} />
 * ```
 */

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY, SPACING, STORAGE_KEYS } from '@constants';
import type { AuthStackParamList } from '@types';

// Import screens
import OnboardingScreen from '@screens/auth/OnboardingScreen';
import LoginScreen from '@screens/auth/LoginScreen';
import RegisterScreen from '@screens/auth/RegisterScreen';

// For loading state
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth Navigator Component
 */
export default function AuthNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  /**
   * Check if user has completed onboarding
   */
  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking onboarding status
  if (isLoading) {
    return (
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color={COLORS.primary.main} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={hasCompletedOnboarding ? 'Login' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          headerShown: false,
          gestureEnabled: false, // Onboarding'den geri gidilemez
        }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

// Loading screen styles
const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.default,
  },
});
