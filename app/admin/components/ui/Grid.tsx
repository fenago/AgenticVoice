'use client';

import React, { forwardRef } from 'react';
import { DesignSystem } from '@/app/admin/styles/design-system';

// Grid system types
type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type GridGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type GridAlign = 'start' | 'center' | 'end' | 'stretch';
type GridJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

// Responsive breakpoint object
interface ResponsiveValue<T> {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Grid Container Props
interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: GridColumns | ResponsiveValue<GridColumns>;
  gap?: GridGap | ResponsiveValue<GridGap>;
  alignItems?: GridAlign;
  justifyContent?: GridJustify;
  autoFit?: boolean; // Auto-fit columns with minmax
  minColumnWidth?: string; // For auto-fit grid
  children: React.ReactNode;
}

// Grid Item Props
interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: GridColumns | ResponsiveValue<GridColumns>;
  rowSpan?: number;
  colStart?: number;
  colEnd?: number;
  rowStart?: number;
  rowEnd?: number;
  children: React.ReactNode;
}

// 🎨 AgenticVoice Grid Container Component
const Grid = forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 1,
      gap = 'md',
      alignItems = 'stretch',
      justifyContent = 'start',
      autoFit = false,
      minColumnWidth = '250px',
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Gap configurations
    const gapValues = {
      none: '0',
      xs: DesignSystem.spacing[1],
      sm: DesignSystem.spacing[2],
      md: DesignSystem.spacing[4],
      lg: DesignSystem.spacing[6],
      xl: DesignSystem.spacing[8],
      '2xl': DesignSystem.spacing[10],
    };

    // Generate responsive CSS for columns and gap
    const generateResponsiveStyles = () => {
      let styles = '';

      // Handle columns
      if (typeof columns === 'object') {
        Object.entries(columns).forEach(([breakpoint, value]) => {
          if (breakpoint === 'base') {
            styles += `
              grid-template-columns: ${autoFit 
                ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` 
                : `repeat(${value}, 1fr)`};
            `;
          } else {
            const breakpointValue = DesignSystem.breakpoints[breakpoint as keyof typeof DesignSystem.breakpoints];
            styles += `
              @media (min-width: ${breakpointValue}) {
                .agentic-grid-${Date.now()} {
                  grid-template-columns: ${autoFit 
                    ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` 
                    : `repeat(${value}, 1fr)`};
                }
              }
            `;
          }
        });
      } else {
        styles += `
          grid-template-columns: ${autoFit 
            ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` 
            : `repeat(${columns}, 1fr)`};
        `;
      }

      // Handle gap
      if (typeof gap === 'object') {
        Object.entries(gap).forEach(([breakpoint, value]) => {
          if (breakpoint === 'base') {
            styles += `gap: ${gapValues[value as GridGap]};`;
          } else {
            const breakpointValue = DesignSystem.breakpoints[breakpoint as keyof typeof DesignSystem.breakpoints];
            styles += `
              @media (min-width: ${breakpointValue}) {
                .agentic-grid-${Date.now()} {
                  gap: ${gapValues[value as GridGap]};
                }
              }
            `;
          }
        });
      } else {
        styles += `gap: ${gapValues[gap]};`;
      }

      return styles;
    };

    const baseStyles: React.CSSProperties = {
      display: 'grid',
      alignItems,
      justifyContent,
      ...style,
    };

    // For simple non-responsive grids, use inline styles
    if (typeof columns === 'number' && typeof gap === 'string') {
      baseStyles.gridTemplateColumns = autoFit 
        ? `repeat(auto-fit, minmax(${minColumnWidth}, 1fr))` 
        : `repeat(${columns}, 1fr)`;
      baseStyles.gap = gapValues[gap];
    }

    const gridId = `agentic-grid-${Date.now()}`;

    return (
      <>
        {/* Responsive styles for complex configurations */}
        {(typeof columns === 'object' || typeof gap === 'object') && (
          <style jsx>{`
            .${gridId} {
              ${generateResponsiveStyles()}
            }
          `}</style>
        )}
        
        <div
          ref={ref}
          style={baseStyles}
          className={`agentic-grid ${gridId} ${className}`}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);

Grid.displayName = 'Grid';

// 🎯 Grid Item Component
const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      colSpan,
      rowSpan,
      colStart,
      colEnd,
      rowStart,
      rowEnd,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const generateItemStyles = (): React.CSSProperties => {
      const itemStyles: React.CSSProperties = {};

      if (colSpan) {
        if (typeof colSpan === 'number') {
          itemStyles.gridColumn = `span ${colSpan}`;
        }
        // Note: Responsive colSpan would need CSS-in-JS solution for full support
      }

      if (rowSpan) itemStyles.gridRow = `span ${rowSpan}`;
      if (colStart) itemStyles.gridColumnStart = colStart;
      if (colEnd) itemStyles.gridColumnEnd = colEnd;
      if (rowStart) itemStyles.gridRowStart = rowStart;
      if (rowEnd) itemStyles.gridRowEnd = rowEnd;

      return itemStyles;
    };

    const itemStyles: React.CSSProperties = {
      ...generateItemStyles(),
      ...style,
    };

    return (
      <div
        ref={ref}
        style={itemStyles}
        className={`agentic-grid-item ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GridItem.displayName = 'GridItem';

// 🎯 Flex Container Component (Alternative to Grid)
interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: GridGap;
  children: React.ReactNode;
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      direction = 'row',
      wrap = 'nowrap',
      align = 'stretch',
      justify = 'start',
      gap = 'none',
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const gapValues = {
      none: '0',
      xs: DesignSystem.spacing[1],
      sm: DesignSystem.spacing[2],
      md: DesignSystem.spacing[4],
      lg: DesignSystem.spacing[6],
      xl: DesignSystem.spacing[8],
      '2xl': DesignSystem.spacing[10],
    };

    const justifyContentMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      between: 'space-between',
      around: 'space-around',
      evenly: 'space-evenly',
    };

    const alignItemsMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
      stretch: 'stretch',
      baseline: 'baseline',
    };

    const flexStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: direction,
      flexWrap: wrap,
      alignItems: alignItemsMap[align],
      justifyContent: justifyContentMap[justify],
      gap: gapValues[gap],
      ...style,
    };

    return (
      <div
        ref={ref}
        style={flexStyles}
        className={`agentic-flex ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = 'Flex';

// 🎯 Container Component for Max-Width Layouts
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  centerContent?: boolean;
  padding?: GridGap;
  children: React.ReactNode;
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      maxWidth = '6xl',
      centerContent = true,
      padding = 'md',
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    const maxWidthValues = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '4xl': '1792px',
      '6xl': '2048px',
      full: '100%',
    };

    const paddingValues = {
      none: '0',
      xs: DesignSystem.spacing[1],
      sm: DesignSystem.spacing[2],
      md: DesignSystem.spacing[4],
      lg: DesignSystem.spacing[6],
      xl: DesignSystem.spacing[8],
      '2xl': DesignSystem.spacing[10],
    };

    const containerStyles: React.CSSProperties = {
      width: '100%',
      maxWidth: maxWidthValues[maxWidth],
      margin: centerContent ? '0 auto' : undefined,
      padding: `0 ${paddingValues[padding]}`,
      ...style,
    };

    return (
      <div
        ref={ref}
        style={containerStyles}
        className={`agentic-container ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Grid;
export { GridItem, Flex, Container };
export type { 
  GridProps, 
  GridItemProps, 
  FlexProps, 
  ContainerProps,
  GridColumns, 
  GridGap, 
  ResponsiveValue 
};
