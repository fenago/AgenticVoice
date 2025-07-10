'use client';

import React, { forwardRef } from 'react';
import { DesignSystem } from '@/app/admin/styles/design-system';

// Card variant types
type CardVariant = 'default' | 'elevated' | 'gradient' | 'outline';
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  interactive?: boolean;
  children: React.ReactNode;
}

// 🎨 AgenticVoice Card Component with Brand Design
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hover = false,
      interactive = false,
      className = '',
      children,
      style,
      ...props
    },
    ref
  ) => {
    // Padding configurations
    const paddingStyles = {
      none: '0',
      sm: DesignSystem.spacing[4],
      md: DesignSystem.spacing[6],
      lg: DesignSystem.spacing[8],
      xl: DesignSystem.spacing[10],
    };

    // Variant configurations
    const variantStyles = {
      default: {
        background: 'white',
        border: `1px solid ${DesignSystem.colors.neutral[200]}`,
        boxShadow: DesignSystem.shadows.md,
      },
      elevated: {
        background: 'white',
        border: 'none',
        boxShadow: DesignSystem.shadows.xl,
      },
      gradient: {
        background: DesignSystem.gradients.subtle,
        border: `1px solid ${DesignSystem.colors.neutral[100]}`,
        boxShadow: DesignSystem.shadows.lg,
      },
      outline: {
        background: 'transparent',
        border: `2px solid ${DesignSystem.colors.neutral[200]}`,
        boxShadow: 'none',
      },
    };

    const baseStyles: React.CSSProperties = {
      borderRadius: DesignSystem.borderRadius.xl,
      padding: paddingStyles[padding],
      transition: `all ${DesignSystem.animations.transition.normal}`,
      cursor: interactive ? 'pointer' : 'default',
      position: 'relative',
      overflow: 'hidden',
      ...variantStyles[variant],
      ...style,
    };

    const hoverStyles: React.CSSProperties = hover || interactive ? {
      transform: 'translateY(-2px)',
      boxShadow: variant === 'outline' ? DesignSystem.shadows.md : DesignSystem.shadows['2xl'],
      borderColor: variant === 'outline' ? DesignSystem.colors.primary[200] : undefined,
    } : {};

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hover || interactive) {
        Object.assign(e.currentTarget.style, { ...baseStyles, ...hoverStyles });
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
      if (hover || interactive) {
        Object.assign(e.currentTarget.style, baseStyles);
      }
    };

    return (
      <div
        ref={ref}
        style={baseStyles}
        className={`agentic-card agentic-card--${variant} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
        
        {/* Focus ring for interactive cards */}
        <style jsx>{`
          .agentic-card {
            position: relative;
          }
          
          .agentic-card:focus-visible {
            outline: 2px solid ${DesignSystem.colors.primary[500]};
            outline-offset: 2px;
          }
          
          .agentic-card--gradient::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: ${DesignSystem.gradients.primary};
            opacity: 0;
            transition: opacity ${DesignSystem.animations.transition.slow};
            border-radius: inherit;
            z-index: -1;
          }
          
          .agentic-card--gradient:hover::before {
            opacity: 0.03;
          }
        `}</style>
      </div>
    );
  }
);

Card.displayName = 'Card';

// 🎯 Card Header Component
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`agentic-card-header ${className}`}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: DesignSystem.spacing[4],
        }}
        {...props}
      >
        <div>
          {children || (
            <>
              {title && (
                <h3
                  style={{
                    fontSize: DesignSystem.typography.fontSize.lg,
                    fontWeight: DesignSystem.typography.fontWeight.semibold,
                    color: DesignSystem.colors.neutral[900],
                    marginBottom: subtitle ? DesignSystem.spacing[1] : 0,
                    margin: 0,
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: DesignSystem.typography.fontSize.sm,
                    color: DesignSystem.colors.neutral[600],
                    margin: 0,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// 🎯 Card Content Component
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`agentic-card-content ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

// 🎯 Card Footer Component
interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`agentic-card-footer ${className}`}
        style={{
          marginTop: DesignSystem.spacing[4],
          paddingTop: DesignSystem.spacing[4],
          borderTop: `1px solid ${DesignSystem.colors.neutral[200]}`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
export { CardHeader, CardContent, CardFooter };
export type { CardProps, CardVariant, CardPadding };
