/**
 * SettingsScreen Types
 */

export interface SettingsScreenProps {
  navigation: any;
}

export interface AppSettings {
  notifications: boolean;
  voiceAlerts: boolean;
  mapStyle: 'standard' | 'satellite' | 'hybrid';
  distanceUnit: 'km' | 'mi';
  theme: 'light' | 'dark' | 'auto';
}

export interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export interface SettingToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export interface SettingPickerProps {
  label: string;
  description?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onValueChange: (value: string) => void;
}

export interface SettingButtonProps {
  label: string;
  description?: string;
  onPress: () => void;
  isDestructive?: boolean;
}
