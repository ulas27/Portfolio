/**
 * SettingPicker Component
 * 
 * Picker setting item with modal
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { styles } from '../styles';
import type { SettingPickerProps } from '../types';

export default function SettingPicker({
  label,
  description,
  value,
  options,
  onValueChange,
}: SettingPickerProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  /**
   * Get selected option label
   */
  const getSelectedLabel = (): string => {
    const option = options.find((opt) => opt.value === value);
    return option?.label || '';
  };

  /**
   * Handle option selection
   */
  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.settingItemContent}>
          <Text style={styles.settingItemLabel}>{label}</Text>
          {description && (
            <Text style={styles.settingItemDescription}>{description}</Text>
          )}
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerValue}>{getSelectedLabel()}</Text>
          <Text style={styles.pickerChevron}>›</Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
            </View>

            {/* Options */}
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  index === options.length - 1 && styles.modalOptionLast,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalOptionLabel,
                    value === option.value && styles.modalOptionSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Text style={styles.modalOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
