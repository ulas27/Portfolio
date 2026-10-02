/**
 * WarningDetailScreen Types
 */

import type { Warning, WarningType, Coordinates } from '@types';

export interface WarningDetailScreenProps {
  route: {
    params: {
      warningId: string;
    };
  };
  navigation: any;
}

export interface WarningHeaderProps {
  type: WarningType;
}

export interface WarningInfoProps {
  createdBy: string;
  createdAt: Date;
  location: Coordinates;
  address?: string;
}

export interface MiniMapProps {
  location: Coordinates;
  onPress?: () => void;
}

export interface VoteButtonProps {
  type: 'up' | 'down';
  count: number;
  isActive: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export type UserVote = 'up' | 'down' | null;
