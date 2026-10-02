/**
 * Authentication Store
 * 
 * Kullanıcı kimlik doğrulama ve profil yönetimi
 * - Firebase Auth entegrasyonu
 * - AsyncStorage ile persist
 * - Token yönetimi
 * 
 * @example
 * ```tsx
 * import { useAuthStore } from '@store';
 * 
 * const { user, login, logout } = useAuthStore();
 * await login('email@example.com', 'password');
 * ```
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@services/firebase';
import type { User, AuthCredentials, RegisterData } from '@types';

/**
 * Auth Store State Interface
 */
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<RegisterData>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setToken: (token: string | null) => void;
}

/**
 * Auth Store
 * 
 * Persist edilir: user, token, isAuthenticated
 * Persist edilmez: isLoading, error
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      /**
       * Login - Kullanıcı girişi
       */
      login: async (credentials: AuthCredentials) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Firebase Auth entegrasyonu
          // const response = await authService.login(credentials);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 1000));

          const mockUser: User = {
            id: '1',
            email: credentials.email,
            displayName: 'Test User',
            phoneNumber: undefined,
            photoURL: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            isEmailVerified: true,
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

          const mockToken = 'mock-jwt-token-' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Register - Yeni kullanıcı kaydı
       */
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Firebase Auth entegrasyonu
          // const response = await authService.register(data);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 1000));

          const mockUser: User = {
            id: Date.now().toString(),
            email: data.email,
            displayName: data.displayName,
            phoneNumber: data.phoneNumber,
            photoURL: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
            isEmailVerified: false,
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

          const mockToken = 'mock-jwt-token-' + Date.now();

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Kayıt başarısız';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Logout - Kullanıcı çıkışı
       */
      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          // TODO: Firebase Auth entegrasyonu
          // await authService.logout();
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Çıkış başarısız';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Update Profile - Profil güncelleme
       */
      updateProfile: async (userData: Partial<User>) => {
        const { user } = get();
        if (!user) {
          throw new Error('Kullanıcı oturumu bulunamadı');
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Firebase Auth/Firestore entegrasyonu
          // const updatedUser = await authService.updateProfile(userData);
          
          // Mock implementation
          await new Promise(resolve => setTimeout(resolve, 500));

          const updatedUser: User = {
            ...user,
            ...userData,
            updatedAt: new Date(),
          };

          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profil güncellenemedi';
          set({
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      /**
       * Refresh Token - Token yenileme
       */
      refreshToken: async () => {
        const { token } = get();
        if (!token) {
          throw new Error('Token bulunamadı');
        }

        try {
          // TODO: Token refresh API call
          // const newToken = await authService.refreshToken(token);
          
          // Mock implementation
          const newToken = 'refreshed-token-' + Date.now();

          set({ token: newToken });
        } catch (error) {
          // Token refresh başarısız, kullanıcıyı çıkış yap
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: 'Oturum süresi doldu, lütfen tekrar giriş yapın',
          });
          throw error;
        }
      },

      /**
       * Clear Error - Hata mesajını temizle
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Set User - Kullanıcıyı manuel olarak ayarla
       */
      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      /**
       * Set Is Authenticated - Auth durumunu manuel olarak ayarla
       */
      setIsAuthenticated: (isAuthenticated: boolean) => {
        set({ isAuthenticated });
      },

      /**
       * Set Token - Token'ı manuel olarak ayarla
       */
      setToken: (token: string | null) => {
        set({ token });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Sadece gerekli state'leri persist et
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Auth Store Selectors
 * Performance için memoized selectors
 */
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectIsLoading = (state: AuthState) => state.isLoading;
export const selectError = (state: AuthState) => state.error;
export const selectToken = (state: AuthState) => state.token;
