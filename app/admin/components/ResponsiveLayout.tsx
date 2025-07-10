'use client';

import React from 'react';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
  className?: string;
}

// 📱 Main Responsive Container
export function ResponsiveContainer({ 
  children, 
  maxWidth = '1200px', 
  padding = DesignSystem.spacing[6],
  className = '' 
}: ResponsiveLayoutProps) {
  const { isMobile, isTablet } = useBreakpoint();
  
  const responsivePadding = isMobile 
    ? DesignSystem.spacing[3] 
    : isTablet 
    ? DesignSystem.spacing[4] 
    : padding;

  return (
    <div
      className={`responsive-container ${className}`}
      style={{
        maxWidth,
        margin: '0 auto',
        padding: `0 ${responsivePadding}`,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

// 📊 Dashboard Grid Layout
interface DashboardGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export function DashboardGrid({ 
  children, 
  columns = 12, 
  gap = DesignSystem.spacing[6],
  className = '' 
}: DashboardGridProps) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  
  const responsiveColumns = isMobile 
    ? '1fr' 
    : isTablet 
    ? 'repeat(4, 1fr)' 
    : isDesktop && columns > 8 
    ? 'repeat(8, 1fr)' 
    : `repeat(${columns}, 1fr)`;
    
  const responsiveGap = isMobile ? DesignSystem.spacing[4] : gap;

  return (
    <div
      className={`dashboard-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: responsiveColumns,
        gap: responsiveGap,
      }}
    >
      {children}
    </div>
  );
}

// 🎯 Grid Item with Responsive Spans
interface GridItemProps {
  children: React.ReactNode;
  span?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  className?: string;
}

export function GridItem({ 
  children, 
  span = { desktop: 1, tablet: 1, mobile: 1 },
  className = '' 
}: GridItemProps) {
  const { isMobile, isTablet } = useBreakpoint();
  
  const responsiveSpan = isMobile 
    ? (span.mobile || span.tablet || span.desktop || 1)
    : isTablet 
    ? (span.tablet || span.desktop || 1)
    : (span.desktop || 1);

  return (
    <div
      className={`grid-item ${className}`}
      style={{
        gridColumn: `span ${responsiveSpan}`,
      }}
    >
      {children}
    </div>
  );
}

// 📋 Content Layout with Sidebar Support
interface ContentLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarWidth?: string;
  gap?: string;
  className?: string;
}

export function ContentLayout({ 
  children, 
  sidebar, 
  sidebarWidth = '300px', 
  gap = DesignSystem.spacing[6],
  className = '' 
}: ContentLayoutProps) {
  const { isTablet, isMobile } = useBreakpoint();
  
  if (!sidebar) {
    return <div className={className}>{children}</div>;
  }

  const isMobileLayout = isTablet || isMobile;
  const responsiveGap = isMobileLayout ? DesignSystem.spacing[4] : gap;
  const gridColumns = isMobileLayout ? '1fr' : `1fr ${sidebarWidth}`;

  return (
    <div
      className={`content-layout ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: gridColumns,
        gap: responsiveGap,
        alignItems: 'start',
      }}
    >
      <main>{children}</main>
      <aside style={{ order: isMobileLayout ? -1 : 0 }}>
        {sidebar}
      </aside>
    </div>
  );
}

// 📱 Mobile Stack Layout
interface MobileStackProps {
  children: React.ReactNode;
  spacing?: string;
  className?: string;
}

export function MobileStack({ 
  children, 
  spacing = DesignSystem.spacing[4], 
  className = '' 
}: MobileStackProps) {
  const { isDesktop } = useBreakpoint();
  
  return (
    <div
      className={`mobile-stack ${className}`}
      style={{
        display: isDesktop ? 'grid' : 'flex',
        flexDirection: isDesktop ? undefined : 'column',
        gridTemplateColumns: isDesktop ? 'repeat(auto-fit, minmax(300px, 1fr))' : undefined,
        gap: isDesktop ? DesignSystem.spacing[6] : spacing,
      }}
    >
      {children}
    </div>
  );
}

// 🎨 Section with Responsive Padding
interface SectionProps {
  children: React.ReactNode;
  padding?: {
    desktop?: string;
    tablet?: string;
    mobile?: string;
  };
  background?: string;
  className?: string;
}

export function Section({ 
  children, 
  padding = {
    desktop: DesignSystem.spacing[8],
    tablet: DesignSystem.spacing[6],
    mobile: DesignSystem.spacing[4],
  },
  background = 'transparent',
  className = '' 
}: SectionProps) {
  const { isMobile, isTablet } = useBreakpoint();
  
  const responsivePadding = isMobile 
    ? padding.mobile 
    : isTablet 
    ? padding.tablet 
    : padding.desktop;

  return (
    <section
      className={`section ${className}`}
      style={{
        padding: responsivePadding,
        backgroundColor: background,
      }}
    >
      {children}
    </section>
  );
}

// 🎯 Flex Layout Utilities
interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: string;
  wrap?: boolean;
  className?: string;
}

export function Flex({ 
  children, 
  direction = 'row', 
  align = 'start', 
  justify = 'start', 
  gap = '0',
  wrap = false,
  className = '' 
}: FlexProps) {
  const alignMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
  };

  const justifyMap = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: direction,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        gap,
        flexWrap: wrap ? 'wrap' : 'nowrap',
      }}
    >
      {children}
    </div>
  );
}

// 📱 Responsive Breakpoint Hook
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
}

// 🎪 Page Layout with Header Space
interface PageLayoutProps {
  children: React.ReactNode;
  hasHeader?: boolean;
  hasSidebar?: boolean;
  sidebarCollapsed?: boolean;
  className?: string;
}

export function PageLayout({ 
  children, 
  hasHeader = true, 
  hasSidebar = true,
  sidebarCollapsed = false,
  className = '' 
}: PageLayoutProps) {
  const { isMobileOrTablet } = useBreakpoint();
  const headerHeight = '72px';
  const sidebarWidth = sidebarCollapsed ? '80px' : '280px';

  return (
    <div
      className={`page-layout ${className}`}
      style={{
        minHeight: '100vh',
        paddingTop: hasHeader ? headerHeight : '0',
        paddingLeft: hasSidebar && !isMobileOrTablet ? sidebarWidth : '0',
        transition: `padding-left ${DesignSystem.animations.transition.normal}`,
      }}
    >
      {children}
    </div>
  );
}

// 🎨 Card Grid for Dashboard Items
interface CardGridProps {
  children: React.ReactNode;
  minCardWidth?: string;
  gap?: string;
  className?: string;
}

export function CardGrid({ 
  children, 
  minCardWidth = '300px', 
  gap = DesignSystem.spacing[6],
  className = '' 
}: CardGridProps) {
  const { isMobileOrTablet } = useBreakpoint();
  
  return (
    <div
      className={`card-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobileOrTablet 
          ? '1fr' 
          : `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`,
        gap: isMobileOrTablet ? DesignSystem.spacing[4] : gap,
      }}
    >
      {children}
    </div>
  );
}

// 📊 Stats Grid for Metrics
interface StatsGridProps {
  children: React.ReactNode;
  columns?: {
    desktop?: number;
    tablet?: number;
    mobile?: number;
  };
  gap?: string;
  className?: string;
}

export function StatsGrid({ 
  children, 
  columns = { desktop: 4, tablet: 2, mobile: 1 },
  gap = DesignSystem.spacing[4],
  className = '' 
}: StatsGridProps) {
  const { isMobile, isTablet } = useBreakpoint();
  
  const responsiveColumns = isMobile 
    ? columns.mobile 
    : isTablet 
    ? columns.tablet 
    : columns.desktop;

  return (
    <div
      className={`stats-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${responsiveColumns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
}
