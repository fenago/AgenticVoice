'use client';

import React, { forwardRef } from 'react';
import { DesignSystem } from '@/app/admin/styles/design-system';

// Typography element types
type TypographyElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
type TypographyVariant = 
  | 'display-lg' | 'display-md' | 'display-sm'
  | 'heading-xl' | 'heading-lg' | 'heading-md' | 'heading-sm'
  | 'body-lg' | 'body-md' | 'body-sm'
  | 'caption' | 'overline';

type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
type TypographyColor = 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error' | 'inherit';

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: TypographyElement;
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  color?: TypographyColor;
  gradient?: boolean;
  truncate?: boolean;
  children: React.ReactNode;
}

// 🎨 AgenticVoice Typography Component with Inter Font
const Typography = forwardRef<HTMLElement, TypographyProps>(
  (
    {
      as = 'p',
      variant = 'body-md',
      weight = 'normal',
      align = 'left',
      color = 'inherit',
      gradient = false,
      truncate = false,
      className = '',
      style,
      children,
      ...props
    },
    ref
  ) => {
    // Typography variant configurations
    const variantStyles = {
      'display-lg': {
        fontSize: DesignSystem.typography.fontSize['6xl'],
        lineHeight: DesignSystem.typography.lineHeight.tight,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: '-0.02em',
      },
      'display-md': {
        fontSize: DesignSystem.typography.fontSize['5xl'],
        lineHeight: DesignSystem.typography.lineHeight.tight,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: '-0.02em',
      },
      'display-sm': {
        fontSize: DesignSystem.typography.fontSize['4xl'],
        lineHeight: DesignSystem.typography.lineHeight.tight,
        fontWeight: DesignSystem.typography.fontWeight.bold,
        letterSpacing: '-0.01em',
      },
      'heading-xl': {
        fontSize: DesignSystem.typography.fontSize['3xl'],
        lineHeight: DesignSystem.typography.lineHeight.tight,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },
      'heading-lg': {
        fontSize: DesignSystem.typography.fontSize['2xl'],
        lineHeight: DesignSystem.typography.lineHeight.tight,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },
      'heading-md': {
        fontSize: DesignSystem.typography.fontSize.xl,
        lineHeight: DesignSystem.typography.lineHeight.normal,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },
      'heading-sm': {
        fontSize: DesignSystem.typography.fontSize.lg,
        lineHeight: DesignSystem.typography.lineHeight.normal,
        fontWeight: DesignSystem.typography.fontWeight.semibold,
      },
      'body-lg': {
        fontSize: DesignSystem.typography.fontSize.lg,
        lineHeight: DesignSystem.typography.lineHeight.relaxed,
        fontWeight: DesignSystem.typography.fontWeight.normal,
      },
      'body-md': {
        fontSize: DesignSystem.typography.fontSize.base,
        lineHeight: DesignSystem.typography.lineHeight.normal,
        fontWeight: DesignSystem.typography.fontWeight.normal,
      },
      'body-sm': {
        fontSize: DesignSystem.typography.fontSize.sm,
        lineHeight: DesignSystem.typography.lineHeight.normal,
        fontWeight: DesignSystem.typography.fontWeight.normal,
      },
      caption: {
        fontSize: DesignSystem.typography.fontSize.xs,
        lineHeight: DesignSystem.typography.lineHeight.normal,
        fontWeight: DesignSystem.typography.fontWeight.normal,
        textTransform: 'none' as const,
      },
      overline: {
        fontSize: DesignSystem.typography.fontSize.xs,
        lineHeight: DesignSystem.typography.lineHeight.normal,
        fontWeight: DesignSystem.typography.fontWeight.medium,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.1em',
      },
    };

    // Color configurations
    const colorStyles = {
      primary: { color: DesignSystem.colors.neutral[900] },
      secondary: { color: DesignSystem.colors.neutral[700] },
      muted: { color: DesignSystem.colors.neutral[500] },
      success: { color: DesignSystem.colors.success },
      warning: { color: DesignSystem.colors.warning },
      error: { color: DesignSystem.colors.error },
      inherit: { color: 'inherit' },
    };

    // Weight override
    const weightStyles = {
      light: { fontWeight: DesignSystem.typography.fontWeight.light },
      normal: { fontWeight: DesignSystem.typography.fontWeight.normal },
      medium: { fontWeight: DesignSystem.typography.fontWeight.medium },
      semibold: { fontWeight: DesignSystem.typography.fontWeight.semibold },
      bold: { fontWeight: DesignSystem.typography.fontWeight.bold },
      extrabold: { fontWeight: DesignSystem.typography.fontWeight.extrabold },
    };

    const baseStyles: React.CSSProperties = {
      fontFamily: DesignSystem.typography.fontFamily.sans.join(', '),
      textAlign: align,
      margin: 0,
      ...variantStyles[variant],
      ...colorStyles[color],
      ...weightStyles[weight],
      ...(gradient && {
        background: DesignSystem.gradients.primary,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }),
      ...(truncate && {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }),
      ...style,
    };

    const Component = as as any;

    return (
      <Component
        ref={ref}
        style={baseStyles}
        className={`agentic-typography agentic-typography--${variant} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Typography.displayName = 'Typography';

// 🎯 Specialized Typography Components

// Heading Component
interface HeadingProps extends Omit<TypographyProps, 'as' | 'variant'> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: 'xl' | 'lg' | 'md' | 'sm';
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level = 1, size, weight = 'semibold', ...props }, ref) => {
    const headingElements: Record<number, TypographyElement> = {
      1: 'h1',
      2: 'h2',
      3: 'h3',
      4: 'h4',
      5: 'h5',
      6: 'h6',
    };

    // Auto-size mapping if size not provided
    const autoSizeMapping: Record<number, TypographyVariant> = {
      1: 'heading-xl',
      2: 'heading-lg',
      3: 'heading-md',
      4: 'heading-sm',
      5: 'heading-sm',
      6: 'heading-sm',
    };

    const variant: TypographyVariant = size ? `heading-${size}` as TypographyVariant : autoSizeMapping[level];

    return (
      <Typography
        ref={ref as any}
        as={headingElements[level]}
        variant={variant}
        weight={weight}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

// Text Component
interface TextProps extends Omit<TypographyProps, 'as' | 'variant'> {
  size?: 'lg' | 'md' | 'sm';
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = 'md', ...props }, ref) => {
    const variant: TypographyVariant = `body-${size}` as TypographyVariant;

    return (
      <Typography
        ref={ref as any}
        as="p"
        variant={variant}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

// Caption Component
const Caption = forwardRef<HTMLSpanElement, Omit<TypographyProps, 'as' | 'variant'>>(
  (props, ref) => (
    <Typography
      ref={ref as any}
      as="span"
      variant="caption"
      color="muted"
      {...props}
    />
  )
);

Caption.displayName = 'Caption';

// Code Component
interface CodeProps extends Omit<TypographyProps, 'as' | 'style'> {
  inline?: boolean;
  block?: boolean;
  language?: string;
  style?: React.CSSProperties;
}

const Code = forwardRef<HTMLElement, CodeProps>(
  ({ inline = true, block = false, language, className = '', style, children, ...props }, ref) => {
    const codeStyles: React.CSSProperties = {
      fontFamily: DesignSystem.typography.fontFamily.mono.join(', '),
      fontSize: DesignSystem.typography.fontSize.sm,
      color: DesignSystem.colors.neutral[800],
      backgroundColor: DesignSystem.colors.neutral[100],
      padding: inline ? `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}` : DesignSystem.spacing[4],
      borderRadius: DesignSystem.borderRadius.md,
      border: `1px solid ${DesignSystem.colors.neutral[200]}`,
      display: block ? 'block' : 'inline-block',
      whiteSpace: block ? 'pre-wrap' : 'nowrap',
      overflow: block ? 'auto' : 'visible',
      ...style,
    };

    const Component = block ? 'pre' : 'code';

    return (
      <Component
        ref={ref as any}
        style={codeStyles}
        className={`agentic-code ${className}`}
        {...props}
      >
        {block ? <code>{children}</code> : children}
      </Component>
    );
  }
);

Code.displayName = 'Code';

export default Typography;
export { Heading, Text, Caption, Code };
export type { 
  TypographyProps, 
  HeadingProps, 
  TextProps, 
  CodeProps,
  TypographyVariant, 
  TypographyWeight, 
  TypographyColor 
};
