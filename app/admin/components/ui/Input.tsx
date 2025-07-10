'use client';

import React, { forwardRef, useState } from 'react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react';

// Input variant types
type InputVariant = 'default' | 'filled' | 'outline';
type InputSize = 'sm' | 'md' | 'lg';
type InputState = 'default' | 'success' | 'error' | 'warning';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  state?: InputState;
  label?: string;
  helper?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

// 🎨 AgenticVoice Input Component with Validation States
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      state = 'default',
      label,
      helper,
      error,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      fullWidth = true,
      type = 'text',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // Determine actual input type
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Size configurations
    const sizeStyles = {
      sm: {
        height: '36px',
        padding: `0 ${DesignSystem.spacing[3]}`,
        fontSize: DesignSystem.typography.fontSize.sm,
      },
      md: {
        height: '44px',
        padding: `0 ${DesignSystem.spacing[4]}`,
        fontSize: DesignSystem.typography.fontSize.base,
      },
      lg: {
        height: '52px',
        padding: `0 ${DesignSystem.spacing[5]}`,
        fontSize: DesignSystem.typography.fontSize.lg,
      },
    };

    // State configurations
    const stateStyles = {
      default: {
        borderColor: DesignSystem.colors.neutral[300],
        focusBorderColor: DesignSystem.colors.primary[500],
        focusRingColor: `${DesignSystem.colors.primary[500]}20`,
      },
      success: {
        borderColor: DesignSystem.colors.success,
        focusBorderColor: DesignSystem.colors.success,
        focusRingColor: `${DesignSystem.colors.success}20`,
      },
      error: {
        borderColor: DesignSystem.colors.error,
        focusBorderColor: DesignSystem.colors.error,
        focusRingColor: `${DesignSystem.colors.error}20`,
      },
      warning: {
        borderColor: DesignSystem.colors.warning,
        focusBorderColor: DesignSystem.colors.warning,
        focusRingColor: `${DesignSystem.colors.warning}20`,
      },
    };

    // Variant configurations
    const variantStyles = {
      default: {
        background: 'white',
        border: '2px solid',
      },
      filled: {
        background: DesignSystem.colors.neutral[50],
        border: '2px solid transparent',
      },
      outline: {
        background: 'transparent',
        border: '2px solid',
      },
    };

    // Determine current state based on error prop
    const currentState = error ? 'error' : state;
    const currentStateStyle = stateStyles[currentState];
    const currentVariantStyle = variantStyles[variant];
    const currentSizeStyle = sizeStyles[size];

    const inputStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      fontFamily: DesignSystem.typography.fontFamily.sans.join(', '),
      fontWeight: DesignSystem.typography.fontWeight.normal,
      borderRadius: DesignSystem.borderRadius.lg,
      transition: `all ${DesignSystem.animations.transition.normal}`,
      outline: 'none',
      borderColor: isFocused ? currentStateStyle.focusBorderColor : currentStateStyle.borderColor,
      boxShadow: isFocused ? `0 0 0 3px ${currentStateStyle.focusRingColor}` : 'none',
      paddingLeft: leftIcon ? `${DesignSystem.spacing[10]}` : currentSizeStyle.padding.split(' ')[1],
      paddingRight: (rightIcon || showPasswordToggle) ? `${DesignSystem.spacing[10]}` : currentSizeStyle.padding.split(' ')[1],
      ...currentVariantStyle,
      ...currentSizeStyle,
      ...style,
    };

    const containerStyles: React.CSSProperties = {
      position: 'relative',
      width: fullWidth ? '100%' : 'auto',
    };

    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      color: DesignSystem.colors.neutral[500],
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1,
    };

    const leftIconStyles: React.CSSProperties = {
      ...iconStyles,
      left: DesignSystem.spacing[3],
    };

    const rightIconStyles: React.CSSProperties = {
      ...iconStyles,
      right: DesignSystem.spacing[3],
      pointerEvents: showPasswordToggle ? 'auto' : 'none',
      cursor: showPasswordToggle ? 'pointer' : 'default',
    };

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        {/* Label */}
        {label && (
          <label
            style={{
              display: 'block',
              fontSize: DesignSystem.typography.fontSize.sm,
              fontWeight: DesignSystem.typography.fontWeight.medium,
              color: DesignSystem.colors.neutral[700],
              marginBottom: DesignSystem.spacing[2],
            }}
          >
            {label}
            {props.required && (
              <span style={{ color: DesignSystem.colors.error, marginLeft: DesignSystem.spacing[1] }}>
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div style={containerStyles}>
          {/* Left Icon */}
          {leftIcon && (
            <div style={leftIconStyles}>
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            style={inputStyles}
            className={`agentic-input agentic-input--${variant} agentic-input--${size} ${className}`}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div
              style={rightIconStyles}
              onClick={showPasswordToggle ? () => setShowPassword(!showPassword) : undefined}
            >
              {showPasswordToggle ? (
                showPassword ? <EyeOff size={20} /> : <Eye size={20} />
              ) : rightIcon ? (
                rightIcon
              ) : currentState === 'success' ? (
                <Check size={20} style={{ color: DesignSystem.colors.success }} />
              ) : currentState === 'error' ? (
                <AlertCircle size={20} style={{ color: DesignSystem.colors.error }} />
              ) : null}
            </div>
          )}
        </div>

        {/* Helper Text or Error Message */}
        {(helper || error) && (
          <div
            style={{
              marginTop: DesignSystem.spacing[2],
              fontSize: DesignSystem.typography.fontSize.sm,
              color: error 
                ? DesignSystem.colors.error 
                : DesignSystem.colors.neutral[600],
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[1],
            }}
          >
            {error && <AlertCircle size={16} />}
            {error || helper}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
export type { InputProps, InputVariant, InputSize, InputState };
