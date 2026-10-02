/**
 * RouteSearchModal Types
 */

import type { Route, RoutePoint } from '@types/route';

export interface RouteSearchModalProps {
  /**
   * Modal visibility
   */
  isVisible: boolean;

  /**
   * Close handler
   */
  onClose: () => void;

  /**
   * Route calculated callback
   */
  onRouteCalculated: (routes: Route[]) => void;
}

export interface SearchInputProps {
  /**
   * Label text
   */
  label: string;

  /**
   * Placeholder text
   */
  placeholder: string;

  /**
   * Current value
   */
  value: string;

  /**
   * Value change handler
   */
  onChangeText: (text: string) => void;

  /**
   * Search results
   */
  results: RoutePoint[];

  /**
   * Result selected handler
   */
  onSelectResult: (result: RoutePoint) => void;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Show current location button
   */
  showCurrentLocation?: boolean;

  /**
   * Current location handler
   */
  onUseCurrentLocation?: () => void;

  /**
   * Auto focus
   */
  autoFocus?: boolean;
}

export interface SearchResultItemProps {
  /**
   * Route point data
   */
  item: RoutePoint;

  /**
   * Press handler
   */
  onPress: (item: RoutePoint) => void;

  /**
   * Distance from current location (optional)
   */
  distance?: number;
}

export interface RecentSearchesProps {
  /**
   * Recent searches list
   */
  searches: RecentSearch[];

  /**
   * Search selected handler
   */
  onSelectSearch: (search: RecentSearch) => void;

  /**
   * Clear all handler
   */
  onClearAll: () => void;
}

export interface RouteOptionsProps {
  /**
   * Avoid tolls
   */
  avoidTolls: boolean;

  /**
   * Avoid tolls change handler
   */
  onAvoidTollsChange: (value: boolean) => void;

  /**
   * Avoid highways
   */
  avoidHighways: boolean;

  /**
   * Avoid highways change handler
   */
  onAvoidHighwaysChange: (value: boolean) => void;

  /**
   * Route type (fastest/shortest)
   */
  routeType: 'fastest' | 'shortest';

  /**
   * Route type change handler
   */
  onRouteTypeChange: (value: 'fastest' | 'shortest') => void;
}

export interface RecentSearch {
  id: string;
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  timestamp: number;
}

export interface RouteSearchState {
  startPoint: RoutePoint | null;
  endPoint: RoutePoint | null;
  startQuery: string;
  endQuery: string;
  startSearchResults: RoutePoint[];
  endSearchResults: RoutePoint[];
  isSearchingStart: boolean;
  isSearchingEnd: boolean;
  isCalculating: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  routeType: 'fastest' | 'shortest';
  recentSearches: RecentSearch[];
  activeInput: 'start' | 'end' | null;
}
