/**
 * RouteDetailScreen Types
 */

import type { Route, RouteStep, RouteWarning } from '@types/route';

export interface RouteDetailScreenProps {
  route: {
    params: {
      routeId: string;
    };
  };
  navigation: any;
}

export interface RouteSummaryCardProps {
  /**
   * Route data
   */
  route: Route;

  /**
   * Show fuel estimate
   */
  showFuelEstimate?: boolean;
}

export interface MapPreviewProps {
  /**
   * Route to display
   */
  route: Route;

  /**
   * Press handler
   */
  onPress?: () => void;
}

export interface AlternativeRoutesCarouselProps {
  /**
   * All available routes
   */
  routes: Route[];

  /**
   * Selected route ID
   */
  selectedId: string;

  /**
   * Route selection handler
   */
  onSelect: (routeId: string) => void;
}

export interface AlternativeRouteCardProps {
  /**
   * Route data
   */
  route: Route;

  /**
   * Is selected
   */
  isSelected: boolean;

  /**
   * Press handler
   */
  onPress: () => void;

  /**
   * Comparison route (for showing difference)
   */
  comparisonRoute?: Route;
}

export interface WarningsSectionProps {
  /**
   * Route warnings
   */
  warnings: RouteWarning[];

  /**
   * Warning press handler
   */
  onWarningPress?: (warning: RouteWarning) => void;
}

export interface WarningItemProps {
  /**
   * Warning data
   */
  warning: RouteWarning;

  /**
   * Press handler
   */
  onPress?: () => void;
}

export interface InstructionsListProps {
  /**
   * Route steps
   */
  steps: RouteStep[];
}

export interface InstructionItemProps {
  /**
   * Step data
   */
  step: RouteStep;

  /**
   * Step index
   */
  index: number;

  /**
   * Is last item
   */
  isLast?: boolean;
}

export interface RouteStats {
  distance: number; // meters
  duration: number; // seconds
  fuelEstimate?: number; // liters
  tollCost?: number; // currency
}
