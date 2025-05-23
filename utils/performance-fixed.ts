import { lazy } from 'react';
import React from 'react';

// Function to create a lazy-loaded component with type safety
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback: React.ReactNode = null
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = lazy(importFn);
  
  const Component = (props: React.ComponentProps<T>): React.ReactElement => {
    return (
      <React.Suspense fallback={fallback}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
  
  return Component;
}

// Function to preload critical images
export function preloadCriticalImages(imagePaths: string[]): void {
  if (typeof window === 'undefined') return;
  
  imagePaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = path;
    document.head.appendChild(link);
  });
}

// Function to defer non-critical JavaScript
export function deferNonCriticalJS(scriptSrc: string, async = true, defer = true): void {
  if (typeof window === 'undefined') return;
  
  const script = document.createElement('script');
  script.src = scriptSrc;
  if (async) script.async = true;
  if (defer) script.defer = true;
  
  // Add the script element to the end of the body to avoid blocking rendering
  document.body.appendChild(script);
}
