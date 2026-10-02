/**
 * VoteButton Component
 * 
 * Upvote/downvote button with haptic feedback
 */

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { styles } from '../styles';
import type { VoteButtonProps } from '../types';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export default function VoteButton({
  type,
  count,
  isActive,
  onPress,
  disabled = false,
}: VoteButtonProps) {
  /**
   * Handle press with haptic feedback
   */
  const handlePress = () => {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    
    onPress();
  };

  const icon = type === 'up' ? '👍' : '👎';

  return (
    <TouchableOpacity
      style={[
        styles.voteButton,
        isActive && styles.voteButtonActive,
        type === 'up' && isActive && styles.voteButtonUpActive,
        type === 'down' && isActive && styles.voteButtonDownActive,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.voteIcon}>{icon}</Text>
      <Text style={[styles.voteCount, isActive && styles.voteCountActive]}>
        {count}
      </Text>
    </TouchableOpacity>
  );
}
