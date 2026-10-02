/**
 * Vehicle related type definitions
 */

export type VehicleType = 'truck' | 'semi_trailer' | 'trailer' | 'tanker';

export interface Vehicle {
  id: string;
  userId: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  dimensions: VehicleDimensions;
  weight: VehicleWeight;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleDimensions {
  height: number; // meters
  width: number; // meters
  length: number; // meters
}

export interface VehicleWeight {
  empty: number; // tons
  loaded: number; // tons
  maxLoad: number; // tons
}

export interface VehicleProfile {
  vehicle: Vehicle;
  restrictions: VehicleRestrictions;
}

export interface VehicleRestrictions {
  maxHeight: number;
  maxWidth: number;
  maxLength: number;
  maxWeight: number;
  hazardousMaterials: boolean;
  requiresSpecialPermit: boolean;
}

export interface CreateVehicleData {
  name: string;
  type: VehicleType;
  licensePlate: string;
  dimensions: VehicleDimensions;
  weight: VehicleWeight;
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  id: string;
}

export interface VehicleState {
  vehicles: Vehicle[];
  activeVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Simplified VehicleInfo interface
 * For basic vehicle information without full Vehicle object
 */
export interface VehicleInfo {
  height: number;        // meters
  width: number;         // meters
  length: number;        // meters
  weight: number;        // tons
  hasDangerousGoods: boolean;
  axleCount?: number;
}

/**
 * Default truck dimensions
 * Standard Turkish truck dimensions
 */
export const DEFAULT_TRUCK_DIMENSIONS: VehicleInfo = {
  height: 4.0,
  width: 2.5,
  length: 16.5,
  weight: 40,
  hasDangerousGoods: false,
  axleCount: 5,
} as const;
