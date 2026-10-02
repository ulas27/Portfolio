/**
 * Input Component
 * 
 * Reusable text input component
 * - Label support
 * - Error message display
 * - Left and right icons
 * - Secure text entry (password)
 * - Multiline support
 * - Character counter
 * - Focus animation
 * 
 * @example
 * ```tsx
 * <Input
 *   label="E-posta"
 *   value={email}
 *   onChangeText={setEmail}
 *   placeholder="ornek@email.com"
 *   error={emailError}
 *   leftIcon={<Icon name="email" />}
 * />
 * ```
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '@constants';
import { styles } from './styles';
import type { InputProps } from './types';

/**
 * Input Component
 */
export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  multiline = false,
  maxLength,
  showCharacterCount = false,
  disabled = false,
  containerStyle,
  inputStyle,
  testID,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderWidth = useSharedValue(1);

  // Focus animation
  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderWidth.value = withTiming(2, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, { duration: 200 });
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const characterCount = value.length;
  const isCharacterLimitExceeded = maxLength ? characterCount > maxLength : false;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          isFocused && !error && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          animatedStyle,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.disabled}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          multiline={multiline}
          maxLength={maxLength}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          testID={testID}
          accessibilityLabel={label || placeholder}
          {...textInputProps}
        />

        {/* Right Icon or Password Toggle */}
        {secureTextEntry ? (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            accessibilityLabel={isPasswordVisible ? 'Şifreyi gizle' : 'Şifreyi göster'}
          >
            <Text style={{ fontSize: 20 }}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Character Counter */}
      {showCharacterCount && maxLength && (
        <Text
          style={[
            styles.characterCount,
            isCharacterLimitExceeded && styles.characterCountError,
          ]}
        >
          {characterCount}/{maxLength}
        </Text>
      )}
    </View>
  );
}
