/**
 * Avatar Component
 * 
 * Display user avatar with placeholder
 */

import React from 'react';
import { View, Image, Text } from 'react-native';
import { styles } from '../styles';
import type { AvatarProps } from '../types';

export default function Avatar({ uri, size = 80, name }: AvatarProps) {
  /**
   * Get initials from name
   */
  const getInitials = (): string => {
    if (!name) return '👤';
    
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    
    return name[0].toUpperCase();
  };

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.avatarImage, { borderRadius: size / 2 }]}
        />
      ) : (
        <Text style={styles.avatarPlaceholder}>{getInitials()}</Text>
      )}
    </View>
  );
}
