import * as React from 'react';

/**
 * Performance utility for lazy loading components
 * This is a simplified implementation for the deployment build
 */
export function lazyLoad<T extends React.ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>
): React.ComponentType<React.ComponentProps<T>> {
  // Create a wrapper component that doesn't use JSX syntax
  return function WrappedComponent(props: React.ComponentProps<T>) {
    // This is just a placeholder implementation to fix TypeScript errors
    // The actual lazy loading would be implemented in a real component
    // This will be replaced by the actual implementation after deployment
    const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
    
    React.useEffect(() => {
      let mounted = true;
      importFunction().then(module => {
        if (mounted) {
          setComponent(() => module.default);
        }
      });
      return () => { mounted = false; };
    }, []);
    
    if (!Component) {
      return React.createElement('div', null, 'Loading...');
    }
    
    return React.createElement(Component, props);
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
