/**
 * AddWarningScreen Types
 */

import type { WarningType, Coordinates } from '@types';

export interface AddWarningScreenProps {
  route: {
    params: {
      location: Coordinates;
    };
  };
  navigation: any;
}

export interface WarningTypeOption {
  value: WarningType;
  label: string;
  icon: string;
  description: string;
}

export interface WarningTypeButtonProps {
  type: WarningTypeOption;
  isSelected: boolean;
  onPress: () => void;
}

export interface LocationDisplayProps {
  location: Coordinates;
  address?: string;
  onChangeLocation?: () => void;
}

export interface AddWarningFormData {
  type: WarningType | null;
  description: string;
  imageUri: string | null;
  location: Coordinates;
}

export interface ImagePickerResult {
  uri: string;
  type: string;
  fileName: string;
  fileSize: number;
}
