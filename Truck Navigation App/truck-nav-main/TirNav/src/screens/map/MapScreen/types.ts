/**
 * MapScreen Types
 */

import type { Region } from 'react-native-maps';
import type { Coordinates } from '@types/common';
import type { Warning } from '@types/warning';

export interface MapScreenState {
  region: Region;
  userLocation: Coordinates | null;
  warnings: Warning[];
  selectedWarning: Warning | null;
  isLoading: boolean;
}

export interface MapScreenProps {
  navigation: any;
  route: any;
}

export interface WarningMarkerProps {
  warning: Warning;
  onPress: (warning: Warning) => void;
}

export interface FloatingButtonsProps {
  onLocationPress: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onAddWarning: () => void;
}

export interface SearchBarProps {
  onPress: () => void;
}

export interface WarningListProps {
  warnings: Warning[];
  userLocation: Coordinates | null;
  onWarningPress: (warning: Warning) => void;
}
