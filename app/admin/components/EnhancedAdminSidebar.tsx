'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSpring, animated, config } from '@react-spring/web';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  CreditCard, 
  Bell,
  Menu,
  ChevronLeft,
  ChevronRight,
  User,
  UserCheck,
  Activity,
  Database,
  Phone,
  MessageSquare,
  FileText,
  DollarSign,
  Zap,
  Home,
  Calendar,
  HelpCircle,
  Building2,
  TrendingUp,
  GitBranch,
  Ticket
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavigationBadge {
  text: string;
  color: 'primary' | 'success' | 'warning' | 'error';
}

interface NavigationChild {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: NavigationBadge | null;
  children?: NavigationChild[];
}

// 🎨 AgenticVoice Navigation Configuration
const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Overview & Analytics',
    badge: null
  },
  {
    name: 'VAPI Dashboard',
    href: '/admin/vapi',
    icon: Zap,
    description: 'VAPI system & customer data',
    badge: { text: 'NEW', color: 'success' }
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users & accounts',
    badge: { text: 'NEW', color: 'success' },
    children: [
      { name: 'All Users', href: '/admin/users', icon: Users },
      { name: 'User Roles', href: '/admin/users/roles', icon: UserCheck },
      { name: 'Activity Logs', href: '/admin/users/activity', icon: Activity }
    ]
  },

  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    description: 'Billing & subscription plans',
    badge: null,
    children: [
      { name: 'Subscription Plans', href: '/admin/subscriptions/plans', icon: CreditCard },
      { name: 'Customer Billing', href: '/admin/subscriptions/billing', icon: DollarSign },
      { name: 'Payment Analytics', href: '/admin/subscriptions/analytics', icon: BarChart3 }
    ]
  },

  {
    name: 'Security & Audit',
    href: '/admin/security',
    icon: Shield,
    description: 'Security monitoring & audit logs',
    badge: null,
    children: [
      { name: 'Audit Logs', href: '/admin/security/audit', icon: FileText },
      { name: 'Access Control', href: '/admin/security/access', icon: Shield },
      { name: 'System Monitor', href: '/admin/security/monitor', icon: Activity }
    ]
  },
  {
    name: 'CRM',
    href: '/admin/crm',
    icon: Database,
    description: 'Customer relationship management',
    badge: null,
    children: [
      { name: 'CRM Dashboard', href: '/admin/crm', icon: BarChart3 },
      { name: 'Contacts', href: '/admin/crm/contacts', icon: Users },
      { name: 'Companies', href: '/admin/crm/companies', icon: Building2 },
      { name: 'Deal Pipeline', href: '/admin/crm/deals', icon: TrendingUp },
      { name: 'Pipeline Configuration', href: '/admin/crm/pipelines', icon: GitBranch },
      { name: 'Engagements Hub', href: '/admin/crm/engagements', icon: Activity },
      { name: 'Support Tickets', href: '/admin/crm/tickets', icon: Ticket },
      { name: 'Properties Manager', href: '/admin/crm/properties', icon: Settings },
      { name: 'CRM Settings', href: '/admin/crm/settings', icon: Settings },
      { name: 'Error Logs', href: '/admin/crm/logs', icon: FileText }
    ]
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System configuration',
    badge: null,
    children: [
      { name: 'General Settings', href: '/admin/settings/general', icon: Settings },
      { name: 'API Configuration', href: '/admin/settings/api', icon: Database },
      { name: 'Notifications', href: '/admin/settings/notifications', icon: Bell }
    ]
  }
];

// 🎨 Enhanced AdminSidebar with React Spring Animations
export function EnhancedAdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // React Spring animations
  const sidebarSpring = useSpring({
    width: collapsed ? '80px' : '280px',
    config: config.gentle
  });

  const contentSpring = useSpring({
    opacity: collapsed ? 0 : 1,
    transform: collapsed ? 'translateX(-20px)' : 'translateX(0px)',
    config: config.gentle
  });

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

  const isExpanded = (itemName: string) => {
    return expandedItems.includes(itemName);
  };

  const getBadgeColor = (color: NavigationBadge['color']) => {
    const colors = {
      primary: DesignSystem.colors.primary[500],
      success: DesignSystem.colors.success,
      warning: DesignSystem.colors.warning,
      error: DesignSystem.colors.error,
    };
    return colors[color];
  };

  const NavItem = ({ item }: { item: NavigationItem }) => {
    const IconComponent = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);
    const expanded = isExpanded(item.name);

    const itemSpring = useSpring({
      backgroundColor: active ? `${DesignSystem.colors.primary[500]}15` : 'transparent',
      borderColor: active ? DesignSystem.colors.primary[500] : 'transparent',
      config: config.gentle
    });

    return (
      <div style={{ marginBottom: DesignSystem.spacing[1] }}>
        {/* Main Navigation Item */}
        <animated.div
          style={{
            ...itemSpring,
            borderRadius: DesignSystem.borderRadius.lg,
            border: '2px solid',
            margin: `0 ${DesignSystem.spacing[2]}`,
          }}
        >
          <Link href={item.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: `${DesignSystem.spacing[3]} ${DesignSystem.spacing[4]}`,
                cursor: 'pointer',
                transition: `all ${DesignSystem.animations.transition.normal}`,
                borderRadius: DesignSystem.borderRadius.lg,
              }}
              onClick={(e) => {
                if (hasChildren && !collapsed) {
                  e.preventDefault();
                  toggleExpanded(item.name);
                }
              }}
            >
              {/* Icon */}
              <div
                style={{
                  color: active ? DesignSystem.colors.primary[600] : DesignSystem.colors.neutral[600],
                  marginRight: collapsed ? 0 : DesignSystem.spacing[3],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '24px',
                }}
              >
                <IconComponent size={20} />
              </div>

              {/* Content (hidden when collapsed) */}
              {!collapsed && (
                <animated.div
                  style={{
                    ...contentSpring,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Typography
                      variant="body-sm"
                      weight="medium"
                      color={active ? 'primary' : 'secondary'}
                      style={{ marginBottom: DesignSystem.spacing[1] }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="muted"
                      style={{ fontSize: '11px' }}
                    >
                      {item.description}
                    </Typography>
                  </div>

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
                      <ChevronRight
                        size={16}
                        style={{
                          color: DesignSystem.colors.neutral[400],
                          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                          transition: `transform ${DesignSystem.animations.transition.normal}`,
                        }}
                      />
                    )}
                  </div>
                </animated.div>
              )}
            </div>
          </Link>
        </animated.div>

        {/* Children (SubNavigation) */}
        {hasChildren && !collapsed && expanded && (
          <animated.div
            style={{
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
                  style={{ textDecoration: 'none' }}
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
          </animated.div>
        )}
      </div>
    );
  };

  return (
    <animated.aside
      style={{
        ...sidebarSpring,
        height: '100vh',
        background: 'white',
        borderRight: `1px solid ${DesignSystem.colors.neutral[200]}`,
        boxShadow: DesignSystem.shadows.sm,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: DesignSystem.zIndex.docked,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: DesignSystem.spacing[4],
          borderBottom: `1px solid ${DesignSystem.colors.neutral[200]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {!collapsed && (
          <animated.div style={contentSpring}>
            <Typography variant="heading-sm" gradient>
              AgenticVoice
            </Typography>
            <Typography variant="caption" color="muted">
              Admin Dashboard
            </Typography>
          </animated.div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          style={{ 
            padding: DesignSystem.spacing[2],
            minWidth: 'auto',
          }}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${DesignSystem.spacing[4]} 0`,
        }}
      >
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <animated.div
          style={{
            ...contentSpring,
            padding: DesignSystem.spacing[4],
            borderTop: `1px solid ${DesignSystem.colors.neutral[200]}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: DesignSystem.spacing[2],
              padding: DesignSystem.spacing[2],
              borderRadius: DesignSystem.borderRadius.lg,
              backgroundColor: DesignSystem.colors.neutral[50],
            }}
          >
            <User size={16} style={{ color: DesignSystem.colors.neutral[600] }} />
            <div>
              <Typography variant="body-sm" weight="medium">
                Admin User
              </Typography>
              <Typography variant="caption" color="muted">
                Super Admin
              </Typography>
            </div>
          </div>
        </animated.div>
      )}
    </animated.aside>
  );
}
