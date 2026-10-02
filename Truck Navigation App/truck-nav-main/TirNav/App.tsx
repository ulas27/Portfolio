/**
 * TirNav - Main Application Entry Point
 * 
 * This is the root component that sets up:
 * - Firebase initialization
 * - Authentication state management
 * - Global providers (SafeAreaProvider, GestureHandler, Toast)
 * - Navigation container
 * - Splash screen handling
 * - Status bar configuration
 * 
 * @author TirNav Team
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import auth from '@react-native-firebase/auth';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/store/authStore';
import { COLORS } from './src/constants/colors';
import type { User } from './src/types';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

/**
 * Main App Component
 * 
 * Handles:
 * - Firebase auth state listener
 * - App initialization
 * - Splash screen management
 * - Provider setup
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  useEffect(() => {
    /**
     * Firebase Auth State Listener
     * Automatically updates store when auth state changes
     */
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || '',
            phoneNumber: firebaseUser.phoneNumber || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(firebaseUser.metadata.creationTime!),
            updatedAt: new Date(firebaseUser.metadata.lastSignInTime!),
            isEmailVerified: firebaseUser.emailVerified,
            preferences: {
              language: 'tr',
              theme: 'light',
              notifications: {
                pushEnabled: true,
                emailEnabled: true,
                warningAlerts: true,
                trafficAlerts: true,
                routeUpdates: true,
              },
              map: {
                showTraffic: true,
                showPOIs: true,
                showWarnings: true,
                autoZoom: true,
                mapStyle: 'standard',
              },
              route: {
                avoidHighways: false,
                avoidTolls: false,
                avoidFerries: false,
                preferFastestRoute: true,
              },
            },
          };

          setUser(user);
          setIsAuthenticated(true);
        } else {
          // User is signed out
          setUser(null);
          setIsAuthenticated(false);
        }

        // Load other app data
        await loadAppData();
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        // App is ready, hide splash screen
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    });

    // Cleanup listener on unmount
    return unsubscribe;
  }, []);

  /**
   * Load App Data
   * Load necessary data from AsyncStorage or Firestore
   */
  const loadAppData = async () => {
    try {
      // Load vehicle info from AsyncStorage (via persist middleware)
      // Vehicle store will auto-load from AsyncStorage
      
      // Load route history (if needed)
      // await useRouteStore.getState().loadHistory();
      
      // Load user settings (if needed)
      // await loadUserSettings();
      
      // Any other initialization
    } catch (error) {
      console.error('App data loading error:', error);
    }
  };

  /**
   * Show splash screen while loading
   */
  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.grayscale.white}
        />
        <RootNavigator />
        <Toast />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
