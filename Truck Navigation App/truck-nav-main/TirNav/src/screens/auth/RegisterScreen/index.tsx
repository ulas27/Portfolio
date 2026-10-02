/**
 * RegisterScreen Component
 * 
 * User registration screen with form validation
 * - Full name, email, phone, password inputs
 * - Password confirmation
 * - Comprehensive validation
 * - Firebase authentication integration
 * - Error handling with Turkish messages
 * - Loading states
 * - Keyboard aware scrolling
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="Register" component={RegisterScreen} />
 * ```
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import { Button, Input } from '@components/common';
import { useAuthStore } from '@store';
import { ROUTES } from '@constants';
import {
  getEmailError,
  getPasswordError,
  getFullNameError,
  getPhoneError,
  getPasswordMatchError,
  translateFirebaseError,
  formatPhoneNumber,
} from '@utils/validators';
import { styles } from './styles';
import type { RegisterScreenProps, RegisterFormData, RegisterFormErrors } from './types';

/**
 * RegisterScreen Component
 */
export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    displayName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const emailInputRef = useRef<RNTextInput>(null);
  const phoneInputRef = useRef<RNTextInput>(null);
  const passwordInputRef = useRef<RNTextInput>(null);
  const confirmPasswordInputRef = useRef<RNTextInput>(null);

  const register = useAuthStore((state) => state.register);

  /**
   * Update form field
   */
  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: RegisterFormErrors = {};

    const nameError = getFullNameError(formData.displayName);
    if (nameError) {
      newErrors.displayName = nameError;
    }

    const emailError = getEmailError(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const phoneError = getPhoneError(formData.phoneNumber, false);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }

    const passwordError = getPasswordError(formData.password, 6);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    const confirmPasswordError = getPasswordMatchError(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle register
   */
  const handleRegister = async () => {
    // Clear general error
    setErrors((prev) => ({ ...prev, general: undefined }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(formData.email.trim(), formData.password, {
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
      });
      // Navigation handled by RootNavigator based on auth state
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Get Firebase error code
      const errorCode = error?.code || 'unknown';
      const errorMessage = translateFirebaseError(errorCode);
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to login screen
   */
  const handleNavigateToLogin = () => {
    navigation.navigate(ROUTES.AUTH.LOGIN);
  };

  /**
   * Format phone number on blur
   */
  const handlePhoneBlur = () => {
    if (formData.phoneNumber) {
      const formatted = formatPhoneNumber(formData.phoneNumber);
      updateField('phoneNumber', formatted);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🚛</Text>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>
            TirNav'a katılın
          </Text>
        </View>

        {/* General Error */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name Input */}
          <View style={styles.inputContainer}>
            <Input
              label="Ad Soyad"
              value={formData.displayName}
              onChangeText={(value) => updateField('displayName', value)}
              placeholder="Ahmet Yılmaz"
              autoCapitalize="words"
              autoComplete="name"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              error={errors.displayName}
              leftIcon={<Text style={{ fontSize: 20 }}>👤</Text>}
              testID="register-name-input"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Input
              ref={emailInputRef}
              label="E-posta"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
              error={errors.email}
              leftIcon={<Text style={{ fontSize: 20 }}>📧</Text>}
              testID="register-email-input"
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Input
              ref={phoneInputRef}
              label="Telefon (Opsiyonel)"
              value={formData.phoneNumber}
              onChangeText={(value) => updateField('phoneNumber', value)}
              onBlur={handlePhoneBlur}
              placeholder="05XX XXX XX XX"
              keyboardType="phone-pad"
              autoComplete="tel"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={errors.phoneNumber}
              leftIcon={<Text style={{ fontSize: 20 }}>📱</Text>}
              testID="register-phone-input"
            />
            <Text style={styles.helperText}>
              İsteğe bağlı - Hesap kurtarma için kullanılabilir
            </Text>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Input
              ref={passwordInputRef}
              label="Şifre"
              value={formData.password}
              onChangeText={(value) => updateField('password', value)}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              error={errors.password}
              leftIcon={<Text style={{ fontSize: 20 }}>🔒</Text>}
              testID="register-password-input"
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Input
              ref={confirmPasswordInputRef}
              label="Şifre Tekrar"
              value={formData.confirmPassword}
              onChangeText={(value) => updateField('confirmPassword', value)}
              placeholder="••••••••"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password-new"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={errors.confirmPassword}
              leftIcon={<Text style={{ fontSize: 20 }}>🔒</Text>}
              testID="register-confirm-password-input"
            />
          </View>

          {/* Register Button */}
          <Button
            title="Kayıt Ol"
            onPress={handleRegister}
            variant="primary"
            size="large"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.registerButton}
            testID="register-button"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı?</Text>
          <TouchableOpacity
            onPress={handleNavigateToLogin}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.footerLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
