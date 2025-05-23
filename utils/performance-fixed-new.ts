import { lazy } from 'react';
import React from 'react';

// Simple factory function for lazy-loaded components
export function lazyLoad<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  const LazyComponent = lazy(importFn);
  
  return function WithSuspense(props: any) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
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
