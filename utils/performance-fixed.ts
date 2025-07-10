// Disabled performance utilities for deployment

/**
 * Simple stub to prevent TypeScript build errors
 */
export function lazyLoad(importFn: () => Promise<any>): any {
  return function(): null { return null; };
}

/**
 * Simple stub to prevent TypeScript build errors
 */
export function preloadCriticalImages(imagePaths: string[]): void {
  // Empty implementation
}

/**
 * Simple stub to prevent TypeScript build errors
 */
export function deferNonCriticalJS(scriptSrc: string, async = true, defer = true): void {
  // Empty implementation
}
