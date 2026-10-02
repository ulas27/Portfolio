/**
 * Validation Utilities
 * 
 * Form validation helper functions
 * - Email validation
 * - Password validation
 * - Phone number validation
 * - General field validation
 */

/**
 * Email validation regex
 * RFC 5322 compliant
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Turkish phone number regex
 * Formats: 05XX XXX XX XX, 5XXXXXXXXX, +90 5XX XXX XX XX
 */
const PHONE_REGEX = /^(\+90|0)?5\d{9}$/;

/**
 * Validate email format
 * 
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 6)
 * @returns true if valid, false otherwise
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password.length >= minLength;
}

/**
 * Validate Turkish phone number
 * 
 * @param phone - Phone number to validate
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, '');
  return PHONE_REGEX.test(cleanPhone);
}

/**
 * Check if field is empty
 * 
 * @param value - Value to check
 * @returns true if empty, false otherwise
 */
export function isEmpty(value: string | null | undefined): boolean {
  return !value || value.trim().length === 0;
}

/**
 * Validate full name (at least 2 words)
 * 
 * @param name - Full name to validate
 * @returns true if valid, false otherwise
 */
export function isValidFullName(name: string): boolean {
  if (isEmpty(name)) {
    return false;
  }
  const words = name.trim().split(/\s+/);
  return words.length >= 2 && words.every(word => word.length > 0);
}

/**
 * Check if passwords match
 * 
 * @param password - Password
 * @param confirmPassword - Confirm password
 * @returns true if match, false otherwise
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && !isEmpty(password);
}

/**
 * Get email validation error message
 * 
 * @param email - Email to validate
 * @returns Error message or null if valid
 */
export function getEmailError(email: string): string | null {
  if (isEmpty(email)) {
    return 'E-posta adresi gereklidir';
  }
  if (!isValidEmail(email)) {
    return 'Geçerli bir e-posta adresi giriniz';
  }
  return null;
}

/**
 * Get password validation error message
 * 
 * @param password - Password to validate
 * @param minLength - Minimum password length
 * @returns Error message or null if valid
 */
export function getPasswordError(password: string, minLength: number = 6): string | null {
  if (isEmpty(password)) {
    return 'Şifre gereklidir';
  }
  if (!isValidPassword(password, minLength)) {
    return `Şifre en az ${minLength} karakter olmalıdır`;
  }
  return null;
}

/**
 * Get phone validation error message
 * 
 * @param phone - Phone to validate
 * @param required - Is phone required
 * @returns Error message or null if valid
 */
export function getPhoneError(phone: string, required: boolean = false): string | null {
  if (isEmpty(phone)) {
    return required ? 'Telefon numarası gereklidir' : null;
  }
  if (!isValidPhone(phone)) {
    return 'Geçerli bir telefon numarası giriniz (05XX XXX XX XX)';
  }
  return null;
}

/**
 * Get full name validation error message
 * 
 * @param name - Name to validate
 * @returns Error message or null if valid
 */
export function getFullNameError(name: string): string | null {
  if (isEmpty(name)) {
    return 'Ad soyad gereklidir';
  }
  if (!isValidFullName(name)) {
    return 'Lütfen ad ve soyadınızı giriniz';
  }
  return null;
}

/**
 * Get password match error message
 * 
 * @param password - Password
 * @param confirmPassword - Confirm password
 * @returns Error message or null if valid
 */
export function getPasswordMatchError(password: string, confirmPassword: string): string | null {
  if (isEmpty(confirmPassword)) {
    return 'Şifre tekrarı gereklidir';
  }
  if (!passwordsMatch(password, confirmPassword)) {
    return 'Şifreler eşleşmiyor';
  }
  return null;
}

/**
 * Translate Firebase auth error codes to Turkish
 * 
 * @param errorCode - Firebase error code
 * @returns Turkish error message
 */
export function translateFirebaseError(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanımda',
    'auth/invalid-email': 'Geçersiz e-posta adresi',
    'auth/operation-not-allowed': 'Bu işlem şu anda kullanılamıyor',
    'auth/weak-password': 'Şifre çok zayıf, daha güçlü bir şifre seçin',
    'auth/user-disabled': 'Bu hesap devre dışı bırakılmış',
    'auth/user-not-found': 'E-posta veya şifre hatalı',
    'auth/wrong-password': 'E-posta veya şifre hatalı',
    'auth/invalid-credential': 'E-posta veya şifre hatalı',
    'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin',
    'auth/network-request-failed': 'İnternet bağlantısı hatası',
    'auth/requires-recent-login': 'Bu işlem için tekrar giriş yapmanız gerekiyor',
  };

  return errorMessages[errorCode] || 'Bir hata oluştu. Lütfen tekrar deneyin';
}

/**
 * Format phone number for display
 * 
 * @param phone - Phone number to format
 * @returns Formatted phone number (05XX XXX XX XX)
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Remove leading +90 or 90
  let cleaned = digits;
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2);
  }
  
  // Format: 05XX XXX XX XX
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7, 9)} ${cleaned.substring(9)}`;
  }
  
  return phone;
}
