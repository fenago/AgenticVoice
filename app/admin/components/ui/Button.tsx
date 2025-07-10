'use client';

import React, { forwardRef } from 'react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Loader2 } from 'lucide-react';

// Button variant types
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// 🎨 AgenticVoice Button Component with Brand Gradients
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Size configurations
    const sizeStyles = {
      sm: {
        padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
        fontSize: DesignSystem.typography.fontSize.xs,
        minHeight: '32px',
      },
      md: {
        padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[4]}`,
        fontSize: DesignSystem.typography.fontSize.sm,
        minHeight: '40px',
      },
      lg: {
        padding: `${DesignSystem.spacing[4]} ${DesignSystem.spacing[6]}`,
        fontSize: DesignSystem.typography.fontSize.base,
        minHeight: '48px',
      },
      xl: {
        padding: `${DesignSystem.spacing[5]} ${DesignSystem.spacing[8]}`,
        fontSize: DesignSystem.typography.fontSize.lg,
        minHeight: '56px',
      },
    };

    // Variant configurations
    const variantStyles = {
      primary: {
        background: DesignSystem.gradients.primary,
        color: 'white',
        border: 'none',
        boxShadow: DesignSystem.shadows.md,
        hover: {
          boxShadow: DesignSystem.shadows.lg,
          transform: 'translateY(-1px)',
        },
      },
      secondary: {
        background: 'white',
        color: DesignSystem.colors.primary[600],
        border: `2px solid ${DesignSystem.colors.primary[200]}`,
        boxShadow: DesignSystem.shadows.sm,
        hover: {
          background: DesignSystem.colors.primary[50],
          borderColor: DesignSystem.colors.primary[300],
          boxShadow: DesignSystem.shadows.md,
        },
      },
      outline: {
        background: 'transparent',
        color: DesignSystem.colors.neutral[700],
        border: `1px solid ${DesignSystem.colors.neutral[300]}`,
        boxShadow: 'none',
        hover: {
          background: DesignSystem.colors.neutral[50],
          borderColor: DesignSystem.colors.neutral[400],
        },
      },
      ghost: {
        background: 'transparent',
        color: DesignSystem.colors.neutral[700],
        border: 'none',
        boxShadow: 'none',
        hover: {
          background: DesignSystem.colors.neutral[100],
        },
      },
      danger: {
        background: DesignSystem.colors.error,
        color: 'white',
        border: 'none',
        boxShadow: DesignSystem.shadows.md,
        hover: {
          background: '#dc2626',
          boxShadow: DesignSystem.shadows.lg,
        },
      },
    };

    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: DesignSystem.spacing[2],
      fontFamily: DesignSystem.typography.fontFamily.sans.join(', '),
      fontWeight: DesignSystem.typography.fontWeight.medium,
      borderRadius: DesignSystem.borderRadius.lg,
      transition: `all ${DesignSystem.animations.transition.normal}`,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      textDecoration: 'none',
      outline: 'none',
      position: 'relative',
      overflow: 'hidden',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      const button = e.currentTarget;
      const hoverStyle = variantStyles[variant].hover;
      
      if (hoverStyle) {
        Object.assign(button.style, hoverStyle);
      }
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      
      const button = e.currentTarget;
      // Reset to base styles
      Object.assign(button.style, baseStyles);
    };

    return (
      <button
        ref={ref}
        style={baseStyles}
        className={`agentic-button agentic-button--${variant} agentic-button--${size} ${className}`}
        disabled={disabled || loading}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} 
            className="animate-spin" 
            style={{ 
              animation: 'spin 1s linear infinite',
              marginRight: leftIcon || children ? DesignSystem.spacing[1] : 0 
            }} 
          />
        )}
        
        {/* Left icon */}
        {leftIcon && !loading && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {leftIcon}
          </span>
        )}
        
        {/* Button text */}
        <span style={{ 
          display: 'flex', 
          alignItems: 'center',
          opacity: loading ? 0.7 : 1 
        }}>
          {children}
        </span>
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {rightIcon}
          </span>
        )}
        
        {/* Ripple effect on click */}
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .agentic-button {
            position: relative;
            overflow: hidden;
          }
          
          .agentic-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
          }
          
          .agentic-button:active::before {
            width: 300px;
            height: 300px;
          }
          
          .agentic-button:focus-visible {
            outline: 2px solid ${DesignSystem.colors.primary[500]};
            outline-offset: 2px;
          }
        `}</style>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps, ButtonVariant, ButtonSize };
