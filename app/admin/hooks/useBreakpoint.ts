'use client';

import { useState, useEffect } from 'react';

// Breakpoint values matching design system
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
} as const;

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isMobileOrTablet: boolean;
  isTabletOrDesktop: boolean;
  width: number;
}

/**
 * Custom hook for responsive breakpoint detection
 * Matches AgenticVoice design system breakpoints:
 * - Mobile: < 768px
 * - Tablet: 768px - 1023px  
 * - Desktop: >= 1024px
 */
export function useBreakpoint(): BreakpointState {
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // Initialize with current window width
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate breakpoint states
  const isMobile = windowWidth < BREAKPOINTS.mobile;
  const isTablet = windowWidth >= BREAKPOINTS.mobile && windowWidth < BREAKPOINTS.tablet;
  const isDesktop = windowWidth >= BREAKPOINTS.tablet;
  const isMobileOrTablet = windowWidth < BREAKPOINTS.tablet;
  const isTabletOrDesktop = windowWidth >= BREAKPOINTS.mobile;

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isTabletOrDesktop,
    width: windowWidth,
  };
}

/**
 * Hook for getting current breakpoint name
 */
export function useCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const { isMobile, isTablet } = useBreakpoint();
  
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Hook for checking if current screen matches a specific breakpoint
 */
export function useMatchBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  switch (breakpoint) {
    case 'mobile':
      return isMobile;
    case 'tablet':
      return isTablet;
    case 'desktop':
      return isDesktop;
    default:
      return false;
  }
}
