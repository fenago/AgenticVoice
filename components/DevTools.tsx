"use client";

import { useEffect } from 'react';

// DevTools component to include testing scripts in development mode
const DevTools = (): React.ReactElement | null => {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    // Dynamically import performance testing scripts
    const perfScript = document.createElement('script');
    perfScript.src = '/scripts/performance-test.js';
    perfScript.async = true;
    document.body.appendChild(perfScript);
    
    // Dynamically import accessibility testing scripts
    const accessibilityScript = document.createElement('script');
    accessibilityScript.src = '/scripts/test-checks.js';
    accessibilityScript.async = true;
    document.body.appendChild(accessibilityScript);
    
    return () => {
      // Clean up scripts when component unmounts
      document.body.removeChild(perfScript);
      document.body.removeChild(accessibilityScript);
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
};

export default DevTools;
