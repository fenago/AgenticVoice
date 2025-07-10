'use client';

import React from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { DesignSystem } from '@/app/admin/styles/design-system';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'fadeSlide';
}

// 🎭 Animation Variants
const pageVariants: Record<string, Variants> = {
  // Fade Transition
  fade: {
    initial: { 
      opacity: 0 
    },
    in: { 
      opacity: 1 
    },
    out: { 
      opacity: 0 
    }
  },

  // Slide Transition (left to right)
  slide: {
    initial: { 
      opacity: 0, 
      x: 30 
    },
    in: { 
      opacity: 1, 
      x: 0 
    },
    out: { 
      opacity: 0, 
      x: -30 
    }
  },

  // Scale Transition
  scale: {
    initial: { 
      opacity: 0, 
      scale: 0.95 
    },
    in: { 
      opacity: 1, 
      scale: 1 
    },
    out: { 
      opacity: 0, 
      scale: 1.05 
    }
  },

  // Slide Up Transition
  slideUp: {
    initial: { 
      opacity: 0, 
      y: 20 
    },
    in: { 
      opacity: 1, 
      y: 0 
    },
    out: { 
      opacity: 0, 
      y: -20 
    }
  },

  // Fade + Slide Combination
  fadeSlide: {
    initial: { 
      opacity: 0, 
      x: 20, 
      y: 10 
    },
    in: { 
      opacity: 1, 
      x: 0, 
      y: 0 
    },
    out: { 
      opacity: 0, 
      x: -20, 
      y: -10 
    }
  }
};

// 🎨 Enhanced Page Transition Component
export function PageTransition({ 
  children, 
  className = '', 
  variant = 'fadeSlide' 
}: PageTransitionProps) {
  const pathname = usePathname();

    const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.4
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        className={className}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants[variant]}
        transition={pageTransition}
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// 🚀 Stagger Children Animation for Lists/Cards
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function StaggerContainer({ 
  children, 
  className = '', 
  staggerDelay = 0.1,
  direction = 'up'
}: StaggerContainerProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      }
    }
  };

  const getItemVariants = (): Variants => {
    const directions = {
      up: { y: 20, x: 0 },
      down: { y: -20, x: 0 },
      left: { y: 0, x: 20 },
      right: { y: 0, x: -20 }
    };

    return {
      hidden: { 
        opacity: 0, 
        ...directions[direction] 
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        transition: {
          type: 'spring',
          stiffness: 100,
          damping: 12
        }
      }
    };
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={getItemVariants()}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// 📋 Card Animation for Data Tables and Lists
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0, 
  hover = true,
  onClick
}: AnimatedCardProps) {
  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    },
    hover: hover ? {
      y: -4,
      scale: 1.02,
      boxShadow: DesignSystem.shadows.lg,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    } : {},
    tap: {
      scale: 0.98,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      whileTap={onClick ? "tap" : undefined}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </motion.div>
  );
}

// 🎯 Modal/Dialog Animations
interface AnimatedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export function AnimatedModal({ 
  children, 
  isOpen, 
  onClose, 
  className = '' 
}: AnimatedModalProps) {
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.75,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.75,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: DesignSystem.zIndex.modal,
          }}
        >
          <motion.div
            className={className}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: DesignSystem.borderRadius.xl,
              boxShadow: DesignSystem.shadows.xl,
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ⚡ Micro-interactions for Buttons and UI Elements
interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function AnimatedButton({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  loading = false
}: AnimatedButtonProps) {
  const buttonVariants: Variants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    },
    tap: { 
      scale: 0.95,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    },
    loading: {
      scale: [1, 1.02, 1],
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.button
      className={className}
      variants={buttonVariants}
      initial="idle"
      animate={loading ? "loading" : "idle"}
      whileHover={!disabled && !loading ? "hover" : undefined}
      whileTap={!disabled && !loading ? "tap" : undefined}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </motion.button>
  );
}

// 🎪 Loading Skeleton with Pulse Animation
interface AnimatedSkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function AnimatedSkeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = DesignSystem.borderRadius.md,
  className = '' 
}: AnimatedSkeletonProps) {
  return (
    <motion.div
      className={className}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: DesignSystem.colors.neutral[200],
      }}
    />
  );
}

// 🌊 Floating Action Button with Magnetic Effect
interface FloatingActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  position?: {
    bottom?: string;
    right?: string;
    top?: string;
    left?: string;
  };
  className?: string;
}

export function FloatingActionButton({ 
  children, 
  onClick, 
  position = { bottom: '24px', right: '24px' },
  className = '' 
}: FloatingActionButtonProps) {
  const fabVariants: Variants = {
    idle: { 
      scale: 1,
      boxShadow: DesignSystem.shadows.lg,
    },
    hover: { 
      scale: 1.1,
      boxShadow: DesignSystem.shadows.xl,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    },
    tap: { 
      scale: 0.9,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  return (
    <motion.button
      className={className}
      variants={fabVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      style={{
        position: 'fixed',
        ...position,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        background: `linear-gradient(135deg, ${DesignSystem.colors.primary[500]}, ${DesignSystem.colors.primary[600]})`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
                zIndex: DesignSystem.zIndex.overlay,
      }}
    >
      {children}
    </motion.button>
  );
}
