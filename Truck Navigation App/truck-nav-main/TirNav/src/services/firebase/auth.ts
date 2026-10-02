/**
 * Firebase Authentication Service
 * 
 * Handles user authentication operations
 * - Sign in with email/password
 * - Register new users
 * - Sign out
 * - Auth state listener
 * - Profile updates
 * 
 * @example
 * ```tsx
 * import { authService } from '@services/firebase/auth';
 * 
 * const user = await authService.signIn({ email, password });
 * ```
 */

import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import type { User, AuthCredentials, RegisterData } from '@types/user';

/**
 * Firebase Authentication Service
 */
export const authService = {
  /**
   * Sign in with email and password
   * 
   * @param credentials - User credentials (email, password)
   * @returns Authenticated user
   * @throws Error with Turkish message
   */
  async signIn(credentials: AuthCredentials): Promise<User> {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );
      return mapFirebaseUser(userCredential.user);
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Register new user with email and password
   * 
   * @param data - Registration data (email, password, displayName, phoneNumber)
   * @returns Newly created user
   * @throws Error with Turkish message
   */
  async register(data: RegisterData): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        data.email,
        data.password
      );
      
      // Update profile with display name
      await userCredential.user.updateProfile({
        displayName: data.displayName,
      });

      // Reload user to get updated profile
      await userCredential.user.reload();
      const updatedUser = auth().currentUser;

      return mapFirebaseUser(updatedUser!);
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Sign out current user
   * 
   * @throws Error with Turkish message
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Get current authenticated user
   * 
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    const firebaseUser = auth().currentUser;
    return firebaseUser ? mapFirebaseUser(firebaseUser) : null;
  },

  /**
   * Update user profile
   * 
   * @param updates - Profile updates (displayName, photoURL)
   * @returns Updated user
   * @throws Error with Turkish message
   */
  async updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<User> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      await currentUser.updateProfile(updates);
      await currentUser.reload();
      const updatedUser = auth().currentUser;

      return mapFirebaseUser(updatedUser!);
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Send password reset email
   * 
   * @param email - User email address
   * @throws Error with Turkish message
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Send email verification
   * 
   * @throws Error with Turkish message
   */
  async sendEmailVerification(): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      await currentUser.sendEmailVerification();
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Reload current user data
   * 
   * @returns Updated user
   * @throws Error with Turkish message
   */
  async reloadUser(): Promise<User> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      await currentUser.reload();
      const updatedUser = auth().currentUser;

      return mapFirebaseUser(updatedUser!);
    } catch (error) {
      throw handleAuthError(error);
    }
  },

  /**
   * Listen to authentication state changes
   * 
   * @param callback - Callback function called when auth state changes
   * @returns Unsubscribe function
   * 
   * @example
   * ```tsx
   * const unsubscribe = authService.onAuthStateChanged((user) => {
   *   if (user) {
   *     console.log('User signed in:', user.email);
   *   } else {
   *     console.log('User signed out');
   *   }
   * });
   * 
   * // Later, unsubscribe
   * unsubscribe();
   * ```
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return auth().onAuthStateChanged((firebaseUser) => {
      callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
    });
  },

  /**
   * Delete current user account
   * 
   * @throws Error with Turkish message
   */
  async deleteAccount(): Promise<void> {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      await currentUser.delete();
    } catch (error) {
      throw handleAuthError(error);
    }
  },
};

/**
 * Map Firebase user to app User type
 * 
 * @param firebaseUser - Firebase user object
 * @returns App User object
 */
function mapFirebaseUser(firebaseUser: FirebaseAuthTypes.User): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || '',
    phoneNumber: firebaseUser.phoneNumber || undefined,
    photoURL: firebaseUser.photoURL || undefined,
    createdAt: firebaseUser.metadata.creationTime 
      ? new Date(firebaseUser.metadata.creationTime) 
      : new Date(),
    updatedAt: firebaseUser.metadata.lastSignInTime 
      ? new Date(firebaseUser.metadata.lastSignInTime) 
      : new Date(),
  };
}

/**
 * Handle Firebase authentication errors
 * Translates Firebase error codes to Turkish messages
 * 
 * @param error - Firebase error
 * @returns Error with Turkish message
 */
function handleAuthError(error: any): Error {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda',
    'auth/invalid-email': 'Geçersiz e-posta adresi',
    'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor',
    'auth/weak-password': 'Şifre çok zayıf (en az 6 karakter olmalı)',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış',
    'auth/user-not-found': 'E-posta veya şifre hatalı',
    'auth/wrong-password': 'E-posta veya şifre hatalı',
    'auth/invalid-credential': 'E-posta veya şifre hatalı',
    'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin',
    'auth/network-request-failed': 'İnternet bağlantısı hatası',
    'auth/requires-recent-login': 'Bu işlem için tekrar giriş yapmanız gerekiyor',
    'auth/invalid-verification-code': 'Geçersiz doğrulama kodu',
    'auth/invalid-verification-id': 'Geçersiz doğrulama kimliği',
    'auth/missing-verification-code': 'Doğrulama kodu eksik',
    'auth/missing-verification-id': 'Doğrulama kimliği eksik',
    'auth/credential-already-in-use': 'Bu kimlik bilgileri zaten kullanımda',
    'auth/invalid-action-code': 'Geçersiz işlem kodu',
    'auth/expired-action-code': 'İşlem kodu süresi dolmuş',
  };

  const code = error?.code || 'unknown';
  const message = errorMessages[code] || error?.message || 'Bir hata oluştu. Lütfen tekrar deneyin';
  
  const appError = new Error(message);
  (appError as any).code = code;
  
  return appError;
}

export default authService;
