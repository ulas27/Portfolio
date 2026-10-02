/**
 * InstructionsList Component
 * 
 * Turn-by-turn navigation instructions
 */

import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import type { InstructionsListProps, InstructionItemProps } from '../types';

/**
 * Instruction Item Component
 */
function InstructionItem({ step, index, isLast = false }: InstructionItemProps) {
  /**
   * Format distance
   */
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    
    return `${(meters / 1000).toFixed(1)} km`;
  };

  /**
   * Format duration
   */
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    
    if (minutes < 1) {
      return `${seconds} sn`;
    }
    
    return `${minutes} dk`;
  };

  return (
    <View style={[styles.instructionItem, isLast && styles.instructionItemLast]}>
      {/* Index */}
      <View style={styles.instructionIndex}>
        <Text style={styles.instructionIndexText}>{index + 1}</Text>
      </View>

      {/* Content */}
      <View style={styles.instructionContent}>
        <Text style={styles.instructionText}>{step.instruction}</Text>

        <View style={styles.instructionMeta}>
          <Text style={styles.instructionDistance}>
            📏 {formatDistance(step.distance)}
          </Text>

          <Text style={styles.instructionDistance}>
            ⏱️ {formatDuration(step.duration)}
          </Text>

          {step.streetName && (
            <Text style={styles.instructionStreet} numberOfLines={1}>
              {step.streetName}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/**
 * InstructionsList Component
 */
export default function InstructionsList({ steps }: InstructionsListProps) {
  if (steps.length === 0) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ color: '#666' }}>Talimat bulunamadı</Text>
      </View>
    );
  }

  return (
    <View style={styles.instructionsList}>
      {steps.map((step, index) => (
        <InstructionItem
          key={index}
          step={step}
          index={index}
          isLast={index === steps.length - 1}
        />
      ))}
    </View>
  );
}
