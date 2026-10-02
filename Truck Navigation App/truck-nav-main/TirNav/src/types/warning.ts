/**
 * Warning and hazard related type definitions
 */

import { LatLng } from './common';
import { WarningType, WarningSeverity } from './route';

export interface Warning {
  id: string;
  userId: string;
  type: WarningType;
  severity: WarningSeverity;
  location: LatLng;
  address: string;
  title: string;
  description: string;
  images?: string[];
  isVerified: boolean;
  verificationCount: number;
  reportCount: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWarningData {
  type: WarningType;
  severity: WarningSeverity;
  location: LatLng;
  address: string;
  title: string;
  description: string;
  images?: string[];
  expiresAt?: Date;
}

export interface UpdateWarningData extends Partial<CreateWarningData> {
  id: string;
}

export interface WarningVerification {
  warningId: string;
  userId: string;
  isValid: boolean;
  comment?: string;
  createdAt: Date;
}

export interface WarningReport {
  warningId: string;
  userId: string;
  reason: WarningReportReason;
  comment?: string;
  createdAt: Date;
}

export type WarningReportReason =
  | 'outdated'
  | 'incorrect_location'
  | 'false_information'
  | 'duplicate'
  | 'spam'
  | 'other';

export interface WarningFilter {
  types?: WarningType[];
  severities?: WarningSeverity[];
  radius?: number; // meters
  center?: LatLng;
  onlyVerified?: boolean;
}

export interface WarningState {
  warnings: Warning[];
  nearbyWarnings: Warning[];
  selectedWarning: Warning | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Re-export WarningType for convenience
 */
export { WarningType, WarningSeverity } from './route';

/**
 * Warning vote actions
 */
export interface WarningVote {
  warningId: string;
  userId: string;
  vote: 'up' | 'down';
  createdAt: Date;
}
