/**
 * OnboardingScreen Types
 */

export interface OnboardingSlide {
  /**
   * Slide unique key
   */
  key: string;

  /**
   * Slide title
   */
  title: string;

  /**
   * Slide description
   */
  description: string;

  /**
   * Slide illustration/icon
   */
  illustration: string;

  /**
   * Background color
   */
  backgroundColor?: string;
}

export interface OnboardingScreenProps {
  navigation: any;
}
