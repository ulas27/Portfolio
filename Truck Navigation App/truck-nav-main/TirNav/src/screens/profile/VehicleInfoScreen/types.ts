/**
 * VehicleInfoScreen Types
 */

export interface VehicleFormData {
  /**
   * Vehicle height in meters
   */
  height: number;

  /**
   * Vehicle width in meters
   */
  width: number;

  /**
   * Vehicle length in meters
   */
  length: number;

  /**
   * Vehicle weight in tons
   */
  weight: number;

  /**
   * Has dangerous goods
   */
  hasDangerousGoods: boolean;

  /**
   * Number of axles (optional)
   */
  axleCount?: number;
}

export interface VehicleInfoScreenProps {
  navigation: any;
  route: any;
}

export interface SliderInputProps {
  /**
   * Label text
   */
  label: string;

  /**
   * Current value
   */
  value: number;

  /**
   * Value change handler
   */
  onChange: (value: number) => void;

  /**
   * Minimum value
   */
  min: number;

  /**
   * Maximum value
   */
  max: number;

  /**
   * Step size
   */
  step: number;

  /**
   * Unit text (e.g., "m", "ton")
   */
  unit: string;

  /**
   * Disabled state
   */
  disabled?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
