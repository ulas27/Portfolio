/**
 * RegisterScreen Types
 */

export interface RegisterScreenProps {
  navigation: any;
}

export interface RegisterFormData {
  displayName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterFormErrors {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}
