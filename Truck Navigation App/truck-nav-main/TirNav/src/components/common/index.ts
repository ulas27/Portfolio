/**
 * Common Components Barrel Export
 * 
 * Reusable UI components
 * 
 * @example
 * ```tsx
 * import { Button, Input, Card, Loading } from '@components/common';
 * ```
 */

export { default as Button } from './Button';
export { default as Input } from './Input';
export { default as Card } from './Card';
export { default as Loading, Skeleton } from './Loading';
export { default as ErrorView } from './ErrorView';
export { default as EmptyState } from './EmptyState';

// Export types
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button/types';
export type { InputProps } from './Input/types';
export type { CardProps, CardPadding, CardElevation } from './Card/types';
export type { LoadingProps, SkeletonProps, LoadingSize, LoadingType } from './Loading/types';
export type { ErrorViewProps } from './ErrorView/types';
export type { EmptyStateProps } from './EmptyState/types';
