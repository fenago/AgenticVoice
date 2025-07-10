'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Home,
  Users, 
  Phone, 
  CreditCard, 
  MessageSquare,
  Shield,
  Settings,
  ChevronDown,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';
import { useBreakpoint } from './ResponsiveLayout';

interface MobileMenuProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  onClose?: () => void;
}

interface MobileNavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: {
    text: string;
    color: 'primary' | 'success' | 'warning' | 'error';
  };
  children?: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<any>;
  }>;
}

// 📱 Mobile Navigation Configuration
const mobileNavigation: MobileNavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    badge: { text: 'NEW', color: 'success' },
    children: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'User Roles', href: '/admin/users/roles', icon: User },
      { name: 'Activity Logs', href: '/admin/users/activity', icon: MessageSquare },
    ]
  },
  {
    name: 'Voice AI Assistants',
    href: '/admin/assistants',
    icon: Phone,
    badge: { text: '12', color: 'primary' },
    children: [
      { name: 'All Assistants', href: '/admin/assistants', icon: Phone },
      { name: 'Voice Settings', href: '/admin/assistants/voice', icon: Settings },
      { name: 'Call Analytics', href: '/admin/assistants/analytics', icon: MessageSquare },
    ]
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    children: [
      { name: 'Subscription Plans', href: '/admin/subscriptions/plans', icon: CreditCard },
      { name: 'Customer Billing', href: '/admin/subscriptions/billing', icon: CreditCard },
      { name: 'Payment Analytics', href: '/admin/subscriptions/analytics', icon: MessageSquare },
    ]
  },
  {
    name: 'Call Records',
    href: '/admin/calls',
    icon: MessageSquare,
    badge: { text: '156', color: 'warning' },
  },
  {
    name: 'Security & Audit',
    href: '/admin/security',
    icon: Shield,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  }
];

// 🎨 Mobile Menu Toggle Button
interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function MobileMenuToggle({ isOpen, onToggle, className = '' }: MobileMenuToggleProps) {
  const { isMobileOrTablet } = useBreakpoint();

  if (!isMobileOrTablet) return null;

  return (
    <motion.button
      className={className}
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        borderRadius: DesignSystem.borderRadius.lg,
        backgroundColor: 'transparent',
        border: `1px solid ${DesignSystem.colors.neutral[200]}`,
        cursor: 'pointer',
        transition: `all ${DesignSystem.animations.transition.normal}`,
      }}
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </motion.div>
    </motion.button>
  );
}

// 🎯 Main Mobile Menu Component
export function MobileMenu({ user, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { isMobileOrTablet } = useBreakpoint();

  // Handle outside clicks and escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
    onClose?.();
  }, [pathname, onClose]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const getBadgeColor = (color: 'primary' | 'success' | 'warning' | 'error') => {
    const colors = {
      primary: DesignSystem.colors.primary[500],
      success: DesignSystem.colors.success,
      warning: DesignSystem.colors.warning,
      error: DesignSystem.colors.error,
    };
    return colors[color];
  };

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const menuVariants = {
    hidden: { 
      x: '-100%',
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
    },
    visible: { 
      x: 0,
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
    },
    exit: { 
      x: '-100%',
      transition: { type: 'spring' as const, stiffness: 300, damping: 30 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  if (!isMobileOrTablet) return null;

  return (
    <>
      {/* Toggle Button */}
      <MobileMenuToggle isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: DesignSystem.zIndex.modal,
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Menu Panel */}
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '320px',
                maxWidth: '85vw',
                height: '100vh',
                backgroundColor: 'white',
                boxShadow: DesignSystem.shadows.xl,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: DesignSystem.spacing[6],
                  borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <Typography variant="heading-sm" gradient>
                    AgenticVoice
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Admin Dashboard
                  </Typography>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  style={{ padding: DesignSystem.spacing[2] }}
                >
                  <X size={20} />
                </Button>
              </div>

              {/* User Profile */}
              {user && (
                <div
                  style={{
                    padding: DesignSystem.spacing[4],
                    borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: DesignSystem.spacing[3],
                      padding: DesignSystem.spacing[3],
                      borderRadius: DesignSystem.borderRadius.lg,
                      backgroundColor: DesignSystem.colors.neutral[50],
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: DesignSystem.borderRadius.full,
                        backgroundColor: DesignSystem.colors.primary[500],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: DesignSystem.typography.fontWeight.semibold,
                      }}
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
                        />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>

                    {/* User Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body-sm"
                        weight="medium"
                        style={{ marginBottom: DesignSystem.spacing[1] }}
                      >
                        {user.name}
                      </Typography>
                      <Typography variant="caption" color="muted">
                        {user.email}
                      </Typography>
                      <div
                        style={{
                          marginTop: DesignSystem.spacing[1],
                          padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
                          backgroundColor: DesignSystem.colors.primary[50],
                          borderRadius: DesignSystem.borderRadius.md,
                          display: 'inline-block',
                        }}
                      >
                        <Typography variant="caption" color="primary" weight="medium">
                          {user.role}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav style={{ flex: 1, padding: DesignSystem.spacing[4] }}>
                {mobileNavigation.map((item, index) => {
                  const IconComponent = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const active = isActive(item.href);
                  const expanded = expandedItems.includes(item.name);

                  return (
                    <motion.div
                      key={item.name}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      style={{ marginBottom: DesignSystem.spacing[2] }}
                    >
                      {/* Main Item */}
                      <div
                        onClick={(e) => {
                          if (hasChildren) {
                            e.preventDefault();
                            toggleExpanded(item.name);
                          }
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: DesignSystem.spacing[3],
                          borderRadius: DesignSystem.borderRadius.lg,
                          backgroundColor: active ? `${DesignSystem.colors.primary[500]}15` : 'transparent',
                          border: `2px solid ${active ? DesignSystem.colors.primary[500] : 'transparent'}`,
                          cursor: 'pointer',
                          transition: `all ${DesignSystem.animations.transition.normal}`,
                        }}
                      >
                        <Link 
                          href={item.href} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            flex: 1, 
                            textDecoration: 'none',
                            color: 'inherit'
                          }}
                        >
                          {/* Icon */}
                          <IconComponent
                            size={20}
                            style={{
                              color: active ? DesignSystem.colors.primary[600] : DesignSystem.colors.neutral[600],
                              marginRight: DesignSystem.spacing[3],
                            }}
                          />

                          {/* Name */}
                          <Typography
                            variant="body-sm" 
                            weight="medium"
                            color={active ? 'primary' : 'secondary'}
                            style={{ flex: 1 }}
                          >
                            {item.name}
                          </Typography>
                        </Link>

                        {/* Badge and Arrow */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: DesignSystem.spacing[2] }}>
                          {/* Badge */}
                          {item.badge && (
                            <div
                              style={{
                                padding: `${DesignSystem.spacing[1]} ${DesignSystem.spacing[2]}`,
                                borderRadius: DesignSystem.borderRadius.full,
                                backgroundColor: getBadgeColor(item.badge.color),
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: DesignSystem.typography.fontWeight.bold,
                                minWidth: '20px',
                                textAlign: 'center',
                              }}
                            >
                              {item.badge.text}
                            </div>
                          )}

                          {/* Expand Arrow */}
                          {hasChildren && (
                            <motion.div
                              animate={{ rotate: expanded ? 90 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronRight
                                size={16}
                                style={{ color: DesignSystem.colors.neutral[400] }}
                              />
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Children */}
                      <AnimatePresence>
                        {hasChildren && expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              overflow: 'hidden',
                              marginTop: DesignSystem.spacing[2],
                              marginLeft: DesignSystem.spacing[6],
                              paddingLeft: DesignSystem.spacing[4],
                              borderLeft: `2px solid ${DesignSystem.colors.neutral[200]}`,
                            }}
                          >
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon;
                              const childActive = isActive(child.href);

                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      padding: `${DesignSystem.spacing[2]} ${DesignSystem.spacing[3]}`,
                                      marginBottom: DesignSystem.spacing[1],
                                      borderRadius: DesignSystem.borderRadius.md,
                                      backgroundColor: childActive ? `${DesignSystem.colors.primary[500]}10` : 'transparent',
                                      cursor: 'pointer',
                                      transition: `all ${DesignSystem.animations.transition.normal}`,
                                    }}
                                  >
                                    <ChildIcon
                                      size={16}
                                      style={{
                                        color: childActive ? DesignSystem.colors.primary[600] : DesignSystem.colors.neutral[500],
                                        marginRight: DesignSystem.spacing[2],
                                      }}
                                    />
                                    <Typography
                                      variant="body-sm"
                                      color={childActive ? 'primary' : 'muted'}
                                    >
                                      {child.name}
                                    </Typography>
                                  </div>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer Actions */}
              <div
                style={{
                  padding: DesignSystem.spacing[4],
                  borderTop: `1px solid ${DesignSystem.colors.neutral[200]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: DesignSystem.spacing[2],
                }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle profile */}}
                  style={{
                    justifyContent: 'flex-start',
                    gap: DesignSystem.spacing[3],
                  }}
                >
                  <User size={18} />
                  Profile Settings
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {/* Handle logout */}}
                  style={{
                    justifyContent: 'flex-start',
                    gap: DesignSystem.spacing[3],
                    color: DesignSystem.colors.error,
                  }}
                >
                  <LogOut size={18} />
                  Sign Out
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
