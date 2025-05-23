// Disabled performance utilities for deployment

import type { ComponentType, FC, ReactNode, ComponentProps } from 'react';

/**
 * Simple stub to prevent TypeScript build errors
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: ReactNode = null
): FC<ComponentProps<T>> {
  // Create a simple component that returns null
  const Component: FC<ComponentProps<T>> = () => null;
  return Component;
}

/**
 * Simple stub to prevent TypeScript build errors
 */
export function preloadCriticalImages(imagePaths: string[]): void {
  // Empty implementation 
  // This won't actually preload images but will satisfy TypeScript
  return;
}

/**
 * Simple stub to prevent TypeScript build errors
 */
export function deferNonCriticalJS(scriptSrc: string, async = true, defer = true): void {
  // Empty implementation
  // This won't actually load scripts but will satisfy TypeScript
  return;
}
