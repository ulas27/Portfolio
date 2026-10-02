/**
 * LoginScreen Component
 * 
 * User login screen with email/password authentication
 * - Email and password inputs with validation
 * - Show/hide password toggle
 * - Firebase authentication integration
 * - Error handling with Turkish messages
 * - Loading states
 * - Keyboard aware scrolling
 * 
 * @example
 * ```tsx
 * <Stack.Screen name="Login" component={LoginScreen} />
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
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { Button, Input } from '@components/common';
import { useAuthStore } from '@store';
import { ROUTES } from '@constants';
import {
  getEmailError,
  getPasswordError,
  translateFirebaseError,
} from '@utils/validators';
import { styles } from './styles';
import type { LoginScreenProps, LoginFormData, LoginFormErrors } from './types';

/**
 * LoginScreen Component
 */
export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const passwordInputRef = useRef<RNTextInput>(null);

  const login = useAuthStore((state) => state.login);

  /**
   * Update form field
   */
  const updateField = (field: keyof LoginFormData, value: string) => {
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
    const newErrors: LoginFormErrors = {};

    const emailError = getEmailError(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = getPasswordError(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle login
   */
  const handleLogin = async () => {
    // Clear general error
    setErrors((prev) => ({ ...prev, general: undefined }));

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      // Navigation handled by RootNavigator based on auth state
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Get Firebase error code
      const errorCode = error?.code || 'unknown';
      const errorMessage = translateFirebaseError(errorCode);
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to register screen
   */
  const handleNavigateToRegister = () => {
    navigation.navigate(ROUTES.AUTH.REGISTER);
  };

  /**
   * Handle forgot password
   */
  const handleForgotPassword = () => {
    Alert.alert(
      'Şifremi Unuttum',
      'Şifre sıfırlama özelliği yakında eklenecek.',
      [{ text: 'Tamam' }]
    );
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
          <Text style={styles.title}>Hoş Geldiniz</Text>
          <Text style={styles.subtitle}>
            Hesabınıza giriş yapın
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
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Input
              label="E-posta"
              value={formData.email}
              onChangeText={(value) => updateField('email', value)}
              placeholder="ornek@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              error={errors.email}
              leftIcon={<Text style={{ fontSize: 20 }}>📧</Text>}
              testID="login-email-input"
            />
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
              autoComplete="password"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={errors.password}
              leftIcon={<Text style={{ fontSize: 20 }}>🔒</Text>}
              testID="login-password-input"
            />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={handleForgotPassword}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title="Giriş Yap"
            onPress={handleLogin}
            variant="primary"
            size="large"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            testID="login-button"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hesabın yok mu?</Text>
          <TouchableOpacity
            onPress={handleNavigateToRegister}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Text style={styles.footerLink}>Kayıt Ol</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
