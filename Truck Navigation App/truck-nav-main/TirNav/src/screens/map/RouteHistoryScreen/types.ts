/**
 * RouteHistoryScreen Types
 */

import type { Route } from '@types';

export interface RouteHistoryScreenProps {
  navigation: any;
}

export type FilterType = 'all' | 'today' | 'week' | 'month';

export interface RouteCardProps {
  route: Route;
  onPress: () => void;
  onReuse?: () => void;
  onDelete?: () => void;
}

export interface FilterChipProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export interface GroupedRoutes {
  [key: string]: Route[];
}

export interface RouteSection {
  title: string;
  data: Route[];
}
