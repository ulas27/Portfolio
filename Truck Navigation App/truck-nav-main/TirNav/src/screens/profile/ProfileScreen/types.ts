/**
 * ProfileScreen Types
 */

export interface ProfileScreenProps {
  navigation: any;
}

export interface UserStats {
  totalRoutes: number;
  totalKm: number;
  totalWarnings: number;
}

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
}

export interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  isDestructive?: boolean;
  showChevron?: boolean;
}

export interface AvatarProps {
  uri?: string | null;
  size?: number;
  name?: string;
}
