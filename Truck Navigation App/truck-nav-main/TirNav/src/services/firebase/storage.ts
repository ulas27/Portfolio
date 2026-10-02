/**
 * Firebase Storage Service
 * 
 * Handles file upload/download operations
 * - Image uploads (warnings, profile photos)
 * - File management
 * - Progress tracking
 * 
 * @example
 * ```tsx
 * import { storageService } from '@services/firebase/storage';
 * 
 * const url = await storageService.uploadWarningImage(uri, userId);
 * ```
 */

import storage, { FirebaseStorageTypes } from '@react-native-firebase/storage';

/**
 * Storage paths
 */
const STORAGE_PATHS = {
  WARNING_IMAGES: 'warnings',
  PROFILE_PHOTOS: 'profiles',
  VEHICLE_PHOTOS: 'vehicles',
} as const;

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Firebase Storage Service
 */
export const storageService = {
  /**
   * Upload warning image
   * 
   * @param imageUri - Local image URI
   * @param userId - User ID
   * @param onProgress - Progress callback (0-100)
   * @returns Download URL
   * @throws Error if upload fails
   */
  async uploadWarningImage(
    imageUri: string,
    userId: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const filename = `${userId}_${Date.now()}.jpg`;
      const path = `${STORAGE_PATHS.WARNING_IMAGES}/${filename}`;
      
      return await this.uploadImage(imageUri, path, onProgress);
    } catch (error) {
      console.error('Upload warning image error:', error);
      throw handleStorageError(error, 'Fotoğraf yüklenirken hata oluştu');
    }
  },

  /**
   * Upload profile photo
   * 
   * @param imageUri - Local image URI
   * @param userId - User ID
   * @param onProgress - Progress callback (0-100)
   * @returns Download URL
   * @throws Error if upload fails
   */
  async uploadProfilePhoto(
    imageUri: string,
    userId: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const filename = `${userId}.jpg`;
      const path = `${STORAGE_PATHS.PROFILE_PHOTOS}/${filename}`;
      
      // Delete old profile photo if exists
      try {
        await this.deleteFile(path);
      } catch (error) {
        // Ignore error if file doesn't exist
      }
      
      return await this.uploadImage(imageUri, path, onProgress);
    } catch (error) {
      console.error('Upload profile photo error:', error);
      throw handleStorageError(error, 'Profil fotoğrafı yüklenirken hata oluştu');
    }
  },

  /**
   * Upload vehicle photo
   * 
   * @param imageUri - Local image URI
   * @param userId - User ID
   * @param vehicleId - Vehicle ID
   * @param onProgress - Progress callback (0-100)
   * @returns Download URL
   * @throws Error if upload fails
   */
  async uploadVehiclePhoto(
    imageUri: string,
    userId: string,
    vehicleId: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const filename = `${userId}_${vehicleId}.jpg`;
      const path = `${STORAGE_PATHS.VEHICLE_PHOTOS}/${filename}`;
      
      return await this.uploadImage(imageUri, path, onProgress);
    } catch (error) {
      console.error('Upload vehicle photo error:', error);
      throw handleStorageError(error, 'Araç fotoğrafı yüklenirken hata oluştu');
    }
  },

  /**
   * Upload image to storage
   * 
   * @param imageUri - Local image URI
   * @param path - Storage path
   * @param onProgress - Progress callback (0-100)
   * @returns Download URL
   * @throws Error if upload fails
   */
  async uploadImage(
    imageUri: string,
    path: string,
    onProgress?: UploadProgressCallback
  ): Promise<string> {
    try {
      const reference = storage().ref(path);
      const task = reference.putFile(imageUri);

      // Track upload progress
      if (onProgress) {
        task.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(progress));
        });
      }

      // Wait for upload to complete
      await task;

      // Get download URL
      const downloadURL = await reference.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error('Upload image error:', error);
      throw handleStorageError(error, 'Fotoğraf yüklenirken hata oluştu');
    }
  },

  /**
   * Delete file from storage
   * 
   * @param path - Storage path
   * @throws Error if deletion fails
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const reference = storage().ref(path);
      await reference.delete();
    } catch (error) {
      console.error('Delete file error:', error);
      throw handleStorageError(error, 'Dosya silinirken hata oluştu');
    }
  },

  /**
   * Delete warning image
   * 
   * @param imageUrl - Image download URL
   * @throws Error if deletion fails
   */
  async deleteWarningImage(imageUrl: string): Promise<void> {
    try {
      const path = this.getPathFromUrl(imageUrl);
      await this.deleteFile(path);
    } catch (error) {
      console.error('Delete warning image error:', error);
      throw handleStorageError(error, 'Fotoğraf silinirken hata oluştu');
    }
  },

  /**
   * Delete profile photo
   * 
   * @param userId - User ID
   * @throws Error if deletion fails
   */
  async deleteProfilePhoto(userId: string): Promise<void> {
    try {
      const path = `${STORAGE_PATHS.PROFILE_PHOTOS}/${userId}.jpg`;
      await this.deleteFile(path);
    } catch (error) {
      console.error('Delete profile photo error:', error);
      throw handleStorageError(error, 'Profil fotoğrafı silinirken hata oluştu');
    }
  },

  /**
   * Get file metadata
   * 
   * @param path - Storage path
   * @returns File metadata
   * @throws Error if operation fails
   */
  async getMetadata(path: string): Promise<FirebaseStorageTypes.FullMetadata> {
    try {
      const reference = storage().ref(path);
      return await reference.getMetadata();
    } catch (error) {
      console.error('Get metadata error:', error);
      throw handleStorageError(error, 'Dosya bilgileri alınırken hata oluştu');
    }
  },

  /**
   * Get download URL for a file
   * 
   * @param path - Storage path
   * @returns Download URL
   * @throws Error if operation fails
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const reference = storage().ref(path);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Get download URL error:', error);
      throw handleStorageError(error, 'İndirme bağlantısı alınırken hata oluştu');
    }
  },

  /**
   * List files in a directory
   * 
   * @param path - Directory path
   * @param maxResults - Maximum number of results
   * @returns List of file references
   * @throws Error if operation fails
   */
  async listFiles(
    path: string,
    maxResults: number = 100
  ): Promise<FirebaseStorageTypes.ListResult> {
    try {
      const reference = storage().ref(path);
      return await reference.list({ maxResults });
    } catch (error) {
      console.error('List files error:', error);
      throw handleStorageError(error, 'Dosyalar listelenirken hata oluştu');
    }
  },

  /**
   * Extract storage path from download URL
   * 
   * @param url - Download URL
   * @returns Storage path
   */
  getPathFromUrl(url: string): string {
    try {
      // Extract path from Firebase Storage URL
      // Format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
      const matches = url.match(/\/o\/(.+?)\?/);
      if (matches && matches[1]) {
        return decodeURIComponent(matches[1]);
      }
      throw new Error('Invalid storage URL');
    } catch (error) {
      console.error('Get path from URL error:', error);
      throw new Error('Geçersiz dosya bağlantısı');
    }
  },

  /**
   * Compress image before upload (optional utility)
   * Note: Requires additional library like react-native-image-resizer
   * 
   * @param imageUri - Local image URI
   * @param maxWidth - Maximum width
   * @param maxHeight - Maximum height
   * @param quality - JPEG quality (0-100)
   * @returns Compressed image URI
   */
  async compressImage(
    imageUri: string,
    maxWidth: number = 1024,
    maxHeight: number = 1024,
    quality: number = 80
  ): Promise<string> {
    // TODO: Implement image compression
    // This is a placeholder - implement with react-native-image-resizer or similar
    console.warn('Image compression not implemented yet');
    return imageUri;
  },
};

/**
 * Handle Firebase Storage errors
 * 
 * @param error - Storage error
 * @param defaultMessage - Default error message
 * @returns Error with message
 */
function handleStorageError(error: any, defaultMessage: string): Error {
  const errorMessages: Record<string, string> = {
    'storage/unknown': 'Bilinmeyen bir hata oluştu',
    'storage/object-not-found': 'Dosya bulunamadı',
    'storage/bucket-not-found': 'Depolama alanı bulunamadı',
    'storage/project-not-found': 'Proje bulunamadı',
    'storage/quota-exceeded': 'Depolama kotası aşıldı',
    'storage/unauthenticated': 'Giriş yapmanız gerekiyor',
    'storage/unauthorized': 'Bu işlem için yetkiniz yok',
    'storage/retry-limit-exceeded': 'Çok fazla deneme yapıldı',
    'storage/invalid-checksum': 'Dosya bozuk',
    'storage/canceled': 'İşlem iptal edildi',
    'storage/invalid-event-name': 'Geçersiz olay adı',
    'storage/invalid-url': 'Geçersiz URL',
    'storage/invalid-argument': 'Geçersiz parametre',
    'storage/no-default-bucket': 'Varsayılan depolama alanı yok',
    'storage/cannot-slice-blob': 'Dosya işlenemedi',
    'storage/server-file-wrong-size': 'Dosya boyutu uyuşmuyor',
  };

  const code = error?.code || 'unknown';
  const message = errorMessages[code] || error?.message || defaultMessage;
  
  const appError = new Error(message);
  (appError as any).code = code;
  
  return appError;
}

export default storageService;
