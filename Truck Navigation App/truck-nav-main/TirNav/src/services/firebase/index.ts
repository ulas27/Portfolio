/**
 * Firebase Services Barrel Export
 * 
 * Centralized export for all Firebase services
 * 
 * @example
 * ```tsx
 * import { authService, firestoreService, storageService } from '@services/firebase';
 * 
 * // Use services
 * const user = await authService.signIn({ email, password });
 * const warnings = await firestoreService.getWarnings();
 * const url = await storageService.uploadWarningImage(uri, userId);
 * ```
 */

export { authService, default as auth } from './auth';
export { firestoreService, default as firestore } from './firestore';
export { storageService, default as storage } from './storage';

// Re-export types
export type { UploadProgressCallback } from './storage';
