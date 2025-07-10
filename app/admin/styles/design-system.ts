// AgenticVoice Design System Configuration
// Brand identity, colors, typography, and component styles

export const DesignSystem = {
  // 🎨 BRAND COLORS - AgenticVoice Gradient Palette
  colors: {
    // Primary gradient colors from brand identity
    primary: {
      50: '#fef7f0',
      100: '#fdeee1',
      200: '#fad7b8',
      300: '#f7be8e',
      400: '#f79533', // Primary brand orange
      500: '#f37055', // Brand coral
      600: '#ef4e7b', // Brand pink
      700: '#a166ab', // Brand purple
      800: '#5073b8', // Brand blue
      900: '#1098ad', // Brand teal
    },
    
    // Secondary gradient colors
    secondary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#07b39b', // Brand mint
      500: '#6fba82', // Brand green
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    
    // Neutral grays for backgrounds and text
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },
    
    // Semantic colors
    success: '#07b39b',
    warning: '#f79533',
    error: '#ef4445',
    info: '#5073b8',
  },
  
  // 🌈 GRADIENTS - AgenticVoice Brand Gradients
  gradients: {
    primary: 'linear-gradient(60deg, #f79533, #f37055, #ef4e7b, #a166ab, #5073b8, #1098ad, #07b39b, #6fba82)',
    primaryReverse: 'linear-gradient(240deg, #6fba82, #07b39b, #1098ad, #5073b8, #a166ab, #ef4e7b, #f37055, #f79533)',
    warm: 'linear-gradient(45deg, #f79533, #f37055, #ef4e7b)',
    cool: 'linear-gradient(45deg, #5073b8, #1098ad, #07b39b)',
    subtle: 'linear-gradient(135deg, #fef7f0, #f0fdfa)',
    dark: 'linear-gradient(135deg, #262626, #404040)',
  },
  
  // 📝 TYPOGRAPHY - Inter Font System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    },
    
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
      '6xl': '3.75rem',  // 60px
    },
    
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // 📏 SPACING SYSTEM
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
  },
  
  // 🔘 BORDER RADIUS
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // 🌑 SHADOWS
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(247, 149, 51, 0.3)', // Orange glow
    brandGlow: '0 0 30px rgba(247, 149, 51, 0.2), 0 0 60px rgba(243, 112, 85, 0.1)',
  },
  
  // 🎞️ ANIMATIONS
  animations: {
    transition: {
      fast: '150ms ease-in-out',
      normal: '250ms ease-in-out',
      slow: '350ms ease-in-out',
    },
    
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // 📱 BREAKPOINTS
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // 🎯 Z-INDEX SCALE
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    header: 100,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// 🎨 COMPONENT PRESETS
export const ComponentPresets = {
  // Button variants
  button: {
    primary: {
      background: DesignSystem.gradients.primary,
      color: 'white',
      border: 'none',
      borderRadius: DesignSystem.borderRadius.md,
      padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      boxShadow: DesignSystem.shadows.md,
      transition: DesignSystem.animations.transition.normal,
    },
    
    secondary: {
      background: 'white',
      color: DesignSystem.colors.primary[500],
      border: `1px solid ${DesignSystem.colors.primary[200]}`,
      borderRadius: DesignSystem.borderRadius.md,
      padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[6]}`,
      fontSize: DesignSystem.typography.fontSize.sm,
      fontWeight: DesignSystem.typography.fontWeight.medium,
      boxShadow: DesignSystem.shadows.sm,
      transition: DesignSystem.animations.transition.normal,
    },
  },
  
  // Card variants
  card: {
    default: {
      background: 'white',
      borderRadius: DesignSystem.borderRadius.lg,
      boxShadow: DesignSystem.shadows.md,
      padding: DesignSystem.spacing[6],
      border: `1px solid ${DesignSystem.colors.neutral[200]}`,
    },
    
    elevated: {
      background: 'white',
      borderRadius: DesignSystem.borderRadius.xl,
      boxShadow: DesignSystem.shadows.xl,
      padding: DesignSystem.spacing[8],
      border: 'none',
    },
    
    gradient: {
      background: DesignSystem.gradients.subtle,
      borderRadius: DesignSystem.borderRadius.xl,
      boxShadow: DesignSystem.shadows.lg,
      padding: DesignSystem.spacing[8],
      border: `1px solid ${DesignSystem.colors.neutral[100]}`,
    },
  },
};

export type DesignSystemType = typeof DesignSystem;
export type ComponentPresetsType = typeof ComponentPresets;
