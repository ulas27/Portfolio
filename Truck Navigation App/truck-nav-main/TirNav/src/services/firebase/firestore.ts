/**
 * Firebase Firestore Service
 * 
 * Handles database operations
 * - Warnings CRUD operations
 * - User data management
 * - Route history
 * - Real-time listeners
 * 
 * @example
 * ```tsx
 * import { firestoreService } from '@services/firebase/firestore';
 * 
 * const warnings = await firestoreService.getWarnings();
 * ```
 */

import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { 
  Warning, 
  CreateWarningData, 
  UpdateWarningData,
  WarningType,
} from '@types/warning';
import type { Route } from '@types/route';
import type { Coordinates } from '@types/common';

/**
 * Firestore collection names
 */
const COLLECTIONS = {
  WARNINGS: 'warnings',
  USERS: 'users',
  ROUTES: 'routes',
  VEHICLES: 'vehicles',
} as const;

/**
 * Firebase Firestore Service
 */
export const firestoreService = {
  // ==================== WARNING OPERATIONS ====================

  /**
   * Get all active warnings
   * 
   * @returns Array of active warnings
   * @throws Error if operation fails
   */
  async getWarnings(): Promise<Warning[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get();

      return snapshot.docs.map(doc => mapWarningFromFirestore(doc));
    } catch (error) {
      console.error('Get warnings error:', error);
      throw handleFirestoreError(error, 'Uyarılar yüklenirken hata oluştu');
    }
  },

  /**
   * Get warnings near a location
   * 
   * @param location - Center coordinates
   * @param radiusKm - Radius in kilometers (default: 50)
   * @returns Array of nearby warnings
   * @throws Error if operation fails
   */
  async getNearbyWarnings(location: Coordinates, radiusKm: number = 50): Promise<Warning[]> {
    try {
      // Firestore doesn't support geoqueries natively
      // We'll fetch all warnings and filter in memory
      // For production, consider using GeoFirestore or similar
      const allWarnings = await this.getWarnings();

      return allWarnings.filter(warning => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          warning.location.latitude,
          warning.location.longitude
        );
        return distance <= radiusKm;
      });
    } catch (error) {
      console.error('Get nearby warnings error:', error);
      throw handleFirestoreError(error, 'Yakındaki uyarılar yüklenirken hata oluştu');
    }
  },

  /**
   * Get warnings by type
   * 
   * @param type - Warning type
   * @returns Array of warnings
   * @throws Error if operation fails
   */
  async getWarningsByType(type: WarningType): Promise<Warning[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .where('type', '==', type)
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      return snapshot.docs.map(doc => mapWarningFromFirestore(doc));
    } catch (error) {
      console.error('Get warnings by type error:', error);
      throw handleFirestoreError(error, 'Uyarılar yüklenirken hata oluştu');
    }
  },

  /**
   * Get user's warnings
   * 
   * @param userId - User ID
   * @returns Array of user's warnings
   * @throws Error if operation fails
   */
  async getUserWarnings(userId: string): Promise<Warning[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .where('createdBy', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => mapWarningFromFirestore(doc));
    } catch (error) {
      console.error('Get user warnings error:', error);
      throw handleFirestoreError(error, 'Kullanıcı uyarıları yüklenirken hata oluştu');
    }
  },

  /**
   * Add new warning
   * 
   * @param data - Warning data
   * @param userId - User ID
   * @returns Created warning
   * @throws Error if operation fails
   */
  async addWarning(data: CreateWarningData, userId: string): Promise<Warning> {
    try {
      const docRef = await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .add({
          ...data,
          createdBy: userId,
          createdAt: firestore.FieldValue.serverTimestamp(),
          upvotes: 0,
          downvotes: 0,
          isActive: true,
        });

      const doc = await docRef.get();
      return mapWarningFromFirestore(doc);
    } catch (error) {
      console.error('Add warning error:', error);
      throw handleFirestoreError(error, 'Uyarı eklenirken hata oluştu');
    }
  },

  /**
   * Update warning
   * 
   * @param warningId - Warning ID
   * @param data - Update data
   * @throws Error if operation fails
   */
  async updateWarning(warningId: string, data: UpdateWarningData): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .doc(warningId)
        .update(data);
    } catch (error) {
      console.error('Update warning error:', error);
      throw handleFirestoreError(error, 'Uyarı güncellenirken hata oluştu');
    }
  },

  /**
   * Delete warning
   * 
   * @param warningId - Warning ID
   * @throws Error if operation fails
   */
  async deleteWarning(warningId: string): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .doc(warningId)
        .update({
          isActive: false,
        });
    } catch (error) {
      console.error('Delete warning error:', error);
      throw handleFirestoreError(error, 'Uyarı silinirken hata oluştu');
    }
  },

  /**
   * Upvote warning
   * 
   * @param warningId - Warning ID
   * @throws Error if operation fails
   */
  async upvoteWarning(warningId: string): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .doc(warningId)
        .update({
          upvotes: firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.error('Upvote warning error:', error);
      throw handleFirestoreError(error, 'Oy kullanılırken hata oluştu');
    }
  },

  /**
   * Downvote warning
   * 
   * @param warningId - Warning ID
   * @throws Error if operation fails
   */
  async downvoteWarning(warningId: string): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.WARNINGS)
        .doc(warningId)
        .update({
          downvotes: firestore.FieldValue.increment(1),
        });
    } catch (error) {
      console.error('Downvote warning error:', error);
      throw handleFirestoreError(error, 'Oy kullanılırken hata oluştu');
    }
  },

  /**
   * Listen to warnings in real-time
   * 
   * @param callback - Callback function called when warnings change
   * @returns Unsubscribe function
   */
  onWarningsChanged(callback: (warnings: Warning[]) => void): () => void {
    return firestore()
      .collection(COLLECTIONS.WARNINGS)
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(100)
      .onSnapshot(
        (snapshot) => {
          const warnings = snapshot.docs.map(doc => mapWarningFromFirestore(doc));
          callback(warnings);
        },
        (error) => {
          console.error('Warnings listener error:', error);
        }
      );
  },

  // ==================== ROUTE OPERATIONS ====================

  /**
   * Save route to history
   * 
   * @param route - Route data
   * @param userId - User ID
   * @returns Saved route ID
   * @throws Error if operation fails
   */
  async saveRoute(route: Route, userId: string): Promise<string> {
    try {
      const docRef = await firestore()
        .collection(COLLECTIONS.ROUTES)
        .add({
          ...route,
          userId,
          savedAt: firestore.FieldValue.serverTimestamp(),
        });

      return docRef.id;
    } catch (error) {
      console.error('Save route error:', error);
      throw handleFirestoreError(error, 'Rota kaydedilirken hata oluştu');
    }
  },

  /**
   * Get user's route history
   * 
   * @param userId - User ID
   * @param limit - Maximum number of routes to fetch
   * @returns Array of routes
   * @throws Error if operation fails
   */
  async getRouteHistory(userId: string, limit: number = 20): Promise<Route[]> {
    try {
      const snapshot = await firestore()
        .collection(COLLECTIONS.ROUTES)
        .where('userId', '==', userId)
        .orderBy('savedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Route[];
    } catch (error) {
      console.error('Get route history error:', error);
      throw handleFirestoreError(error, 'Rota geçmişi yüklenirken hata oluştu');
    }
  },

  /**
   * Delete route from history
   * 
   * @param routeId - Route ID
   * @throws Error if operation fails
   */
  async deleteRoute(routeId: string): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.ROUTES)
        .doc(routeId)
        .delete();
    } catch (error) {
      console.error('Delete route error:', error);
      throw handleFirestoreError(error, 'Rota silinirken hata oluştu');
    }
  },

  // ==================== USER DATA OPERATIONS ====================

  /**
   * Save user data
   * 
   * @param userId - User ID
   * @param data - User data
   * @throws Error if operation fails
   */
  async saveUserData(userId: string, data: any): Promise<void> {
    try {
      await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set(data, { merge: true });
    } catch (error) {
      console.error('Save user data error:', error);
      throw handleFirestoreError(error, 'Kullanıcı verisi kaydedilirken hata oluştu');
    }
  },

  /**
   * Get user data
   * 
   * @param userId - User ID
   * @returns User data
   * @throws Error if operation fails
   */
  async getUserData(userId: string): Promise<any> {
    try {
      const doc = await firestore()
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .get();

      return doc.exists ? doc.data() : null;
    } catch (error) {
      console.error('Get user data error:', error);
      throw handleFirestoreError(error, 'Kullanıcı verisi yüklenirken hata oluştu');
    }
  },
};

/**
 * Map Firestore document to Warning object
 * 
 * @param doc - Firestore document
 * @returns Warning object
 */
function mapWarningFromFirestore(
  doc: FirebaseFirestoreTypes.DocumentSnapshot
): Warning {
  const data = doc.data()!;
  return {
    id: doc.id,
    type: data.type,
    location: data.location,
    description: data.description,
    createdBy: data.createdBy,
    createdAt: data.createdAt?.toDate() || new Date(),
    upvotes: data.upvotes || 0,
    downvotes: data.downvotes || 0,
    imageUrl: data.imageUrl,
    isActive: data.isActive,
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * 
 * @param lat1 - Latitude 1
 * @param lon1 - Longitude 1
 * @param lat2 - Latitude 2
 * @param lon2 - Longitude 2
 * @returns Distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Handle Firestore errors
 * 
 * @param error - Firestore error
 * @param defaultMessage - Default error message
 * @returns Error with message
 */
function handleFirestoreError(error: any, defaultMessage: string): Error {
  const errorMessages: Record<string, string> = {
    'permission-denied': 'Bu işlem için yetkiniz yok',
    'not-found': 'Veri bulunamadı',
    'already-exists': 'Bu veri zaten mevcut',
    'failed-precondition': 'İşlem gerçekleştirilemedi',
    'unavailable': 'Servis şu anda kullanılamıyor',
    'unauthenticated': 'Giriş yapmanız gerekiyor',
  };

  const code = error?.code || 'unknown';
  const message = errorMessages[code] || error?.message || defaultMessage;
  
  const appError = new Error(message);
  (appError as any).code = code;
  
  return appError;
}

export default firestoreService;
