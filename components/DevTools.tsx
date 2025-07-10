"use client";

import { useEffect } from 'react';

// DevTools component to include testing scripts in development mode
const DevTools = (): React.ReactElement | null => {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') return;
    
    // Dynamically import performance testing script
    const perfScript = document.createElement('script');
    perfScript.src = '/scripts/perf-test.js';
    perfScript.async = true;
    document.body.appendChild(perfScript);
    
    return () => {
      // Clean up script when component unmounts
      if (document.body.contains(perfScript)) {
        document.body.removeChild(perfScript);
      }
    };
  }, []);
  
  // This component doesn't render anything visible
  return null;
};

export default DevTools;
