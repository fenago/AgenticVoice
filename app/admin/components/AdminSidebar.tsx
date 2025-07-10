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
  HelpCircle
} from 'lucide-react';
import { DesignSystem } from '@/app/admin/styles/design-system';
import { Button, Typography } from '@/app/admin/components/ui';
import { cn } from '@/libs/utils';

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

// Navigation configuration with updated AgenticVoice-specific sections
const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Overview & Analytics',
    badge: null
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
    name: 'Voice AI Assistants',
    href: '/admin/assistants',
    icon: Phone,
    description: 'VAPI assistant management',
    badge: { text: '12', color: 'primary' },
    children: [
      { name: 'All Assistants', href: '/admin/assistants', icon: Phone },
      { name: 'Voice Settings', href: '/admin/assistants/voice', icon: MessageSquare },
      { name: 'Call Analytics', href: '/admin/assistants/analytics', icon: BarChart3 }
    ]
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    description: 'Billing & subscription plans',
    badge: null,
    children: [
      { name: 'Subscription Plans', href: '/admin/subscriptions/plans', icon: FileText },
      { name: 'Customer Billing', href: '/admin/subscriptions/billing', icon: DollarSign },
      { name: 'Usage Analytics', href: '/admin/subscriptions/usage', icon: BarChart3 }
    ]
  },
  {
    name: 'Security',
    href: '/admin/security',
    icon: Shield,
    description: 'Security & compliance',
    children: [
      { name: 'Role Management', href: '/admin/security/roles', icon: UserCheck },
      { name: 'Audit Logs', href: '/admin/security/audit', icon: FileText },
      { name: 'Compliance', href: '/admin/security/compliance', icon: Shield }
    ]
  },
  {
    name: 'System Config',
    href: '/admin/system',
    icon: Settings,
    description: 'System configuration',
    children: [
      { name: 'Integrations', href: '/admin/system/integrations', icon: Zap },
      { name: 'Email Templates', href: '/admin/system/email', icon: MessageSquare },
      { name: 'Branding', href: '/admin/system/branding', icon: Settings }
    ]
  },
  {
    name: 'Monitoring',
    href: '/admin/monitoring',
    icon: Activity,
    description: 'System health & logs'
  },
];

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 bg-gradient-to-br from-primary-purple via-primary-blue to-primary-teal',
      'transition-all duration-300 ease-in-out z-30',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        {!collapsed && (
          <Link href="/admin" className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">
              AgenticVoice
            </span>
          </Link>
        )}
        
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg text-white hover:bg-white/10 transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                  title={collapsed ? item.name : ''}
                >
                  <Icon className={cn(
                    'flex-shrink-0 w-5 h-5',
                    collapsed ? 'mx-auto' : 'mr-3'
                  )} />
                  
                  {!collapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-white/60 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>

                {/* Sub-navigation (only show when not collapsed and has children) */}
                {!collapsed && item.children && isActive && (
                  <div className="mt-2 ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'block px-3 py-2 text-sm rounded-md transition-colors',
                          pathname === child.href
                            ? 'text-white bg-white/10'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="text-center text-xs text-white/60">
            AgenticVoice Admin
            <br />
            Version 1.0.0
          </div>
        </div>
      )}
    </div>
  );
}
